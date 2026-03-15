import { useState } from 'react';
import { useAuth }        from './context/AuthContext';
import { AuthPage }       from './pages/AuthPage';
import { DashboardPage }  from './pages/DashboardPage';
import { ScanPage }       from './pages/ScanPage';
import { Nav }            from './components/Nav';
import { LoadingSpinner } from './components/LoadingSpinner';
import './styles/globals.css';
import type { AppPage } from './index';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [page, setPage] = useState<AppPage>('dashboard');

  if (isLoading) return <LoadingSpinner label="Restoring session…" />;

  if (!isAuthenticated) return <AuthPage />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav page={page} setPage={setPage} />
      {page === 'dashboard'
        ? <DashboardPage setPage={setPage} />
        : <ScanPage />
      }
    </div>
  );
}
