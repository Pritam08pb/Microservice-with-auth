"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { documents } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function DocumentsPage() {
  const router = useRouter();
  const [files, setFiles] = useState<Array<{ id: string; filename: string; createdAt: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const token = getAuthToken();

  const fetchDocs = async () => {
    if (!token) return;
    try {
      const data = await documents.list(token);
      setFiles(data.documents || []);
    } catch (err: any) {
      setError(err?.message || 'Could not load documents');
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchDocs();
  }, [token, router]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (!token) return;

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await documents.upload(token, file);
      await fetchDocs();
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeDoc = async (id: string) => {
    if (!token) return;
    try {
      await documents.delete(token, id);
      setFiles((prev) => prev.filter((x) => x.id !== id));
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
    }
  };

  return (
    <main className="container">
      <Navbar />
      <section className="card">
        <h1>Documents</h1>
        <p>Upload PDF or text docs for RAG.</p>
        <input type="file" onChange={onUpload} disabled={uploading} />
        {uploading && <p>Uploading…</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <ul>
          {files.map((file) => (
            <li key={file.id}>
              {file.filename} <button onClick={() => removeDoc(file.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
