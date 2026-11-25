import CodeBlock from "./CodeBlock";

const ChallengerCard = ({
  side, // 'a' or 'b'
  solution,
  isRecommended,
  votes,
  onVote,
}) => {
  const isA = side === "a";

  return (
    <article
      className={`relative flex flex-col h-full rounded-xl bg-[#0e1117] border transition-all duration-200 overflow-hidden ${
        isRecommended
          ? "border-emerald-500/40 shadow-[0_0_20px_-8px_rgba(16,185,129,0.2)]"
          : "border-[#21262d]"
      }`}
    >
      {/* Top accent indicator */}
      <div
        className={`h-1 w-full ${
          isRecommended
            ? "bg-gradient-to-r from-emerald-400 to-indigo-500"
            : isA
            ? "bg-indigo-500"
            : "bg-purple-500"
        }`}
      />

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Clean Header: Model Name & Vote Button */}
        <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isA ? "bg-indigo-400" : "bg-purple-400"
              }`}
            />
            <h3 className="text-[17px] font-bold text-[#f0f6fc] tracking-tight">
              {solution.modelName}
            </h3>

            {isRecommended && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                <svg
                  className="w-3 h-3 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Recommended
              </span>
            )}
          </div>

          <button
            onClick={onVote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b22] hover:bg-[#1f242c] text-[#f0f6fc] border border-[#21262d] hover:border-[#30363d] text-[12px] font-medium transition-all"
            title={`Vote for ${solution.modelName}`}
          >
            <span>👍 Vote</span>
            {votes > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-400 font-mono text-[11px] font-semibold">
                {votes}
              </span>
            )}
          </button>
        </div>

        {/* The Solution Content */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Explanation Text */}
          {solution.explanation && (
            <p className="text-[14px] text-[#c9d1d9] leading-relaxed">
              {solution.explanation}
            </p>
          )}

          {/* Colorful Code Snippet */}
          {solution.codeSnippet?.code && (
            <div className="flex-1 min-h-[220px]">
              <CodeBlock
                filename={solution.codeSnippet.filename}
                code={solution.codeSnippet.code}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default ChallengerCard;
