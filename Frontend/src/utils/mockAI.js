// Anonymous Model A vs Model B comparison engine with clean 1-10 scoring

export const PRESET_SESSIONS = [
  {
    id: "session-1",
    title: "Rust Tokio Async Memory Leak",
    category: "Rust / Systems",
    timestamp: "Today at 14:32 UTC",
    prompt: "We have a high-throughput Rust background worker consuming messages from Kafka via Tokio. Under sustained 40k req/s load, memory steadily crawls upward by ~250MB/hour until OOM killed. We suspect unbounded mpsc channels or leaked Arc references in task spawning. Refactor our worker loop with backpressure, explicit channel capacity limits, and graceful shutdown signal handling.",
    tags: ["rust", "tokio", "memory-leak", "backpressure"],
    data: {
      latency: "2.8s",
      solutionA: {
        modelName: "Model A",
        explanation: "To eliminate unbounded heap growth, this solution replaces unmetered task spawning with a bounded Tokio MPSC channel and permit reservation (`tx.reserve()`). When the worker pool is saturated, the Kafka partition consumer automatically pauses fetching. A `CancellationToken` ensures all buffered items are processed before graceful shutdown.",
        codeSnippet: {
          filename: "solution_a.rs",
          language: "rust",
          code: `use tokio::sync::mpsc;
use tokio_util::sync::CancellationToken;

const CHANNEL_BUFFER_LIMIT: usize = 1024;

pub async fn run_worker(token: CancellationToken) -> Result<(), WorkerError> {
    let (tx, mut rx) = mpsc::channel::<KafkaPayload>(CHANNEL_BUFFER_LIMIT);
    
    loop {
        tokio::select! {
            _ = token.cancelled() => {
                // Cooperative drain without dropping in-flight messages
                drop(tx);
                while let Some(msg) = rx.recv().await {
                    process_msg(msg).await?;
                }
                break Ok(());
            }
            permit = tx.reserve() => {
                let p = permit.map_err(|_| WorkerError::ChannelClosed)?;
                let raw = kafka_consumer.recv().await?;
                p.send(raw); // Direct upstream backpressure applied
            }
        }
    }
}`
        }
      },
      solutionB: {
        modelName: "Model B",
        explanation: "This approach uses an `Arc<Semaphore>` to limit concurrency across worker tasks. Incoming messages from Kafka acquire an owned permit before invoking `tokio::spawn`. An atomic flag checks for termination signals.",
        codeSnippet: {
          filename: "solution_b.rs",
          language: "rust",
          code: `use tokio::sync::Semaphore;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

pub struct WorkerPool {
    sem: Arc<Semaphore>,
    is_stopped: Arc<AtomicBool>,
}

impl WorkerPool {
    pub async fn consume(&mut self) {
        while !self.is_stopped.load(Ordering::Relaxed) {
            let permit = self.sem.clone().acquire_owned().await;
            tokio::spawn(async move {
                let _permit = permit;
                if let Some(msg) = fetch_next_msg().await {
                    process_msg(msg).await;
                }
            });
        }
    }
}`
        }
      },
      judge: {
        winner: "A",
        scoreA: 9.4,
        scoreB: 7.8,
        reason: "Model A is recommended. By combining a bounded channel with tx.reserve(), it directly eliminates the root cause of the memory leak at the Kafka poll boundary. Model B still spawns unbounded futures onto the Tokio runtime queue during arrival bursts."
      }
    }
  },
  {
    id: "session-2",
    title: "PostgreSQL JSONB Sub-10ms Queries",
    category: "Postgres / Database",
    timestamp: "Yesterday at 17:15 UTC",
    prompt: "We have an events table with 80M rows containing a JSONB payload. Queries filtering nested attributes like payload->'user'->>'org_id' and payload->'metadata'->>'status' take 4.8 seconds. How do we optimize indexing and query execution for sub-10ms response times?",
    tags: ["postgresql", "jsonb", "indexes"],
    data: {
      latency: "2.5s",
      solutionA: {
        modelName: "Model A",
        explanation: "Rather than indexing the entire JSON document, create a composite B-Tree expression index targeting the exact extracted keys. This reduces index size by ~80% compared to a GIN index and delivers deterministic sub-5ms lookups.",
        codeSnippet: {
          filename: "solution_a.sql",
          language: "sql",
          code: `-- Composite B-Tree expression index for exact query paths
CREATE INDEX CONCURRENTLY idx_events_org_status
ON events (
  (payload->'user'->>'org_id'),
  (payload->'metadata'->>'status')
)
WHERE (payload->'metadata'->>'status') IS NOT NULL;

-- Fast index seek (sub-5ms)
SELECT id, created_at FROM events
WHERE payload->'user'->>'org_id' = 'org_9281a'
  AND payload->'metadata'->>'status' = 'ACTIVE';`
        }
      },
      solutionB: {
        modelName: "Model B",
        explanation: "Add a generalized GIN index with the `jsonb_path_ops` operator class. This indexes all nested keys using hash signatures, enabling flexible `@>` containment queries across any present or future attributes.",
        codeSnippet: {
          filename: "solution_b.sql",
          language: "sql",
          code: `-- Generalized GIN index for arbitrary JSON path containment
CREATE INDEX CONCURRENTLY idx_events_payload_gin
ON events USING GIN (payload jsonb_path_ops);

-- Query using jsonb containment operator (@>)
SELECT id, created_at FROM events
WHERE payload @> '{"user": {"org_id": "org_9281a"}, "metadata": {"status": "ACTIVE"}}';`
        }
      },
      judge: {
        winner: "A",
        scoreA: 9.2,
        scoreB: 8.1,
        reason: "Model A is recommended. For predictable production queries on an 80M-row table, its targeted B-Tree index uses only 1.4GB RAM vs 6.8GB for GIN, achieving 3.2ms response times with significantly less write overhead."
      }
    }
  },
  {
    id: "session-3",
    title: "Distributed Rate Limiter: Redis vs Cloudflare",
    category: "System Design",
    timestamp: "Previous 7 Days",
    prompt: "Design a distributed sliding-window rate limiter for 100M daily API requests. What are the trade-offs between Redis sliding-window zset vs Cloudflare Workers KV / Durable Objects?",
    tags: ["system-design", "rate-limiting", "redis"],
    data: {
      latency: "2.7s",
      solutionA: {
        modelName: "Model A",
        explanation: "Implements an atomic sliding-window rate limiter in Redis using sorted sets (ZSET) evaluated via a Lua script. Each incoming request removes expired timestamps, checks the window limit, and inserts the current timestamp atomically.",
        codeSnippet: {
          filename: "solution_a.lua",
          language: "lua",
          code: `local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local clear_before = now - window

-- Atomically clear expired calls and verify capacity
redis.call('ZREMRANGEBYSCORE', key, 0, clear_before)
local current = redis.call('ZCARD', key)

if current < limit then
    redis.call('ZADD', key, now, now)
    redis.call('EXPIRE', key, math.ceil(window / 1000))
    return 1 -- Allowed
else
    return 0 -- Rate Limited
end`
        }
      },
      solutionB: {
        modelName: "Model B",
        explanation: "Deploys stateful Durable Objects at the edge. Each client IP or API key maps to an actor instance holding timestamps in memory, eliminating dedicated database clusters and achieving zero maintenance overhead.",
        codeSnippet: {
          filename: "solution_b.ts",
          language: "typescript",
          code: `export class RateLimiterDO {
  private timestamps: number[] = [];

  async fetch(request: Request) {
    const now = Date.now();
    const windowStart = now - 60000;
    
    // Prune timestamps older than 1 minute
    this.timestamps = this.timestamps.filter(t => t > windowStart);
    
    if (this.timestamps.length >= 100) {
      return new Response("Too Many Requests", { status: 429 });
    }
    
    this.timestamps.push(now);
    return new Response("OK", { status: 200 });
  }
}`
        }
      },
      judge: {
        winner: "B",
        scoreA: 8.5,
        scoreB: 9.3,
        reason: "Model B is recommended. For a globally distributed API serving 100M daily requests, Cloudflare Durable Objects eliminates Redis cluster maintenance, cross-region replication lag, and server provisioning costs."
      }
    }
  }
];

