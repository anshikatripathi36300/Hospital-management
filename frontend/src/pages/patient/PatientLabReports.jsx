/**
 * PatientLabReports.jsx — Diagnostic Test Reports & Results (Part 9)
 *
 * Features:
 * - Scoped list of diagnostic test orders for the patient
 * - Processing status indicator (Completed, In-Processing, Pending)
 * - Result viewer drawer with normal ranges and abnormal alerts
 * - Attending doctor's clinical comments on results
 * - Official diagnostic report print / export
 */
import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { getAllLabReports } from '../../data/demoData';
import {
  TestTube,
  FileText,
  Clock,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Flame,
} from 'lucide-react';

export default function PatientLabReports() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resultModal, setResultModal] = useState(false);

  useEffect(() => {
    const patId = currentUser?.patientId || 'P-001';
    const all = getAllLabReports();
    const mine = all.filter(
      (r) => r.patientId === patId || r.patientName === currentUser?.name
    );
    setReports(mine);
  }, [currentUser]);

  const handleOpenResult = (rep) => {
    setSelectedReport(rep);
    setResultModal(true);
  };

  return (
    <AppLayout title="My Lab Reports">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Diagnostic Lab Reports</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Verified clinical pathology results, biochemistry profiles, and radiology reports.
          </p>
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            fontWeight: 700,
          }}
        >
          All Diagnostic Test Reports
        </div>

        {reports.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <FlaskConical size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No laboratory reports currently on file for your profile.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Test Name</th>
                  <th>Department</th>
                  <th>Order Date</th>
                  <th>Completed Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => {
                  const hasAbnormal = rep.results?.some((r) => r.flag === 'high' || r.flag === 'low');
                  return (
                    <tr key={rep.id}>
                      <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                        {rep.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{rep.testName}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          Prescribed by: {rep.doctorName}
                        </div>
                      </td>
                      <td>{rep.category}</td>
                      <td>{rep.requestedDate}</td>
                      <td>{rep.completedDate || 'Pending sample run'}</td>
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
                          onClick={() => handleOpenResult(rep)}
                        >
                          {rep.status === 'completed' ? 'View Report' : 'Track Status'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Result Details Modal */}
      {resultModal && selectedReport && (
        <Modal
          isOpen={resultModal}
          onClose={() => setResultModal(false)}
          title={`Diagnostic Lab Report: ${selectedReport.testName}`}
          subtitle={`Report Ref: ${selectedReport.id} · Prescribed by: ${selectedReport.doctorName}`}
        >
          <div className="printable-area" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Report Header Metadata */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 12,
                background: '#f8fafc',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #e2e8f0',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: '#64748b' }}>Patient</span>
                <div style={{ fontWeight: 700 }}>{selectedReport.patientName}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b' }}>Department</span>
                <div style={{ fontWeight: 600 }}>{selectedReport.category}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b' }}>Sample Date</span>
                <div style={{ fontWeight: 600 }}>{selectedReport.requestedDate}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b' }}>Verification Status</span>
                <div>
                  <StatusBadge status={selectedReport.status} />
                </div>
              </div>
            </div>

            {/* Results Table */}
            {selectedReport.results && selectedReport.results.length > 0 ? (
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
                  Observed Clinical Biomarkers
                </h4>
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th>Parameter</th>
                        <th>Your Value</th>
                        <th>Reference Range</th>
                        <th>Unit</th>
                        <th>Interpretation</th>
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
                <div style={{ fontWeight: 600 }}>Specimen Processing Underway</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Your sample has reached the diagnostic laboratory. Verified numerical readings will be published here upon pathologist approval.
                </div>
              </div>
            )}

            {/* Doctor Interpretation Remarks */}
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
                  Physician Interpretation:
                </div>
                <div style={{ color: '#1e3a8a' }}>{selectedReport.doctorNotes}</div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setResultModal(false)}>
              Close
            </Button>
            {selectedReport.status === 'completed' && (
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                Print Laboratory Report
              </Button>
            )}
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
