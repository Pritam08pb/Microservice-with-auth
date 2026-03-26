"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { agent } from '@/lib/api';
import { getAuthToken, getUserId } from '@/lib/auth';
import { getAgentSocket } from '@/lib/socket';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [stream, setStream] = useState<string[]>([]);
  const [status, setStatus] = useState('idle');
  const [messageId, setMessageId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const token = getAuthToken();
  const userId = getUserId();

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const socket = getAgentSocket();
    const room = userId;

    if (room) {
      socket.emit('join_agent_room', room);
    }

    socket.on('agent_status', (payload: any) => {
      setStatus(payload.status);
    });

    socket.on('agent_stream', (text: string) => {
      setStream((prev) => [...prev, text]);
    });

    socket.on('agent_complete', (payload: any) => {
      setStatus('complete');
      setStream((prev) => [...prev, `✅ Completed: ${payload.result}`]);
    });

    socket.on('agent_error', (payload: any) => {
      setStatus('error');
      setError(payload.error || payload.message || 'Agent failure');
    });

    return () => {
      socket.off('agent_status');
      socket.off('agent_stream');
      socket.off('agent_complete');
      socket.off('agent_error');
    };
  }, [token, userId, router]);

  const submitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStream((prev) => [...prev, `📝 You: ${prompt}`]);

    if (!token) return;

    try {
      const res = await agent.task(token, prompt);
      setMessageId(res.messageId || '');
      setStatus('queued');
      setStream((prev) => [...prev, `📥 queued task: ${res.messageId}`]);
      setPrompt('');
    } catch (err: any) {
      setError(err?.message || 'Failed to send prompt');
    }
  };

  return (
    <main className="container">
      <Navbar />
      <section className="card">
        <h1>Agent Chat</h1>

        <form onSubmit={submitPrompt}>
          <label>Message for the agent</label>
          <input className="input" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask anything" required />
          <button type="submit">Send</button>
        </form>

        <p>Status: {status}</p>
        {messageId && <p>Current messageId: {messageId}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="agent-stream">
          {stream.map((line, i) => (
            <p key={`line-${i}`}>{line}</p>
          ))}
        </div>
      </section>
    </main>
  );
}
