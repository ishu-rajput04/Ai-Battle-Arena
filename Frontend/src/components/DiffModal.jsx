const DiffModal = ({ isOpen, onClose, solutionA, solutionB }) => {
  if (!isOpen) return null;

  const linesA = solutionA.codeSnippet?.code
    ? solutionA.codeSnippet.code.split("\n")
    : solutionA.codeSnippet?.lines || [];
  const linesB = solutionB.codeSnippet?.code
    ? solutionB.codeSnippet.code.split("\n")
    : solutionB.codeSnippet?.lines || [];
  const maxLines = Math.max(linesA.length, linesB.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl max-h-[85vh] bg-[#0e1117] border border-[#21262d] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#161b22] border-b border-[#21262d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#f0f6fc]">
                Code Comparison: Solution A vs Solution B
              </h3>
              <p className="text-[12px] font-mono text-[#8b949e]">
                {solutionA.codeSnippet?.filename} vs {solutionB.codeSnippet?.filename}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1f242c] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Diff Columns */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column A */}
          <div className="flex flex-col rounded-xl bg-[#090a0f] border border-[#21262d] overflow-hidden">
            <div className="px-3 py-2 bg-[#161b22] border-b border-[#21262d] flex items-center justify-between text-[11px] font-mono">
              <span className="text-indigo-400 font-bold">Model A</span>
              <span className="text-emerald-400">Recommended</span>
            </div>
            <div className="p-3 font-mono text-[12px] leading-relaxed overflow-x-auto">
              {Array.from({ length: maxLines }).map((_, i) => (
                <div key={i} className="flex gap-2 hover:bg-white/[0.02]">
                  <span className="w-6 text-right text-[#484f58] select-none shrink-0 text-[11px]">
                    {linesA[i] !== undefined ? i + 1 : ""}
                  </span>
                  <span className="text-[#e6edf3] whitespace-pre">
                    {linesA[i] !== undefined ? linesA[i] : " "}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Column B */}
          <div className="flex flex-col rounded-xl bg-[#090a0f] border border-[#21262d] overflow-hidden">
            <div className="px-3 py-2 bg-[#161b22] border-b border-[#21262d] flex items-center justify-between text-[11px] font-mono">
              <span className="text-purple-400 font-bold">Model B</span>
              <span className="text-[#8b949e]">Alternative</span>
            </div>
            <div className="p-3 font-mono text-[12px] leading-relaxed overflow-x-auto">
              {Array.from({ length: maxLines }).map((_, i) => (
                <div key={i} className="flex gap-2 hover:bg-white/[0.02]">
                  <span className="w-6 text-right text-[#484f58] select-none shrink-0 text-[11px]">
                    {linesB[i] !== undefined ? i + 1 : ""}
                  </span>
                  <span className="text-[#e6edf3] whitespace-pre">
                    {linesB[i] !== undefined ? linesB[i] : " "}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#161b22] border-t border-[#21262d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1f242c] hover:bg-[#292f39] text-[#f0f6fc] text-[13px] font-medium transition-colors"
          >
            Close Diff
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiffModal;
