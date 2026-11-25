import { useState } from "react";

const Sidebar = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  isOpen,
  onToggle,
}) => {
  const [search, setSearch] = useState("");

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0e1117] border-r border-[#21262d] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header / Brand */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-4 pb-3 flex flex-col gap-3">
            {/* Logo Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[15px] tracking-tight text-[#f0f6fc]">
                      Consensus AI
                    </span>
                    <span className="px-1.5 py-0.2 text-[10px] font-mono font-medium rounded bg-[#1f242c] text-[#8b949e] border border-[#30363d]">
                      v2.4
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8b949e]">
                    Dual Model + Arbitrator
                  </span>
                </div>
              </div>

              {/* Close Button on mobile */}
              <button
                onClick={onToggle}
                className="lg:hidden p-1 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22] transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#161b22] hover:bg-[#1f242c] text-[#f0f6fc] border border-[#30363d] hover:border-[#484f58] transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-emerald-400 group-hover:rotate-90 transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-[13px] font-medium">New Comparison</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-[#090a0f] text-[#8b949e] font-mono text-[10px] border border-[#21262d]">
                Ctrl+N
              </kbd>
            </button>

            {/* Search Input */}
            <div className="relative">
              <svg
                className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Filter sessions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#161b22] text-[#f0f6fc] placeholder-[#8b949e] text-[12px] pl-8 pr-6 py-1.5 rounded-md border border-[#21262d] focus:outline-none focus:border-indigo-500/80 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-2 text-[#8b949e] hover:text-[#f0f6fc]"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8b949e]">
                Saved Comparison Sessions
              </div>

              {filteredSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <button
                    key={session.id}
                    onClick={() => {
                      onSelectSession(session.id);
                      if (window.innerWidth < 1024) onToggle();
                    }}
                    className={`w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-lg transition-all text-[13px] ${
                      isActive
                        ? "bg-[#1f242c] text-[#f0f6fc] font-medium border border-[#30363d] shadow-sm"
                        : "text-[#8b949e] hover:bg-[#161b22] hover:text-[#f0f6fc]"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        isActive
                          ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                          : "bg-[#484f58]"
                      }`}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate">{session.title}</span>
                      <span className="text-[11px] font-mono text-[#8b949e] mt-0.5">
                        {session.category || "AI Comparison"}
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredSessions.length === 0 && (
                <div className="px-3 py-6 text-center text-[12px] text-[#8b949e]">
                  No sessions matching "{search}"
                </div>
              )}
            </div>
          </div>

          {/* Footer User / Model Badge */}
          <div className="p-3 bg-[#090a0f] border-t border-[#21262d] flex flex-col gap-2">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#161b22] border border-[#21262d] text-[11px] font-mono text-[#8b949e]">
              <span className="truncate text-[#f0f6fc] font-medium">Model A vs Model B</span>
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                ⚖️ Judge
              </span>
            </div>

            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-700 to-indigo-700 border border-indigo-400/30 flex items-center justify-center text-[11px] font-bold text-white">
                  AV
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium text-[#f0f6fc] leading-tight">
                    Alex Vance
                  </span>
                  <span className="text-[10px] font-mono text-[#8b949e]">
                    Tech Lead • Enterprise
                  </span>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400" title="System Online" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
