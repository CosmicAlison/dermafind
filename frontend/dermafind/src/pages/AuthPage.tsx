import { useState } from 'react';
import { Logo } from '../components/Logo';
import { Diamond } from '../components/Diamond';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
        await signup({ name, email, password });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      minWidth:'100vw',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    }}>
      {/* ── Visual panel ── */}
      <div className="md:flex md:flex-col hidden" style={{
        background: 'var(--grad)',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 48,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <Diamond size={56} />
          <div style={{
            fontFamily: 'Michelle',
            fontSize: 52,
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.05,
          }}>
            DermaFind
          </div>
          <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 16, textAlign: 'center', lineHeight: 1.6 }}>
            AI-powered skin health,<br />in the palm of your hand.
          </div>

          {/* Three feature pills */}
          {['Instant AI analysis', 'Track over time', 'Dermatologist-grade'].map(f => (
            <div key={f} style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 20,
              padding: '6px 16px',
              fontSize: 13,
              color: '#fff',
              backdropFilter: 'blur(8px)',
            }}>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="w-100" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        background: 'var(--dark)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }} className="fade-in">
          <Logo size="sm" showIcon={false} />
          <div style={{ marginTop: 32, marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 600, lineHeight: 1.1 }}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>
              {mode === 'login'
                ? 'Sign in to continue to DermaFind'
                : 'Start your skin health journey today'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="field">
                <label>Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Doe"
                  autoComplete="name"
                  required
                />
              </div>
            )}
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={8}
                required
              />
            </div>

            {error && <div className="error-banner">{error}</div>}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading
                ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            {mode === 'login' ? 'No account? ' : 'Already have one? '}
            <span
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              style={{ color: 'var(--text)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );

}