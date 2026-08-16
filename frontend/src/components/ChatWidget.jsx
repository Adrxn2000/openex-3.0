import { useState } from 'react';
import useAuthStore from '../store/authStore';

function ChatWidget() {
  const token = useAuthStore((state) => state.token);
  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    setReply('');
    try {
      const res = await fetch('http://localhost:8080/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setReply(data.response || data.error || 'No response');
    } catch (err) {
      setReply('Could not reach the assistant. Is the AI service running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 320,
        background: '#1E293B',
        borderRadius: 14,
        padding: 18,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        border: '1px solid #334155',
      }}
    >
      <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
        🤖 Trading Assistant
      </div>

      {reply && (
        <div
          style={{
            background: '#0F172A',
            borderRadius: 8,
            padding: 10,
            fontSize: 13,
            color: '#F1F5F9',
            marginBottom: 10,
            maxHeight: 160,
            overflowY: 'auto',
          }}
        >
          {reply}
        </div>
      )}

      {loading && (
        <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>
          Thinking... this can take up to a minute locally.
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="Ask about trading..."
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid #334155',
            background: '#0F172A',
            color: '#F1F5F9',
            fontSize: 13,
          }}
        />
        <button
          onClick={ask}
          disabled={loading}
          style={{
            background: '#10B981',
            color: '#0F172A',
            border: 'none',
            borderRadius: 8,
            padding: '8px 14px',
            fontWeight: 700,
            fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWidget;