/**
 * FinancialReports.jsx — Revenue Analytics & Receivables Aging (Part 14)
 *
 * Revenue trend bar charts, department-wise financial distribution,
 * receivables aging analysis, and CSV ledger export.
 */
import { useState, useEffect, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { getAllBills } from '../../data/demoData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Building,
} from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#7c3aed', '#ec4899'];

export default function FinancialReports() {
  const { currentUser } = useAuth();
  const [bills, setBills] = useState([]);
  const [timeRange, setTimeRange] = useState('current_fy');

  useEffect(() => {
    setBills(getAllBills());
  }, []);

  // Monthly Revenue Trend Data for Recharts
  const monthlyRevenueData = useMemo(() => {
    return [
      { month: 'May', billed: 485000, collected: 450000 },
      { month: 'Jun', billed: 520000, collected: 490000 },
      { month: 'Jul', billed: 560000, collected: 535000 },
      { month: 'Aug', billed: 610000, collected: 580000 },
      { month: 'Sep', billed: 590000, collected: 570000 },
      { month: 'Oct', billed: 645000, collected: 615000 },
    ];
  }, []);

  // Department contribution pie chart data
  const departmentRevenueData = useMemo(() => {
    return [
      { name: 'Inpatient (IPD) Wards', value: 340000 },
      { name: 'Outpatient (OPD) Clinics', value: 180000 },
      { name: 'Central Pharmacy', value: 165000 },
      { name: 'Diagnostic Laboratory', value: 120000 },
      { name: 'Emergency & Trauma', value: 95000 },
    ];
  }, []);

  // Receivables aging breakdown
  const agingData = useMemo(() => {
    const pendingBills = bills.filter((b) => b.status === 'pending' || b.status === 'unpaid');
    const totalPending = pendingBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return [
      { bracket: '0 – 30 Days (Current)', count: 12, amount: Math.round(totalPending * 0.65), risk: 'Low' },
      { bracket: '31 – 60 Days (Aging)', count: 4, amount: Math.round(totalPending * 0.25), risk: 'Moderate' },
      { bracket: '61 – 90 Days (Overdue)', count: 2, amount: Math.round(totalPending * 0.08), risk: 'High' },
      { bracket: '90+ Days (Bad Debt Risk)', count: 1, amount: Math.round(totalPending * 0.02), risk: 'Critical' },
    ];
  }, [bills]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = 'Invoice ID,Patient ID,Patient Name,Category,Date,Status,Total (INR),Payment Method\n';
    const rows = bills.map((b) =>
      `"${b.id}","${b.patientId}","${b.patientName}","${b.category}","${b.date}","${b.status}","${b.totalAmount}","${b.paymentMethod || 'N/A'}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Hospital_Financial_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout title="Financial Reports & Analytics">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart3 size={26} color="var(--color-primary-600)" />
            Revenue Analytics &amp; Receivables Aging
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Financial reporting, clinical cost center contributions, and statutory receivables aging.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline" icon={Download} onClick={handleExportCSV}>
            Export CSV Ledger
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Monthly Revenue Trend */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} color="var(--color-primary-600)" />
              Monthly Revenue Collections (₹)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              FY 2026-27 (Past 6 Months)
            </span>
          </div>

          <div style={{ width: '100%', height: 280, marginTop: 12 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-text-secondary)" />
                <YAxis
                  stroke="var(--color-text-secondary)"
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'var(--color-card-bg)',
                    borderColor: 'var(--color-border)',
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Bar dataKey="billed" name="Gross Invoiced" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Realized Receipts" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Revenue Contribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building size={18} color="var(--color-primary-600)" />
              Cost Center Contribution
            </h3>
          </div>

          <div style={{ width: '100%', height: 280, marginTop: 12 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={departmentRevenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {departmentRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'var(--color-card-bg)',
                    borderColor: 'var(--color-border)',
                    borderRadius: 8,
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Accounts Receivables Aging Analysis */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} color="#d97706" />
            Accounts Receivables Aging Schedule
          </h3>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Aging Category</th>
                <th>Invoices Count</th>
                <th>Outstanding Value (₹)</th>
                <th>Share of Dues</th>
                <th>Collection Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {agingData.map((row, idx) => {
                const totalAging = agingData.reduce((sum, r) => sum + r.amount, 0) || 1;
                const pct = Math.round((row.amount / totalAging) * 100);
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{row.bracket}</td>
                    <td>{row.count} accounts</td>
                    <td style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      ₹{row.amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            height: 6,
                            width: 80,
                            background: 'var(--color-bg-secondary)',
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${pct}%`,
                              background: row.risk === 'Critical' ? '#dc2626' : row.risk === 'High' ? '#f59e0b' : '#2563eb',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          background:
                            row.risk === 'Critical' ? '#fee2e2' :
                            row.risk === 'High' ? '#fef3c7' :
                            row.risk === 'Moderate' ? '#eff6ff' : '#ecfdf5',
                          color:
                            row.risk === 'Critical' ? '#dc2626' :
                            row.risk === 'High' ? '#b45309' :
                            row.risk === 'Moderate' ? '#1d4ed8' : '#047857',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {row.risk}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
