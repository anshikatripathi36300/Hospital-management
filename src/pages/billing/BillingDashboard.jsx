/**
 * BillingDashboard.jsx — Hospital Accounts & Revenue Dashboard (Part 14)
 *
 * Real-time financial telemetry:
 * - Revenue collections, outstanding receivables, invoice aging
 * - Payment channel distribution (UPI, Cards, Cash, Insurance)
 * - Recent transaction stream and cashier audit log
 */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getAllBills } from '../../data/demoData';
import {
  Receipt,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  Wallet,
} from 'lucide-react';

export default function BillingDashboard() {
  const { currentUser } = useAuth();
  const [bills, setBills] = useState([]);

  useEffect(() => {
    setBills(getAllBills());
  }, []);

  const stats = useMemo(() => {
    const totalBilled = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalCollected = bills
      .filter((b) => b.status === 'paid')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const pendingDues = bills
      .filter((b) => b.status === 'pending' || b.status === 'unpaid')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const paidCount = bills.filter((b) => b.status === 'paid').length;
    const pendingCount = bills.filter((b) => b.status === 'pending' || b.status === 'unpaid').length;

    return {
      totalBilled,
      totalCollected,
      pendingDues,
      paidCount,
      pendingCount,
    };
  }, [bills]);

  // Payment channel distribution
  const methodStats = useMemo(() => {
    const map = { UPI: 0, 'Credit/Debit Card': 0, Cash: 0, Insurance: 0 };
    bills.forEach((b) => {
      const m = b.paymentMethod || 'UPI';
      if (m.toLowerCase().includes('card')) map['Credit/Debit Card'] += b.totalAmount || 0;
      else if (m.toLowerCase().includes('cash')) map.Cash += b.totalAmount || 0;
      else if (m.toLowerCase().includes('insurance')) map.Insurance += b.totalAmount || 0;
      else map.UPI += b.totalAmount || 0;
    });
    return map;
  }, [bills]);

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return bills.slice(0, 5);
  }, [bills]);

  return (
    <AppLayout title="Billing & Accounts Dashboard">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wallet size={28} color="var(--color-primary-600)" />
            Hospital Billing &amp; Financial Accounts
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Welcome, <strong>{currentUser?.name || 'Accountant'}</strong>. Consolidated invoices, cash receipts, and receivables reconciliation.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/billing/invoices">
            <Button variant="primary" icon={PlusCircle}>
              Generate Invoice
            </Button>
          </Link>
          <Link to="/billing/payments">
            <Button variant="outline" icon={CreditCard}>
              Record Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
            }}
          >
            <Receipt size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              ₹{stats.totalBilled.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Total Gross Invoiced
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>
              ₹{stats.totalCollected.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Realized Collections ({stats.paidCount} bills)
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706' }}>
              ₹{stats.pendingDues.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Outstanding Receivables ({stats.pendingCount} unpaid)
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: '#f5f3ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c3aed',
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {Math.round((stats.paidCount / (bills.length || 1)) * 100)}%
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Payment Clearance Rate
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 20 }}>
        {/* Recent Invoices Table */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Receipt size={18} color="var(--color-primary-600)" />
              Recent Hospital Invoices
            </h3>
            <Link to="/billing/invoices" style={{ fontSize: '0.82rem', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all invoices <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice Ref</th>
                  <th>Patient Details</th>
                  <th>Department / Service</th>
                  <th>Amount (₹)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{bill.id}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{bill.date}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{bill.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{bill.patientId}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{bill.category || 'General Consultation'}</td>
                    <td style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      ₹{bill.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <StatusBadge status={bill.status} />
                    </td>
                    <td>
                      <Link to="/billing/invoices">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PieIcon size={18} color="var(--color-primary-600)" />
              Payment Channels Share
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(methodStats).map(([method, amount]) => {
              const pct = Math.round((amount / (stats.totalBilled || 1)) * 100);
              return (
                <div key={method}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 500 }}>{method}</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                      ₹{amount.toLocaleString('en-IN')} ({pct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      width: '100%',
                      background: 'var(--color-bg-secondary)',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 20,
              padding: '12px 14px',
              background: 'var(--color-bg-secondary)',
              borderRadius: 8,
              fontSize: '0.82rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>
              Tax &amp; Statutory Compliance
            </div>
            Applicable GST Rate: 5.0% on specialized inpatient diagnostics and medical consumables.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
