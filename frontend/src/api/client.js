const API_BASE = "http://127.0.0.1:8000";

// messages: [{ role: "system"|"user"|"assistant", content: string }, ...]
export async function chat(messages) {
  const res = await fetch(`${API_BASE}/api/chat_llm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json(); // { reply: string }
}
