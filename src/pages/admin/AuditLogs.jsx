/**
 * AuditLogs.jsx — Security & System Audit Trail (Part 15)
 *
 * Tamper-evident operational logging for academic Software Engineering project compliance:
 * - Authentication, Clinical, Pharmacy, Laboratory, and Billing operations
 * - Client IP tracking, user attribution, category tagging, and CSV audit export
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { getAllAuditLogs } from '../../data/demoData';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Calendar,
  Lock,
  Activity,
  Layers,
  Terminal,
} from 'lucide-react';

const CATEGORY_COLORS = {
  Authentication: { bg: '#eff6ff', text: '#1d4ed8' },
  Clinical:       { bg: '#f0fdf4', text: '#15803d' },
  Billing:        { bg: '#ecfdf5', text: '#047857' },
  Inventory:      { bg: '#fef3c7', text: '#b45309' },
  Laboratory:     { bg: '#f5f3ff', text: '#7c3aed' },
  'Patient Care': { bg: '#e0e7ff', text: '#4338ca' },
  Admin:          { bg: '#fef2f2', text: '#b91c1c' },
};

export default function AuditLogs() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const loadData = useCallback(() => {
    setLogs(getAllAuditLogs());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = 'Log ID,Timestamp,Actor Name,Role,Category,Action,IP Address,Details\n';
    const rows = logs.map((l) =>
      `"${l.id}","${l.timestamp}","${l.userName}","${l.role}","${l.category}","${l.action}","${l.ipAddress}","${l.details.replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Hospital_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.details.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = categoryFilter === 'all' || l.category === categoryFilter;
      const matchRole = roleFilter === 'all' || l.role === roleFilter;

      return matchSearch && matchCategory && matchRole;
    });
  }, [logs, searchTerm, categoryFilter, roleFilter]);

  return (
    <AppLayout title="Security & Audit Logs">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={26} color="var(--color-primary-600)" />
            Security &amp; Administrative Audit Trail
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Tamper-evident activity logs across authentication, clinical decisions, financial transactions, and inventory changes.
          </p>
        </div>
        <Button variant="outline" icon={Download} onClick={handleExportCSV}>
          Export Audit Trail (CSV)
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
              placeholder="Search by Actor, Action Code, IP, or Event details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="var(--color-text-muted)" />
            <select
              className="form-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: 170 }}
            >
              <option value="all">All Categories</option>
              <option value="Authentication">Authentication</option>
              <option value="Clinical">Clinical</option>
              <option value="Billing">Billing</option>
              <option value="Inventory">Inventory</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Patient Care">Patient Care</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              className="form-control"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ width: 150 }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="accountant">Accountant</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="lab_technician">Lab Tech</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Actor &amp; Role</th>
                <th>Category</th>
                <th>Action Code</th>
                <th>IP Address</th>
                <th>Event Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No audit log records match the search filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const styleColors = CATEGORY_COLORS[log.category] || { bg: '#f1f5f9', text: '#334155' };
                  return (
                    <tr key={log.id}>
                      <td>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.82rem' }}>
                          {log.id}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                        {log.timestamp}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{log.userName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          Role: {log.role}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            background: styleColors.bg,
                            color: styleColors.text,
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {log.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.78rem', color: 'var(--color-primary-800)' }}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {log.ipAddress}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.84rem' }}>
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
