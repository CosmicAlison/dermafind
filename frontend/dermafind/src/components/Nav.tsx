import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import type { AppPage } from '../types';

interface NavProps {
  page: AppPage;
  setPage: (p: AppPage) => void;
}

export function Nav({ page, setPage }: NavProps) {
  const { user} = useAuth();

  const initials = user?.username
    ? user.username.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 24px',
      background: 'rgba(14,13,20,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <Logo size="sm" />

      <div style={{ display: 'flex', gap: 4 }}>
        {(['dashboard', 'scan'] as AppPage[]).map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--r-sm)',
              border: 'none',
              background: page === p ? 'var(--surface2)' : 'transparent',
              color: page === p ? 'var(--text)' : 'var(--muted)',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'capitalize',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        //onClick={logout}
        title={`Signed in as ${user?.email ?? ''} — click to sign out`}
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'var(--grad)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 500,
          color: '#fff',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        {initials}
      </button>
    </nav>
  );
}
