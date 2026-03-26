"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { config, documents, auth as authApi, plugin } from '@/lib/api';
import { getAuthToken, getUserEmail, getUserId, clearAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [activeDocumentId, setActiveDocumentId] = useState<string>('');
  const [isEmailEnabled, setIsEmailEnabled] = useState<boolean>(false);
  const [docCount, setDocCount] = useState<number>(0);
  const [apiKey, setApiKey] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const token = getAuthToken();
  const email = getUserEmail();
  const userId = getUserId();

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    async function loadData() {
      if (!token) return;
      try {
        const configData = await config.get(token);
        setActiveDocumentId(configData.activeDocumentId || '');
        setIsEmailEnabled(Boolean(configData.isEmailEnabled));

        const docs = await documents.list(token);
        setDocCount(docs.documents.length);
      } catch (err: any) {
        setMessage(err?.message || 'Failed to load dashboard settings.');
      }
    }

    loadData();
  }, [token, router]);

  const saveConfig = async () => {
    if (!token) return;
    try {
      await config.update(token, { activeDocumentId: activeDocumentId || undefined, isEmailEnabled });
      setMessage('Configuration saved successfully.');
    } catch (err: any) {
      setMessage(err?.message || 'Failed to save configuration.');
    }
  };

  const generateKey = async () => {
    if (!token) return;
    try {
      const data = await authApi.generateApiKey(token);
      setApiKey(data.apiKey);
      setMessage('API key generated. Copy it now!');
    } catch (err: any) {
      setMessage(err?.message || 'API key creation failed.');
    }
  };

  const linkGoogle = async () => {
    if (!token) return;
    try {
      const data = await plugin.startGoogleConnect(token);
      window.location.href = data.consentUrl;
    } catch (err: any) {
      setMessage(err?.message || 'Google OAuth start failed.');
    }
  };

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <main className="container">
      <Navbar />
      <section className="card">
        <h1>Dashboard</h1>
        <p>Logged in as <strong>{email || 'unknown'}</strong></p>
        <p>UserId: <strong>{userId}</strong></p>

        <h2>Agent configuration</h2>
        <label>Active Document ID</label>
        <input className="input" value={activeDocumentId} onChange={(e) => setActiveDocumentId(e.target.value)} />
        <label>
          <input type="checkbox" checked={isEmailEnabled} onChange={(e) => setIsEmailEnabled(e.target.checked)} /> Enable email context
        </label>
        <button onClick={saveConfig}>Save Bot Config</button>

        <h2>Document vector memory</h2>
        <p>{docCount} documents uploaded.</p>

        <h2>API key</h2>
        <button onClick={generateKey}>Generate API key</button>
        {apiKey && <p>New Key: <code>{apiKey}</code></p>}

        <h2>Plugin integrations</h2>
        <button onClick={linkGoogle}>Connect Google Workspace</button>

        <p style={{ color: 'green' }}>{message}</p>
        <button onClick={logout}>Force logout</button>
      </section>
    </main>
  );
}
