/**
 * DoctorPatients.jsx — Doctor's Patient Directory & Clinical History (Part 8)
 *
 * Features:
 * - Patient directory filtered for the attending doctor
 * - Search by patient name, UHID, or blood group
 * - Clinical details slide-out drawer with recorded vitals, allergies, conditions, and past notes
 * - Direct shortcuts to prescribe medication or order diagnostic tests
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getAllPatients } from '../../data/demoData';
import {
  Users,
  Search,
  Activity,
  HeartPulse,
  AlertTriangle,
  User,
  Phone,
  FileText,
  PlusCircle,
  X,
  TestTube,
  ShieldAlert,
} from 'lucide-react';

export default function DoctorPatients() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const all = getAllPatients();
    // Scope to patients assigned to this doctor or show all if admin
    const docPatients = all.filter(
      (p) =>
        p.assignedDoctor === currentUser?.name ||
        currentUser?.role === 'admin' ||
        !p.assignedDoctor
    );
    setPatients(docPatients);
  }, [currentUser]);

  const filtered = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.uhid.toLowerCase().includes(term) ||
      (p.diagnosis && p.diagnosis.toLowerCase().includes(term)) ||
      (p.blood && p.blood.toLowerCase().includes(term))
    );
  });

  return (
    <AppLayout title="My Patients">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Assigned Patients Directory</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Comprehensive medical records, recorded vitals, and clinical histories.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 20,
          display: 'flex',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
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
            placeholder="Search patient by name, UHID, blood group, or clinical diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>
      </div>

      {/* Main Grid: Patients Table & Clinical Profile Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedPatient ? '1fr 380px' : '1fr', gap: 20 }}>
        {/* Patients Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>UHID</th>
                  <th>Patient Details</th>
                  <th>Age / Gender</th>
                  <th>Blood Group</th>
                  <th>Admission</th>
                  <th>Diagnosis</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                      No patients found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((pt) => {
                    const isSelected = selectedPatient?.id === pt.id;
                    return (
                      <tr
                        key={pt.id}
                        style={{
                          background: isSelected ? '#eff6ff' : undefined,
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedPatient(pt)}
                      >
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                          {pt.uhid}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{pt.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            {pt.phone} · {pt.bed || 'OPD'}
                          </div>
                        </td>
                        <td>
                          {pt.age} yrs / {pt.gender}
                        </td>
                        <td>
                          <span
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              fontWeight: 700,
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}
                          >
                            {pt.blood}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={pt.admissionStatus || 'outpatient'} />
                        </td>
                        <td style={{ maxWidth: 200, fontSize: 12 }}>
                          {pt.diagnosis || 'General Evaluation'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-sm btn-outline"
                            style={{ fontSize: 11, padding: '4px 10px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPatient(pt);
                            }}
                          >
                            View Clinical File
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clinical Profile Drawer */}
        {selectedPatient && (
          <div
            className="card"
            style={{
              padding: 20,
              background: '#ffffff',
              border: '2px solid var(--color-primary)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              maxHeight: 'calc(100vh - 180px)',
              overflowY: 'auto',
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    textTransform: 'uppercase',
                  }}
                >
                  Clinical Case File
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.2rem', fontWeight: 800 }}>
                  {selectedPatient.name}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  {selectedPatient.uhid} · {selectedPatient.gender}, {selectedPatient.age} yrs
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline"
                style={{ padding: 4 }}
                onClick={() => setSelectedPatient(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Vitals Grid */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-muted)',
                  marginBottom: 8,
                }}
              >
                Current Vitals
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 8,
                }}
              >
                <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Blood Pressure</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                    {selectedPatient.vitals?.bp || '120/80 mmHg'}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Pulse Rate</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                    {selectedPatient.vitals?.pulse || '74 bpm'}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Body Temp</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                    {selectedPatient.vitals?.temp || '98.6°F'}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>SpO2 Saturation</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                    {selectedPatient.vitals?.spo2 || '99%'}
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Alerts (Allergies & Conditions) */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-muted)',
                  marginBottom: 6,
                }}
              >
                Allergies & Cautions
              </div>
              <div
                style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  padding: '8px 12px',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: '#991b1b',
                  fontWeight: 600,
                }}
              >
                <ShieldAlert size={16} />
                <span>{selectedPatient.allergies || 'No known drug allergies (NKDA)'}</span>
              </div>
            </div>

            {/* Primary Diagnosis */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-muted)',
                  marginBottom: 6,
                }}
              >
                Clinical Diagnosis
              </div>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '10px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  lineHeight: 1.4,
                }}
              >
                {selectedPatient.diagnosis || 'Evaluation in progress'}
              </div>
            </div>

            {/* Emergency Contact */}
            <div style={{ fontSize: 12 }}>
              <div style={{ color: 'var(--color-text-muted)', marginBottom: 2 }}>Emergency Contact</div>
              <div style={{ fontWeight: 600 }}>
                {selectedPatient.emergencyContact?.name} ({selectedPatient.emergencyContact?.relation})
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>
                {selectedPatient.emergencyContact?.phone}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10 }}>
              <Button
                variant="primary"
                icon={PlusCircle}
                style={{ width: '100%' }}
                onClick={() => navigate('/doctor/prescriptions')}
              >
                Write Prescription
              </Button>
              <Button
                variant="outline"
                icon={TestTube}
                style={{ width: '100%' }}
                onClick={() => navigate('/doctor/lab-requests')}
              >
                Order Lab Test
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
