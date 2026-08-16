import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../store/authStore';

function ChatWidget() {
  const token = useAuthStore((state) => state.token);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function ask() {
    const q = question.trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      const reply = data.response || data.error || 'No response';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Could not reach the assistant. Is the AI service running?' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button className="chat-launcher" onClick={() => setOpen(true)} aria-label="Open chat">
        💬
      </button>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="title">
          <span className="dot"></span>
          Trading Assistant
        </div>
        <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="chat-empty">Ask me about trading, or your balance.</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>{m.text}</div>
        ))}
        {loading && <div className="chat-bubble typing">Thinking...</div>}
      </div>

      <div className="chat-input-row">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="Type a message..."
        />
        <button onClick={ask} disabled={loading}>Send</button>
      </div>
    </div>
  );
}

export default ChatWidget;