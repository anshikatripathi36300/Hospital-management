/**
 * AdminDashboard.jsx
 *
 * Full-featured Hospital Executive & Admin Dashboard.
 * Includes:
 *  - Real-time KPI stat cards with trend indicators
 *  - Recharts visual analytics (Financial Trends, Department Workloads, Demographics, Weekly Appointments)
 *  - Real-time Bed Occupancy & Ward Capacity monitors
 *  - Hospital Critical Operational Alerts
 *  - Interactive Time Range filter (Today, 7D, 30D, 1Y)
 *  - Filterable live appointment stream
 *  - Department performance table with revenue and satisfaction scores
 *
 * Part 4 Roadmap Implementation.
 */
import { useState, useMemo } from 'react';
import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Bed,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  Filter,
  Download,
  RefreshCw,
  Plus,
  ShieldCheck,
  Search,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import AppLayout from '../../components/layout/AppLayout';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import {
  DASHBOARD_STATS,
  MONTHLY_REVENUE,
  BED_OCCUPANCY_DATA,
  DEPARTMENT_METRICS,
  WEEKLY_APPOINTMENTS_DATA,
  PATIENT_DEMOGRAPHICS,
  CRITICAL_ALERTS,
  APPOINTMENTS,
  getAllPatients,
} from '../../data/demoData';

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('30D'); // 'Today' | '7D' | '30D' | '1Y'
  const [revenueMetric, setRevenueMetric] = useState('both'); // 'revenue' | 'profit' | 'both'
  const [apptFilter, setApptFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const allPatients = getAllPatients();

  // Simulated live refresh
  function handleRefresh() {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  }

  // Filtered revenue data based on time range
  const chartRevenueData = useMemo(() => {
    if (timeRange === 'Today' || timeRange === '7D') {
      return MONTHLY_REVENUE.slice(-4);
    }
    if (timeRange === '30D') {
      return MONTHLY_REVENUE.slice(-6);
    }
    return MONTHLY_REVENUE;
  }, [timeRange]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return APPOINTMENTS.filter((a) => {
      const matchesStatus = apptFilter === 'all' || a.status === apptFilter;
      const matchesSearch =
        searchTerm === '' ||
        a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.department.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [apptFilter, searchTerm]);

  // Format currency in Indian Lakhs / Rupees
  const formatCurrency = (val) => `₹${Number(val).toLocaleString('en-IN')}`;

  return (
    <AppLayout title="Executive Admin Dashboard">
      {/* ── Top Header & Global Actions ─────────────────────────────────── */}
      <div className="dashboard-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text)' }}>
              Hospital Operations Overview
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              <Activity size={12} />
              SYSTEM LIVE
            </span>
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Real-time multi-department metrics, patient throughput, and financial performance.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Time Filter Pill */}
          <div className="dashboard-filter-group" role="group" aria-label="Time period selector">
            {['Today', '7D', '30D', '1Y'].map((range) => (
              <button
                key={range}
                type="button"
                className={`dashboard-filter-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={isRefreshing}
            onClick={handleRefresh}
            title="Refresh Hospital Metrics"
          >
            Sync
          </Button>

          <Button
            variant="primary"
            icon={Download}
            onClick={() => window.print()}
            title="Export Summary Report"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* ── Critical Operational Alerts Banner ──────────────────────────── */}
      {CRITICAL_ALERTS.filter((a) => !dismissedAlerts.includes(a.id)).length > 0 && (
        <div className="alerts-banner-container" aria-label="Critical notifications">
          {CRITICAL_ALERTS.filter((a) => !dismissedAlerts.includes(a.id)).map((alert) => (
            <div key={alert.id} className={`alert-item ${alert.severity}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={18} />
                <div>
                  <strong>{alert.title}:</strong> {alert.message}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>{alert.time}</span>
                <button
                  type="button"
                  onClick={() => setDismissedAlerts((prev) => [...prev, alert.id])}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'inherit',
                    textDecoration: 'underline',
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── KPI Stat Cards ──────────────────────────────────────────────── */}
      <div className="stats-grid">
        <StatCard
          icon={Users}
          label="Total Registered Patients"
          value={allPatients.length}
          color="#1d4ed8"
          trend={{ direction: 'up', value: '+8.4%', label: 'vs last mo' }}
          subtitle={`${DASHBOARD_STATS.activeAdmissions} Inpatients`}
        />
        <StatCard
          icon={Stethoscope}
          label="Active Physicians"
          value={DASHBOARD_STATS.totalDoctors}
          color="#16a34a"
          trend={{ direction: 'neutral', value: '24 On Duty', label: 'today' }}
          badge="8 Depts"
        />
        <StatCard
          icon={Calendar}
          label="Today's Appointments"
          value={DASHBOARD_STATS.todayAppointments}
          color="#d97706"
          trend={{ direction: 'up', value: '+15.2%', label: 'vs yesterday' }}
          subtitle={`${DASHBOARD_STATS.completedToday} completed`}
        />
        <StatCard
          icon={DollarSign}
          label="Monthly Revenue (Oct)"
          value={formatCurrency(DASHBOARD_STATS.monthlyRevenue)}
          color="#7c3aed"
          trend={{ direction: 'up', value: '+14.2%', label: 'MoM' }}
          subtitle={`Profit: ${formatCurrency(DASHBOARD_STATS.netProfit)}`}
        />
        <StatCard
          icon={Bed}
          label="Bed Occupancy Rate"
          value={`${DASHBOARD_STATS.bedOccupancyRate}%`}
          color="#dc2626"
          trend={{ direction: 'up', value: '+3.1%', label: 'critical triage' }}
          subtitle={`${DASHBOARD_STATS.occupiedBeds}/${DASHBOARD_STATS.totalBeds} Beds`}
        />
        <StatCard
          icon={CheckCircle}
          label="Discharge & Clearance"
          value="96.2%"
          color="#0284c7"
          trend={{ direction: 'up', value: '+1.8%', label: 'turnaround' }}
          badge="High Efficiency"
        />
      </div>

      {/* ── Primary Visual Charts: Revenue & Department Workloads ─────────── */}
      <div className="charts-grid-primary">
        {/* Left: Financial Performance Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">
                <TrendingUp size={18} color="var(--color-primary)" />
                Hospital Financial Flow &amp; Net Margin
              </div>
              <div className="chart-card-desc">
                Revenue vs Operational Expenditures (INR ₹)
              </div>
            </div>

            {/* Metric Switcher */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className={`btn-sm ${revenueMetric === 'both' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', padding: '3px 10px', fontSize: '11px' }}
                onClick={() => setRevenueMetric('both')}
              >
                All Flow
              </button>
              <button
                type="button"
                className={`btn-sm ${revenueMetric === 'profit' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', padding: '3px 10px', fontSize: '11px' }}
                onClick={() => setRevenueMetric('profit')}
              >
                Net Margin
              </button>
            </div>
          </div>

          <div className="chart-container-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `₹${val / 1000}k`}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), '']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                {(revenueMetric === 'both' || revenueMetric === 'revenue') && (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#1d4ed8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                )}
                {revenueMetric === 'both' && (
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExp)"
                  />
                )}
                {(revenueMetric === 'both' || revenueMetric === 'profit') && (
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Net Profit"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorProf)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Department Clinical Workload */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">
                <Layers size={18} color="var(--color-primary)" />
                Department Clinical Workload
              </div>
              <div className="chart-card-desc">Active Patients &amp; Daily Consultations</div>
            </div>
          </div>

          <div className="chart-container-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_METRICS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="activePatients" name="Active Inpatients" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="todayAppointments" name="Today's Consultations" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Secondary Visual Charts: Demographics & Weekly Patterns ─────── */}
      <div className="charts-grid-secondary">
        {/* Left: Patient Demographics & Cohort Analysis */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">
                <Users size={18} color="var(--color-primary)" />
                Patient Admission Demographics
              </div>
              <div className="chart-card-desc">Admission Channel Breakdown (%)</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', minHeight: 240 }}>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PATIENT_DEMOGRAPHICS.admissionType}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {PATIENT_DEMOGRAPHICS.admissionType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Share']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 12 }}>
              {PATIENT_DEMOGRAPHICS.admissionType.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: item.color,
                      }}
                    />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text)', fontWeight: 500 }}>
                      {item.name}
                    </span>
                  </div>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text)' }}>
                    {item.value}%
                  </span>
                </div>
              ))}

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10, marginTop: 4 }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Gender Cohort Distribution:
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {PATIENT_DEMOGRAPHICS.genderBreakdown.map((g) => (
                    <span key={g.name} style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                      <strong>{g.name}:</strong> {g.value}%
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Weekly Appointment Flow */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">
                <Calendar size={18} color="var(--color-primary)" />
                Weekly Appointment Fulfillment
              </div>
              <div className="chart-card-desc">Completed vs Pending vs Cancelled</div>
            </div>
          </div>

          <div className="chart-container-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_APPOINTMENTS_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="completed" name="Completed" stackId="a" fill="#16a34a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="scheduled" name="Scheduled" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Ward Bed Capacity Monitors ──────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bed size={18} color="var(--color-primary)" />
              Ward Capacity &amp; Bed Occupancy Status
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
              Hospital census across Intensive Care, Emergency, and Standard Patient Wards
            </p>
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-primary)' }}>
            Overall: {DASHBOARD_STATS.occupiedBeds} / {DASHBOARD_STATS.totalBeds} Beds ({DASHBOARD_STATS.bedOccupancyRate}%)
          </span>
        </div>

        <div className="ward-capacity-list">
          {BED_OCCUPANCY_DATA.map((w) => (
            <div key={w.ward} className="ward-capacity-item">
              <div className="ward-capacity-header">
                <span className="ward-capacity-name">{w.ward}</span>
                <span className="ward-capacity-stats">
                  <strong>{w.occupied}</strong> of {w.total} occupied ({w.available} available) —{' '}
                  <span style={{ color: w.color, fontWeight: 700 }}>{w.rate}%</span>
                </span>
              </div>
              <div className="ward-progress-track">
                <div
                  className="ward-progress-bar"
                  style={{
                    width: `${w.rate}%`,
                    backgroundColor: w.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Department KPI & Revenue Performance Table ───────────────────── */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Department Operational Performance</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
              Clinical staff allocations, daily case loads, and revenue contribution
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Doctors on Staff</th>
                <th>Inpatient Census</th>
                <th>Today's Visits</th>
                <th>Monthly Revenue</th>
                <th>Patient Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {DEPARTMENT_METRICS.map((dept) => (
                <tr key={dept.name}>
                  <td className="font-medium" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: dept.color,
                      }}
                    />
                    {dept.name}
                  </td>
                  <td>{dept.doctors} Specialists</td>
                  <td>{dept.activePatients} patients</td>
                  <td>{dept.todayAppointments} scheduled</td>
                  <td className="font-semibold">{formatCurrency(dept.revenue)}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: '#fef3c7',
                        color: '#92400e',
                        fontWeight: 600,
                        fontSize: '11px',
                      }}
                    >
                      ★ {dept.satisfaction} / 5.0
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Live Appointments Stream & Filter ───────────────────────────── */}
      <div className="card">
        <div
          className="card-header"
          style={{
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 className="card-title">Live Hospital Appointments</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
              Active consultations and scheduled visits for today
            </p>
          </div>

          {/* Status Tabs and Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search patient or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 30, height: 34, fontSize: '12px', width: 200 }}
              />
              <Search
                size={14}
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
            </div>

            <div className="dashboard-filter-group">
              {['all', 'confirmed', 'pending', 'completed'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`dashboard-filter-btn ${apptFilter === st ? 'active' : ''}`}
                  onClick={() => setApptFilter(st)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Schedule</th>
                <th>Visit Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <div className="font-medium">{appt.patientName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{appt.patientId}</div>
                    </td>
                    <td>{appt.doctorName}</td>
                    <td>{appt.department}</td>
                    <td>
                      <div>{appt.date}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{appt.time}</div>
                    </td>
                    <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {appt.reason || appt.type}
                    </td>
                    <td>
                      <StatusBadge status={appt.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                    No appointments match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
