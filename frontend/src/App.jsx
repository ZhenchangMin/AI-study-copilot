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
  const SYSTEM_MESSAGE = useMemo(
    () => ({ role: "system", content: "You are a helpful study copilot." }),
    []
  );

  const MAX_CONTEXT = 10; // ⭐ 只保留最近 10 条消息（核心参数）

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I can remember recent context. Tell me what you're studying.",
    },
  ]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // 保存最新 messages
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 自动滚动
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 初始聚焦
  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const canSend = useMemo(
    () => input.trim().length > 0 && !sending,
    [input, sending]
  );

  const onReset = () => {
    setMessages([
      {
        role: "assistant",
        content: "New chat started. What topic are you learning today?",
      },
    ]);
    setInput("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // ⭐ 发送（带上下文截断）
  const onSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    const userMsg = { role: "user", content: text };

    // 最新历史
    const next = [...messagesRef.current, userMsg];

    // ⭐⭐⭐ 关键：只保留最近 MAX_CONTEXT 条
    const trimmed = next.slice(-MAX_CONTEXT);

    // UI 更新也用截断后的，避免无限增长
    setMessages(trimmed);

    try {
      const reqMessages = [SYSTEM_MESSAGE, ...trimmed];
      const data = await chat(reqMessages);

      setMessages((prev) =>
        [...prev, { role: "assistant", content: data.reply }].slice(-MAX_CONTEXT)
      );
    } catch (e) {
      setMessages((prev) =>
        [...prev, { role: "assistant", content: `Error: ${e.message}` }].slice(
          -MAX_CONTEXT
        )
      );
    } finally {
      setSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
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
            Day 3 Complete · Multi-turn AI with context window
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
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
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
                height: 42,
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
