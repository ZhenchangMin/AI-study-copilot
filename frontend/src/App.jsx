import { useEffect, useMemo, useRef, useState } from "react";
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
          background: isUser ? "#f3f3f3" : "white",
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

  const bottomRef = useRef(null);
  const inputRef = useRef(null);


  /** 自动滚动到底 */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !sending,
    [input, sending]
  );

  /** 发送消息 */
  const onSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    // 先把用户消息放进列表
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const data = await chat(text);

      // 再放 assistant 回复
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${e.message}` },
      ]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  /** New Chat */
  const onReset = () => {
    setMessages([
      { role: "assistant", content: "New chat. Send me anything." },
    ]);
    setInput("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div style={{ height: "100vh", fontFamily: "sans-serif", background: "#fafafa" }}>
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <header style={{ padding: "24px 18px 12px" }}>
          <h1 style={{ margin: 0 }}>AI Study Copilot</h1>
          <p style={{ margin: "8px 0 0", opacity: 0.7 }}>
            Day 2 Complete · Chat UI + Echo Backend
          </p>

          <button
            onClick={onReset}
            style={{
              marginTop: 12,
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              cursor: "pointer",
              background: "white",
            }}
          >
            New Chat
          </button>
        </header>

        {/* Messages */}
        <main style={{ flex: 1, overflow: "auto", padding: "0 18px 18px" }}>
          {messages.map((m, idx) => (
            <Bubble key={idx} role={m.role} content={m.content} />
          ))}
          <div ref={bottomRef} />
        </main>

        {/* Input */}
        <footer
          style={{
            padding: 18,
            borderTop: "1px solid #eee",
            background: "white",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // Enter 发送；Shift+Enter 换行（textarea 默认行为）
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Type a message..."
              disabled={sending}
              rows={2}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
                lineHeight: 1.4,
              }}
            />
            <button
              onClick={onSend}
              disabled={!canSend}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "1px solid #ddd",
                cursor: canSend ? "pointer" : "not-allowed",
                background: canSend ? "white" : "#f5f5f5",
              }}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>

        </footer>
      </div>
    </div>
  );
}
