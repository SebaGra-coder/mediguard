'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    // Impedisce il reload della pagina
    e.preventDefault();

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setResponse(`ERRORE ${res.status}: ${data.message}`);
      } else {
        setResponse(`✅ ${data.message}`);
        // Reset dei campi dopo il login con successo
        setEmail('');
        setPassword('');
      }

    } catch (error) {
      setResponse('Errore critico: server non raggiungibile.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>

      <section>
        <div className="navigation-links">
          <p>Non sei registrato? <Link href="/register">Crea un account</Link></p>
        </div>
      </section>

      <section>
        <h1>Login</h1>

        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Inserisci la tua email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Inserisci la password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        {response && (
          <div className="api-feedback">
            <p>{response}</p>
          </div>
        )}
      </section>
    </main>
  );
}