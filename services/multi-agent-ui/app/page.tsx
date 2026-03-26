import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container">
      <section className="card">
        <h1>Helpy Multi-Agent Frontend</h1>
        <p>Connect to the multi-agent backend at <code>http://localhost:4001</code>.</p>
        <div className="hstack">
          <Link href="/login"><button>Login</button></Link>
          <Link href="/register"><button>Register</button></Link>
          <Link href="/dashboard"><button>Dashboard</button></Link>
          <Link href="/chat"><button>Chatbot</button></Link>
        </div>
      </section>
    </main>
  );
}
