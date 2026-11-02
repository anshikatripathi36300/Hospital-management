/**
 * LaboratoryDashboard.jsx — Diagnostic Laboratory Portal Dashboard (Part 12)
 *
 * Real-time operational metrics for clinical diagnostics:
 * - Diagnostic test volume, STAT emergency test tracker, samples in analyzer
 * - Workload breakdown by laboratory discipline (Hematology, Biochemistry, etc.)
 * - Pending specimen collection queue with 1-click accessioning
 * - Quick jump to results entry and test catalogs
 */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getAllLabReports } from '../../data/demoData';
import {
  TestTube,
  FlaskConical,
  ClipboardList,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
  Microscope,
  FileSpreadsheet,
} from 'lucide-react';

export default function LaboratoryDashboard() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    setReports(getAllLabReports());
  }, []);

  const stats = useMemo(() => {
    const total = reports.length;
    const pendingCollection = reports.filter((r) => r.status === 'pending' || r.status === 'sample_collected').length;
    const inProcessing = reports.filter((r) => r.status === 'processing').length;
    const completed = reports.filter((r) => r.status === 'completed').length;
    const statAlerts = reports.filter((r) => r.priority === 'STAT' && r.status !== 'completed').length;

    return { total, pendingCollection, inProcessing, completed, statAlerts };
  }, [reports]);

  // Discipline breakdown
  const categoryStats = useMemo(() => {
    const map = {};
    reports.forEach((r) => {
      const cat = r.category || 'General Diagnostics';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [reports]);

  // Recent 5 requests needing attention
  const activeQueue = useMemo(() => {
    return reports
      .filter((r) => r.status !== 'completed')
      .slice(0, 5);
  }, [reports]);

  return (
    <AppLayout title="Laboratory Operations Dashboard">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Microscope size={28} color="var(--color-primary-600)" />
            Clinical Diagnostics Laboratory
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Welcome, <strong>{currentUser?.name || 'Lab Technician'}</strong>. Centralized specimen accessioning, analyzer telemetry, and report authorization.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/lab/requests">
            <Button variant="outline" icon={ClipboardList}>
              Requisition Worklist
            </Button>
          </Link>
          <Link to="/lab/results">
            <Button variant="primary" icon={FlaskConical}>
              Enter &amp; Verify Results
            </Button>
          </Link>
        </div>
      </div>

      {/* STAT Emergency Alert Banner */}
      {stats.statAlerts > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #f87171',
            borderRadius: 10,
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#ef4444',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Flame size={20} />
            </div>
            <div>
              <strong style={{ color: '#991b1b', fontSize: '0.95rem' }}>
                {stats.statAlerts} Urgent STAT Orders Awaiting Rapid Turnaround
              </strong>
              <div style={{ color: '#b91c1c', fontSize: '0.85rem' }}>
                Priority clinical decisions pending in Emergency &amp; ICU wards.
              </div>
            </div>
          </div>
          <Link to="/lab/requests?priority=STAT">
            <Button size="sm" variant="danger" icon={Flame}>
              Process STAT Queue
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
            }}
          >
            <ClipboardList size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {stats.pendingCollection}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Pending Collection
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706',
            }}
          >
            <TestTube size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {stats.inProcessing}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              In Analyzer / Bench
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {stats.completed}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Verified &amp; Released
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: '#f5f3ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c3aed',
            }}
          >
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Total Requisitions
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 20 }}>
        {/* Active Worklist Table */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="var(--color-primary-600)" />
              Urgent &amp; Active Laboratory Requisitions
            </h3>
            <Link to="/lab/requests" style={{ fontSize: '0.82rem', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View full queue <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Patient</th>
                  <th>Test Name</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeQueue.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                      No active tests in the pipeline. All tests are processed!
                    </td>
                  </tr>
                ) : (
                  activeQueue.map((req) => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{req.id}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{req.patientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{req.patientId}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{req.testName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{req.category}</div>
                      </td>
                      <td>
                        {req.priority === 'STAT' ? (
                          <span
                            style={{
                              background: '#fef2f2',
                              color: '#dc2626',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Flame size={12} /> STAT
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Routine</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td>
                        <Link to="/lab/results">
                          <Button size="sm" variant="outline">
                            Process
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnostic Workload Discipline Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileSpreadsheet size={18} color="var(--color-primary-600)" />
              Discipline Workload
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {categoryStats.map(({ name, count }) => {
              const pct = Math.round((count / (reports.length || 1)) * 100);
              return (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 500 }}>{name}</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      width: '100%',
                      background: 'var(--color-bg-secondary)',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, var(--color-primary-500), var(--color-primary-700))',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 20,
              padding: '12px 14px',
              background: 'var(--color-bg-secondary)',
              borderRadius: 8,
              fontSize: '0.82rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
              Quality Assurance Compliance
            </div>
            All analytical runs are calibrated against ISO 15189 reference controls.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
