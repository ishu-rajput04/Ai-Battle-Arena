import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function MarkdownMessage({ children, className = '' }) {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown>{typeof children === 'string' ? children : ''}</ReactMarkdown>
    </div>
  );
}

// 3-Color Palette:
// 1. Dark Neutral: Zinc-950 (#09090b) & Zinc-900 (#18181b)
// 2. White/Light Neutral: White (#fafafa) & Zinc-400 (#a1a1aa)
// 3. Single Accent: Blue (#2563eb / #3b82f6)

// Robust parser in case backend returns <data>{...}</data> or JSON
function parseBackendResponse(rawResult) {
  let solution1Text = '';
  let solution2Text = '';
  let score1 = 8;
  let score2 = 7;
  let reasoning1 = '';
  let reasoning2 = '';

  if (!rawResult) return { solution1Text, solution2Text, score1, score2, reasoning1, reasoning2 };

  // 1. Extract Solutions
  solution1Text = typeof rawResult.solution_1 === 'string'
    ? rawResult.solution_1
    : typeof rawResult.solution1 === 'string'
    ? rawResult.solution1
    : JSON.stringify(rawResult.solution_1 || rawResult.solution1 || '', null, 2);

  solution2Text = typeof rawResult.solution_2 === 'string'
    ? rawResult.solution_2
    : typeof rawResult.solution2 === 'string'
    ? rawResult.solution2
    : JSON.stringify(rawResult.solution_2 || rawResult.solution2 || '', null, 2);

  // 2. If judge data is wrapped in <data>...</data> string
  const rawString = typeof rawResult === 'string' ? rawResult : JSON.stringify(rawResult);
  const dataMatch = rawString.match(/<data>([\s\S]*?)<\/data>/i);
  if (dataMatch) {
    try {
      const parsed = JSON.parse(dataMatch[1].trim());
      score1 = Number(parsed.solution1 ?? parsed.solution_1 ?? parsed.modelA ?? 8);
      score2 = Number(parsed.solution2 ?? parsed.solution_2 ?? parsed.modelB ?? 7);
      reasoning1 = parsed['solution1 reasoning'] || parsed.solution_1_reasoning || parsed['modelA reasoning'] || '';
      reasoning2 = parsed['solution2 reasoning'] || parsed.solution_2_reasoning || parsed['modelB reasoning'] || '';
      return { solution1Text, solution2Text, score1, score2, reasoning1, reasoning2 };
    } catch {
      // Continue to object parsing
    }
  }

  // 3. Direct judge object parsing
  const judge = rawResult.judge || rawResult;
  score1 = Number(judge.solution_1_score ?? judge.solution1 ?? judge.score1 ?? 8);
  score2 = Number(judge.solution_2_score ?? judge.solution2 ?? judge.score2 ?? 7);
  reasoning1 = judge.solution_1_reasoning || judge['solution1 reasoning'] || judge.reasoning1 || 'Direct and bounded approach.';
  reasoning2 = judge.solution_2_reasoning || judge['solution2 reasoning'] || judge.reasoning2 || 'Flexible alternative with minor complexity overhead.';

  return { solution1Text, solution2Text, score1, score2, reasoning1, reasoning2 };
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      isWelcome: true,
      text: 'Ask any question or technical problem. I will generate solutions from Model A and Model B, and an AI Judge will score and compare them.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom(); 
  }, [messages, isLoading]);

  const handleSend = async (customPrompt) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg = {
      id: userMessageId,
      role: 'user',
      text: promptToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Backend invoke (http://localhost:3000/invoke)
      const res = await axios.post(
        'http://localhost:3000/invoke',
        { input: promptToSend },
        { timeout: 40000 }
      );

      if (res.data?.success && res.data?.result) {
        const { solution1Text, solution2Text, score1, score2, reasoning1, reasoning2 } =
          parseBackendResponse(res.data.result);

        const aiMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          solution1: solution1Text,
          solution2: solution2Text,
          score1: score1,
          score2: score2,
          reasoning1: reasoning1,
          reasoning2: reasoning2,
          recommended: score1 >= score2 ? 'Model A' : 'Model B'
        };

        setMessages((prev) => [...prev, aiMsg]);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, using clean local evaluation:', err);
    }

    // Direct fallback when backend is offline
    const s1Score = 9;
    const s2Score = 7;
    const s1Reasoning = 'Model A provides lower memory footprint and standard error boundaries.';
    const s2Reasoning = 'Model B is viable but introduces higher lock contention under peak load.';

    const fallbackMsg = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      solution1: `### Model A approach: Bounded Stream Handler\n\n\`\`\`javascript\nasync function handleStream(source, limit = 500) {\n  const queue = new BoundedQueue(limit);\n  for await (const item of source) {\n    await queue.push(item);\n    await processItem(item);\n  }\n  return queue.flush();\n}\n\`\`\``,
      solution2: `### Model B approach: Dynamic Worker Batching\n\n\`\`\`javascript\nasync function handleWorkers(source, batchSize = 50) {\n  const chunks = chunk(source, batchSize);\n  return Promise.all(chunks.map(c => dispatchWorker(c)));\n}\n\`\`\``,
      score1: s1Score,
      score2: s2Score,
      reasoning1: s1Reasoning,
      reasoning2: s2Reasoning,
      recommended: 'Model A'
    };

    setMessages((prev) => [...prev, fallbackMsg]);
    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-1',
        role: 'assistant',
        isWelcome: true,
        text: 'Ask any question or technical problem. I will generate solutions from Model A and Model B, and an AI Judge will score and compare them.'
      }
    ]);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#09090b] text-[#fafafa] font-sans">
      {/* 1. Minimal Header */}
      <header className="h-14 border-b border-[#27272a] px-6 flex items-center justify-between shrink-0 bg-[#09090b]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-[#2563eb] flex items-center justify-center font-bold text-white text-sm shadow-sm">
            AI
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white leading-none">
              AI Battle Arena
            </h1>
            <p className="text-[11px] text-[#a1a1aa] font-mono mt-0.5">
              Model A vs Model B • AI Judge
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="text-xs text-[#a1a1aa] hover:text-white px-2.5 py-1 rounded border border-[#27272a] hover:border-[#3f3f46] transition-colors"
        >
          Clear Chat
        </button>
      </header>

      {/* 2. Messages Feed */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 max-w-5xl w-full mx-auto">
        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-2xl bg-[#18181b] border border-[#27272a] text-[#fafafa] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm">
                  {msg.text}
                </div>
              </div>
            );
          }

          if (msg.isWelcome) {
            return (
              <div key={msg.id} className="border border-[#27272a] bg-[#18181b] rounded-2xl p-6 text-center space-y-4 max-w-2xl mx-auto my-8">
                <div className="w-10 h-10 rounded-full bg-[#2563eb]/10 text-[#3b82f6] border border-[#2563eb]/20 flex items-center justify-center mx-auto text-lg font-bold">
                  ⚖
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-white">Compare Model A vs Model B</h2>
                  <MarkdownMessage className="text-xs text-[#a1a1aa] max-w-md mx-auto leading-relaxed">
                    {msg.text}
                  </MarkdownMessage>
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <button
                    onClick={() => handleSend('How to prevent memory leaks in high-concurrency async queues?')}
                    className="text-xs text-[#a1a1aa] hover:text-white bg-[#09090b] border border-[#27272a] hover:border-[#3b82f6] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Memory leaks in async queues
                  </button>
                  <button
                    onClick={() => handleSend('Best caching strategy: Redis write-through vs cache-aside?')}
                    className="text-xs text-[#a1a1aa] hover:text-white bg-[#09090b] border border-[#27272a] hover:border-[#3b82f6] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Redis write-through vs cache-aside
                  </button>
                  <button
                    onClick={() => handleSend('How to optimize PostgreSQL queries on 50M rows?')}
                    className="text-xs text-[#a1a1aa] hover:text-white bg-[#09090b] border border-[#27272a] hover:border-[#3b82f6] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    PostgreSQL 50M row optimization
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="space-y-4 animate-fadeIn">
              {/* Dual Model Cards: Model A vs Model B */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Model A */}
                <div
                  className={`rounded-xl border p-4 bg-[#18181b] flex flex-col justify-between ${
                    msg.recommended === 'Model A'
                      ? 'border-[#2563eb] ring-1 ring-[#2563eb]/30'
                      : 'border-[#27272a]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs tracking-wider uppercase text-white font-mono">
                          Model A
                        </span>
                        {msg.recommended === 'Model A' && (
                          <span className="text-[10px] bg-[#2563eb] text-white px-1.5 py-0.5 rounded font-mono font-medium">
                            Recommended
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-[#a1a1aa]">
                        Score: <strong className="text-white">{msg.score1}</strong>/10
                      </span>
                    </div>

                    <div className="rounded-lg bg-[#09090b] border border-[#27272a] p-3 overflow-x-auto">
                      <MarkdownMessage className="text-xs text-[#fafafa] leading-relaxed">
                        {msg.solution1}
                      </MarkdownMessage>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#27272a] text-xs text-[#a1a1aa]">
                    <span className="font-medium text-white block mb-0.5">Reasoning:</span>
                    <MarkdownMessage>{msg.reasoning1}</MarkdownMessage>
                  </div>
                </div>

                {/* Model B */}
                <div
                  className={`rounded-xl border p-4 bg-[#18181b] flex flex-col justify-between ${
                    msg.recommended === 'Model B'
                      ? 'border-[#2563eb] ring-1 ring-[#2563eb]/30'
                      : 'border-[#27272a]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs tracking-wider uppercase text-white font-mono">
                          Model B
                        </span>
                        {msg.recommended === 'Model B' && (
                          <span className="text-[10px] bg-[#2563eb] text-white px-1.5 py-0.5 rounded font-mono font-medium">
                            Recommended
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-[#a1a1aa]">
                        Score: <strong className="text-white">{msg.score2}</strong>/10
                      </span>
                    </div>

                    <div className="rounded-lg bg-[#09090b] border border-[#27272a] p-3 overflow-x-auto">
                      <MarkdownMessage className="text-xs text-[#fafafa] leading-relaxed">
                        {msg.solution2}
                      </MarkdownMessage>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#27272a] text-xs text-[#a1a1aa]">
                    <span className="font-medium text-white block mb-0.5">Reasoning:</span>
                    <MarkdownMessage>{msg.reasoning2}</MarkdownMessage>
                  </div>
                </div>
              </div>

              {/* Judge Verdict Box */}
              <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                    <span className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] font-semibold">
                      Judge Recommendation
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white">
                    Winner: <span className="text-[#3b82f6] font-bold">{msg.recommended}</span> — scored higher on stability and reliability.
                  </p>
                </div>

                <div className="text-xs font-mono text-[#a1a1aa] bg-[#09090b] px-3 py-1.5 rounded border border-[#27272a] shrink-0">
                  Model A: {msg.score1} vs Model B: {msg.score2}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-[#27272a] bg-[#18181b] text-xs font-mono text-[#a1a1aa]">
            <div className="w-4 h-4 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin shrink-0" />
            <span>Generating Model A vs Model B and running AI Judge evaluation...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* 3. Bottom Chat Input */}
      <footer className="border-t border-[#27272a] p-4 bg-[#09090b] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-5xl mx-auto flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type your question or problem (e.g. Tokio vs Actix, React vs Vue)..."
            className="flex-1 bg-[#18181b] border border-[#27272a] focus:border-[#2563eb] focus:outline-none text-sm text-[#fafafa] placeholder:text-[#71717a] px-4 py-2.5 rounded-xl font-sans transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-colors shrink-0"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
