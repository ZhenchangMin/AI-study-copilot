import { useMemo, useState } from "react";
import { chat } from "./api/client";

function Bubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          maxWidth: 560,
          padding: "10px 14px",
          borderRadius: 14,
          border: "1px solid #ddd",
          background: isUser ? "#f6f6f6" : "white",
          whiteSpace: "pre-wrap",
          lineHeight: 1.5,
        }}
      >
        <b style={{ display: "block", marginBottom: 4, fontSize: 12, opacity: 0.7 }}>
          {isUser ? "You" : "Assistant"}
        </b>
        {content}
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! Send me anything, I will echo it back for now." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  const onSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const data = await chat(text);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${e.message}` },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ height: "100vh", fontFamily: "sans-serif", background: "#fafafa" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", height: "100%", display: "flex", flexDirection: "column" }}>
        <header style={{ padding: "24px 18px 12px" }}>
          <h1 style={{ margin: 0 }}>AI Study Copilot</h1>
          <p style={{ margin: "8px 0 0", opacity: 0.7 }}>
            Day 2: Chat UI + echo backend. (Tomorrow: real LLM + RAG)
          </p>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: "0 18px 18px" }}>
          {messages.map((m, idx) => (
            <Bubble key={idx} role={m.role} content={m.content} />
          ))}
        </main>

        <footer style={{ padding: 18, borderTop: "1px solid #eee", background: "white" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                outline: "none",
              }}
              disabled={sending}
            />
            <button
              onClick={onSend}
              disabled={!canSend}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "1px solid #ddd",
                cursor: canSend ? "pointer" : "not-allowed",
              }}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.6 }}>
            Tip: Press Enter to send.
          </div>
        </footer>
      </div>
    </div>
  );
}
