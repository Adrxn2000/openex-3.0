import { useState } from 'react';
import useAuthStore from '../store/authStore';

function ChatWidget() {
  const token = useAuthStore((state) => state.token);
  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState('');

  async function ask() {
    const res = await fetch('http://localhost:8080/api/assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setReply(data.response || data.error);
  }

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, border: '1px solid #ccc', padding: 10, background: 'white' }}>
      <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask the assistant..." />
      <button onClick={ask}>Send</button>
      {reply && <p>{reply}</p>}
    </div>
  );
}

export default ChatWidget;