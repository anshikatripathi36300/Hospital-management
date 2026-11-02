/**
 * DoctorAvailability.jsx — Consultation Timings & Duty Status (Part 8)
 *
 * Features:
 * - Weekly schedule configuration (working days & consultation hours)
 * - Consultation slot duration (15 min / 30 min) and patient limit controls
 * - Live duty status toggle ("On Duty" vs "On Break / In Surgery")
 * - Synced with administrative appointment booking calendar
 */
import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Save,
} from 'lucide-react';

const DEFAULT_DAYS = [
  { day: 'Monday', enabled: true, start: '09:00', end: '13:00', eveningStart: '16:00', eveningEnd: '19:00' },
  { day: 'Tuesday', enabled: true, start: '09:00', end: '13:00', eveningStart: '16:00', eveningEnd: '19:00' },
  { day: 'Wednesday', enabled: true, start: '09:00', end: '13:00', eveningStart: '16:00', eveningEnd: '19:00' },
  { day: 'Thursday', enabled: true, start: '09:00', end: '13:00', eveningStart: '16:00', eveningEnd: '19:00' },
  { day: 'Friday', enabled: true, start: '09:00', end: '13:00', eveningStart: '16:00', eveningEnd: '19:00' },
  { day: 'Saturday', enabled: true, start: '09:00', end: '14:00', eveningStart: '', eveningEnd: '' },
  { day: 'Sunday', enabled: false, start: '', end: '', eveningStart: '', eveningEnd: '' },
];

export default function DoctorAvailability() {
  const { currentUser } = useAuth();
  const storageKey = `hms_doc_avail_${currentUser?.id || 'doc'}`;

  const [isOnDuty, setIsOnDuty] = useState(true);
  const [slotDuration, setSlotDuration] = useState('20');
  const [maxPatients, setMaxPatients] = useState('25');
  const [schedule, setSchedule] = useState(DEFAULT_DAYS);
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isOnDuty !== undefined) setIsOnDuty(parsed.isOnDuty);
        if (parsed.slotDuration) setSlotDuration(parsed.slotDuration);
        if (parsed.maxPatients) setMaxPatients(parsed.maxPatients);
        if (parsed.schedule) setSchedule(parsed.schedule);
      }
    } catch {
      // fallback to defaults
    }
  }, [storageKey]);

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      isOnDuty,
      slotDuration,
      maxPatients,
      schedule,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
    setToast('Consultation schedule & availability saved successfully!');
    setTimeout(() => setToast(''), 3500);
  };

  const toggleDay = (idx) => {
    const updated = [...schedule];
    updated[idx].enabled = !updated[idx].enabled;
    setSchedule(updated);
  };

  const updateTime = (idx, field, value) => {
    const updated = [...schedule];
    updated[idx][field] = value;
    setSchedule(updated);
  };

  return (
    <AppLayout title="Availability">
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

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Consultation Availability</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Set your weekly consultation hours, slot durations, and current clinic duty status.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Duty Status Banner */}
        <div
          className="card"
          style={{
            marginBottom: 24,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isOnDuty ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${isOnDuty ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: isOnDuty ? '#dcfce7' : '#fee2e2',
                color: isOnDuty ? '#16a34a' : '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: isOnDuty ? '#166534' : '#991b1b' }}>
                Clinic Status: {isOnDuty ? 'Available for OPD Consultations' : 'Off Duty / In Surgery / Taking Break'}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: isOnDuty ? '#15803d' : '#b91c1c' }}>
                {isOnDuty
                  ? 'Patients and receptionists can book appointments according to your weekly schedule.'
                  : 'New bookings are temporarily paused while you are unavailable.'}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn"
            style={{
              background: isOnDuty ? '#16a34a' : '#dc2626',
              color: 'white',
              fontWeight: 600,
              padding: '8px 18px',
            }}
            onClick={() => setIsOnDuty(!isOnDuty)}
          >
            {isOnDuty ? 'Set to Off Duty' : 'Set to On Duty'}
          </button>
        </div>

        {/* Timing Parameters */}
        <div
          className="card"
          style={{
            marginBottom: 24,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Appointment Slot Duration
            </label>
            <select
              className="form-control"
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value)}
            >
              <option value="15">15 Minutes (Fast consults)</option>
              <option value="20">20 Minutes (Standard)</option>
              <option value="30">30 Minutes (Comprehensive)</option>
              <option value="45">45 Minutes (Specialist)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Max Daily Patient Limit
            </label>
            <input
              type="number"
              className="form-control"
              min="5"
              max="60"
              value={maxPatients}
              onChange={(e) => setMaxPatients(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Designated Consultation Chamber
            </label>
            <input
              type="text"
              className="form-control"
              disabled
              value={`${currentUser?.department || 'Cardiology'} OPD — Suite 302`}
            />
          </div>
        </div>

        {/* Weekly Day-by-Day Schedule */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontWeight: 700,
            }}
          >
            Weekly Consultation Hours
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: 120 }}>Day</th>
                  <th style={{ width: 140 }}>Working Day</th>
                  <th>Morning Session</th>
                  <th>Evening Session</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((item, idx) => (
                  <tr key={item.day} style={{ opacity: item.enabled ? 1 : 0.6 }}>
                    <td style={{ fontWeight: 700 }}>{item.day}</td>
                    <td>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => toggleDay(idx)}
                        />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          {item.enabled ? 'Active' : 'Off Day'}
                        </span>
                      </label>
                    </td>
                    <td>
                      {item.enabled ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="time"
                            className="form-control"
                            style={{ width: 120, padding: '4px 8px' }}
                            value={item.start}
                            onChange={(e) => updateTime(idx, 'start', e.target.value)}
                          />
                          <span>to</span>
                          <input
                            type="time"
                            className="form-control"
                            style={{ width: 120, padding: '4px 8px' }}
                            value={item.end}
                            onChange={(e) => updateTime(idx, 'end', e.target.value)}
                          />
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>Clinic Closed</span>
                      )}
                    </td>
                    <td>
                      {item.enabled ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="time"
                            className="form-control"
                            style={{ width: 120, padding: '4px 8px' }}
                            value={item.eveningStart}
                            onChange={(e) => updateTime(idx, 'eveningStart', e.target.value)}
                          />
                          <span>to</span>
                          <input
                            type="time"
                            className="form-control"
                            style={{ width: 120, padding: '4px 8px' }}
                            value={item.eveningEnd}
                            onChange={(e) => updateTime(idx, 'eveningEnd', e.target.value)}
                          />
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>Clinic Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Changes Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button type="submit" variant="primary" icon={Save} size="lg">
            Save Consultation Schedule
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
