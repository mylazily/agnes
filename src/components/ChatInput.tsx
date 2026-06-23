import { useLanguage } from "../hooks/useLanguage";

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming }: ChatInputProps) {
  const { t } = useLanguage();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("message") as HTMLInputElement;
    const value = input.value.trim();
    if (!value) return;
    onSend(value);
    input.value = "";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  }

  return (
    <div
      className="border-t px-4 py-3"
      style={{
        borderColor: "rgba(0,0,0,0.07)",
        background: "#ffffff",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex items-center gap-2"
        style={{ maxWidth: 480 }}
      >
        <div
          className="flex flex-1 items-center gap-2 rounded-full px-4 py-2.5"
          style={{ background: "#f4f4f4" }}
        >
          <input
            name="message"
            type="text"
            autoComplete="off"
            placeholder={t.inputPlaceholder}
            disabled={isStreaming}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[14px] outline-none"
            style={{ color: "#000" }}
          />
        </div>
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="cursor-pointer flex items-center justify-center rounded-full transition-all duration-200 active:scale-95"
            style={{
              width: 36,
              height: 36,
              background: "#0065fd",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4d8eff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#0065fd")}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            className="cursor-pointer flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              width: 36,
              height: 36,
              background: "#0065fd",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4d8eff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#0065fd")}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
}
