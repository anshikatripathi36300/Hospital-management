/**
 * PaymentRecords.jsx — Payment Transactions, Receipts & Cash Collection (Part 14)
 *
 * Inward payment registration, channel reconciliation, and printable thermal payment receipts.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  getAllBills,
  payBillRecord,
  logAuditEvent,
} from '../../data/demoData';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  PlusCircle,
  Receipt,
  Wallet,
  Building,
} from 'lucide-react';

export default function PaymentRecords() {
  const { currentUser } = useAuth();
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  // Modals
  const [recordModal, setRecordModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [toast, setToast] = useState('');

  // Payment Form
  const [targetBillId, setTargetBillId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transNotes, setTransNotes] = useState('Counter payment cleared via QR code scan.');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(() => {
    setBills(getAllBills());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Paid transactions list
  const paidTransactions = useMemo(() => {
    return bills.filter((b) => b.status === 'paid');
  }, [bills]);

  // Pending bills list for the payment modal dropdown
  const pendingBills = useMemo(() => {
    return bills.filter((b) => b.status === 'pending' || b.status === 'unpaid');
  }, [bills]);

  // Open Receipt Modal
  const openReceipt = (bill) => {
    setSelectedBill(bill);
    setReceiptModal(true);
  };

  // Handle Record Payment
  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!targetBillId) {
      showToast('Please select a pending bill.');
      return;
    }

    const updated = payBillRecord(targetBillId, paymentMethod);
    if (!updated) {
      showToast('Error recording payment');
      return;
    }

    logAuditEvent({
      userId: currentUser?.id || 'u008',
      userName: currentUser?.name || 'Vikram Joshi',
      role: 'accountant',
      action: 'PAYMENT_RECEIVED',
      category: 'Billing',
      details: `Payment of ₹${updated.totalAmount} received for ${updated.id} via ${paymentMethod}. Txn: ${updated.transactionId}`,
    });

    showToast(`Payment of ₹${updated.totalAmount} recorded successfully!`);
    setRecordModal(false);
    setTargetBillId('');
    loadData();
  };

  const filteredTransactions = useMemo(() => {
    return paidTransactions.filter((b) => {
      const matchSearch =
        (b.transactionId && b.transactionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.patientId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchMethod =
        methodFilter === 'all' ||
        (b.paymentMethod && b.paymentMethod.toLowerCase().includes(methodFilter.toLowerCase()));

      return matchSearch && matchMethod;
    });
  }, [paidTransactions, searchTerm, methodFilter]);

  return (
    <AppLayout title="Payment Records & Receipts">
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
            <CreditCard size={26} color="var(--color-primary-600)" />
            Payment Records &amp; Cash Desk
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Real-time transaction register, counter receipts, digital payment channel reconciliation.
          </p>
        </div>
        <Button variant="primary" icon={PlusCircle} onClick={() => setRecordModal(true)}>
          Record Inward Payment
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
              placeholder="Search by Txn ID, Invoice #, or Patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="var(--color-text-muted)" />
            <select
              className="form-control"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              style={{ width: 180 }}
            >
              <option value="all">All Payment Methods</option>
              <option value="upi">UPI / QR Code</option>
              <option value="card">Credit / Debit Card</option>
              <option value="cash">Counter Cash</option>
              <option value="insurance">Corporate Insurance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Register Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Invoice Ref</th>
                <th>Patient Details</th>
                <th>Payment Mode</th>
                <th>Amount Paid (₹)</th>
                <th>Date / Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No payment transactions recorded.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--color-primary-700)' }}>
                        {bill.transactionId || `TXN-${bill.id.slice(-6)}`}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{bill.id}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{bill.category}</div>
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
                          background: '#ecfdf5',
                          color: '#047857',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.78rem',
                          fontWeight: 600,
                        }}
                      >
                        {bill.paymentMethod || 'UPI'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.95rem', color: '#047857' }}>
                      ₹{bill.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                      {bill.paymentDate || bill.date}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Printer}
                        onClick={() => openReceipt(bill)}
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inward Payment Modal */}
      {recordModal && (
        <Modal
          isOpen={recordModal}
          onClose={() => setRecordModal(false)}
          title="Record Inward Counter Payment"
        >
          <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Select Pending Invoice *</label>
              <select
                className="form-control"
                value={targetBillId}
                onChange={(e) => setTargetBillId(e.target.value)}
                required
              >
                <option value="">-- Choose Invoice to Settle --</option>
                {pendingBills.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.patientName} ({b.patientId}) — ₹{b.totalAmount} Due
                  </option>
                ))}
              </select>
            </div>

            {targetBillId && (
              <div
                style={{
                  background: 'var(--color-bg-secondary)',
                  padding: '12px 14px',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                }}
              >
                {(() => {
                  const bill = bills.find((b) => b.id === targetBillId);
                  return bill ? (
                    <div>
                      <div><strong>Patient:</strong> {bill.patientName}</div>
                      <div><strong>Service:</strong> {bill.category}</div>
                      <div><strong>Payable Amount:</strong> <span style={{ fontWeight: 700, color: 'var(--color-primary-700)' }}>₹{bill.totalAmount.toLocaleString('en-IN')}</span></div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Payment Channel *</label>
              <select
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="UPI">UPI / Instant QR Payment</option>
                <option value="Credit/Debit Card">Credit / Debit Card POS Machine</option>
                <option value="Cash">Cash at Hospital Billing Counter</option>
                <option value="Corporate Insurance">Third Party Administrator (TPA) Insurance</option>
                <option value="NEFT/RTGS">NEFT / Bank Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cashier Transaction Notes</label>
              <input
                type="text"
                className="form-control"
                value={transNotes}
                onChange={(e) => setTransNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button type="button" variant="ghost" onClick={() => setRecordModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Confirm Clearance &amp; Generate Receipt
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Receipt Modal */}
      {receiptModal && selectedBill && (
        <Modal
          isOpen={receiptModal}
          onClose={() => setReceiptModal(false)}
          title="Payment Acknowledgement Receipt"
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
                <h2 style={{ margin: 0, color: 'var(--color-primary-700)', fontSize: '1.2rem' }}>
                  Apex City Multispecialty Hospital
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  Cashier &amp; Revenue Services Desk
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  42 Medical Enclave, Health City, Bengaluru • GSTIN: 29ABCDE1234F1Z5
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
                  PAYMENT RECEIVED
                </span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: 4, fontWeight: 700 }}>
                  {selectedBill.transactionId || 'TXN-COUNTER-001'}
                </div>
              </div>
            </div>

            {/* Receipt Details */}
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
              <div>
                <div><strong>Patient Name:</strong> {selectedBill.patientName}</div>
                <div><strong>Patient UHID:</strong> {selectedBill.patientId}</div>
                <div><strong>Invoice Reference:</strong> {selectedBill.id}</div>
              </div>
              <div>
                <div><strong>Receipt Date:</strong> {selectedBill.paymentDate || selectedBill.date}</div>
                <div><strong>Payment Method:</strong> {selectedBill.paymentMethod || 'UPI'}</div>
                <div><strong>Received By:</strong> Vikram Joshi, Cashier</div>
              </div>
            </div>

            {/* Payment Summary Box */}
            <div
              style={{
                border: '1px solid var(--color-border)',
                padding: '14px',
                borderRadius: 8,
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.9rem' }}>
                <span>Total Invoiced Dues:</span>
                <span style={{ fontWeight: 600 }}>₹{selectedBill.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.95rem', color: '#047857' }}>
                <span style={{ fontWeight: 600 }}>Amount Received:</span>
                <span style={{ fontWeight: 700 }}>₹{selectedBill.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: 6,
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span>Balance Dues Remaining:</span>
                <span style={{ fontWeight: 600 }}>₹0.00 (Fully Settled)</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="ghost" onClick={() => setReceiptModal(false)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                Print Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
