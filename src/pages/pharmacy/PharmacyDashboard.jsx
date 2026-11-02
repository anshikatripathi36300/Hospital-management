/**
 * PharmacyDashboard.jsx — Hospital Pharmacy Operations Dashboard (Part 13)
 *
 * Real-time operational metrics for pharmaceutical services:
 * - Inventory SKU count, low-stock warnings, inventory valuation
 * - Prescriptions awaiting fulfillment queue
 * - Fast-moving drug categories and expiry risk alerts
 */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  getAllMedicines,
  getAllPrescriptions,
} from '../../data/demoData';
import {
  Pill,
  ShoppingBag,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function PharmacyDashboard() {
  const { currentUser } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    setMedicines(getAllMedicines());
    setPrescriptions(getAllPrescriptions());
  }, []);

  const stats = useMemo(() => {
    const totalSKUs = medicines.length;
    const lowStockItems = medicines.filter((m) => m.stock <= m.reorderLevel);
    const totalInventoryValue = medicines.reduce((sum, m) => sum + (m.stock * m.unitPrice), 0);
    const pendingDispensing = prescriptions.filter((p) => p.status === 'pending' || p.status === 'active').length;
    const dispensedCount = prescriptions.filter((p) => p.status === 'dispensed' || p.status === 'completed').length;

    return {
      totalSKUs,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      totalInventoryValue,
      pendingDispensing,
      dispensedCount,
    };
  }, [medicines, prescriptions]);

  // Urgent pending prescriptions queue
  const pendingRxQueue = useMemo(() => {
    return prescriptions
      .filter((p) => p.status === 'pending' || p.status === 'active')
      .slice(0, 5);
  }, [prescriptions]);

  return (
    <AppLayout title="Pharmacy Operations Dashboard">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Pill size={28} color="var(--color-primary-600)" />
            Hospital Central Pharmacy
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Welcome, <strong>{currentUser?.name || 'Pharmacist'}</strong>. Inventory control, prescription dispensing, and formulary management.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/pharmacy/dispensing">
            <Button variant="primary" icon={ClipboardList}>
              Dispense Prescriptions ({stats.pendingDispensing})
            </Button>
          </Link>
          <Link to="/pharmacy/inventory">
            <Button variant="outline" icon={ShoppingBag}>
              Manage Inventory
            </Button>
          </Link>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {stats.lowStockCount > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid #f59e0b',
            borderRadius: 10,
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(245, 158, 11, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#f59e0b',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <strong style={{ color: '#92400e', fontSize: '0.95rem' }}>
                {stats.lowStockCount} Medications Below Minimum Safety Stock Level!
              </strong>
              <div style={{ color: '#b45309', fontSize: '0.85rem' }}>
                Stock levels require procurement replenishment to prevent patient treatment delays.
              </div>
            </div>
          </div>
          <Link to="/pharmacy/inventory?filter=low_stock">
            <Button size="sm" variant="warning" icon={TrendingDown}>
              Review Low Stock
            </Button>
          </Link>
        </div>
      )}

      {/* Metrics Row */}
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
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {stats.totalSKUs}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Formulary Drug SKUs
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#dc2626' }}>
              {stats.lowStockCount}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Reorder Alerts (&lt; Min)
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
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {stats.dispensedCount}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Fulfillments Issued
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16a34a',
            }}
          >
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              ₹{stats.totalInventoryValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Current Stock Valuation
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 20 }}>
        {/* Urgent Prescriptions Queue */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClipboardList size={18} color="var(--color-primary-600)" />
              Prescriptions Awaiting Dispensing
            </h3>
            <Link to="/pharmacy/dispensing" style={{ fontSize: '0.82rem', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Open dispensing desk <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Prescription #</th>
                  <th>Patient</th>
                  <th>Prescribing Doctor</th>
                  <th>Medications</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRxQueue.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                      All prescriptions are currently fulfilled!
                    </td>
                  </tr>
                ) : (
                  pendingRxQueue.map((rx) => (
                    <tr key={rx.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{rx.id}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{rx.patientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{rx.patientId}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{rx.doctorName}</td>
                      <td>
                        <span
                          style={{
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {(rx.medicines || []).length} items
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{rx.date}</td>
                      <td>
                        <Link to="/pharmacy/dispensing">
                          <Button size="sm" variant="primary">
                            Dispense
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Quick Widget */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} color="#d97706" />
              Critical Stock Watchlist
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.lowStockItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                All medications are well above safety threshold levels.
              </div>
            ) : (
              stats.lowStockItems.slice(0, 4).map((med) => (
                <div
                  key={med.id}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #fee2e2',
                    borderRadius: 8,
                    background: '#fff5f5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#991b1b' }}>{med.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                      Batch: {med.batchNo} • Shelf: {med.location}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#dc2626' }}>
                      {med.stock} units left
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      Min: {med.reorderLevel}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link to="/pharmacy/inventory" style={{ marginTop: 16, display: 'block' }}>
            <Button variant="outline" size="sm" style={{ width: '100%' }}>
              Restock &amp; Manage Catalog
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
