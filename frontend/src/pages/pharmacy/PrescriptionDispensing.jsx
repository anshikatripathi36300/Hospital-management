/**
 * PrescriptionDispensing.jsx — Electronic Prescription Fulfillment & Stock Deduction (Part 13)
 *
 * Real-time inventory matching, automated stock reduction, counseling notes,
 * and printable medication dispensing slip.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  getAllPrescriptions,
  updatePrescriptionRecord,
  getAllMedicines,
  updateMedicineStock,
  logAuditEvent,
} from '../../data/demoData';
import {
  Pill,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

export default function PrescriptionDispensing() {
  const { currentUser } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [dispenseModal, setDispenseModal] = useState(false);
  const [printModal, setPrintModal] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [pharmacistNotes, setPharmacistNotes] = useState('Take with full glass of water after food. Complete full antibiotic course.');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(() => {
    setPrescriptions(getAllPrescriptions());
    setMedicines(getAllMedicines());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Dispense Modal
  const openDispense = (rx) => {
    setSelectedRx(rx);
    setPharmacistNotes('Take with full glass of water after food. Complete full antibiotic course.');
    setDispenseModal(true);
  };

  // Open Printable Voucher Modal
  const openPrintSlip = (rx) => {
    setSelectedRx(rx);
    setPrintModal(true);
  };

  // Confirm Dispense Action
  const handleConfirmDispense = (e) => {
    e.preventDefault();
    if (!selectedRx) return;

    // Deduct stock for each prescribed medicine
    (selectedRx.medicines || []).forEach((item) => {
      // Find matching item in inventory
      const foundMed = medicines.find((m) =>
        m.name.toLowerCase().includes(item.name.toLowerCase()) ||
        item.name.toLowerCase().includes(m.name.toLowerCase())
      );
      if (foundMed) {
        // Calculate units to deduct (e.g. 10 tablets)
        const qtyToDeduct = item.days ? Math.min(30, item.days * 2) : 10;
        updateMedicineStock(foundMed.id, -qtyToDeduct);
      }
    });

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    updatePrescriptionRecord(selectedRx.id, {
      status: 'dispensed',
      dispensedAt: `${dateStr} ${timeStr}`,
      dispensedBy: currentUser?.name || 'Sneha Gupta, Pharmacist',
      pharmacistNotes,
    });

    logAuditEvent({
      userId: currentUser?.id || 'u007',
      userName: currentUser?.name || 'Sneha Gupta',
      role: 'pharmacist',
      action: 'PRESCRIPTION_DISPENSED',
      category: 'Pharmacy',
      details: `Prescription ${selectedRx.id} fulfilled for patient ${selectedRx.patientName}. Inventory stock deducted.`,
    });

    showToast(`Prescription ${selectedRx.id} successfully dispensed and inventory adjusted!`);
    setDispenseModal(false);
    loadData();
  };

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      const matchSearch =
        rx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.doctorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && (rx.status === 'pending' || rx.status === 'active')) ||
        (statusFilter === 'dispensed' && (rx.status === 'dispensed' || rx.status === 'completed'));

      return matchSearch && matchStatus;
    });
  }, [prescriptions, searchTerm, statusFilter]);

  return (
    <AppLayout title="Prescription Dispensing Desk">
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
            <ClipboardList size={26} color="var(--color-primary-600)" />
            Electronic Prescription Dispensing &amp; Fulfillment
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Review physician prescriptions, verify drug contraindications and inventory batches, and issue patient medication.
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
              placeholder="Search by Rx Number, Patient Name, UHID, or Prescriber..."
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
              <option value="all">All Prescriptions</option>
              <option value="pending">Awaiting Dispense</option>
              <option value="dispensed">Fulfilled &amp; Dispensed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Prescriptions Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Rx Ref</th>
                <th>Patient Details</th>
                <th>Prescribed By</th>
                <th>Diagnosis</th>
                <th>Medication Items</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No prescriptions match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredPrescriptions.map((rx) => {
                  const isPending = rx.status === 'pending' || rx.status === 'active';
                  return (
                    <tr key={rx.id}>
                      <td>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{rx.id}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{rx.patientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          UHID: {rx.patientId}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{rx.doctorName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {rx.department || 'Outpatient Clinic'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{rx.diagnosis}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(rx.medicines || []).map((m, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: 'var(--color-bg-secondary)',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontSize: '0.75rem',
                                color: 'var(--color-text-secondary)',
                              }}
                            >
                              {m.name} ({m.dosage})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{rx.date}</td>
                      <td>
                        <StatusBadge status={isPending ? 'pending' : 'dispensed'} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {isPending ? (
                            <Button
                              size="sm"
                              variant="primary"
                              icon={Pill}
                              onClick={() => openDispense(rx)}
                            >
                              Dispense
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              icon={Printer}
                              onClick={() => openPrintSlip(rx)}
                            >
                              Print Slip
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispense Modal */}
      {dispenseModal && selectedRx && (
        <Modal
          isOpen={dispenseModal}
          onClose={() => setDispenseModal(false)}
          title={`Dispense Medication — ${selectedRx.id}`}
        >
          <form onSubmit={handleConfirmDispense} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: '0.85rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              }}
            >
              <div><strong>Patient:</strong> {selectedRx.patientName} ({selectedRx.patientId})</div>
              <div><strong>Physician:</strong> {selectedRx.doctorName}</div>
              <div><strong>Clinical Diagnosis:</strong> {selectedRx.diagnosis}</div>
              <div><strong>Date Prescribed:</strong> {selectedRx.date}</div>
            </div>

            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
              Prescribed Drug List &amp; Inventory Verification
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(selectedRx.medicines || []).map((m, idx) => {
                const foundInStock = medicines.find((inv) =>
                  inv.name.toLowerCase().includes(m.name.toLowerCase()) ||
                  m.name.toLowerCase().includes(inv.name.toLowerCase())
                );

                const hasStock = foundInStock && foundInStock.stock > 0;

                return (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--color-border)',
                      padding: '10px 14px',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: hasStock ? 'var(--color-card-bg)' : '#fff5f5',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                        Dosage: <strong>{m.dosage}</strong> • Frequency: {m.frequency} • Duration: {m.duration || (m.days + ' days')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Instructions: {m.instructions || 'Take after meals'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {hasStock ? (
                        <div>
                          <span
                            style={{
                              background: '#ecfdf5',
                              color: '#059669',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            In Stock ({foundInStock.stock} units)
                          </span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                            Shelf: {foundInStock.location}
                          </div>
                        </div>
                      ) : (
                        <span
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          Stock Check Needed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="form-group">
              <label className="form-label">Pharmacist Patient Counseling Remarks</label>
              <textarea
                className="form-control"
                rows={3}
                value={pharmacistNotes}
                onChange={(e) => setPharmacistNotes(e.target.value)}
                placeholder="Dosage schedules, food interactions, adverse effects warning..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button type="button" variant="ghost" onClick={() => setDispenseModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Confirm Dispensing &amp; Deduct Stock
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Dispensing Slip Modal */}
      {printModal && selectedRx && (
        <Modal
          isOpen={printModal}
          onClose={() => setPrintModal(false)}
          title="Medication Dispensing Voucher (Patient Copy)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div
              style={{
                borderBottom: '2px solid var(--color-primary-600)',
                paddingBottom: 12,
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
                  Licensed In-House Pharmacy • D-Pharm Lic #KA-BLR-2022-771
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  42 Medical Enclave, Health City, Bengaluru • Helpdesk: +91 80 2345 6789
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    background: '#ecfdf5',
                    color: '#047857',
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  MEDICATION DISPENSED
                </span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: 4, fontWeight: 600 }}>
                  {selectedRx.id}
                </div>
              </div>
            </div>

            {/* Patient Demographics */}
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: '0.82rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              }}
            >
              <div>
                <div><strong>Patient Name:</strong> {selectedRx.patientName}</div>
                <div><strong>UHID:</strong> {selectedRx.patientId}</div>
                <div><strong>Diagnosis:</strong> {selectedRx.diagnosis}</div>
              </div>
              <div>
                <div><strong>Prescribed By:</strong> {selectedRx.doctorName}</div>
                <div><strong>Dispensed Date:</strong> {selectedRx.dispensedAt || selectedRx.date}</div>
                <div><strong>Dispensed By:</strong> {selectedRx.dispensedBy || 'Sneha Gupta, R.Pharm'}</div>
              </div>
            </div>

            {/* Medication Schedule Table */}
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 6 }}>
                Dispensed Medications &amp; Schedule
              </div>
              <table className="table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Strength / Dose</th>
                    <th>Frequency</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedRx.medicines || []).map((m, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td>{m.dosage}</td>
                      <td>{m.frequency}</td>
                      <td>{m.instructions || 'As advised'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Safety Guidelines */}
            <div
              style={{
                border: '1px solid var(--color-border)',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: '0.8rem',
                background: '#fafafa',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Pharmacist Advisory:</div>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                {selectedRx.pharmacistNotes || 'Store below 25°C away from direct sunlight. Complete antibiotic regimen. In case of unexpected rash or allergic reaction, report to hospital triage immediately.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
              <Button variant="ghost" onClick={() => setPrintModal(false)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                Print Voucher
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
