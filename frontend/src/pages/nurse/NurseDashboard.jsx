/**
 * NurseDashboard.jsx — Nurse Station & Patient Care Dashboard (Part 11)
 *
 * Provides the attending nurse with:
 * - Shift Overview: Morning (07:00 - 15:00) · General Inpatient Ward
 * - 4 Real-time KPIs: Assigned Inpatients, Vitals Due, Pending Medication Doses, Completed Tasks
 * - Inpatient Bed Status Watchlist with diet/IV status and latest vitals
 * - Medication & Care Tasks checklist with 1-click completion toggle
 * - Shift Handover clinical briefing notes
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  getAllPatients,
  getAllNursingTasks,
  toggleNursingTask,
  getAllVitalsRecords,
} from '../../data/demoData';
import {
  HeartPulse,
  Users,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Bed,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  Activity,
  Pill,
  Droplet,
} from 'lucide-react';

export default function NurseDashboard() {
  const { currentUser } = useAuth();
  const [inpatients, setInpatients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [handoverNote, setHandoverNote] = useState(
    'Morning round completed. Bed B-14 (Lakshmi Devi) resting post-analgesic. Bed ICU-04 (Kavita Sundaram) on 4L O2, monitor arterial ABG closely.'
  );
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(() => {
    const allPts = getAllPatients();
    const admitted = allPts.filter((p) => p.admissionStatus === 'inpatient');
    setInpatients(admitted);

    const allTasks = getAllNursingTasks();
    setTasks(allTasks);

    const allVitals = getAllVitalsRecords();
    setVitals(allVitals);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle task completion toggle
  const handleToggleTask = (taskId) => {
    const nurseTitle = `${currentUser?.name || 'Meena Patel'}, RN`;
    const updated = toggleNursingTask(taskId, nurseTitle);
    loadData();
    showToast(
      updated?.status === 'completed'
        ? `Task completed and signed off by ${nurseTitle}.`
        : 'Task marked as pending.'
    );
  };

  // KPIs
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const criticalVitalsCount = vitals.filter((v) => v.status === 'critical' || v.status === 'warning').length;

  return (
    <AppLayout title="Nurse Dashboard">
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background: 'var(--color-primary)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}

      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
          color: 'white',
          marginBottom: 24,
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span
              style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Nurse Station 03 · General Inpatient Ward
            </span>
            <span style={{ fontSize: 13, opacity: 0.9 }}>
              Shift: Morning (07:00 - 15:00)
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            Welcome, {currentUser?.name || 'Meena Patel, RN'}
          </h1>
          <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: 'var(--font-size-sm)' }}>
            Patient care monitoring, vital signs tracking, and medication administration (MAR).
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/nurse/vitals">
            <Button
              variant="secondary"
              icon={HeartPulse}
              style={{ background: 'white', color: '#047857', border: 'none', fontWeight: 700 }}
            >
              Record Vitals
            </Button>
          </Link>
          <Link to="/nurse/tasks">
            <Button
              variant="outline"
              icon={Pill}
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
            >
              Medication Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Link to="/nurse/patients" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1d4ed8',
              }}
            >
              <Bed size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{inpatients.length}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Assigned Inpatients
              </div>
            </div>
          </div>
        </Link>

        <Link to="/nurse/tasks" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}>
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
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{pendingTasks.length}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Pending Care Tasks
              </div>
            </div>
          </div>
        </Link>

        <Link to="/nurse/vitals" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b91c1c',
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{criticalVitalsCount}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Abnormal Vitals Flags
              </div>
            </div>
          </div>
        </Link>

        <Link to="/nurse/tasks" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{completedTasks.length}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Tasks Completed Today
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Inpatient Ward Bed Watch & Medication Administration Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Assigned Inpatient Bed Watch */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--color-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bed size={18} color="var(--color-primary)" />
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                Assigned Inpatient Ward Watch ({inpatients.length})
              </h3>
            </div>
            <Link
              to="/nurse/patients"
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'none',
              }}
            >
              Full Bed Map <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Bed Number</th>
                  <th>Patient Details</th>
                  <th>Diagnosis</th>
                  <th>Attending Doctor</th>
                  <th>Latest Vitals</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inpatients.map((pt) => (
                  <tr key={pt.id}>
                    <td>
                      <span
                        style={{
                          background: pt.bed?.includes('ICU') ? '#fee2e2' : '#eff6ff',
                          color: pt.bed?.includes('ICU') ? '#b91c1c' : '#1d4ed8',
                          fontWeight: 800,
                          fontSize: 12,
                          padding: '3px 8px',
                          borderRadius: 4,
                          display: 'inline-block',
                        }}
                      >
                        {pt.bed || 'Ward-A-01'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{pt.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        UHID: {pt.uhid} · {pt.age}y / {pt.gender} ({pt.blood})
                      </div>
                    </td>
                    <td style={{ maxWidth: 180, fontSize: 12 }}>
                      {pt.diagnosis || 'Clinical evaluation'}
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 500 }}>
                      {pt.assignedDoctor || 'Dr. Priya Sharma'}
                    </td>
                    <td>
                      <div style={{ fontSize: 11 }}>
                        <span style={{ fontWeight: 700 }}>BP:</span> {pt.vitals?.bp || '120/80'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        <span style={{ fontWeight: 600 }}>SpO2:</span> {pt.vitals?.spo2 || '99%'} · {pt.vitals?.pulse || '72 bpm'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to="/nurse/vitals">
                        <button className="btn btn-sm btn-outline" style={{ fontSize: 11, padding: '4px 8px' }}>
                          Log Vitals
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Shift Handover Briefing & Urgent Care Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Shift Handover Briefing Note */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <ClipboardList size={18} color="var(--color-primary)" />
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                Shift Handover Briefing
              </h3>
            </div>
            <textarea
              className="form-control"
              rows={4}
              value={handoverNote}
              onChange={(e) => setHandoverNote(e.target.value)}
              placeholder="Record handover notes for next shift nurse..."
              style={{ width: '100%', fontSize: 12, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                className="btn btn-sm btn-primary"
                style={{ fontSize: 11 }}
                onClick={() => showToast('Shift handover note updated and logged.')}
              >
                Save Handover
              </button>
            </div>
          </div>

          {/* Urgent Care Tasks / MAR Checklist */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pill size={18} color="#d97706" />
                <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                  Care Tasks & MAR
                </h3>
              </div>
              <Link to="/nurse/tasks" style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                All Tasks
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.slice(0, 5).map((t) => {
                const isDone = t.status === 'completed';
                return (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: 10,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #e2e8f0',
                      background: isDone ? '#f0fdf4' : '#f8fafc',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => handleToggleTask(t.id)}
                      style={{ marginTop: 4, cursor: 'pointer', width: 16, height: 16 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: isDone ? '#166534' : '#1e293b',
                            textDecoration: isDone ? 'line-through' : 'none',
                          }}
                        >
                          {t.title}
                        </span>
                        {t.priority === 'STAT' && (
                          <span
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              fontSize: 10,
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: 4,
                            }}
                          >
                            STAT
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        {t.patientName} ({t.bed}) · Due: {t.scheduleTime}
                      </div>
                      {isDone && (
                        <div style={{ fontSize: 10, color: '#15803d', marginTop: 2 }}>
                          ✓ Done at {t.completedAt} by {t.completedBy}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
