/**
 * InvoiceManagement.jsx — Master Hospital Invoicing & Tax Invoices (Part 14)
 *
 * Itemized invoice generation, GST tax computation, discounts, status tracking,
 * and official printable tax invoices.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  getAllBills,
  saveCustomBill,
  getAllPatients,
  logAuditEvent,
} from '../../data/demoData';
import {
  Receipt,
  Search,
  Filter,
  PlusCircle,
  Printer,
  CheckCircle2,
  Trash2,
  Plus,
  CreditCard,
  Building,
} from 'lucide-react';

export default function InvoiceManagement() {
  const { currentUser } = useAuth();
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [generateModal, setGenerateModal] = useState(false);
  const [printModal, setPrintModal] = useState(false);
  const [activeBill, setActiveBill] = useState(null);
  const [toast, setToast] = useState('');

  // Form State for Invoice Generation
  const [patientId, setPatientId] = useState('');
  const [category, setCategory] = useState('OPD Consultation');
  const [items, setItems] = useState([
    { description: 'Specialist Physician Consultation Fee', qty: 1, rate: 500 },
    { description: 'Hospital Registration & Nursing Charges', qty: 1, rate: 150 },
  ]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(5);
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(() => {
    setBills(getAllBills());
    setPatients(getAllPatients());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Printable Invoice
  const openInvoicePrint = (bill) => {
    setActiveBill(bill);
    setPrintModal(true);
  };

  // Add Item Line
  const addItemLine = () => {
    setItems([...items, { description: '', qty: 1, rate: 0 }]);
  };

  // Remove Item Line
  const removeItemLine = (idx) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  // Update Item Line
  const updateItemLine = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = field === 'description' ? value : parseFloat(value) || 0;
    setItems(updated);
  };

  // Financial calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const taxAmount = useMemo(() => {
    return ((subtotal - discountAmount) * taxPercent) / 100;
  }, [subtotal, discountAmount, taxPercent]);

  const grandTotal = useMemo(() => {
    return Math.round(subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  // Handle Generate Invoice
  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      showToast('Please select a valid registered patient.');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const newBill = {
      id: `INV-2026-${String(bills.length + 1).padStart(3, '0')}`,
      patientId: patient.id,
      patientName: patient.name,
      category,
      date: dateStr,
      dueDate: dateStr,
      status: paymentStatus,
      paymentMethod: paymentStatus === 'paid' ? paymentMethod : null,
      paymentDate: paymentStatus === 'paid' ? dateStr : null,
      transactionId: paymentStatus === 'paid' ? `TXN-${Date.now().toString().slice(-8)}` : null,
      items: items.map((it) => ({
        description: it.description || 'Clinical Service',
        amount: it.qty * it.rate,
        qty: it.qty,
        rate: it.rate,
      })),
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      totalAmount: grandTotal,
      paidAmount: paymentStatus === 'paid' ? grandTotal : 0,
    };

    saveCustomBill(newBill);
    logAuditEvent({
      userId: currentUser?.id || 'u008',
      userName: currentUser?.name || 'Vikram Joshi',
      role: 'accountant',
      action: 'INVOICE_GENERATED',
      category: 'Billing',
      details: `Invoice ${newBill.id} generated for ${patient.name} (Amount: ₹${grandTotal}, Status: ${paymentStatus}).`,
    });

    showToast(`Invoice ${newBill.id} created successfully!`);
    setGenerateModal(false);
    // Reset Form
    setPatientId('');
    setItems([
      { description: 'Specialist Physician Consultation Fee', qty: 1, rate: 500 },
      { description: 'Hospital Registration & Nursing Charges', qty: 1, rate: 150 },
    ]);
    loadData();
  };

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const matchSearch =
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.patientId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'paid' && b.status === 'paid') ||
        (statusFilter === 'pending' && (b.status === 'pending' || b.status === 'unpaid'));

      return matchSearch && matchStatus;
    });
  }, [bills, searchTerm, statusFilter]);

  return (
    <AppLayout title="Hospital Invoice Ledger">
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
            <Receipt size={26} color="var(--color-primary-600)" />
            Consolidated Invoice Management
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Generate itemized tax invoices, reconcile consultation/pharmacy/lab billing, and issue official patient vouchers.
          </p>
        </div>
        <Button variant="primary" icon={PlusCircle} onClick={() => setGenerateModal(true)}>
          Generate New Invoice
        </Button>
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
              placeholder="Search by Invoice #, Patient Name, or UHID..."
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
              <option value="all">All Invoices</option>
              <option value="paid">Paid Invoices</option>
              <option value="pending">Pending / Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoice Ledger Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice Ref</th>
                <th>Patient Details</th>
                <th>Category</th>
                <th>Date</th>
                <th>Payment Mode</th>
                <th>Total (₹)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No invoices match your query.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const isPaid = bill.status === 'paid';
                  return (
                    <tr key={bill.id}>
                      <td>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{bill.id}</span>
                        {bill.transactionId && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                            {bill.transactionId}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{bill.patientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          UHID: {bill.patientId}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            background: 'var(--color-bg-secondary)',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: '0.75rem',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {bill.category || 'Consultation'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{bill.date}</td>
                      <td>
                        <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                          {bill.paymentMethod || (isPaid ? 'Cash' : 'Pending')}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                        ₹{bill.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <StatusBadge status={isPaid ? 'paid' : 'pending'} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Printer}
                          onClick={() => openInvoicePrint(bill)}
                        >
                          Tax Invoice
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {generateModal && (
        <Modal
          isOpen={generateModal}
          onClose={() => setGenerateModal(false)}
          title="Generate Itemized Hospital Tax Invoice"
        >
          <form onSubmit={handleGenerateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
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
                <label className="form-label">Service Category *</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="OPD Consultation">OPD Consultation</option>
                  <option value="Inpatient (IPD) Care">Inpatient (IPD) Care</option>
                  <option value="Diagnostic Laboratory">Diagnostic Laboratory</option>
                  <option value="Pharmacy Dispensary">Pharmacy Dispensary</option>
                  <option value="Emergency Care & Triage">Emergency Care &amp; Triage</option>
                </select>
              </div>
            </div>

            {/* Itemized Line Items */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Billing Line Items</span>
                <Button size="sm" variant="outline" icon={Plus} type="button" onClick={addItemLine}>
                  Add Item
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Item description (e.g. Bed charges, CBC Test)"
                      value={item.description}
                      onChange={(e) => updateItemLine(idx, 'description', e.target.value)}
                      required
                      style={{ flex: 2 }}
                    />
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => updateItemLine(idx, 'qty', e.target.value)}
                      required
                      min="1"
                      style={{ width: 75 }}
                    />
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Rate ₹"
                      value={item.rate}
                      onChange={(e) => updateItemLine(idx, 'rate', e.target.value)}
                      required
                      min="0"
                      style={{ width: 100 }}
                    />
                    <span style={{ width: 85, fontWeight: 600, fontSize: '0.88rem', textAlign: 'right' }}>
                      ₹{(item.qty * item.rate).toFixed(0)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItemLine(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: items.length > 1 ? '#dc2626' : 'var(--color-text-muted)',
                        padding: 4,
                      }}
                      disabled={items.length <= 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax & Discount Calculations */}
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                padding: '12px 14px',
                borderRadius: 8,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                fontSize: '0.85rem',
              }}
            >
              <div>
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Discount %</label>
                  <input
                    type="number"
                    className="form-control"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    style={{ height: 32 }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>GST Tax %</label>
                  <input
                    type="number"
                    className="form-control"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="28"
                    style={{ height: 32 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>Discount ({discountPercent}%):</span>
                  <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                  <span>Tax GST ({taxPercent}%):</span>
                  <span>+ ₹{taxAmount.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: '1rem',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: 4,
                    marginTop: 4,
                  }}
                >
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--color-primary-700)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Payment Status *</label>
                <select
                  className="form-control"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                >
                  <option value="paid">Paid in Full (Clearance)</option>
                  <option value="pending">Pending / Due</option>
                </select>
              </div>

              {paymentStatus === 'paid' && (
                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <select
                    className="form-control"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Credit/Debit Card">Credit / Debit Card</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Corporate Insurance">TPA / Corporate Insurance</option>
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button type="button" variant="ghost" onClick={() => setGenerateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Generate &amp; Register Invoice
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Tax Invoice Print Modal */}
      {printModal && activeBill && (
        <Modal
          isOpen={printModal}
          onClose={() => setPrintModal(false)}
          title="Official Hospital Tax Invoice"
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
                  42 Medical Enclave, Health City, Bengaluru, Karnataka 560029
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  GSTIN: 29ABCDE1234F1Z5 • PAN: AAACE1234F • Reg #REG/KA/MED/2021/8849
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    background: activeBill.status === 'paid' ? '#ecfdf5' : '#fffbeb',
                    color: activeBill.status === 'paid' ? '#047857' : '#b45309',
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {activeBill.status === 'paid' ? 'TAX INVOICE (PAID)' : 'TAX INVOICE (PENDING DUES)'}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.88rem', marginTop: 4, fontWeight: 700 }}>
                  {activeBill.id}
                </div>
              </div>
            </div>

            {/* Demographics */}
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
                <div><strong>Patient Name:</strong> {activeBill.patientName}</div>
                <div><strong>UHID:</strong> {activeBill.patientId}</div>
                <div><strong>Category:</strong> {activeBill.category || 'Consultation'}</div>
              </div>
              <div>
                <div><strong>Invoice Date:</strong> {activeBill.date}</div>
                <div><strong>Payment Channel:</strong> {activeBill.paymentMethod || 'Unpaid'}</div>
                <div><strong>Txn Reference:</strong> {activeBill.transactionId || 'Pending'}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <table className="table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>Service Description</th>
                    <th>Qty</th>
                    <th style={{ textAlign: 'right' }}>Rate (₹)</th>
                    <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeBill.items || [
                    { description: activeBill.category || 'Clinical Consultation', qty: 1, rate: activeBill.totalAmount, amount: activeBill.totalAmount }
                  ]).map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{item.description}</td>
                      <td>{item.qty || 1}</td>
                      <td style={{ textAlign: 'right' }}>₹{(item.rate || item.amount).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{(item.amount || item.rate).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div
              style={{
                alignSelf: 'flex-end',
                width: 260,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>₹{(activeBill.subtotal || activeBill.totalAmount).toFixed(2)}</span>
              </div>
              {activeBill.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>Discount:</span>
                  <span>- ₹{activeBill.discount.toFixed(2)}</span>
                </div>
              )}
              {activeBill.tax > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                  <span>GST (5%):</span>
                  <span>+ ₹{activeBill.tax.toFixed(2)}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  borderTop: '2px solid var(--color-border)',
                  paddingTop: 6,
                  color: 'var(--color-primary-800)',
                }}
              >
                <span>Grand Total:</span>
                <span>₹{activeBill.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Terms and Cashier Sign */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: 6,
                paddingTop: 10,
                borderTop: '1px dashed var(--color-border)',
                fontSize: '0.78rem',
              }}
            >
              <div style={{ color: 'var(--color-text-muted)' }}>
                * Computer generated tax invoice. No signature required.<br />
                All medical services subject to Apex Hospital billing terms.
              </div>
              <div style={{ textAlign: 'right' }}>
                <div><strong>Authorized Cashier</strong></div>
                <div style={{ color: 'var(--color-text-muted)' }}>Accounts &amp; Revenue Dept</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="ghost" onClick={() => setPrintModal(false)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                Print Tax Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
