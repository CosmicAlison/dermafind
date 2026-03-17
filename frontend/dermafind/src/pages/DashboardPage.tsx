import type { AppPage, ScanRecord } from '../types'
import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useAuth } from '../context/AuthContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

const MOCK_SCANS: ScanRecord[] = [
  { id: 1, score: 3, date: 'Mar 14, 2026', lesions: { blackheads: 2, darkspots: 4, papules: 1, pustules: 0, whiteheads: 2, nodules: 1 } },
  { id: 2, score: 1, date: 'Mar 10, 2026', lesions: { blackheads: 5, darkspots: 2, papules: 1, pustules: 2, whiteheads: 2, nodules: 1 } },
  { id: 3, score: 1, date: 'Feb 28, 2026', lesions: { blackheads: 2, darkspots: 4, papules: 1, pustules: 0, whiteheads: 2, nodules: 1 } },
  { id: 4, score: 2, date: 'Feb 20, 2026', lesions: { blackheads: 4, darkspots: 0, papules: 1, pustules: 0, whiteheads: 2, nodules: 1 } },
  { id: 5, score: 0, date: 'Feb 12, 2026', lesions: { blackheads: 2, darkspots: 1, papules: 0, pustules: 0, whiteheads: 0, nodules: 0 } }
]

interface DashboardPageProps {
  setPage: (p: AppPage) => void
}

export function DashboardPage({ setPage }: DashboardPageProps) {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const [scans, setScans] = useState<ScanRecord[] | null>()
  const [recommendation, setRecommendation] = useState<string>();

  useEffect(()=>{
    setRecommendation("Your skin shows a few mild blemishes, one small nodule, and some dark spots. Use a gentle cleanser, apply a retinoid at night, benzoyl peroxide in the morning, and keep your skin moisturized. Protect with sunscreen daily, treat any inflamed spots directly, and avoid picking. Niacinamide or azelaic acid can help fade dark spots over time.");
    setScans(MOCK_SCANS);
  }, []); 

  const chartData = {
    labels: scans?.map(scan => scan.date),
    datasets: [
      {
        label: 'Blackheads',
        data: scans?.map(scan => scan.lesions.blackheads || 0),
        borderColor: '#6366f1',
        backgroundColor: '#6366f1'
      },
      {
        label: 'Whiteheads',
        data: scans?.map(scan => scan.lesions.whiteheads || 0),
        borderColor: '#22c55e',
        backgroundColor: '#22c55e'
      },
      {
        label: 'Pustules',
        data: scans?.map(scan => scan.lesions.pustules || 0),
        borderColor: '#ef4444',
        backgroundColor: '#ef4444'
      },
      {
        label: 'Papules',
        data: scans?.map(scan => scan.lesions.papules || 0),
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b'
      },
      {
        label: 'Nodules',
        data: scans?.map(scan => scan.lesions.nodules || 0),
        borderColor: '#a855f7',
        backgroundColor: '#a855f7'
      },
      {
        label: 'Darkspots',
        data: scans?.map(scan => scan.lesions.darkspots || 0),
        borderColor: '#14b8a6',
        backgroundColor: '#14b8a6'
      }
    ]
  }

  return (
    <div style={{ flex: 1, padding: '28px 24px', margin: '0 auto'}} className="fade-in md:max-w-[680px] w-100vw">

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 600, lineHeight: 1.05 }}>
          Good morning,<br />{firstName}.
        </h1>
      </div>

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
          transition: 'transform 0.2s'
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: '#fff' }}>
            New Scan
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 2 }}>
            Start a skin scan session
          </p>
        </div>

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          </svg>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: '16px 18px'
          }}
        >
          <div
            className="grad-text"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 40,
              fontWeight: 600,
              lineHeight: 1
            }}
          >
            {scans ? scans.length : 0}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            Total scans
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: '16px 18px'
          }}
        >
          <div
            className="grad-text"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 40,
              fontWeight: 600,
              lineHeight: 1
            }}
          >
            {scans? scans[0].score : 0}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            Latest Score
          </div>
        </div>
      </div>

      <div
        style={{
          borderColor: 'var(--border)',
          borderRadius: 'var(--r)',
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--surface)',
          fontWeight: 'lighter', 
          border: '1px solid',
          justifyContent: 'space-between',
          marginBottom: 24,
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
      >
          <p>{recommendation}</p>
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r)',
          padding: 20,
          marginBottom: 24
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: 14
          }}
        >
          Lesion progression
        </div>

        <div style={{ height: 320 }}>
          <Line options={options} data={chartData} />
        </div>
      </div>

      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: 12
        }}
      >
        Recent scans
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MOCK_SCANS.slice(0, 3).map(scan => (
          <div
            key={scan.id}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r)',
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontWeight: 500 }}>{scan.date}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                Score: {scan.score}
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {Object.values(scan.lesions).reduce((a, b) => a + (b || 0), 0)} lesions
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}