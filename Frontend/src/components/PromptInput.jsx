import { useRef, useEffect } from "react";

const PromptInput = ({ value, onChange, onSend, disabled }) => {
  const textareaRef = useRef(null);

  // Auto-resize textarea height to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSubmit = !disabled && value.trim().length > 0;

  return (
    <div className="fixed bottom-4 left-0 right-0 lg:left-72 z-40 px-4 sm:px-8 pointer-events-none">
      <div className="max-w-3xl mx-auto w-full pointer-events-auto">
        {/* Simple input field with integrated submit button inside */}
        <div className="relative flex items-end rounded-2xl bg-[#0e1117]/95 backdrop-blur-xl border border-[#30363d] focus-within:border-indigo-500/80 shadow-2xl p-1.5 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type your message or prompt here..."
            className="flex-1 bg-transparent text-[#f0f6fc] placeholder-[#8b949e] text-[14px] pl-3.5 pr-12 py-2 border-none outline-none resize-none leading-relaxed min-h-[38px] max-h-36 font-sans disabled:opacity-50"
          />

          {/* Submit button inside the input field */}
          <button
            onClick={onSend}
            disabled={!canSubmit}
            className={`absolute right-2.5 bottom-2 w-8 h-8 rounded-xl transition-all flex items-center justify-center ${
              canSubmit
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 cursor-pointer"
                : "bg-[#1f242c] text-[#8b949e] opacity-50 cursor-not-allowed"
            }`}
            title="Submit prompt (Enter)"
          >
            {disabled ? (
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