export const generateDynamicBattle = (prompt) => {
  const p = prompt.toLowerCase();
  
  let filenameA = "solution_a.ts";
  let filenameB = "solution_b.ts";
  let lang = "typescript";
  
  if (p.includes("css") || p.includes("design") || p.includes("ui") || p.includes("frontend") || p.includes("tailwind")) {
    filenameA = "ComponentA.jsx";
    filenameB = "ComponentB.jsx";
    lang = "javascript";
  } else if (p.includes("python") || p.includes("fastapi") || p.includes("django")) {
    filenameA = "service_a.py";
    filenameB = "service_b.py";
    lang = "python";
  } else if (p.includes("sql") || p.includes("database")) {
    filenameA = "query_a.sql";
    filenameB = "query_b.sql";
    lang = "sql";
  }

  const codeA = `// Model A: Deterministic & verified solution for: "${prompt.slice(0, 35)}..."
export async function executeStrategy<T>(input: T): Promise<Result> {
  // 1. Strict contract validation
  const valid = validateInput(input);
  
  // 2. High-performance execution pipeline
  const pipeline = new ExecutionEngine({
    timeoutMs: 1200,
    retryPolicy: { maxAttempts: 2 },
  });
  
  return await pipeline.run(valid);
}`;

  const codeB = `// Model B: Adaptive pattern for: "${prompt.slice(0, 35)}..."
export class AdaptiveHandler {
  private cache = new Map<string, Result>();

  async handle(payload: unknown): Promise<Result> {
    const key = this.getKey(payload);
    if (this.cache.has(key)) return this.cache.get(key)!;
    
    try {
      const result = await this.process(payload);
      this.cache.set(key, result);
      return result;
    } catch (err) {
      return this.fallback(err);
    }
  }
}`;

  return {
    latency: "2.1s",
    solutionA: {
      modelName: "Model A",
      explanation: `Model A provides a structured, deterministic approach to "${prompt}". It emphasizes formal contract verification, predictable resource consumption, and unambiguous boundary conditions with zero unmanaged side-effects.`,
      codeSnippet: {
        filename: filenameA,
        language: lang,
        code: codeA
      }
    },
    solutionB: {
      modelName: "Model B",
      explanation: `Model B implements an adaptive pattern for "${prompt}". It features built-in memoization to accelerate recurring operations, paired with resilient runtime fallbacks when encountering unexpected inputs.`,
      codeSnippet: {
        filename: filenameB,
        language: lang,
        code: codeB
      }
    },
    judge: {
      winner: "A",
      scoreA: 9.3,
      scoreB: 8.2,
      reason: `Model A is recommended. Its deterministic flow and explicit contract validation provide lower maintenance risk and predictable performance compared to Model B's cache-driven approach.`
    }
  };
};
