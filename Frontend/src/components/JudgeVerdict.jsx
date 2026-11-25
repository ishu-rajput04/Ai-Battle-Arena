const JudgeVerdict = ({ verdict }) => {
  const isA = verdict.winner === "A";

  return (
    <section className="rounded-xl bg-[#0e1117] border border-[#21262d] p-5 sm:p-6 shadow-sm flex flex-col gap-4 animate-fade-in">
      {/* Title & Winner */}
      <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
        <div className="flex items-center gap-2">
          <span className="text-base">⚖️</span>
          <h3 className="text-[15px] font-semibold text-[#f0f6fc]">
            Judge Recommendation
          </h3>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[12px] font-bold flex items-center gap-1.5 shadow-sm">
          🏆 Winner: Model {verdict.winner}
        </span>
      </div>

      {/* Main Feature: Score of BOTH solutions out of 10 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Model A Score Card */}
        <div
          className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
            isA
              ? "bg-[#161b22] border-emerald-500/50 shadow-[0_0_15px_-4px_rgba(16,185,129,0.2)]"
              : "bg-[#12141a] border-[#21262d]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[14px] text-[#f0f6fc] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              Model A
            </span>
            {isA && (
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                HIGHEST SCORE
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-3xl font-extrabold font-mono ${
                isA ? "text-emerald-400" : "text-[#f0f6fc]"
              }`}
            >
              {verdict.scoreA}
            </span>
            <span className="text-sm font-mono text-[#8b949e]">/ 10</span>
          </div>

          {/* Clean Progress bar */}
          <div className="w-full h-2 bg-[#21262d] rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isA ? "bg-emerald-400" : "bg-indigo-400"
              }`}
              style={{ width: `${(verdict.scoreA / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Model B Score Card */}
        <div
          className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
            !isA
              ? "bg-[#161b22] border-emerald-500/50 shadow-[0_0_15px_-4px_rgba(16,185,129,0.2)]"
              : "bg-[#12141a] border-[#21262d]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[14px] text-[#f0f6fc] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Model B
            </span>
            {!isA && (
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                HIGHEST SCORE
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-3xl font-extrabold font-mono ${
                !isA ? "text-emerald-400" : "text-[#f0f6fc]"
              }`}
            >
              {verdict.scoreB}
            </span>
            <span className="text-sm font-mono text-[#8b949e]">/ 10</span>
          </div>

          {/* Clean Progress bar */}
          <div className="w-full h-2 bg-[#21262d] rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                !isA ? "bg-emerald-400" : "bg-[#8b949e]"
              }`}
              style={{ width: `${(verdict.scoreB / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Short, Simple Verdict Reason */}
      {verdict.reason && (
        <div className="p-3.5 rounded-lg bg-[#161b22] border-l-2 border-emerald-400 border border-[#21262d]">
          <p className="text-[13px] text-[#c9d1d9] leading-relaxed">
            {verdict.reason}
          </p>
        </div>
      )}
    </section>
  );
};

export default JudgeVerdict;
