import { useState } from "react";

const Header = ({
  sessionTitle,
  layoutMode,
  onChangeLayoutMode,
  onOpenDiff,
  onToggleSidebar,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#090a0f]/85 backdrop-blur-xl border-b border-[#21262d] flex items-center justify-between px-4 lg:px-8">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-lg text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22] border border-[#21262d] transition-colors"
          title="Toggle Navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <nav className="flex items-center gap-1.5 text-[12px] font-mono text-[#8b949e]">
          <span className="hidden sm:inline hover:text-[#f0f6fc] transition-colors cursor-pointer">
            Consensus
          </span>
          <span className="hidden sm:inline text-[#484f58]">/</span>
          <span className="hidden md:inline hover:text-[#f0f6fc] transition-colors cursor-pointer">
            Evaluation
          </span>
          <span className="hidden md:inline text-[#484f58]">/</span>
          <span className="text-[#f0f6fc] font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {sessionTitle || "Active Analysis"}
          </span>
        </nav>

        {/* Live Status indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Dual Routing Active</span>
        </div>
      </div>

      {/* Right: Layout Switcher & Action buttons */}
      <div className="flex items-center gap-2">
        {/* Layout View Mode Buttons */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#161b22] border border-[#21262d]">
          <button
            onClick={() => onChangeLayoutMode("split")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
              layoutMode === "split"
                ? "bg-[#1f242c] text-[#f0f6fc] shadow-sm font-semibold border border-[#30363d]"
                : "text-[#8b949e] hover:text-[#f0f6fc]"
            }`}
            title="Split Side-by-Side View"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 4v16m6-16v16M4 4h16v16H4V4z" />
            </svg>
            <span className="hidden sm:inline">Split</span>
          </button>

          <button
            onClick={() => onChangeLayoutMode("tabs")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
              layoutMode === "tabs"
                ? "bg-[#1f242c] text-[#f0f6fc] shadow-sm font-semibold border border-[#30363d]"
                : "text-[#8b949e] hover:text-[#f0f6fc]"
            }`}
            title="Tabbed Stack View"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="hidden sm:inline">Tabs</span>
          </button>

          <button
            onClick={onOpenDiff}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
            title="Compare Code Diff"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="hidden sm:inline">Diff</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b22] hover:bg-[#1f242c] text-[#f0f6fc] border border-[#21262d] hover:border-[#30363d] text-[12px] font-medium transition-all"
        >
          {copiedShare ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
