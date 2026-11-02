/**
 * AdminReports.jsx — Clinical, Operational & Institutional Analytics (Part 15)
 *
 * Hospital census, bed occupancy telemetry, doctor consultation workloads,
 * department volumes, and executive summary export.
 */
import { useState, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  Bed,
  Stethoscope,
  TrendingUp,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#7c3aed', '#ec4899', '#06b6d4'];

export default function AdminReports() {
  const [dateRange, setDateRange] = useState('month');

  // Bed occupancy & admission census
  const bedCensusData = [
    { ward: 'General Medical Ward', total: 60, occupied: 52 },
    { ward: 'Surgical Care Ward', total: 40, occupied: 36 },
    { ward: 'Intensive Care (ICU)', total: 20, occupied: 17 },
    { ward: 'Pediatric Ward', total: 25, occupied: 18 },
    { ward: 'Maternity Ward', total: 30, occupied: 24 },
    { ward: 'Cardiac Critical Care (CCU)', total: 15, occupied: 13 },
  ];

  // Daily Patient Outpatient (OPD) Flow
  const patientFlowData = [
    { day: 'Mon', opd: 142, emergency: 28, admissions: 14 },
    { day: 'Tue', opd: 168, emergency: 24, admissions: 19 },
    { day: 'Wed', opd: 155, emergency: 31, admissions: 16 },
    { day: 'Thu', opd: 172, emergency: 22, admissions: 21 },
    { day: 'Fri', opd: 185, emergency: 35, admissions: 25 },
    { day: 'Sat', opd: 194, emergency: 42, admissions: 28 },
    { day: 'Sun', opd: 92,  emergency: 38, admissions: 15 },
  ];

  // Doctor Consultation Workload
  const doctorWorkloadData = [
    { name: 'Dr. Priya Sharma', dept: 'Cardiology', consultations: 124, avgTimeMins: 18 },
    { name: 'Dr. Rajesh Rao', dept: 'Orthopedics', consultations: 108, avgTimeMins: 20 },
    { name: 'Dr. Sneha Roy', dept: 'Pediatrics', consultations: 146, avgTimeMins: 15 },
    { name: 'Dr. Vikram Seth', dept: 'Neurology', consultations: 88,  avgTimeMins: 25 },
    { name: 'Dr. Ananya Bose', dept: 'General Medicine', consultations: 165, avgTimeMins: 14 },
  ];

  const totalBeds = bedCensusData.reduce((sum, b) => sum + b.total, 0);
  const totalOccupied = bedCensusData.reduce((sum, b) => sum + b.occupied, 0);
  const occupancyRate = Math.round((totalOccupied / totalBeds) * 100);

  // Export Executive Report
  const handleExportSummary = () => {
    const csvContent =
      'Category,Metric,Value\n' +
      `Bed Capacity,Total Beds,${totalBeds}\n` +
      `Bed Capacity,Occupied Beds,${totalOccupied}\n` +
      `Bed Capacity,Occupancy Rate,${occupancyRate}%\n` +
      'Weekly Outpatient Flow,Average OPD Patients/Day,158\n' +
      'Emergency Department,Weekly Triage Inflow,220\n' +
      'Physician Workload,Peak Consultations,Dr. Ananya Bose (165)\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Hospital_Executive_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout title="Hospital Reports & Analytics">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart3 size={26} color="var(--color-primary-600)" />
            Hospital Executive Analytics &amp; Clinical Reports
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Institutional metrics, bed occupancy telemetry, clinical workload trends, and capacity planning.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline" icon={Download} onClick={handleExportSummary}>
            Export Executive Report
          </Button>
        </div>
      </div>

      {/* High-level KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
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
            <Bed size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {occupancyRate}%
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Bed Occupancy ({totalOccupied}/{totalBeds})
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
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              1,108
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Weekly OPD Consultations
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
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              224
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Emergency Inflow Triage
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
            <Stethoscope size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              17.4 min
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Avg Consultation Time
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Outpatient & Emergency Census Flow */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} color="var(--color-primary-600)" />
              Weekly Patient Census Flow
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              OPD vs Emergency vs Admissions
            </span>
          </div>

          <div style={{ width: '100%', height: 280, marginTop: 12 }}>
            <ResponsiveContainer>
              <AreaChart data={patientFlowData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-text-secondary)" />
                <YAxis stroke="var(--color-text-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card-bg)',
                    borderColor: 'var(--color-border)',
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="opd" name="OPD Visits" stroke="#2563eb" fill="#bfdbfe" fillOpacity={0.6} />
                <Area type="monotone" dataKey="emergency" name="Emergency Triage" stroke="#dc2626" fill="#fecaca" fillOpacity={0.5} />
                <Area type="monotone" dataKey="admissions" name="IPD Admissions" stroke="#059669" fill="#a7f3d0" fillOpacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inpatient Bed Occupancy Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bed size={18} color="var(--color-primary-600)" />
              Ward Bed Capacity &amp; Occupancy
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            {bedCensusData.map((b) => {
              const pct = Math.round((b.occupied / b.total) * 100);
              const isHigh = pct >= 85;
              return (
                <div key={b.ward}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 500 }}>{b.ward}</span>
                    <span style={{ color: isHigh ? '#dc2626' : 'var(--color-text-secondary)', fontWeight: 600 }}>
                      {b.occupied} / {b.total} beds ({pct}%)
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
                        background: isHigh
                          ? 'linear-gradient(90deg, #f87171, #ef4444)'
                          : 'linear-gradient(90deg, #60a5fa, #2563eb)',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Doctor Consultation Workload Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stethoscope size={18} color="var(--color-primary-600)" />
            Attending Physician Workload &amp; Fulfillment Performance
          </h3>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Physician Name</th>
                <th>Specialty Department</th>
                <th>Consultations Completed</th>
                <th>Avg Turnaround Time</th>
                <th>Fulfillment Status</th>
              </tr>
            </thead>
            <tbody>
              {doctorWorkloadData.map((doc, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{doc.name}</td>
                  <td>
                    <span
                      style={{
                        background: 'var(--color-bg-secondary)',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: '0.78rem',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {doc.dept}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                    {doc.consultations} patients
                  </td>
                  <td>{doc.avgTimeMins} mins / patient</td>
                  <td>
                    <span
                      style={{
                        background: '#ecfdf5',
                        color: '#047857',
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Optimal Throughput
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
