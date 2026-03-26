"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      router.push('/login');
    }
  };

  return (
    <div className="navbar">
      <Link href="/">Home</Link>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/chat">Chat</Link>
      <Link href="/documents">Documents</Link>
      <Link href="/config">Bot Config</Link>
      {!token ? (
        <>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </>
      ) : (
        <button onClick={logout}>Logout</button>
      )}
    </div>
  );
}
