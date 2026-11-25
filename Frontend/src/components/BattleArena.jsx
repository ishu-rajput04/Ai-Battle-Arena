import { useState, useEffect } from "react";
import UserQueryCard from "./UserQueryCard";
import ChallengerCard from "./ChallengerCard";
import JudgeVerdict from "./JudgeVerdict";

const BattleArena = ({
  session,
  battleState, // 'idle' | 'loading' | 'done'
  votes,
  onVote,
  layoutMode, // 'split' | 'tabs'
  loadingPrompt,
}) => {
  const [activeTab, setActiveTab] = useState("a");
  const [elapsed, setElapsed] = useState(0);

  // Live timer during loading state
  useEffect(() => {
    if (battleState !== "loading") return;

    const start = Date.now();
    const timer = setInterval(() => {
      setElapsed(((Date.now() - start) / 1000).toFixed(1));
    }, 100);

    return () => clearInterval(timer);
  }, [battleState]);

  if (battleState === "loading") {
    return (
      <div className="flex flex-col gap-5 animate-fade-in max-w-7xl mx-auto w-full">
        {/* Input prompt header with live running timer */}
        <UserQueryCard
          prompt={loadingPrompt || session?.prompt || "Evaluating prompt..."}
          latency={`${elapsed}s`}
        />

        {/* Loading Skeletons in equal dimensions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="rounded-xl bg-[#0e1117] border border-[#21262d] p-5 flex flex-col gap-4 min-h-[380px] h-full"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
                <div className="h-4 w-28 bg-[#21262d] rounded animate-shimmer" />
                <div className="h-6 w-16 bg-[#21262d] rounded animate-shimmer" />
              </div>
              <div className="h-16 bg-[#161b22] rounded-lg animate-shimmer" />
              <div className="flex-1 bg-[#161b22] rounded-lg min-h-[200px] animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!session || !session.data) {
    return null;
  }

  const { solutionA, solutionB, judge } = session.data;
  const isWinnerA = judge.winner === "A";

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full pb-24 animate-fade-in">
      {/* 1. Only Input Prompt and Timer */}
      <UserQueryCard
        prompt={session.prompt}
        latency={session.data.latency}
      />

      {/* Tabs Switcher for 'tabs' layout mode */}
      {layoutMode === "tabs" && (
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0e1117] border border-[#21262d] self-start">
          <button
            onClick={() => setActiveTab("a")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === "a"
                ? "bg-[#1f242c] text-[#f0f6fc] shadow-sm font-semibold border border-[#30363d]"
                : "text-[#8b949e] hover:text-[#f0f6fc]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Model A</span>
            {isWinnerA && (
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                Winner
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("b")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === "b"
                ? "bg-[#1f242c] text-[#f0f6fc] shadow-sm font-semibold border border-[#30363d]"
                : "text-[#8b949e] hover:text-[#f0f6fc]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Model B</span>
            {!isWinnerA && (
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                Winner
              </span>
            )}
          </button>
        </div>
      )}

      {/* 2. Dual Solutions Container - Same Dimensions */}
      {layoutMode === "split" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          <div className="h-full">
            <ChallengerCard
              side="a"
              solution={solutionA}
              isRecommended={isWinnerA}
              votes={votes.a || 0}
              onVote={() => onVote("a")}
            />
          </div>

          <div className="h-full">
            <ChallengerCard
              side="b"
              solution={solutionB}
              isRecommended={!isWinnerA}
              votes={votes.b || 0}
              onVote={() => onVote("b")}
            />
          </div>
        </div>
      ) : (
        <div className="w-full">
          {activeTab === "a" ? (
            <ChallengerCard
              side="a"
              solution={solutionA}
              isRecommended={isWinnerA}
              votes={votes.a || 0}
              onVote={() => onVote("a")}
            />
          ) : (
            <ChallengerCard
              side="b"
              solution={solutionB}
              isRecommended={!isWinnerA}
              votes={votes.b || 0}
              onVote={() => onVote("b")}
            />
          )}
        </div>
      )}

      {/* 3. Simple & Clean Judge Recommendation */}
      <JudgeVerdict verdict={judge} />
    </div>
  );
};

export default BattleArena;
