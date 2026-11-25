import { useState } from "react";

// Tokenizes code into colorful syntax-highlighted segments
function highlightCode(code) {
  if (!code) return null;

  const lines = code.split("\n");

  return lines.map((line, lineIndex) => {
    // 1. Comments
    if (line.trim().startsWith("//") || line.trim().startsWith("--")) {
      return (
        <div key={lineIndex} className="table-row leading-relaxed">
          <span className="table-cell select-none text-right pr-4 text-[#484f58] text-[11px] font-mono w-7">
            {lineIndex + 1}
          </span>
          <span className="table-cell text-[#6b7280] italic whitespace-pre">
            {line}
          </span>
        </div>
      );
    }

    // Keyword, types, functions, strings, and numbers regex tokenizer
    const tokenRegex =
      /(\/\/[^\n]*|--[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:use|pub|async|fn|struct|impl|loop|tokio::select!|while|let|mut|const|return|break|drop|match|import|export|from|class|private|new|try|catch|if|else|local|then|end|CREATE|INDEX|ON|WHERE|SELECT|FROM|AND|NOT|NULL|IS|CONCURRENTLY|USING|GIN)\b|\b(?:CancellationToken|WorkerError|Result|Option|Some|Arc|Semaphore|Ordering|AtomicBool|VecDeque|KafkaPayload|Response|Request|Map|Promise|Date|usize|number|string|boolean)\b|\b[a-zA-Z_]\w*(?=\()|\b\d+\b|[^\s\w]+|\s+|\w+)/g;

    const tokens = [];
    let match;
    let lastIndex = 0;

    while ((match = tokenRegex.exec(line)) !== null) {
      const part = match[0];
      const idx = match.index;

      if (idx > lastIndex) {
        tokens.push({ text: line.slice(lastIndex, idx), type: "text" });
      }

      let type = "text";
      if (part.startsWith("//") || part.startsWith("--")) {
        type = "comment";
      } else if (part.startsWith('"') || part.startsWith("'")) {
        type = "string";
      } else if (
        /^(use|pub|async|fn|struct|impl|loop|while|let|mut|const|return|break|drop|match|import|export|from|class|private|new|try|catch|if|else|local|then|end|CREATE|INDEX|ON|WHERE|SELECT|FROM|AND|NOT|NULL|IS|CONCURRENTLY|USING|GIN)$/.test(
          part
        )
      ) {
        type = "keyword";
      } else if (
        /^(CancellationToken|WorkerError|Result|Option|Some|Arc|Semaphore|Ordering|AtomicBool|VecDeque|KafkaPayload|Response|Request|Map|Promise|Date|usize|number|string|boolean)$/.test(
          part
        )
      ) {
        type = "type";
      } else if (/^\d+$/.test(part)) {
        type = "number";
      } else if (
        match.index + part.length < line.length &&
        line[match.index + part.length] === "(" &&
        /^[a-zA-Z_]\w*$/.test(part)
      ) {
        type = "function";
      }

      tokens.push({ text: part, type });
      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      tokens.push({ text: line.slice(lastIndex), type: "text" });
    }

    return (
      <div key={lineIndex} className="table-row leading-relaxed hover:bg-white/[0.02]">
        <span className="table-cell select-none text-right pr-4 text-[#484f58] text-[11px] font-mono w-7">
          {lineIndex + 1}
        </span>
        <span className="table-cell whitespace-pre font-mono text-[12px]">
          {tokens.map((t, i) => {
            if (t.type === "keyword") {
              return (
                <span key={i} className="text-[#c084fc] font-semibold">
                  {t.text}
                </span>
              );
            }
            if (t.type === "type") {
              return (
                <span key={i} className="text-[#38bdf8] font-medium">
                  {t.text}
                </span>
              );
            }
            if (t.type === "function") {
              return (
                <span key={i} className="text-[#fbbf24]">
                  {t.text}
                </span>
              );
            }
            if (t.type === "string") {
              return (
                <span key={i} className="text-[#34d399]">
                  {t.text}
                </span>
              );
            }
            if (t.type === "number") {
              return (
                <span key={i} className="text-[#fb923c]">
                  {t.text}
                </span>
              );
            }
            if (t.type === "comment") {
              return (
                <span key={i} className="text-[#6b7280] italic">
                  {t.text}
                </span>
              );
            }
            return (
              <span key={i} className="text-[#e2e8f0]">
                {t.text}
              </span>
            );
          })}
        </span>
      </div>
    );
  });
}

const CodeBlock = ({ filename, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col rounded-lg bg-[#090a0f] border border-[#21262d] overflow-hidden my-2 shadow-inner">
      {/* Code Header Bar */}
      <div className="px-3.5 py-1.5 bg-[#161b22] border-b border-[#21262d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#30363d]" />
          <span className="font-mono text-[11px] text-[#8b949e]">
            {filename || "solution.code"}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1f242c] hover:bg-[#292f39] text-[#f0f6fc] text-[11px] font-mono transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="p-3 overflow-x-auto max-h-80 scrollbar-thin font-mono text-[12px]">
        <div className="table w-full">{highlightCode(code)}</div>
      </div>
    </div>
  );
};

export default CodeBlock;
