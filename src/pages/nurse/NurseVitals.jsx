/**
 * NurseVitals.jsx — Vital Signs Recording & Physiological Monitoring (Part 11)
 *
 * Features:
 * - Real-time physiological parameters logging (BP, Pulse, Temp, SpO2, Resp Rate, Blood Glucose)
 * - Automated threshold checking with visual warning/critical alert indicators
 * - Direct synchronization with patient medical records and doctor rounds
 * - Comprehensive vitals history log with nurse initials and timestamps
 */
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  getAllPatients,
  getAllVitalsRecords,
  saveCustomVitalsRecord,
  updatePatientRecord,
} from '../../data/demoData';
import {
  HeartPulse,
  Activity,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Droplet,
  User,
  Bed,
} from 'lucide-react';

export default function NurseVitals() {
  const { currentUser } = useAuth();
  const [vitalsList, setVitalsList] = useState([]);
  const [inpatients, setInpatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [logModal, setLogModal] = useState(false);
  const [toast, setToast] = useState('');

  // Form State
  const [patientId, setPatientId] = useState('');
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [pulse, setPulse] = useState('76');
  const [temp, setTemp] = useState('98.6');
  const [spo2, setSpo2] = useState('98');
  const [respRate, setRespRate] = useState('18');
  const [bloodGlucose, setBloodGlucose] = useState('110');
  const [notes, setNotes] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(() => {
    const allPts = getAllPatients();
    setInpatients(allPts.filter((p) => p.admissionStatus === 'inpatient'));

    const allVitals = getAllVitalsRecords();
    setVitalsList(allVitals);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenLogModal = () => {
    if (inpatients.length > 0) setPatientId(inpatients[0].id);
    setBpSystolic('120');
    setBpDiastolic('80');
    setPulse('76');
    setTemp('98.6');
    setSpo2('98');
    setRespRate('18');
    setBloodGlucose('110');
    setNotes('');
    setLogModal(true);
  };

  const handleSaveVitals = (e) => {
    e.preventDefault();
    const targetPt = inpatients.find((p) => p.id === patientId);
    if (!targetPt) return;

    const bpStr = `${bpSystolic}/${bpDiastolic}`;
    const pulseNum = parseInt(pulse, 10);
    const tempNum = parseFloat(temp);
    const spo2Num = parseInt(spo2, 10);

    // Compute Clinical Flag
    let flagStatus = 'normal';
    if (spo2Num < 95 || tempNum >= 101 || pulseNum > 105 || parseInt(bpSystolic, 10) >= 150) {
      flagStatus = 'critical';
    } else if (spo2Num < 97 || tempNum > 99.5 || pulseNum > 90 || parseInt(bpSystolic, 10) >= 135) {
      flagStatus = 'warning';
    }

    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newRecord = {
      id: `VIT-${Date.now().toString().slice(-6)}`,
      patientId: targetPt.id,
      patientName: targetPt.name,
      bed: targetPt.bed || 'Ward Bed',
      recordedAt: timestamp,
      bp: bpStr,
      pulse: String(pulseNum),
      temp: String(tempNum),
      spo2: String(spo2Num),
      respiratoryRate: String(respRate),
      bloodSugar: String(bloodGlucose),
      recordedBy: `${currentUser?.name || 'Meena Patel'}, RN`,
      status: flagStatus,
      notes: notes || 'Vitals recorded during routine nurse rounds.',
    };

    saveCustomVitalsRecord(newRecord);

    // Update patient's current vitals in patient directory
    updatePatientRecord(targetPt.id, {
      vitals: {
        bp: `${bpStr} mmHg`,
        pulse: `${pulseNum} bpm`,
        temp: `${tempNum}°F`,
        spo2: `${spo2Num}%`,
        weight: targetPt.vitals?.weight || '65 kg',
      },
    });

    loadData();
    setLogModal(false);
    showToast(`Vitals logged for ${targetPt.name} (${flagStatus.toUpperCase()} status).`);
  };

  const filtered = vitalsList.filter((v) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      v.patientName.toLowerCase().includes(term) ||
      (v.bed && v.bed.toLowerCase().includes(term)) ||
      (v.notes && v.notes.toLowerCase().includes(term));
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout title="Vital Signs">
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Vital Signs Monitoring</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Record patient physiological parameters, detect clinical deterioration, and alert doctors.
          </p>
        </div>
        <Button variant="primary" icon={PlusCircle} onClick={handleOpenLogModal}>
          Record Vital Signs
        </Button>
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
            placeholder="Search by patient name, bed number, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="var(--color-text-muted)" />
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: 150 }}
          >
            <option value="all">All Vitals Flags</option>
            <option value="normal">Normal</option>
            <option value="warning">Warning Threshold</option>
            <option value="critical">Critical / Alert</option>
          </select>
        </div>
      </div>

      {/* Vitals History Log Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Patient & Bed</th>
                <th>Blood Pressure</th>
                <th>Pulse</th>
                <th>Temp</th>
                <th>SpO2</th>
                <th>Resp / Sugar</th>
                <th>Clinical Flag</th>
                <th>Logged By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                    No vitals records found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id}>
                    <td style={{ fontSize: 12, fontWeight: 600 }}>{v.recordedAt}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{v.patientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600 }}>
                        {v.bed}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {v.bp} <span style={{ fontSize: 10, color: '#64748b' }}>mmHg</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {v.pulse} <span style={{ fontSize: 10, color: '#64748b' }}>bpm</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {v.temp}°F
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          color: parseInt(v.spo2, 10) < 95 ? '#b91c1c' : '#15803d',
                        }}
                      >
                        {v.spo2}%
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: '#475569' }}>
                      {v.respiratoryRate}/min · {v.bloodSugar} mg/dL
                    </td>
                    <td>
                      <span
                        style={{
                          background:
                            v.status === 'critical'
                              ? '#fee2e2'
                              : v.status === 'warning'
                              ? '#fef3c7'
                              : '#dcfce7',
                          color:
                            v.status === 'critical'
                              ? '#b91c1c'
                              : v.status === 'warning'
                              ? '#b45309'
                              : '#15803d',
                          fontWeight: 700,
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                        }}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {v.recordedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Vital Signs */}
      {logModal && (
        <Modal
          isOpen={logModal}
          onClose={() => setLogModal(false)}
          title="Record Patient Vital Signs"
          subtitle="Input physiological observations into inpatient medical chart"
        >
          <form onSubmit={handleSaveVitals} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Select Inpatient
              </label>
              <select
                className="form-control"
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                {inpatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.bed || 'Ward Bed'}) — UHID: {p.uhid}
                  </option>
                ))}
              </select>
            </div>

            {/* Vitals Inputs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Blood Pressure (Systolic / Diastolic)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    className="form-control"
                    required
                    placeholder="Sys"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                  />
                  <span>/</span>
                  <input
                    type="number"
                    className="form-control"
                    required
                    placeholder="Dia"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                  />
                  <span style={{ fontSize: 11, color: '#64748b' }}>mmHg</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Heart / Pulse Rate
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                  />
                  <span style={{ fontSize: 11, color: '#64748b' }}>bpm</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Body Temperature
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    required
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                  />
                  <span style={{ fontSize: 11, color: '#64748b' }}>°F</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Oxygen Saturation (SpO2)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    className="form-control"
                    required
                    min="50"
                    max="100"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                  />
                  <span style={{ fontSize: 11, color: '#64748b' }}>%</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Respiratory Rate
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    className="form-control"
                    value={respRate}
                    onChange={(e) => setRespRate(e.target.value)}
                  />
                  <span style={{ fontSize: 11, color: '#64748b' }}>/min</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Blood Glucose (CBG)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    className="form-control"
                    value={bloodGlucose}
                    onChange={(e) => setBloodGlucose(e.target.value)}
                  />
                  <span style={{ fontSize: 11, color: '#64748b' }}>mg/dL</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Clinical Observation & Nurse Notes
              </label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Patient comfort, pain score (1-10), response to analgesics, breathing pattern..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button type="button" variant="secondary" onClick={() => setLogModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Save & Update Vitals Chart
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
