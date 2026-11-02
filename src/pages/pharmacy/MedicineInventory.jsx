/**
 * MedicineInventory.jsx — Hospital Pharmaceutical Inventory & Stock Registry (Part 13)
 *
 * Formularies, batch tracking, expiry monitoring, reorder thresholds, and stock replenishment.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  getAllMedicines,
  saveCustomMedicine,
  updateMedicineStock,
  logAuditEvent,
} from '../../data/demoData';
import {
  Pill,
  Search,
  Filter,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  PackagePlus,
  Calendar,
  Layers,
  ArrowUpDown,
  Building,
} from 'lucide-react';

export default function MedicineInventory() {
  const { currentUser } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [adjustQty, setAdjustQty] = useState(50);
  const [adjustReason, setAdjustReason] = useState('PO Shipment Received from Manufacturer');
  const [toast, setToast] = useState('');

  // Add Medicine Form
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState('Antibiotics');
  const [dosageForm, setDosageForm] = useState('Tablet');
  const [strength, setStrength] = useState('500 mg');
  const [unitPrice, setUnitPrice] = useState('15.00');
  const [stock, setStock] = useState('200');
  const [reorderLevel, setReorderLevel] = useState('50');
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [manufacturer, setManufacturer] = useState('Cipla Ltd');
  const [location, setLocation] = useState('Shelf A-01');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(() => {
    setMedicines(getAllMedicines());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Add Medicine
  const handleAddMedicine = (e) => {
    e.preventDefault();
    const newId = `MED-${String(medicines.length + 1).padStart(3, '0')}`;
    const newMed = {
      id: newId,
      name,
      genericName,
      category,
      dosageForm,
      strength,
      unitPrice: parseFloat(unitPrice) || 10,
      stock: parseInt(stock, 10) || 100,
      reorderLevel: parseInt(reorderLevel, 10) || 50,
      batchNo: batchNo || `BAT-${Date.now().toString().slice(-6)}`,
      expiryDate: expiryDate || '2027-12-31',
      manufacturer,
      location,
    };

    saveCustomMedicine(newMed);
    logAuditEvent({
      userId: currentUser?.id || 'u007',
      userName: currentUser?.name || 'Sneha Gupta',
      role: 'pharmacist',
      action: 'MEDICINE_ADDED',
      category: 'Inventory',
      details: `New medication SKU ${newMed.name} (${newMed.id}) registered in central inventory.`,
    });

    showToast(`Medication ${newMed.name} successfully cataloged!`);
    setAddModal(false);
    // Reset Form
    setName('');
    setGenericName('');
    setBatchNo('');
    setExpiryDate('');
    loadData();
  };

  // Open Adjust Modal
  const openAdjust = (med) => {
    setSelectedMed(med);
    setAdjustQty(50);
    setAdjustReason('Shipment Received / Restock from Central Depot');
    setAdjustModal(true);
  };

  // Handle Stock Adjustment
  const handleStockAdjust = (e) => {
    e.preventDefault();
    if (!selectedMed) return;
    const qty = parseInt(adjustQty, 10);
    updateMedicineStock(selectedMed.id, qty);

    logAuditEvent({
      userId: currentUser?.id || 'u007',
      userName: currentUser?.name || 'Sneha Gupta',
      role: 'pharmacist',
      action: 'STOCK_ADJUSTED',
      category: 'Inventory',
      details: `Stock for ${selectedMed.name} adjusted by ${qty > 0 ? '+' + qty : qty} units. Reason: ${adjustReason}`,
    });

    showToast(`Inventory updated for ${selectedMed.name}!`);
    setAdjustModal(false);
    loadData();
  };

  const categories = useMemo(() => {
    const set = new Set(medicines.map((m) => m.category));
    return Array.from(set);
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = categoryFilter === 'all' || m.category === categoryFilter;
      const matchStock =
        stockFilter === 'all' ||
        (stockFilter === 'low' && m.stock <= m.reorderLevel) ||
        (stockFilter === 'normal' && m.stock > m.reorderLevel);

      return matchSearch && matchCategory && matchStock;
    });
  }, [medicines, searchTerm, categoryFilter, stockFilter]);

  return (
    <AppLayout title="Pharmacy Medicine Inventory">
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
            <Pill size={26} color="var(--color-primary-600)" />
            Pharmacy Formulary &amp; Inventory Catalog
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Real-time track of drug stocks, lot/batch numbers, shelf-life expiry, and automated reorder alerts.
          </p>
        </div>
        <Button variant="primary" icon={PlusCircle} onClick={() => setAddModal(true)}>
          Add New Medication
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
              placeholder="Search by Drug Name, Generic Name, Batch #..."
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
              style={{ width: 180 }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color="var(--color-text-muted)" />
            <select
              className="form-control"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              style={{ width: 160 }}
            >
              <option value="all">All Stock Statuses</option>
              <option value="low">Low Stock Alerts</option>
              <option value="normal">Normal / In Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Code &amp; Name</th>
                <th>Category &amp; Form</th>
                <th>Batch # &amp; Expiry</th>
                <th>Unit Price (₹)</th>
                <th>In Stock</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No medications match your filter parameters.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const isLow = med.stock <= med.reorderLevel;
                  return (
                    <tr key={med.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{med.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          Generic: {med.genericName} • {med.strength}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          Loc: {med.location}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            background: 'var(--color-bg-secondary)',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                          }}
                        >
                          {med.category}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {med.dosageForm}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>
                          {med.batchNo}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          Exp: {med.expiryDate}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                        ₹{med.unitPrice.toFixed(2)}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: isLow ? '#dc2626' : 'var(--color-text-primary)',
                          }}
                        >
                          {med.stock}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                        {med.reorderLevel} units
                      </td>
                      <td>
                        {isLow ? (
                          <span
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <AlertTriangle size={12} /> Low Stock
                          </span>
                        ) : (
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
                            In Stock
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={PackagePlus}
                          onClick={() => openAdjust(med)}
                        >
                          Restock
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

      {/* Restock / Adjust Stock Modal */}
      {adjustModal && selectedMed && (
        <Modal
          isOpen={adjustModal}
          onClose={() => setAdjustModal(false)}
          title={`Restock / Adjust Inventory — ${selectedMed.name}`}
        >
          <form onSubmit={handleStockAdjust} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: '0.85rem',
              }}
            >
              <div><strong>Drug SKU:</strong> {selectedMed.name} ({selectedMed.strength})</div>
              <div><strong>Batch Number:</strong> {selectedMed.batchNo}</div>
              <div><strong>Current Stock:</strong> <span style={{ fontWeight: 700 }}>{selectedMed.stock} units</span></div>
              <div><strong>Safety Threshold:</strong> {selectedMed.reorderLevel} units</div>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity to Add / Adjust (Units) *</label>
              <input
                type="number"
                className="form-control"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                required
                placeholder="e.g. 100 for restock, or -10 for damage"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                New resulting inventory stock will be: <strong>{Math.max(0, selectedMed.stock + parseInt(adjustQty || 0, 10))}</strong> units
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Adjustment Reason / Goods Receipt Note (GRN)</label>
              <input
                type="text"
                className="form-control"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. GRN #88219 from Sun Pharma distributor"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button type="button" variant="ghost" onClick={() => setAdjustModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={PackagePlus}>
                Update Inventory Stock
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add New Medication Modal */}
      {addModal && (
        <Modal
          isOpen={addModal}
          onClose={() => setAddModal(false)}
          title="Catalog New Medication in Formulary"
        >
          <form onSubmit={handleAddMedicine} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Trade / Brand Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Augmentin 625 Duo"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Generic Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  required
                  placeholder="e.g. Amoxicillin + Clavulanic Acid"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Analgesics & Antipyretics">Analgesics &amp; Antipyretics</option>
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Antidiabetic">Antidiabetic</option>
                  <option value="Gastrointestinal">Gastrointestinal</option>
                  <option value="Respiratory">Respiratory</option>
                  <option value="Critical Care / Emergency">Critical Care / Emergency</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dosage Form</label>
                <select
                  className="form-control"
                  value={dosageForm}
                  onChange={(e) => setDosageForm(e.target.value)}
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup / Liquid">Syrup / Suspension</option>
                  <option value="Injection / Vial">Injection / Vial</option>
                  <option value="Inhaler">Inhaler</option>
                  <option value="Ointment">Topical Ointment</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Strength</label>
                <input
                  type="text"
                  className="form-control"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  placeholder="e.g. 500 mg"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Stock *</label>
                <input
                  type="number"
                  className="form-control"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Reorder Min *</label>
                <input
                  type="number"
                  className="form-control"
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Batch No *</label>
                <input
                  type="text"
                  className="form-control"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  placeholder="e.g. AUG-2025-01"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Manufacturer</label>
                <input
                  type="text"
                  className="form-control"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Storage Shelf Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Shelf A-04 or Cold Storage"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button type="button" variant="ghost" onClick={() => setAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={PlusCircle}>
                Register in Inventory
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
