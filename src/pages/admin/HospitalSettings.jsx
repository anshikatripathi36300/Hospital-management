/**
 * HospitalSettings.jsx — Institutional Configuration & Hospital Profile (Part 15)
 *
 * Configurable hospital metadata, clinical fee schedules, GST tax parameters,
 * visiting hours, and operational alert toggles.
 */
import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import {
  getHospitalSettings,
  saveHospitalSettings,
  logAuditEvent,
} from '../../data/demoData';
import {
  Settings,
  Building,
  DollarSign,
  Clock,
  Bell,
  CheckCircle2,
  Save,
  Shield,
} from 'lucide-react';

export default function HospitalSettings() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState(getHospitalSettings());
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveHospitalSettings(settings);

    logAuditEvent({
      userId: currentUser?.id || 'u001',
      userName: currentUser?.name || 'Admin User',
      role: 'admin',
      action: 'SETTINGS_UPDATED',
      category: 'Admin',
      details: 'Hospital institutional configurations and tariff schedules updated.',
    });

    showToast('Hospital configuration settings saved successfully!');
  };

  return (
    <AppLayout title="Hospital Profile & Configuration">
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
            <Settings size={26} color="var(--color-primary-600)" />
            Hospital Profile &amp; Institutional Settings
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Institutional metadata, consultation fee tariffs, GST tax percentages, visiting hours, and system preferences.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
        {[
          { id: 'profile', label: 'Hospital Identity', icon: Building },
          { id: 'tariffs', label: 'Tariffs & GST Billing', icon: DollarSign },
          { id: 'policies', label: 'Hours & Policies', icon: Clock },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: activeTab === id ? 'var(--color-primary-600)' : 'transparent',
              color: activeTab === id ? 'white' : 'var(--color-text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.88rem',
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>
        {/* TAB 1: Hospital Identity */}
        {activeTab === 'profile' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 className="card-title">Hospital Identity &amp; Statutory Registration</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Hospital Institution Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.hospitalName}
                  onChange={(e) => handleChange('hospitalName', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">State Health Clinical Registration #</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.registrationNo}
                  onChange={(e) => handleChange('registrationNo', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Hospital Motto / Tagline</label>
              <input
                type="text"
                className="form-control"
                value={settings.tagLine}
                onChange={(e) => handleChange('tagLine', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Physical Address</label>
              <input
                type="text"
                className="form-control"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Main Reception Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency 24/7 Hotline</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.emergencyHotline}
                  onChange={(e) => handleChange('emergencyHotline', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Contact Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Tariffs & GST Billing */}
        {activeTab === 'tariffs' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 className="card-title">Clinical Tariffs &amp; Tax Structure</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">GSTIN / Tax Identification #</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.gstNumber}
                  onChange={(e) => handleChange('gstNumber', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Statutory GST Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={settings.taxRatePercent}
                  onChange={(e) => handleChange('taxRatePercent', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Standard OPD Fee (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.opdConsultationFee}
                  onChange={(e) => handleChange('opdConsultationFee', parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Triage Fee (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.emergencyFee}
                  onChange={(e) => handleChange('emergencyFee', parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ward Bed Charge / Day (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.bedChargeGeneralWard}
                  onChange={(e) => handleChange('bedChargeGeneralWard', parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">ICU Bed Charge / Day (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={settings.bedChargeIcu}
                  onChange={(e) => handleChange('bedChargeIcu', parseInt(e.target.value, 10) || 0)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Hours & Policies */}
        {activeTab === 'policies' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 className="card-title">Ward Visiting Hours &amp; System Toggles</h3>

            <div className="form-group">
              <label className="form-label">Inpatient Visiting Hours Policy</label>
              <input
                type="text"
                className="form-control"
                value={settings.visitingHours}
                onChange={(e) => handleChange('visitingHours', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.enableSmsAlerts}
                  onChange={(e) => handleChange('enableSmsAlerts', e.target.checked)}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  Enable Automated SMS Appointment &amp; Report Ready Notifications
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.enableEmailAlerts}
                  onChange={(e) => handleChange('enableEmailAlerts', e.target.checked)}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  Enable Email Invoices &amp; Verified Lab Report Transmissions
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#dc2626' }}>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  System Maintenance Mode (Restricts clinical portal access to Administrators only)
                </span>
              </label>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <Button type="submit" variant="primary" icon={Save}>
            Save Hospital Configuration
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
