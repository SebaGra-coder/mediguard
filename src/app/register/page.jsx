'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dataNascita, setDataNascita] = useState('');

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          cognome,
          email,
          password,
          data_nascita: dataNascita
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setResponse(`ERRORE ${res.status}: ${data.message}`);
      } else {
        setResponse(`✅ ${data.message}`);
        // Reset di tutti i campi dopo il successo
        setNome('');
        setCognome('');
        setEmail('');
        setPassword('');
        setDataNascita('');
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
          <p>Hai già un account? <Link href="/login">Accedi qui</Link></p>
        </div>
      </section>

      <section>
        <h1>Registrazione</h1>

        <form onSubmit={handleRegister}>
          <div>
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              type="text"
              placeholder="Il tuo nome"
              required
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="cognome">Cognome</label>
            <input
              id="cognome"
              type="text"
              placeholder="Il tuo cognome"
              required
              value={cognome}
              onChange={e => setCognome(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="esempio@mail.com"
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
              placeholder="Scegli una password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="dataNascita">Data di Nascita</label>
            <input
              id="dataNascita"
              type="date"
              required
              value={dataNascita}
              onChange={e => setDataNascita(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Registrazione in corso...' : 'Registrati'}
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