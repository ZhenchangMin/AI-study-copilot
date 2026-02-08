import { useState } from "react";

function App() {
  const [msg, setMsg] = useState("");

  const callBackend = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/hello");
      const data = await res.json();
      setMsg(data.msg);
    } catch (err) {
      setMsg("Error calling backend");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>AI Study Copilot</h1>

      <button onClick={callBackend} style={{ padding: "10px 20px" }}>
        Call Backend
      </button>

      <p style={{ marginTop: 20 }}>
        Backend response: <b>{msg}</b>
      </p>
    </div>
  );
}

export default App;

