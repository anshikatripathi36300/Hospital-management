/**
 * PatientBills.jsx — Patient Invoices & Simulated Online Payments (Part 9)
 *
 * Features:
 * - List of all hospital invoices (OPD consultations, labs, pharmacy)
 * - Detailed itemized invoice breakdown with GST tax computation
 * - Simulated secure online payment modal (UPI, Cards, Net Banking)
 * - Generates official transaction reference and printable payment receipt
 */
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { getAllBills, payBillRecord } from '../../data/demoData';
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  Printer,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  QrCode,
} from 'lucide-react';

export default function PatientBills() {
  const { currentUser } = useAuth();
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);

  // Modals
  const [payModal, setPayModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('rahul@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadBills = useCallback(() => {
    const patId = currentUser?.patientId || 'P-001';
    const all = getAllBills();
    const mine = all.filter(
      (b) => b.patientId === patId || b.patientName === currentUser?.name
    );
    setBills(mine);
  }, [currentUser]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);


  const handleOpenPay = (bill) => {
    setSelectedBill(bill);
    setPaymentMethod('UPI');
    setPayModal(true);
  };

  const handleSimulatePayment = (e) => {
    e.preventDefault();
    if (!selectedBill) return;

    setIsProcessing(true);
    setTimeout(() => {
      const updated = payBillRecord(selectedBill.id, paymentMethod);
      setIsProcessing(false);
      setPayModal(false);
      loadBills();
      setSelectedBill(updated);
      setReceiptModal(true);
      showToast(`Payment of ₹${selectedBill.totalAmount} completed successfully!`);
    }, 1200);
  };

  const handleOpenReceipt = (bill) => {
    setSelectedBill(bill);
    setReceiptModal(true);
  };

  return (
    <AppLayout title="Bills & Payments">
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Hospital Invoices & Payments</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Review itemized charges, pay outstanding medical bills, and download GST receipts.
          </p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            fontWeight: 700,
          }}
        >
          Invoices & Statements
        </div>

        {bills.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Receipt size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No billing statements on record for your profile.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Date</th>
                  <th>Department & Doctor</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                      {bill.id}
                    </td>
                    <td>{bill.date}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{bill.department}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{bill.doctorName}</div>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: 14 }}>
                      ₹{bill.totalAmount}
                    </td>
                    <td style={{ color: '#16a34a', fontWeight: 600 }}>
                      ₹{bill.paidAmount || 0}
                    </td>
                    <td>
                      <StatusBadge status={bill.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {bill.status === 'pending' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={CreditCard}
                            onClick={() => handleOpenPay(bill)}
                          >
                            Pay ₹{bill.totalAmount}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Printer}
                            onClick={() => handleOpenReceipt(bill)}
                          >
                            Receipt
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Secure Payment Simulation */}
      {payModal && selectedBill && (
        <Modal
          isOpen={payModal}
          onClose={() => !isProcessing && setPayModal(false)}
          title={`Pay Invoice: ${selectedBill.id}`}
          subtitle={`Total Payable: ₹${selectedBill.totalAmount}`}
        >
          <form onSubmit={handleSimulatePayment} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Bill Summary */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Subtotal Charges:</span>
                <span>₹{selectedBill.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Healthcare GST (5%):</span>
                <span>₹{selectedBill.tax}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: 'var(--color-primary)',
                  borderTop: '1px solid #cbd5e1',
                  paddingTop: 8,
                  marginTop: 6,
                }}
              >
                <span>Total Amount Due:</span>
                <span>₹{selectedBill.totalAmount}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>
                Choose Payment Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 6 }}>
                {[
                  { key: 'UPI', label: 'UPI / QR' },
                  { key: 'Card', label: 'Debit / Card' },
                  { key: 'NetBanking', label: 'Net Banking' },
                ].map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    className={`payment-method-tile ${paymentMethod === m.key ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(m.key)}
                  >
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Input based on method */}
            {paymentMethod === 'UPI' && (
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Enter UPI Virtual Payment Address (VPA)
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="name@okaxis / mobile@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            )}

            {paymentMethod === 'Card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Card Number</label>
                  <input type="text" className="form-control" placeholder="4532 •••• •••• 9821" defaultValue="4532 8819 0021 9821" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input type="text" className="form-control" placeholder="MM/YY" defaultValue="12/28" required />
                  <input type="password" className="form-control" placeholder="CVV" defaultValue="882" required maxLength={3} />
                </div>
              </div>
            )}

            {paymentMethod === 'NetBanking' && (
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Select Bank</label>
                <select className="form-control">
                  <option>State Bank of India (SBI)</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                </select>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
                color: '#16a34a',
                background: '#f0fdf4',
                padding: '8px 12px',
                borderRadius: 6,
              }}
            >
              <ShieldCheck size={16} />
              256-Bit SSL Encrypted Sandbox Payment Gateway
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <Button
                type="button"
                variant="secondary"
                disabled={isProcessing}
                onClick={() => setPayModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isProcessing}
                icon={CheckCircle2}
              >
                {isProcessing ? 'Processing Transaction...' : `Pay ₹${selectedBill.totalAmount}`}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Official Tax Invoice & Payment Receipt */}
      {receiptModal && selectedBill && (
        <Modal
          isOpen={receiptModal}
          onClose={() => setReceiptModal(false)}
          title={`Tax Invoice & Payment Receipt: ${selectedBill.id}`}
        >
          <div className="printable-area">
            <div className="invoice-card">
              {/* Receipt Header */}
              <div className="invoice-header">
                <div>
                  <h2 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1.4rem', fontWeight: 800 }}>
                    METROPOLITAN GENERAL HOSPITAL
                  </h2>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    GSTIN: 29AAAAA0000A1Z5 · PAN: AAACM9921K
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    Indiranagar, Bengaluru - 560038
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{selectedBill.id}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Date: {selectedBill.date}</div>
                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 4,
                      display: 'inline-block',
                      marginTop: 4,
                    }}
                  >
                    PAID IN FULL
                  </span>
                </div>
              </div>

              {/* Patient Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16, fontSize: 'var(--font-size-sm)' }}>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Billed To:</span>
                  <div style={{ fontWeight: 700 }}>{selectedBill.patientName}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>UHID: {selectedBill.patientId}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Consulting Doctor:</span>
                  <div style={{ fontWeight: 700 }}>{selectedBill.doctorName}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{selectedBill.department}</div>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="table" style={{ margin: '14px 0' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th>#</th>
                    <th>Service Description</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{item.description}</td>
                      <td>
                        <span style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="invoice-total-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Subtotal:</span>
                  <span>₹{selectedBill.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>CGST (2.5%) + SGST (2.5%):</span>
                  <span>₹{selectedBill.tax}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    color: 'var(--color-primary)',
                    borderTop: '1px solid #cbd5e1',
                    paddingTop: 8,
                  }}
                >
                  <span>Grand Total:</span>
                  <span>₹{selectedBill.totalAmount}</span>
                </div>
              </div>

              {/* Transaction Details */}
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: '#f8fafc',
                  borderRadius: 6,
                  fontSize: 11,
                  color: '#475569',
                }}
              >
                <div><strong>Transaction ID:</strong> {selectedBill.transactionId || 'TXN-9984102914'}</div>
                <div><strong>Payment Channel:</strong> {selectedBill.paymentMethod || 'UPI (Google Pay)'}</div>
                <div><strong>Timestamp:</strong> {selectedBill.paymentDate || '2024-10-24 11:45 AM'}</div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setReceiptModal(false)}>
              Close
            </Button>
            <Button variant="primary" icon={Printer} onClick={() => window.print()}>
              Print Payment Receipt
            </Button>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
