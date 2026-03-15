import { useAuth } from '../context/AuthContext';
import type { AppPage, ScanRecord } from '../index';

const MOCK_SCANS: ScanRecord[] = [
  { id: 1, name: 'Left forearm',   date: 'Mar 14, 2026', status: 'clear'   },
  { id: 2, name: 'Upper back',     date: 'Mar 10, 2026', status: 'review'  },
  { id: 3, name: 'Right shoulder', date: 'Feb 28, 2026', status: 'clear'   },
  { id: 4, name: 'Neck area',      date: 'Feb 20, 2026', status: 'concern' },
  { id: 5, name: 'Left cheek',     date: 'Feb 12, 2026', status: 'clear'   },
];

const CHART_DATA = [
  { month: 'Oct', count: 2 }, { month: 'Nov', count: 3 }, { month: 'Dec', count: 1 },
  { month: 'Jan', count: 4 }, { month: 'Feb', count: 3 }, { month: 'Mar', count: 2 },
];

const STATUS_COLORS: Record<string, string>  = { clear: '#34C759', review: '#FF9F0A', concern: '#D4735A' };
const STATUS_BG: Record<string, string>      = { clear: 'rgba(52,199,89,0.12)', review: 'rgba(255,159,10,0.12)', concern: 'rgba(212,115,90,0.12)' };
const STATUS_LABEL: Record<string, string>   = { clear: 'Clear', review: 'Review', concern: 'Concern' };

interface DashboardPageProps {
  setPage: (p: AppPage) => void;
}

export function DashboardPage({ setPage }: DashboardPageProps) {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const maxCount  = Math.max(...CHART_DATA.map(d => d.count));
  const needsReview = MOCK_SCANS.filter(s => s.status !== 'clear').length;

  return (
    <div style={{ flex: 1, padding: '28px 24px', maxWidth: 680, margin: '0 auto', width: '100%' }} className="fade-in">

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 600, lineHeight: 1.05 }}>
          Good morning,<br />{firstName}.
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>Your skin health overview</p>
      </div>

      {/* Scan CTA card */}
      <div
        onClick={() => setPage('scan')}
        style={{
          background: 'var(--grad)',
          borderRadius: 'var(--r)',
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          cursor: 'pointer',
          transition: 'transform 0.2s, opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: '#fff' }}>
            New Scan
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 2 }}>
            Analyse a skin area with AI
          </p>
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { n: MOCK_SCANS.length, label: 'Total scans', grad: true },
          { n: needsReview,       label: 'Needs review', grad: false },
        ].map(({ n, label, grad }) => (
          <div key={label} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: '18px 20px',
          }}>
            <div className={grad ? 'grad-text' : ''} style={{
              fontFamily: 'var(--font-display)',
              fontSize: 40,
              fontWeight: 600,
              lineHeight: 1,
              ...(grad ? {} : { color: 'var(--text)' }),
            }}>
              {n}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r)',
        padding: 20,
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
          Scans per month
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
          {CHART_DATA.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{
                width: '100%',
                height: `${(d.count / maxCount) * 100}%`,
                borderRadius: '5px 5px 0 0',
                background: i === CHART_DATA.length - 1
                  ? 'linear-gradient(160deg,#5B4FC4,#D4735A)'
                  : 'rgba(255,255,255,0.1)',
                minHeight: 4,
                transition: 'opacity 0.2s',
              }} />
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{d.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent scans list */}
      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
        Recent scans
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MOCK_SCANS.map(scan => (
          <div key={scan.id} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(91,79,196,0.35)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[scan.status], flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{scan.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{scan.date}</div>
            </div>
            <div style={{
              fontSize: 11,
              padding: '4px 12px',
              borderRadius: 20,
              fontWeight: 500,
              background: STATUS_BG[scan.status],
              color: STATUS_COLORS[scan.status],
            }}>
              {STATUS_LABEL[scan.status]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
