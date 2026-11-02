/**
 * LabRequests.jsx — Laboratory Test Requisition Worklist (Part 12)
 *
 * Phlebotomy accessioning, specimen barcoding, and sample pipeline management.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  getAllLabReports,
  updateLabReportRecord,
  saveCustomLabReport,
  getAllPatients,
  COMMON_LAB_TESTS,
} from '../../data/demoData';
import {
  TestTube,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Flame,
  Barcode,
  PlusCircle,
  FlaskConical,
  Microscope,
} from 'lucide-react';

export default function LabRequests() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals
  const [collectModal, setCollectModal] = useState(false);
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [toast, setToast] = useState('');

  // Sample Collection Form State
  const [specimenType, setSpecimenType] = useState('Whole Blood (EDTA)');
  const [collectionNotes, setCollectionNotes] = useState('Collected in fasting state, no hemolysis.');

  // Manual Order Form State
  const [patientId, setPatientId] = useState('');
  const [testId, setTestId] = useState('T-01');
  const [priority, setPriority] = useState('Routine');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(() => {
    setReports(getAllLabReports());
    setPatients(getAllPatients());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open accession modal
  const openAccession = (report) => {
    setSelectedReport(report);
    setSpecimenType(
      report.category === 'Hematology' ? 'Whole Blood (EDTA)' :
      report.category === 'Biochemistry' ? 'Serum (Clot Activator)' :
      report.category === 'Urinalysis' ? 'Mid-stream Clean Urine' : 'Plain Serum'
    );
    setCollectModal(true);
  };

  // Confirm specimen collection
  const handleConfirmCollection = () => {
    if (!selectedReport) return;
    const now = new Date();
    const barcode = `BC-${selectedReport.id.replace('LAB-', '')}-${Math.floor(100 + Math.random() * 900)}`;

    updateLabReportRecord(selectedReport.id, {
      status: 'sample_collected',
      sampleCollectedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sampleBarcode: barcode,
      specimenType,
      phlebotomistNotes: collectionNotes,
      collectedBy: currentUser?.name || 'Arjun Reddy, MLT',
    });

    showToast(`Specimen collected successfully! Barcode tag: ${barcode}`);
    setCollectModal(false);
    loadData();
  };

  // Move directly to processing in analyzer
  const handleMoveToProcessing = (report) => {
    updateLabReportRecord(report.id, {
      status: 'processing',
    });
    showToast(`Requisition ${report.id} loaded into automated analyzer bench.`);
    loadData();
  };

  // Create requisition manually
  const handleCreateOrder = (e) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    const catalogTest = COMMON_LAB_TESTS.find((t) => t.id === testId);

    if (!patient || !catalogTest) {
      showToast('Please select valid patient and test');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const newReport = {
      id: `LAB-2026-${String(reports.length + 1).padStart(3, '0')}`,
      patientId: patient.id,
      patientName: patient.name,
      doctorName: 'Dr. Priya Sharma',
      testName: catalogTest.name,
      testCode: catalogTest.code,
      category: catalogTest.category,
      price: catalogTest.price,
      orderDate: dateStr,
      status: 'pending',
      priority,
      clinicalNotes: clinicalNotes || 'Standard diagnostic workup requested.',
      parameters: catalogTest.parameters.map((p) => ({
        name: p.name,
        unit: p.unit,
        refRange: p.refRange,
        value: '',
        status: 'pending',
      })),
    };

    saveCustomLabReport(newReport);
    showToast(`Order ${newReport.id} registered successfully.`);
    setNewOrderModal(false);
    setPatientId('');
    setClinicalNotes('');
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
      const matchPriority = priorityFilter === 'all' || r.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [reports, searchTerm, statusFilter, priorityFilter]);

  return (
    <AppLayout title="Diagnostic Test Requisitions">
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
            <TestTube size={26} color="var(--color-primary-600)" />
            Diagnostic Test Requisitions &amp; Accessioning
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Track sample intake, assign tube barcodes, and monitor specimen custody from phlebotomy to analyzer.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="primary" icon={PlusCircle} onClick={() => setNewOrderModal(true)}>
            New Lab Order
          </Button>
          <Link to="/lab/results">
            <Button variant="outline" icon={FlaskConical}>
              Results Entry
            </Button>
          </Link>
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
              placeholder="Search by Order ID, Patient Name, UHID, or Test..."
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
              style={{ width: 170 }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Collection</option>
              <option value="sample_collected">Sample Collected</option>
              <option value="processing">In Processing</option>
              <option value="completed">Completed / Released</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={16} color="var(--color-text-muted)" />
            <select
              className="form-control"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ width: 140 }}
            >
              <option value="all">All Priorities</option>
              <option value="Routine">Routine</option>
              <option value="STAT">STAT (Urgent)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Patient Details</th>
                <th>Prescribed Test</th>
                <th>Order Date</th>
                <th>Priority</th>
                <th>Specimen / Barcode</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No lab requisitions match your criteria.
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
                      <span
                        style={{
                          fontSize: '0.72rem',
                          background: 'var(--color-bg-secondary)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {report.category}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{report.orderDate}</td>
                    <td>
                      {report.priority === 'STAT' ? (
                        <span
                          style={{
                            background: '#fef2f2',
                            color: '#dc2626',
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Flame size={12} /> STAT
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Routine</span>
                      )}
                    </td>
                    <td>
                      {report.sampleBarcode ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: '0.78rem', color: 'var(--color-primary-700)' }}>
                            <Barcode size={14} /> {report.sampleBarcode}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            {report.specimenType || 'Specimen Logged'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          Not collected yet
                        </span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={report.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {report.status === 'pending' && (
                          <Button size="sm" variant="primary" icon={TestTube} onClick={() => openAccession(report)}>
                            Accession
                          </Button>
                        )}

                        {report.status === 'sample_collected' && (
                          <Button size="sm" variant="outline" icon={Microscope} onClick={() => handleMoveToProcessing(report)}>
                            Load Analyzer
                          </Button>
                        )}

                        {(report.status === 'sample_collected' || report.status === 'processing') && (
                          <Link to="/lab/results">
                            <Button size="sm" variant="success" icon={FlaskConical}>
                              Results
                            </Button>
                          </Link>
                        )}

                        {report.status === 'completed' && (
                          <Link to="/lab/results">
                            <Button size="sm" variant="ghost">
                              View Report
                            </Button>
                          </Link>
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

      {/* Accession / Specimen Collection Modal */}
      {collectModal && selectedReport && (
        <Modal
          isOpen={collectModal}
          onClose={() => setCollectModal(false)}
          title={`Specimen Accessioning — ${selectedReport.id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: '0.85rem',
              }}
            >
              <div><strong>Patient:</strong> {selectedReport.patientName} ({selectedReport.patientId})</div>
              <div><strong>Prescribed Test:</strong> {selectedReport.testName}</div>
              <div><strong>Ordering Physician:</strong> {selectedReport.doctorName}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Specimen Container / Type</label>
              <select
                className="form-control"
                value={specimenType}
                onChange={(e) => setSpecimenType(e.target.value)}
              >
                <option value="Whole Blood (EDTA Purple Top)">Whole Blood (EDTA Purple Top)</option>
                <option value="Serum (SST Gold/Red Top)">Serum (SST Clot Activator Gold Top)</option>
                <option value="Plasma (Sodium Citrate Light Blue)">Plasma (Sodium Citrate Light Blue)</option>
                <option value="Fluoride Oxalate (Grey Top)">Fluoride Oxalate (Grey Top - Glucose)</option>
                <option value="Mid-stream Clean Catch Urine">Mid-stream Clean Catch Urine Cup</option>
                <option value="Sterile Nasopharyngeal Swab">Sterile Viral Transport Medium (VTM Swab)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sample Phlebotomy Remarks</label>
              <textarea
                className="form-control"
                rows={3}
                value={collectionNotes}
                onChange={(e) => setCollectionNotes(e.target.value)}
                placeholder="Fasting state, collection site, absence of hemolysis or lipemia..."
              />
            </div>

            <div
              style={{
                border: '1px dashed var(--color-primary-400)',
                background: '#eff6ff',
                padding: '12px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Barcode size={32} color="var(--color-primary-600)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-primary-800)' }}>
                  Auto-Generated Laboratory Accession Barcode
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-600)', fontFamily: 'monospace' }}>
                  BC-{selectedReport.id.replace('LAB-', '')}-SAMPLE-VERIFIED
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button variant="ghost" onClick={() => setCollectModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" icon={CheckCircle2} onClick={handleConfirmCollection}>
                Confirm Collection &amp; Issue Barcode
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Manual Order Modal */}
      {newOrderModal && (
        <Modal
          isOpen={newOrderModal}
          onClose={() => setNewOrderModal(false)}
          title="Create Diagnostic Laboratory Requisition"
        >
          <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Select Patient *</label>
              <select
                className="form-control"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id}) — {p.gender}, {p.age} yrs
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Diagnostic Test from Catalog *</label>
              <select
                className="form-control"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
                required
              >
                {COMMON_LAB_TESTS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category}) — ₹{t.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Triage Priority *</label>
              <select
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Routine">Routine Diagnostic (2-4 hrs turnaround)</option>
                <option value="STAT">STAT Emergency (&lt; 45 mins rapid turnaround)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Indication / Diagnosis</label>
              <input
                type="text"
                className="form-control"
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="e.g. Rule out anemia, pre-operative screening, recurrent fever"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button type="button" variant="ghost" onClick={() => setNewOrderModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={PlusCircle}>
                Register Requisition
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
