"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { config } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function ConfigPage() {
  const router = useRouter();
  const [activeDocumentId, setActiveDocumentId] = useState('');
  const [isEmailEnabled, setIsEmailEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = getAuthToken();

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    async function load() {
      if (!token) return;
      try {
        const cfg = await config.get(token);
        setActiveDocumentId(cfg.activeDocumentId || '');
        setIsEmailEnabled(Boolean(cfg.isEmailEnabled));
      } catch (err: any) {
        setError(err?.message || 'Failed to load config');
      }
    }

    load();
  }, [token, router]);

  const save = async () => {
    if (!token) {
      setError('User is not authenticated');
      return;
    }
    try {
      await config.update(token, { activeDocumentId: activeDocumentId || undefined, isEmailEnabled });
      setMessage('Saved');
    } catch (err: any) {
      setError(err?.message || 'Failed to save config');
    }
  };

  return (
    <main className="container">
      <Navbar />
      <section className="card">
        <h1>Bot Config</h1>
        <label>Active Document ID</label>
        <input className="input" value={activeDocumentId} onChange={(e) => setActiveDocumentId(e.target.value)} />
        <label>
          <input type="checkbox" checked={isEmailEnabled} onChange={(e) => setIsEmailEnabled(e.target.checked)} /> Enable email context
        </label>
        <button onClick={save}>Save</button>

        <p style={{ color: 'green' }}>{message}</p>
        <p style={{ color: 'red' }}>{error}</p>
      </section>
    </main>
  );
}
