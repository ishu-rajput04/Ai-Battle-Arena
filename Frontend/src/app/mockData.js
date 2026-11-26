export const INITIAL_SESSIONS = [
  {
    id: "TOK-9482-ASYNC",
    title: "Async Worker Memory Leak in Rust/Tokio",
    category: "Rust & Concurrency",
    timestamp: "Today at 14:32 UTC",
    tags: ["rust", "tokio", "memory-leak", "backpressure"],
    query: "We have a high-throughput Rust background worker consuming messages from Kafka via Tokio. Under sustained 40k req/s load, memory steadily crawls upward by ~250MB/hour until OOM killed. We suspect unbounded mpsc channels or leaked Arc references in task spawning. Refactor our worker loop with backpressure, explicit channel capacity limits, and graceful shutdown signal handling.",
    solution1: {
      model: "Mistral Large / Model A",
      tag: "Bounded Channel + Permit Backpressure",
      latency: "2.4s",
      tokens: "1,420",
      isRecommended: true,
      score: 9.4,
      summary: "Bounded Channel (tokio::sync::mpsc::channel(1024)) with permit reservation upstream, CancellationToken for cooperative drain, and strict zero-heap growth under load.",
      code: `use tokio::sync::mpsc;
use tokio_util::sync::CancellationToken;
use std::sync::Arc;

// Explicit channel bound: strictly limits heap allocation under Kafka spikes
const CHANNEL_BUFFER_LIMIT: usize = 1024;

pub async fn run_worker(token: CancellationToken) -> Result<(), WorkerErr> {
    let (tx, mut rx) = mpsc::channel::<KafkaPayload>(CHANNEL_BUFFER_LIMIT);
    let tracker = Arc::new(tokio::sync::Notify::new());

    loop {
        tokio::select! {
            _ = token.cancelled() => {
                // Drain remaining items cooperatively without leaking tasks
                drop(tx);
                while let Some(msg) = rx.recv().await {
                    process_msg(msg).await?;
                }
                break Ok(());
            }
            permit = tx.reserve() => {
                let p = permit.map_err(|_| WorkerErr::ChannelClosed)?;
                let raw = kafka_consumer.recv().await?;
                p.send(raw); // Mechanical backpressure applied upstream!
            }
        }
    }
}`,
      pros: [
        "tx.reserve() stalls Kafka poll loop naturally",
        "Zero heap reallocation under 40k req/s sustained",
        "Clean cooperative drain via CancellationToken"
      ],
      tradeoffs: [
        "Requires tokio-util dependency crate",
        "Small Kafka poll stall during consumer rebalances"
      ],
      metrics: {
        memoryBound: "Strict ≤64MB",
        throughput: "42,150 msg/s",
        complexity: "Idiomatic",
        reliability: "99.98%"
      }
    },
    solution2: {
      model: "Cohere Command-R / Model B",
      tag: "Dynamic Semaphore Rate Limiter",
      latency: "3.1s",
      tokens: "1,840",
      isRecommended: false,
      score: 7.8,
      summary: "Dynamic Semaphore rate limiter with custom RingBuffer chunking, manual atomic reference cleanup, and OS Unix signal listener hook.",
      code: `use tokio::sync::{Semaphore, broadcast};
use tokio::signal::unix::{signal, SignalKind};

pub struct WorkerPool {
    sem: Arc<Semaphore>,
    batch_chunk: VecDeque<Message>,
}

impl WorkerPool {
    pub async fn consume(&mut self) {
        let mut sig = signal(SignalKind::terminate()).unwrap();
        while !self.is_stopped.load(Ordering::Relaxed) {
            let permit = self.sem.clone().acquire_owned().await;
            // Arc<Semaphore> clone inside hot loop adds atomic ref thrashing
            tokio::spawn(async move {
                let _permit = permit;
                if let Some(task) = fetch_next_msg().await {
                    task.execute().await;
                }
            });
        }
    }
}`,
      pros: [
        "Direct OS Unix signal hook integration",
        "Dynamic concurrency slot expansion option",
        "Familiar Semaphore lock abstraction"
      ],
      tradeoffs: [
        "tokio::spawn retains unbounded pending Futures",
        "Arc atomic ref thrash under 40k req/s load",
        "High probability of continuing memory creep"
      ],
      metrics: {
        memoryBound: "Dynamic ~180MB",
        throughput: "38,900 msg/s",
        complexity: "High",
        reliability: "96.40%"
      }
    },
    judge: {
      model: "Gemini 3.5 Arbitrator",
      winner: "Solution 1",
      compositeScore: "94.2%",
      confidence: "High Statistical Margin (99.4%)",
      solution_1_score: 9.4,
      solution_2_score: 7.8,
      solution_1_reasoning: "Solution 1 completely eliminates memory leakage by bounding channel capacity to 1024 and enforcing permit-based backpressure directly before fetching from Kafka. The cooperative CancellationToken drain prevents dangling tasks during pod restart.",
      solution_2_reasoning: "Solution 2 continues spawning unconstrained tokio tasks via tokio::spawn without heap bounds. Under 40k req/s sustained traffic, the Tokio task queue will accumulate pending futures, failing to resolve the primary OOM root cause.",
      pillars: [
        { name: "Leak Prevention", s1: 98, s2: 89, note: "Solution 1 Decisive Win (+9%)" },
        { name: "Throughput & Latency", s1: 95, s2: 84, note: "+3,250 msg/s edge (Sol 1)" },
        { name: "Idiomatic Code", s1: 96, s2: 79, note: "Standard Tokio primitives" },
        { name: "Shutdown Handling", s1: 91, s2: 92, note: "Near parity (Sol 2 +1%)" }
      ]
    }
  },
  {
    id: "PG-1029-JSONB",
    title: "PostgreSQL JSONB Index Strategy",
    category: "Database & Storage",
    timestamp: "Yesterday at 18:20 UTC",
    tags: ["postgres", "jsonb", "gin-index", "sql-tuning"],
    query: "We have an events table with 80M rows and a metadata JSONB column. Queries querying nested user_id and event_type are taking 1,800ms. We need a strategy to achieve sub-10ms queries without blowing up disk write write amplification.",
    solution1: {
      model: "Mistral Large / Model A",
      tag: "Targeted Functional B-Tree Index",
      latency: "1.9s",
      tokens: "1,120",
      isRecommended: true,
      score: 9.2,
      summary: "Create deterministic expression indexes on (metadata->>'user_id') and (metadata->>'event_type') with immutable JSON extraction.",
      code: `CREATE INDEX CONCURRENTLY idx_events_user_type
ON events ((metadata->>'user_id'), (metadata->>'event_type'))
WHERE (metadata->>'user_id') IS NOT NULL;`,
      pros: ["Sub-5ms query lookups", "Minimal index storage (~2GB vs ~24GB GIN)", "Low write penalty"],
      tradeoffs: ["Only covers exact specified JSON keys"],
      metrics: {
        memoryBound: "2.1 GB index",
        throughput: "4,200 qps",
        complexity: "Low",
        reliability: "99.99%"
      }
    },
    solution2: {
      model: "Cohere Command-R / Model B",
      tag: "Full GIN jsonb_path_ops Index",
      latency: "2.6s",
      tokens: "1,450",
      isRecommended: false,
      score: 7.5,
      summary: "Generic GIN index using jsonb_path_ops to support arbitrary @> containment queries.",
      code: `CREATE INDEX CONCURRENTLY idx_events_metadata_gin
ON events USING gin (metadata jsonb_path_ops);`,
      pros: ["Supports any arbitrary containment query", "Flexible schema changes"],
      tradeoffs: ["Huge write amplification on high-ingest", "28GB disk index size", "Higher cache churn"],
      metrics: {
        memoryBound: "28.4 GB index",
        throughput: "1,850 qps",
        complexity: "Moderate",
        reliability: "97.50%"
      }
    },
    judge: {
      model: "Gemini 3.5 Arbitrator",
      winner: "Solution 1",
      compositeScore: "92.0%",
      confidence: "Decisive (98.1%)",
      solution_1_score: 9.2,
      solution_2_score: 7.5,
      solution_1_reasoning: "Targeted B-Tree expression index achieves the required sub-10ms SLA with 90% less disk overhead and virtually no write amplification penalty on 80M rows.",
      solution_2_reasoning: "Full GIN index is overly generic for the stated query pattern and creates severe write latency bottlenecks on high-throughput ingest tables.",
      pillars: [
        { name: "Query Speed", s1: 99, s2: 91, note: "Sub-5ms latency" },
        { name: "Write Amplification", s1: 96, s2: 65, note: "10x lower disk write" },
        { name: "Index Storage", s1: 95, s2: 60, note: "2GB vs 28GB footprint" },
        { name: "Schema Flexibility", s1: 70, s2: 98, note: "Sol 2 higher flexibility" }
      ]
    }
  }
];
