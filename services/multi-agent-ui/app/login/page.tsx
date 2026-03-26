"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { auth } from '@/lib/api';
import { setAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await auth.login(email, password);
      setAuth(data.token, data.user.id, data.user.email);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <Navbar />
      <section className="card">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      </section>
    </main>
  );
}
