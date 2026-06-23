import { useLanguage } from "../hooks/useLanguage";

interface StoredConversation {
  id: string;
  title: string;
  timestamp: number;
}

interface WelcomeScreenProps {
  onSelect: (question: string) => void;
  onLoadConversation?: (id: string) => void;
  storedConversations?: StoredConversation[];
  onRemoveConversation?: (id: string) => void;
}

export function WelcomeScreen({ onSelect }: WelcomeScreenProps) {
  const { t } = useLanguage();

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowY: "auto",
        padding: "12vh 16px 32px",
        maxWidth: 680,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Title - doubao style, no logo icon */}
      <h2
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: "var(--dbx-text-primary)",
          marginBottom: 32,
          textAlign: "center",
          animation: "fadeIn 0.4s ease",
        }}
      >
        {t.welcomeTitle}
      </h2>

      {/* Suggestion cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
          width: "100%",
          maxWidth: 560,
        }}
      >
        {t.presetQuestions.map((q, i) => (
          <button
            key={i}
            className="suggestion-card"
            onClick={() => onSelect(q)}
            style={{
              animation: `slideUp 0.3s ease ${i * 0.06}s both`,
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
