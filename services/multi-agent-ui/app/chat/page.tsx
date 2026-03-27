"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { agent } from '@/lib/api';
import { getAuthToken, getUserId } from '@/lib/auth';
import { getAgentSocket } from '@/lib/socket';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export default function ChatPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [stream, setStream] = useState<string[]>([]);
  const [status, setStatus] = useState('idle');
  const [messageId, setMessageId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [conversationId, setConversationId] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  const token = getAuthToken();
  const userId = getUserId();

  // Load conversations on mount
  useEffect(() => {
    if (token) {
      loadConversations();
    }
  }, [token]);

  // Load conversation history when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId]);

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

      // Reload conversation to get the new message
      if (payload.conversationId) {
        loadConversation(payload.conversationId);
      }
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

  const loadConversations = async () => {
    try {
      const res = await agent.getConversations(token!);
      setConversations(res.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const res = await agent.getConversation(token!, id);
      setCurrentConversation(res.conversation);
      setConversationId(id);

      // Convert messages to stream format for display
      const messageStream = res.conversation.messages.flatMap((msg: Message) => [
        `${msg.role === 'user' ? '📝 You' : '🤖 Assistant'}: ${msg.content}`
      ]);
      setStream(messageStream);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const startNewConversation = () => {
    setConversationId('');
    setCurrentConversation(null);
    setStream([]);
    setStatus('idle');
    setError('');
  };

  const submitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStream((prev) => [...prev, `📝 You: ${prompt}`]);

    if (!token) return;

    try {
      const res = await agent.task(token, prompt, conversationId);
      setMessageId(res.messageId || '');
      setConversationId(res.conversationId || conversationId);
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
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Conversations Sidebar */}
          <div style={{ width: '300px', borderRight: '1px solid #ccc', paddingRight: '20px' }}>
            <h3>Conversations</h3>
            <button onClick={startNewConversation} style={{ marginBottom: '10px' }}>
              New Conversation
            </button>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  style={{
                    padding: '10px',
                    margin: '5px 0',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    backgroundColor: conv.id === conversationId ? '#f0f0f0' : 'white'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{conv.title || 'Untitled'}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {conv.messages?.length || 0} messages
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div style={{ flex: 1 }}>
            <h1>Agent Chat</h1>
            {currentConversation && (
              <h2>{currentConversation.title || 'Untitled Conversation'}</h2>
            )}

            <form onSubmit={submitPrompt}>
              <label>Message for the agent</label>
              <input
                className="input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask anything"
                required
              />
              <button type="submit">Send</button>
            </form>

            <p>Status: {status}</p>
            {messageId && <p>Current messageId: {messageId}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="agent-stream" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {stream.map((line, i) => (
                <p key={`line-${i}`}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}