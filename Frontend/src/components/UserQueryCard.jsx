const UserQueryCard = ({ prompt, latency }) => {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-[#0e1117] border border-[#21262d] px-4 py-3 shadow-sm animate-fade-in">
      {/* Label and Prompt Text */}
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <span className="mt-0.5 px-2 py-0.5 rounded bg-[#161b22] border border-[#21262d] text-[#8b949e] font-mono text-[10px] uppercase tracking-wider font-semibold shrink-0">
          INPUT
        </span>
        <p className="text-[13px] sm:text-[14px] text-[#f0f6fc] leading-relaxed">
          {prompt}
        </p>
      </div>

      {/* Timer */}
      {latency && (
        <div
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#161b22] border border-[#21262d] text-[#8b949e] font-mono text-[11px] shrink-0 mt-0.5"
          title="Response time"
        >
          <svg
            className="w-3 h-3 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-[#f0f6fc] font-semibold">{latency}</span>
        </div>
      )}
    </div>
  );
};

export default UserQueryCard;
