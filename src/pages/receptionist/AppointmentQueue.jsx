/**
 * AppointmentQueue.jsx — Live OPD Waiting Room Token Queue Manager (Part 10)
 *
 * Features:
 * - Live digital token display board (simulates TV screens in hospital lobby)
 * - Visual "Now Serving" vs "Next in Line" indicators
 * - Token call actions: Call In -> With Doctor -> Mark Complete -> No-Show
 * - Emergency priority bump to push critical walk-in patients to top of queue
 * - Filter by Consulting Doctor or Chamber room
 */
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import {
  getAllAppointments,
  updateAppointmentRecord,
  getAllDoctors,
} from '../../data/demoData';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Bell,
  Flame,
  Volume2,
  Stethoscope,
  Filter,
  Users,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

export default function AppointmentQueue() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('all');
  const [activeCallAnnouncement, setActiveCallAnnouncement] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(() => {
    const all = getAllAppointments();
    setAppointments(all);

    const docs = getAllDoctors();
    setDoctors(docs);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Queue actions
  const handleCallToken = (appt) => {
    updateAppointmentRecord(appt.id, {
      status: 'in-progress',
    });
    loadData();
    setActiveCallAnnouncement({
      tokenNumber: appt.tokenNumber || 1,
      patientName: appt.patientName,
      doctorName: appt.doctorName,
      chamber: appt.chamber || 'Room 302',
    });
    showToast(`Token #${appt.tokenNumber || 1} called into ${appt.chamber || 'Room 302'}`);

    // Auto-dismiss announcement after 6 seconds
    setTimeout(() => {
      setActiveCallAnnouncement(null);
    }, 6000);
  };

  const handleMarkComplete = (apptId) => {
    updateAppointmentRecord(apptId, {
      status: 'completed',
    });
    loadData();
    showToast('Consultation marked as completed.');
  };

  const handleEmergencyBump = (apptId) => {
    updateAppointmentRecord(apptId, {
      type: 'Emergency STAT',
      status: 'waiting',
    });
    loadData();
    showToast('Patient escalated to Emergency Priority.');
  };

  const handleMarkNoShow = (apptId) => {
    updateAppointmentRecord(apptId, {
      status: 'cancelled',
      cancellationReason: 'Patient no-show at lobby queue',
    });
    loadData();
    showToast('Patient marked as No-Show.');
  };

  // Filter appointments for queue
  const queueList = appointments.filter((a) => {
    const isDocMatch =
      selectedDoctorFilter === 'all' || a.doctorName === selectedDoctorFilter;
    return isDocMatch;
  });

  // Now serving (in-progress) and Waiting list
  const nowServingList = queueList.filter((a) => a.status === 'in-progress');
  const waitingList = queueList.filter((a) => a.status === 'waiting');
  const upcomingConfirmed = queueList.filter((a) => a.status === 'confirmed');

  return (
    <AppLayout title="OPD Queue Manager">
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

      {/* Visual Token Call Announcement Banner */}
      {activeCallAnnouncement && (
        <div
          style={{
            background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
            color: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 24px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(22, 163, 74, 0.35)',
            animation: 'pulse-border 2s infinite',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Volume2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 }}>
                Token Announcement Live
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Token #{activeCallAnnouncement.tokenNumber} — {activeCallAnnouncement.patientName}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, opacity: 0.85 }}>Please proceed immediately to:</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {activeCallAnnouncement.chamber} ({activeCallAnnouncement.doctorName})
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Live OPD Token Queue</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Monitor the waiting room queue, call tokens, and manage consultation progress.
          </p>
        </div>
      </div>

      {/* Digital Token Display Screen Board */}
      <div className="token-display-board">
        <div className="token-display-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 10px #22c55e',
                display: 'inline-block',
              }}
            />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.05em' }}>
              MAIN OPD WAITING LOBBY · LIVE DISPLAY SCREEN
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Updated in Real-Time · Audio Chime Enabled
          </div>
        </div>

        <div className="token-display-grid">
          {doctors.slice(0, 3).map((doc) => {
            const serving = appointments.find(
              (a) => a.doctorName === doc.name && a.status === 'in-progress'
            );
            const nextInLine = appointments.find(
              (a) => a.doctorName === doc.name && a.status === 'waiting'
            );
            return (
              <div
                key={doc.id}
                className={`token-screen-card ${serving ? 'active' : ''}`}
              >
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {doc.chamber || 'Room 302'} · {doc.department}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginTop: 2 }}>
                  {doc.name}
                </div>

                <div className="token-giant-number">
                  {serving ? `#${serving.tokenNumber || 1}` : 'IDLE'}
                </div>

                <div style={{ fontSize: 12, color: serving ? '#86efac' : '#94a3b8', fontWeight: 600 }}>
                  {serving ? serving.patientName : 'Awaiting Next Token'}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 8,
                    borderTop: '1px solid #334155',
                    width: '100%',
                    fontSize: 11,
                    color: '#cbd5e1',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Next:</span>
                  <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                    {nextInLine ? `Token #${nextInLine.tokenNumber || 2} (${nextInLine.patientName.split(' ')[0]})` : 'None in lobby'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chamber Filter Control */}
      <div
        className="card"
        style={{
          padding: 14,
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={16} color="var(--color-text-muted)" />
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Filter Queue by Physician:</span>
          <select
            className="form-control"
            value={selectedDoctorFilter}
            onChange={(e) => setSelectedDoctorFilter(e.target.value)}
            style={{ minWidth: 200 }}
          >
            <option value="all">All Doctors & Chambers</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name} ({d.department} — {d.chamber || 'Room 302'})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--color-text-secondary)' }}>
          <span>Waiting in Lobby: <strong>{waitingList.length}</strong></span>
          <span>In Consultation: <strong>{nowServingList.length}</strong></span>
          <span>Awaiting Arrival: <strong>{upcomingConfirmed.length}</strong></span>
        </div>
      </div>

      {/* Main Queue Management Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            fontWeight: 700,
          }}
        >
          Active Waiting Room & Consultation Queue ({queueList.length} Total Patients)
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Token #</th>
                <th>Patient Details</th>
                <th>Consulting Doctor & Chamber</th>
                <th>Check-in Time</th>
                <th>Priority / Type</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Queue Controls</th>
              </tr>
            </thead>
            <tbody>
              {queueList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                    No patients currently in this queue.
                  </td>
                </tr>
              ) : (
                queueList.map((appt, idx) => (
                  <tr key={appt.id} style={{ background: appt.status === 'in-progress' ? '#f0fdf4' : undefined }}>
                    <td>
                      <span className={`token-badge ${appt.status === 'waiting' ? 'token-badge-waiting' : appt.status === 'in-progress' ? 'token-badge-serving' : ''}`}>
                        #{appt.tokenNumber || idx + 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{appt.patientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        UHID: {appt.patientId} · {appt.reason || 'General'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{appt.doctorName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {appt.department} · {appt.chamber || 'Room 302'}
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {appt.checkInTime ? (
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>{appt.checkInTime}</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Scheduled ({appt.time})</span>
                      )}
                    </td>
                    <td>
                      {appt.type?.includes('Emergency') ? (
                        <span className="token-badge token-badge-emergency">
                          <Flame size={12} style={{ marginRight: 4 }} /> Priority STAT
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                          {appt.type}
                        </span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={appt.status} />
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {/* If in waiting state: Call Token */}
                        {appt.status === 'waiting' && (
                          <button
                            className="btn btn-sm"
                            style={{
                              background: '#16a34a',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: 11,
                              padding: '4px 10px',
                            }}
                            onClick={() => handleCallToken(appt)}
                            title="Call Patient Into Doctor Chamber"
                          >
                            <Volume2 size={13} style={{ marginRight: 4 }} /> Call In
                          </button>
                        )}

                        {/* If confirmed/scheduled: Check In */}
                        {appt.status !== 'waiting' && appt.status !== 'in-progress' && appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => {
                              const now = new Date();
                              updateAppointmentRecord(appt.id, {
                                status: 'waiting',
                                checkInTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              });
                              loadData();
                              showToast(`Patient checked in.`);
                            }}
                          >
                            Check In
                          </button>
                        )}

                        {/* If in-progress: Complete */}
                        {appt.status === 'in-progress' && (
                          <button
                            className="btn btn-sm btn-outline"
                            style={{ fontSize: 11, padding: '4px 8px', color: '#16a34a', borderColor: '#86efac' }}
                            onClick={() => handleMarkComplete(appt.id)}
                          >
                            <CheckCircle2 size={13} style={{ marginRight: 4 }} /> Complete
                          </button>
                        )}

                        {/* Emergency priority bump */}
                        {appt.status === 'waiting' && !appt.type?.includes('Emergency') && (
                          <button
                            className="btn btn-sm"
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              fontSize: 11,
                              padding: '4px 8px',
                            }}
                            onClick={() => handleEmergencyBump(appt.id)}
                            title="Bump to Emergency Priority"
                          >
                            <Flame size={13} />
                          </button>
                        )}

                        {/* No show */}
                        {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <button
                            className="btn btn-sm btn-secondary"
                            style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => handleMarkNoShow(appt.id)}
                            title="Mark as No-Show"
                          >
                            No-Show
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
