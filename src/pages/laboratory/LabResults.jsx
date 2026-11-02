/**
 * LabResults.jsx — Structured Diagnostic Results Entry & Official Reporting (Part 12)
 *
 * Automated flag evaluation against biological reference ranges,
 * clinical pathologist remarks, report verification, and printable A4 diagnostic slip.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  getAllLabReports,
  updateLabReportRecord,
  COMMON_LAB_TESTS,
} from '../../data/demoData';
import {
  FlaskConical,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  FileText,
  AlertTriangle,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function LabResults() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [entryModal, setEntryModal] = useState(false);
  const [printModal, setPrintModal] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [paramValues, setParamValues] = useState({});
  const [remarks, setRemarks] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(() => {
    setReports(getAllLabReports());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open entry modal
  const openResultEntry = (report) => {
    setActiveReport(report);
    // Initialize parameter values
    const initialValues = {};
    if (report.parameters && report.parameters.length > 0) {
      report.parameters.forEach((p) => {
        initialValues[p.name] = p.value || '';
      });
    } else {
      // Find default params from catalog
      const cat = COMMON_LAB_TESTS.find((t) => t.name.toLowerCase() === report.testName.toLowerCase());
      if (cat) {
        cat.parameters.forEach((p) => {
          initialValues[p.name] = '';
        });
      }
    }
    setParamValues(initialValues);
    setRemarks(report.notes || report.interpretation || 'Specimen processed on automated clinical analyzer. Controls in valid range.');
    setEntryModal(true);
  };

  // Open printable report modal
  const openReportPreview = (report) => {
    setActiveReport(report);
    setPrintModal(true);
  };

  // Helper to determine flag: Normal, High, Low
  const evaluateFlag = (value, refRange) => {
    if (!value || isNaN(parseFloat(value))) return 'normal';
    const num = parseFloat(value);

    // Look for format like "13.0 - 17.0" or "< 140" or "< 5.7"
    if (refRange.includes('-')) {
      const parts = refRange.split('-').map((s) => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        if (num < parts[0]) return 'low';
        if (num > parts[1]) return 'high';
        return 'normal';
      }
    } else if (refRange.includes('<')) {
      const threshold = parseFloat(refRange.replace('<', '').trim());
      if (!isNaN(threshold) && num > threshold) return 'high';
      return 'normal';
    }
    return 'normal';
  };

  // Save entered results and verify
  const handleSaveAndVerify = (e) => {
    e.preventDefault();
    if (!activeReport) return;

    // Get catalog reference parameters
    const cat = COMMON_LAB_TESTS.find((t) => t.name.toLowerCase() === activeReport.testName.toLowerCase());
    const baseParams = activeReport.parameters && activeReport.parameters.length > 0
      ? activeReport.parameters
      : (cat ? cat.parameters : []);

    const updatedParams = baseParams.map((p) => {
      const val = paramValues[p.name] !== undefined ? paramValues[p.name] : (p.value || '0');
      const flag = evaluateFlag(val, p.refRange);
      return {
        ...p,
        value: val,
        status: flag,
      };
    });

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    updateLabReportRecord(activeReport.id, {
      status: 'completed',
      parameters: updatedParams,
      interpretation: remarks,
      verifiedDate: dateStr,
      verifiedBy: currentUser?.name || 'Arjun Reddy, Lead Medical Technologist',
    });

    showToast(`Report ${activeReport.id} successfully verified and published!`);
    setEntryModal(false);
    loadData();
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.testName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [reports, searchTerm, statusFilter]);

  return (
    <AppLayout title="Diagnostic Results Entry & Verification">
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            background: '#1e293b',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CheckCircle2 size={18} color="#22c55e" />
          {toast}
        </div>
      )}

      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FlaskConical size={26} color="var(--color-primary-600)" />
            Results Entry &amp; Report Verification
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Record quantitative analyzer outputs, review normal biological ranges, and authorize digital lab reports.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: 20, padding: '16px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search
              size={18}
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
              placeholder="Search by Order ID, Patient, UHID, or Test name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="var(--color-text-muted)" />
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 180 }}
            >
              <option value="all">All Statuses</option>
              <option value="sample_collected">Sample Collected (Ready)</option>
              <option value="processing">In Processing</option>
              <option value="completed">Completed / Verified</option>
              <option value="pending">Pending Sample</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Workstation Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Patient Details</th>
                <th>Test Details</th>
                <th>Ordered On</th>
                <th>Sample Barcode</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No lab orders found.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{report.id}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        Dr: {report.doctorName}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{report.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        UHID: {report.patientId}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{report.testName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {report.category}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{report.orderDate}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-primary-700)' }}>
                        {report.sampleBarcode || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={report.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <Button
                          size="sm"
                          variant={report.status === 'completed' ? 'outline' : 'primary'}
                          icon={report.status === 'completed' ? FileText : FlaskConical}
                          onClick={() => openResultEntry(report)}
                        >
                          {report.status === 'completed' ? 'Edit Values' : 'Enter Results'}
                        </Button>

                        {report.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={Printer}
                            onClick={() => openReportPreview(report)}
                          >
                            Print Report
                          </Button>
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

      {/* Enter / Edit Results Modal */}
      {entryModal && activeReport && (
        <Modal
          isOpen={entryModal}
          onClose={() => setEntryModal(false)}
          title={`Diagnostic Results Entry — ${activeReport.testName}`}
        >
          <form onSubmit={handleSaveAndVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: '0.85rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 8,
              }}
            >
              <div><strong>Patient:</strong> {activeReport.patientName} ({activeReport.patientId})</div>
              <div><strong>Order Ref:</strong> {activeReport.id}</div>
              <div><strong>Barcode:</strong> {activeReport.sampleBarcode || 'Unassigned'}</div>
              <div><strong>Referring Doctor:</strong> {activeReport.doctorName}</div>
            </div>

            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--color-text-primary)' }}>
              Quantitative &amp; Qualitative Test Parameters
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(() => {
                const cat = COMMON_LAB_TESTS.find((t) => t.name.toLowerCase() === activeReport.testName.toLowerCase());
                const paramsToRender = activeReport.parameters && activeReport.parameters.length > 0
                  ? activeReport.parameters
                  : (cat ? cat.parameters : [
                      { name: 'Primary Finding / Measurement', unit: 'standard units', refRange: 'Standard' }
                    ]);

                return paramsToRender.map((param) => {
                  const currentValue = paramValues[param.name] ?? '';
                  const flag = evaluateFlag(currentValue, param.refRange);

                  return (
                    <div
                      key={param.name}
                      style={{
                        padding: '12px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        background: flag === 'high' ? '#fffbeb' : flag === 'low' ? '#eff6ff' : 'var(--color-card-bg)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{param.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                          Reference Range: <strong>{param.refRange}</strong> ({param.unit})
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={`Enter value (e.g. 14.2)`}
                          value={currentValue}
                          onChange={(e) =>
                            setParamValues({
                              ...paramValues,
                              [param.name]: e.target.value,
                            })
                          }
                          required
                          style={{ maxWidth: 220 }}
                        />
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{param.unit}</span>

                        {currentValue && (
                          <div style={{ marginLeft: 'auto' }}>
                            {flag === 'high' && (
                              <span
                                style={{
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  padding: '4px 10px',
                                  borderRadius: 4,
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <AlertTriangle size={12} /> HIGH
                              </span>
                            )}
                            {flag === 'low' && (
                              <span
                                style={{
                                  background: '#dbeafe',
                                  color: '#1d4ed8',
                                  padding: '4px 10px',
                                  borderRadius: 4,
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                }}
                              >
                                LOW
                              </span>
                            )}
                            {flag === 'normal' && (
                              <span
                                style={{
                                  background: '#dcfce7',
                                  color: '#15803d',
                                  padding: '4px 10px',
                                  borderRadius: 4,
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <CheckCircle2 size={12} /> NORMAL
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="form-group">
              <label className="form-label">Pathologist Diagnostic Remarks &amp; Correlation</label>
              <textarea
                className="form-control"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Diagnostic impressions, clinical correlation suggested..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button type="button" variant="ghost" onClick={() => setEntryModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={Award}>
                Authorize &amp; Publish Official Report
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Printable Report Modal */}
      {printModal && activeReport && (
        <Modal
          isOpen={printModal}
          onClose={() => setPrintModal(false)}
          title="Diagnostic Laboratory Report (Official Copy)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Report Header */}
            <div
              style={{
                borderBottom: '2px solid var(--color-primary-600)',
                paddingBottom: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: 'var(--color-primary-700)', fontSize: '1.25rem' }}>
                  Apex City Multispecialty Hospital
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  Department of Pathology &amp; Clinical Diagnostics • NABL / ISO 15189 Accredited
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  42 Medical Enclave, Health City, Bengaluru • Tel: +91 80 2345 6789
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    background: '#ecfdf5',
                    color: '#047857',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  VERIFIED REPORT
                </span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: 4, fontWeight: 600 }}>
                  {activeReport.id}
                </div>
              </div>
            </div>

            {/* Patient Demographics Box */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                background: 'var(--color-bg-secondary)',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: '0.82rem',
              }}
            >
              <div>
                <div><strong>Patient Name:</strong> {activeReport.patientName}</div>
                <div><strong>UHID / ID:</strong> {activeReport.patientId}</div>
                <div><strong>Sample Barcode:</strong> {activeReport.sampleBarcode || 'BC-STANDARD'}</div>
              </div>
              <div>
                <div><strong>Referring Doctor:</strong> {activeReport.doctorName}</div>
                <div><strong>Ordered Date:</strong> {activeReport.orderDate}</div>
                <div><strong>Report Verified:</strong> {activeReport.verifiedDate || activeReport.orderDate}</div>
              </div>
            </div>

            {/* Parameter Table */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 8, color: 'var(--color-primary-800)' }}>
                {activeReport.testName} ({activeReport.category || 'Diagnostics'})
              </div>
              <table className="table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Test Parameter</th>
                    <th>Observed Value</th>
                    <th>Biological Reference Range</th>
                    <th>Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeReport.parameters || []).map((p) => {
                    const flag = p.status || evaluateFlag(p.value, p.refRange);
                    return (
                      <tr key={p.name}>
                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                        <td style={{ fontWeight: 700 }}>
                          {p.value} {p.unit}
                        </td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>
                          {p.refRange} {p.unit}
                        </td>
                        <td>
                          {flag === 'high' ? (
                            <span style={{ color: '#b45309', fontWeight: 700 }}>HIGH (▲)</span>
                          ) : flag === 'low' ? (
                            <span style={{ color: '#1d4ed8', fontWeight: 700 }}>LOW (▼)</span>
                          ) : (
                            <span style={{ color: '#15803d', fontWeight: 600 }}>Normal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Clinical Impression */}
            <div
              style={{
                border: '1px solid var(--color-border)',
                padding: '12px',
                borderRadius: 8,
                fontSize: '0.85rem',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Pathologist Interpretation &amp; Remarks:</div>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                {activeReport.interpretation || 'Test results within acceptable clinical limits. Advised clinical correlation.'}
              </p>
            </div>

            {/* Signatures */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: 10,
                paddingTop: 10,
                borderTop: '1px dashed var(--color-border)',
                fontSize: '0.8rem',
              }}
            >
              <div>
                <div><strong>Electronically Verified By:</strong></div>
                <div>{activeReport.verifiedBy || 'Arjun Reddy, M.Sc MLT'}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>Senior Medical Laboratory Technologist</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-primary-700)' }}>Dr. Rajeshwari Swaminathan, MD</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>Consultant Pathologist • KMC Reg #48291</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="ghost" onClick={() => setPrintModal(false)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                Print / Save PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
