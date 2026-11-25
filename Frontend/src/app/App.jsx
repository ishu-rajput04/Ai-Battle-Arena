import "./app.css";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import BattleArena from "../components/BattleArena";
import PromptInput from "../components/PromptInput";
import DiffModal from "../components/DiffModal";
import { PRESET_SESSIONS, generateDynamicBattle } from "../utils/mockAI";

const App = () => {
  const [sessions, setSessions] = useState(PRESET_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState(PRESET_SESSIONS[0].id);
  const [prompt, setPrompt] = useState("");
  const [loadingPrompt, setLoadingPrompt] = useState("");
  const [battleState, setBattleState] = useState("done"); // 'idle' | 'loading' | 'done'
  const [layoutMode, setLayoutMode] = useState("split"); // 'split' | 'tabs'
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionVotes, setSessionVotes] = useState({
    "session-1": { a: 24, b: 11 },
    "session-2": { a: 18, b: 9 },
    "session-3": { a: 7, b: 29 },
  });

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleSendPrompt = () => {
    if (!prompt.trim() || battleState === "loading") return;

    const userPrompt = prompt.trim();
    setLoadingPrompt(userPrompt);
    setBattleState("loading");

    // Generate dynamic responses
    setTimeout(() => {
      const generated = generateDynamicBattle(userPrompt);
      const newSessionId = `session-${Date.now()}`;
      const titleWords = userPrompt.split(" ").slice(0, 5).join(" ");
      const newSession = {
        id: newSessionId,
        title: titleWords.length > 32 ? `${titleWords.slice(0, 32)}...` : titleWords,
        category: "Custom Analysis",
        timestamp: "Just now",
        prompt: userPrompt,
        tags: ["custom-evaluation", "dual-pipeline", "arbitrated"],
        data: generated,
      };

      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSessionId);
      setSessionVotes((prev) => ({ ...prev, [newSessionId]: { a: 0, b: 0 } }));
      setBattleState("done");
      setPrompt("");
    }, 1500);
  };

  const handleVote = (side) => {
    setSessionVotes((prev) => {
      const current = prev[activeSessionId] || { a: 0, b: 0 };
      return {
        ...prev,
        [activeSessionId]: {
          ...current,
          [side]: (current[side] || 0) + 1,
        },
      };
    });
  };

  const handleNewChat = () => {
    setPrompt("");
    setBattleState("idle");
    const blankId = `new-${Date.now()}`;
    const blankSession = {
      id: blankId,
      title: "New Comparison",
      category: "Ready for Prompt",
      timestamp: "Draft",
      prompt: "",
      tags: [],
      data: null,
    };
    setSessions((prev) => [blankSession, ...prev]);
    setActiveSessionId(blankId);
  };

  const currentVotes = sessionVotes[activeSessionId] || { a: 0, b: 0 };

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#e3e1e9] font-sans antialiased flex">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          const selected = sessions.find((s) => s.id === id);
          if (selected && selected.data) {
            setBattleState("done");
          } else {
            setBattleState("idle");
          }
        }}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          sessionTitle={activeSession?.title}
          layoutMode={layoutMode}
          onChangeLayoutMode={setLayoutMode}
          onOpenDiff={() => setIsDiffOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Conversation / Comparison Arena */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
          {battleState === "idle" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto py-16 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-xl shadow-indigo-500/10 mb-5">
                ⚖️
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#f0f6fc] sm:text-3xl">
                Model A vs Model B Consensus
              </h2>
              <p className="mt-2.5 text-sm text-[#8b949e] leading-relaxed">
                Enter any prompt or challenge below. Model A and Model B will provide
                independent solutions, and an AI judge will score both out of 10 and recommend
                the winning solution.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mt-8">
                {[
                  "Fix Tokio memory leak with bounded channels and CancellationToken",
                  "Optimize PostgreSQL 80M-row JSONB queries for sub-10ms response",
                  "Implement distributed sliding-window rate limiter in Redis Lua",
                  "Prevent React 19 useEffect async race condition in data fetching",
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(preset);
                    }}
                    className="p-3 text-left rounded-xl bg-[#0e1117] hover:bg-[#161b22] border border-[#21262d] hover:border-[#30363d] text-[12px] text-[#8b949e] hover:text-[#f0f6fc] transition-all group"
                  >
                    <span className="font-mono text-indigo-400 group-hover:underline">→</span>{" "}
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(battleState === "loading" || battleState === "done") && (
            <BattleArena
              session={activeSession}
              battleState={battleState}
              votes={currentVotes}
              onVote={handleVote}
              layoutMode={layoutMode}
              loadingPrompt={loadingPrompt}
            />
          )}
        </main>

        {/* 3. Bottom Docked Command Center Input */}
        <PromptInput
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onSend={handleSendPrompt}
          disabled={battleState === "loading"}
          onSelectSuggestion={(s) => setPrompt(s)}
        />

        {/* 4. Side-by-Side Diff Modal */}
        {activeSession?.data && (
          <DiffModal
            isOpen={isDiffOpen}
            onClose={() => setIsDiffOpen(false)}
            solutionA={activeSession.data.solutionA}
            solutionB={activeSession.data.solutionB}
          />
        )}
      </div>
    </div>
  );
};

export default App;
