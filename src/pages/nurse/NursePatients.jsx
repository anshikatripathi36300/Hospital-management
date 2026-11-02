/**
 * NursePatients.jsx — Inpatient Ward Bed Map & Patient Directory (Part 11)
 *
 * Features:
 * - Ward-by-ward bed roster (General Ward A, General Ward B, ICU)
 * - Inpatient clinical summaries with diagnosis, attending doctor, and diet
 * - Clinical details slide-out drawer with vitals history & allergy warnings
 * - Fast shortcut to log vital signs or schedule a nursing care task
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { getAllPatients } from '../../data/demoData';
import {
  Bed,
  Search,
  Filter,
  HeartPulse,
  Activity,
  ShieldAlert,
  X,
  PlusCircle,
  User,
  Clock,
  Phone,
  Droplet,
  CheckCircle2,
} from 'lucide-react';

export default function NursePatients() {
  const navigate = useNavigate();

  const [inpatients, setInpatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const loadPatients = useCallback(() => {
    const all = getAllPatients();
    const admitted = all.filter((p) => p.admissionStatus === 'inpatient');
    setInpatients(admitted);
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const filtered = inpatients.filter((pt) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      pt.name.toLowerCase().includes(term) ||
      pt.uhid.toLowerCase().includes(term) ||
      (pt.bed && pt.bed.toLowerCase().includes(term)) ||
      (pt.diagnosis && pt.diagnosis.toLowerCase().includes(term));

    let matchesWard = true;
    if (wardFilter === 'ward-a') matchesWard = pt.bed?.includes('Ward-A');
    if (wardFilter === 'ward-b') matchesWard = pt.bed?.includes('Ward-B');
    if (wardFilter === 'icu') matchesWard = pt.bed?.includes('ICU');

    return matchesSearch && matchesWard;
  });

  return (
    <AppLayout title="Assigned Patients">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Inpatient Ward Directory & Bed Map</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Monitor admitted inpatients, bed allocations, and clinical care requirements.
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
            placeholder="Search by patient name, UHID, bed number, or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="var(--color-text-muted)" />
          <select
            className="form-control"
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            style={{ minWidth: 160 }}
          >
            <option value="all">All Hospital Wards</option>
            <option value="ward-a">General Ward A</option>
            <option value="ward-b">General Ward B</option>
            <option value="icu">Intensive Care Unit (ICU)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Patients Bed Roster & Clinical Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedPatient ? '1fr 380px' : '1fr', gap: 20 }}>
        {/* Inpatients Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Bed Number</th>
                  <th>Patient Details</th>
                  <th>Age / Gender</th>
                  <th>Blood Group</th>
                  <th>Primary Diagnosis</th>
                  <th>Attending Physician</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                      No admitted inpatients found matching this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((pt) => {
                    const isSelected = selectedPatient?.id === pt.id;
                    const isICU = pt.bed?.includes('ICU');
                    return (
                      <tr
                        key={pt.id}
                        style={{
                          background: isSelected ? '#eff6ff' : undefined,
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedPatient(pt)}
                      >
                        <td>
                          <span
                            style={{
                              background: isICU ? '#fee2e2' : '#eff6ff',
                              color: isICU ? '#b91c1c' : '#1d4ed8',
                              fontWeight: 800,
                              fontSize: 12,
                              padding: '3px 8px',
                              borderRadius: 4,
                            }}
                          >
                            {pt.bed || 'Ward Bed'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{pt.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            UHID: {pt.uhid} · Adm: {pt.registered}
                          </div>
                        </td>
                        <td>
                          {pt.age}y / {pt.gender}
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
                        <td style={{ maxWidth: 200, fontSize: 12 }}>
                          {pt.diagnosis || 'Clinical evaluation'}
                        </td>
                        <td style={{ fontSize: 12, fontWeight: 500 }}>
                          {pt.assignedDoctor || 'Dr. Priya Sharma'}
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
                            Clinical File
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
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    textTransform: 'uppercase',
                  }}
                >
                  Bed File: {selectedPatient.bed}
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
                Recorded Vitals Signs
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Blood Pressure</div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>
                    {selectedPatient.vitals?.bp || '120/80 mmHg'}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Heart / Pulse</div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>
                    {selectedPatient.vitals?.pulse || '76 bpm'}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Temperature</div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>
                    {selectedPatient.vitals?.temp || '98.6°F'}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>SpO2 Saturation</div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>
                    {selectedPatient.vitals?.spo2 || '99%'}
                  </div>
                </div>
              </div>
            </div>

            {/* Allergies & Alerts */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                Allergies & Cautions
              </div>
              <div
                style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#991b1b',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <ShieldAlert size={16} />
                <span>{selectedPatient.allergies || 'No known drug allergies (NKDA)'}</span>
              </div>
            </div>

            {/* Clinical Diagnosis & Attending Doctor */}
            <div style={{ fontSize: 12 }}>
              <div style={{ color: '#64748b', marginBottom: 2 }}>Admission Diagnosis</div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{selectedPatient.diagnosis}</div>
              <div style={{ color: '#64748b', marginTop: 8, marginBottom: 2 }}>Attending Physician</div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{selectedPatient.assignedDoctor}</div>
            </div>

            {/* Emergency Contact */}
            <div style={{ fontSize: 12 }}>
              <div style={{ color: '#64748b', marginBottom: 2 }}>Next of Kin</div>
              <div style={{ fontWeight: 600 }}>
                {selectedPatient.emergencyContact?.name} ({selectedPatient.emergencyContact?.relation})
              </div>
              <div style={{ color: '#64748b' }}>{selectedPatient.emergencyContact?.phone}</div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10 }}>
              <Button
                variant="primary"
                icon={HeartPulse}
                style={{ width: '100%' }}
                onClick={() => navigate('/nurse/vitals')}
              >
                Record New Vitals
              </Button>
              <Button
                variant="outline"
                icon={PlusCircle}
                style={{ width: '100%' }}
                onClick={() => navigate('/nurse/tasks')}
              >
                Add Nursing Care Task
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
