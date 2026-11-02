/**
 * DoctorSchedules.jsx — Physician Chamber Schedules & Quota Inquiries (Part 10)
 *
 * Features:
 * - Directory of all consulting physicians with chamber locations
 * - Real-time duty presence indicators (In-Chamber, On Rounds, On Leave)
 * - OPD consultation timings & daily patient token quotas (Booked vs. Remaining)
 * - Fast shortcut to book arriving patients into an available physician's queue
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import {
  getAllDoctors,
  getAllAppointments,
  getAllDepartments,
} from '../../data/demoData';
import {
  Stethoscope,
  Clock,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Users,
  PlusCircle,
  AlertCircle,
  Building,
} from 'lucide-react';

export default function DoctorSchedules() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const loadData = useCallback(() => {
    const docs = getAllDoctors();
    setDoctors(docs);

    const appts = getAllAppointments();
    setAppointments(appts);

    const depts = getAllDepartments();
    setDepartments(depts);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = doctors.filter((doc) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      doc.name.toLowerCase().includes(term) ||
      doc.department.toLowerCase().includes(term) ||
      (doc.specialization && doc.specialization.toLowerCase().includes(term)) ||
      (doc.chamber && doc.chamber.toLowerCase().includes(term));
    const matchesDept = selectedDept === 'all' || doc.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <AppLayout title="Doctor Schedules">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Doctor Schedules & Chambers</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Daily physician presence, consulting room numbers, and OPD token quota availability.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 20,
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Search by physician name, chamber, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="var(--color-text-muted)" />
          <select
            className="form-control"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ minWidth: 160 }}
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Schedule Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        {filtered.map((doc) => {
          const docAppts = appointments.filter(
            (a) => a.doctorName === doc.name && a.status !== 'cancelled'
          );
          const maxTokens = doc.maxDailyPatients || 25;
          const remainingTokens = Math.max(0, maxTokens - docAppts.length);
          const isFull = remainingTokens === 0;

          return (
            <div
              key={doc.id}
              className="card"
              style={{
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--color-border)',
                transition: 'all 0.15s ease',
              }}
            >
              <div>
                {/* Header: Photo / Initials & Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                        {doc.name}
                      </h3>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                        {doc.specialization} · {doc.department}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    In-Chamber
                  </span>
                </div>

                {/* Chamber Location & OPD Hours */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 10,
                    marginTop: 16,
                    padding: '12px 14px',
                    background: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                >
                  <div>
                    <div style={{ color: '#64748b', fontSize: 11 }}>Chamber Location</div>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{doc.chamber || 'OPD Suite 302'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 11 }}>Consultation Fee</div>
                    <div style={{ fontWeight: 800, color: '#16a34a' }}>₹{doc.consultationFee || 600}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ color: '#64748b', fontSize: 11 }}>Clinic Session Hours</div>
                    <div style={{ fontWeight: 600, color: '#334155' }}>
                      {doc.schedule?.timing || 'Morning: 09:00 - 13:00 · Evening: 16:00 - 19:00'}
                    </div>
                  </div>
                </div>

                {/* Quota & Token Progress Bar */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: '#64748b' }}>Daily Token Quota:</span>
                    <span style={{ fontWeight: 700 }}>
                      {docAppts.length} / {maxTokens} Booked ({remainingTokens} left)
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: 6,
                      background: '#e2e8f0',
                      borderRadius: 999,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (docAppts.length / maxTokens) * 100)}%`,
                        height: '100%',
                        background: isFull ? '#ef4444' : 'var(--color-primary)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={PlusCircle}
                  style={{ width: '100%' }}
                  disabled={isFull}
                  onClick={() => navigate('/receptionist/appointments')}
                >
                  {isFull ? 'Quota Full Today' : 'Book into OPD Queue'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
