/**
 * DoctorLabRequests.jsx — Diagnostic Laboratory Orders & Results (Part 8)
 *
 * Features:
 * - Diagnostic lab orders roster scoped to attending physician
 * - "Order Diagnostic Test" modal with pre-configured hospital test catalog
 * - Priority flags: Routine vs. STAT (Emergency)
 * - Result inspection drawer with reference ranges, unit measurements, and abnormal alerts
 */
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  getAllLabReports,
  saveCustomLabReport,
  getAllPatients,
  COMMON_LAB_TESTS,
} from '../../data/demoData';
import {
  TestTube,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  FlaskConical,
  Flame,
  Printer,
} from 'lucide-react';

export default function DoctorLabRequests() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [orderModal, setOrderModal] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [toast, setToast] = useState('');

  // Form State
  const [patientId, setPatientId] = useState('');
  const [testId, setTestId] = useState('T-01');
  const [priority, setPriority] = useState('Routine');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(() => {
    const allReports = getAllLabReports();
    const docReports = allReports.filter(
      (r) => r.doctorName === currentUser?.name || currentUser?.role === 'admin'
    );
    setReports(docReports);

    const allPts = getAllPatients();
    setPatients(allPts);
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const handleOpenOrderModal = () => {
    if (patients.length > 0) setPatientId(patients[0].id);
    setTestId('T-01');
    setPriority('Routine');
    setClinicalNotes('');
    setOrderModal(true);
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const targetPatient = patients.find((p) => p.id === patientId);
    const targetTest = COMMON_LAB_TESTS.find((t) => t.id === testId);
    if (!targetPatient || !targetTest) return;

    const newOrder = {
      id: `LAB-${Date.now().toString().slice(-6)}`,
      patientId: targetPatient.id,
      patientName: targetPatient.name,
      doctorId: currentUser?.id || 'DOC-001',
      doctorName: currentUser?.name || 'Dr. Priya Sharma',
      testName: targetTest.name,
      category: targetTest.department,
      requestedDate: new Date().toISOString().split('T')[0],
      completedDate: null,
      priority,
      status: 'pending',
      results: [],
      doctorNotes: clinicalNotes || 'Diagnostic evaluation requested by attending physician.',
    };

    saveCustomLabReport(newOrder);
    loadData();
    setOrderModal(false);
    showToast(`Lab order ${newOrder.id} (${targetTest.name}) placed.`);
  };

  const handleViewResult = (rep) => {
    setSelectedReport(rep);
    setResultModal(true);
  };

  const filtered = reports.filter((r) => {
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout title="Lab Requests">
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Diagnostic Lab Requests</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Order pathology panels, biochemistry tests, and review validated clinical results.
          </p>
        </div>
        <Button variant="primary" icon={PlusCircle} onClick={handleOpenOrderModal}>
          Order Diagnostic Test
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
            placeholder="Search test name, patient, or order ID..."
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
            <option value="all">All Statuses</option>
            <option value="pending">Pending Sample</option>
            <option value="in-progress">In-Processing</option>
            <option value="completed">Completed Results</option>
          </select>
        </div>
      </div>

      {/* Lab Requests Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Requested</th>
                <th>Patient Details</th>
                <th>Diagnostic Test</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                    No lab orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((rep) => {
                  const hasAbnormal = rep.results?.some((r) => r.flag === 'high' || r.flag === 'low');
                  return (
                    <tr key={rep.id}>
                      <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                        {rep.id}
                      </td>
                      <td>
                        <div>{rep.requestedDate}</div>
                        {rep.completedDate && (
                          <div style={{ fontSize: 10, color: 'var(--color-success)' }}>
                            Completed: {rep.completedDate}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{rep.patientName}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          ID: {rep.patientId}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{rep.testName}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          {rep.category}
                        </div>
                      </td>
                      <td>
                        {rep.priority === 'STAT' ? (
                          <span
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              fontWeight: 800,
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 4,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Flame size={12} /> STAT
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              fontWeight: 600,
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}
                          >
                            Routine
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <StatusBadge status={rep.status} />
                          {hasAbnormal && (
                            <span
                              style={{
                                background: '#fef3c7',
                                color: '#b45309',
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: 4,
                              }}
                              title="Abnormal values flagged"
                            >
                              Alert
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: 11, padding: '4px 10px' }}
                          onClick={() => handleViewResult(rep)}
                        >
                          {rep.status === 'completed' ? 'View Results' : 'Order Details'}
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

      {/* Modal: Order Diagnostic Test */}
      {orderModal && (
        <Modal
          isOpen={orderModal}
          onClose={() => setOrderModal(false)}
          title="Order Diagnostic Laboratory Test"
          subtitle="Submit electronic requisition to Hospital Diagnostic Center"
        >
          <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Select Patient
              </label>
              <select
                className="form-control"
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.uhid}) — {p.age} yrs / {p.gender}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Diagnostic Test Panel
                </label>
                <select
                  className="form-control"
                  required
                  value={testId}
                  onChange={(e) => setTestId(e.target.value)}
                >
                  {COMMON_LAB_TESTS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.department}) — ₹{t.cost}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Priority Level
                </label>
                <select
                  className="form-control"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Routine">Routine (Standard)</option>
                  <option value="STAT">STAT (Emergency / Urgent)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Clinical Indication & Specific Instructions
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Reason for ordering test, symptoms to correlate, fasting status required..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button type="button" variant="secondary" onClick={() => setOrderModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Submit Requisition
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: View Lab Test Results */}
      {resultModal && selectedReport && (
        <Modal
          isOpen={resultModal}
          onClose={() => setResultModal(false)}
          title={`Diagnostic Lab Report: ${selectedReport.testName}`}
          subtitle={`Order ID: ${selectedReport.id} · Requested: ${selectedReport.requestedDate}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Report Header Metadata */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                background: '#f8fafc',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #e2e8f0',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: '#64748b' }}>Patient Name</span>
                <div style={{ fontWeight: 700 }}>{selectedReport.patientName}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b' }}>Attending Physician</span>
                <div style={{ fontWeight: 600 }}>{selectedReport.doctorName}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b' }}>Department</span>
                <div style={{ fontWeight: 600 }}>{selectedReport.category}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b' }}>Status</span>
                <div>
                  <StatusBadge status={selectedReport.status} />
                </div>
              </div>
            </div>

            {/* Results Parameter Table */}
            {selectedReport.results && selectedReport.results.length > 0 ? (
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
                  Measured Biomarkers & Test Parameters
                </h4>
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th>Parameter</th>
                        <th>Observed Value</th>
                        <th>Reference Range</th>
                        <th>Unit</th>
                        <th>Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.results.map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{r.parameter}</td>
                          <td style={{ fontWeight: 700, color: r.flag !== 'normal' ? '#b91c1c' : '#0f172a' }}>
                            {r.value}
                          </td>
                          <td style={{ color: '#475569' }}>{r.normalRange}</td>
                          <td style={{ fontSize: 12, color: '#64748b' }}>{r.unit}</td>
                          <td>
                            <span
                              className={`lab-flag-badge ${
                                r.flag === 'high'
                                  ? 'lab-flag-high'
                                  : r.flag === 'low'
                                  ? 'lab-flag-low'
                                  : 'lab-flag-normal'
                              }`}
                            >
                              {r.flag}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: 24,
                  textAlign: 'center',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed #cbd5e1',
                }}
              >
                <Clock size={28} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600 }}>Test Processing in Laboratory</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Specimen has been collected and analyzer run is currently underway. Verified results will appear here once released by the lab technician.
                </div>
              </div>
            )}

            {/* Doctor / Pathologist Remarks */}
            {selectedReport.doctorNotes && (
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: 4 }}>
                  Clinical Interpretation:
                </div>
                <div style={{ color: '#1e3a8a' }}>{selectedReport.doctorNotes}</div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="secondary" onClick={() => setResultModal(false)}>
                Close
              </Button>
              {selectedReport.status === 'completed' && (
                <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                  Print Report
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
