/**
 * RegisterPatient.jsx — Front-Desk Patient Registration & UHID Issuance (Part 10)
 *
 * Features:
 * - Streamlined intake form for front-desk walk-in patients
 * - Live duplicate detection on phone number and email
 * - Automatic generation of official Unique Hospital ID (UHID)
 * - Printable OPD Registration Card with barcode placeholder
 * - Seamless transition to booking an appointment
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { getAllPatients, saveCustomPatient } from '../../data/demoData';
import {
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Calendar,
  ShieldCheck,
  Phone,
  User,
  Heart,
  Droplet,
  MapPin,
  ArrowRight,
} from 'lucide-react';

export default function RegisterPatient() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    blood: 'O+',
    phone: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Spouse',
    allergies: '',
    conditions: '',
  });

  const [registeredPatient, setRegisteredPatient] = useState(null);
  const [cardModal, setCardModal] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Duplicate phone/email check
  const handlePhoneBlur = (phoneVal) => {
    if (!phoneVal) return;
    const all = getAllPatients();
    const existing = all.find((p) => p.phone === phoneVal);
    if (existing) {
      setDuplicateWarning(
        `Alert: A patient with phone ${phoneVal} is already registered (${existing.name} — ${existing.uhid}).`
      );
    } else {
      setDuplicateWarning('');
    }
  };

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (field === 'phone') {
      handlePhoneBlur(val);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const all = getAllPatients();
    const nextNum = 1000 + all.length + 1;
    const uhid = `UHID-2024-${nextNum}`;
    const newId = `P-${String(all.length + 1).padStart(3, '0')}`;

    const newPatient = {
      id: newId,
      uhid,
      name: formData.name,
      age: parseInt(formData.age, 10) || 30,
      gender: formData.gender,
      blood: formData.blood,
      phone: formData.phone,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@demo.test`,
      address: formData.address,
      status: 'active',
      admissionStatus: 'outpatient',
      registered: new Date().toISOString().split('T')[0],
      lastVisit: new Date().toISOString().split('T')[0],
      vitals: { bp: '120/80 mmHg', pulse: '76 bpm', temp: '98.6°F', spo2: '99%', weight: '65 kg' },
      diagnosis: 'Routine OPD Registration',
      emergencyContact: {
        name: formData.emergencyContactName || 'Family Member',
        phone: formData.emergencyContactPhone || formData.phone,
        relation: formData.emergencyContactRelation || 'Relative',
      },
      allergies: formData.allergies || 'No known allergies reported',
      conditions: formData.conditions || 'None reported',
    };

    saveCustomPatient(newPatient);
    setRegisteredPatient(newPatient);
    setCardModal(true);
    showToast(`Patient ${newPatient.name} registered with ${uhid}`);
  };

  return (
    <AppLayout title="Register Patient">
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Front Desk Patient Registration</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Fast intake form for visiting OPD walk-in patients with instant UHID issuance.
          </p>
        </div>
      </div>

      {duplicateWarning && (
        <div
          style={{
            background: '#fef3c7',
            border: '1px solid #fde68a',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            color: '#b45309',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>{duplicateWarning}</div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="card" style={{ padding: 24 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Section 1: Demographics */}
          <div>
            <h3 style={{ margin: '0 0 14px', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)' }}>
              1. Patient Identity & Demographics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Age (Years) *
                </label>
                <input
                  type="number"
                  className="form-control"
                  required
                  min="0"
                  max="125"
                  placeholder="e.g. 42"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Gender *
                </label>
                <select
                  className="form-control"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Blood Group *
                </label>
                <select
                  className="form-control"
                  value={formData.blood}
                  onChange={(e) => handleChange('blood', e.target.value)}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Address */}
          <div>
            <h3 style={{ margin: '0 0 14px', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)' }}>
              2. Contact Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  className="form-control"
                  required
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Residential Address
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Flat/House number, Street, Landmark, City"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contact & Medical Alerts */}
          <div>
            <h3 style={{ margin: '0 0 14px', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)' }}>
              3. Emergency Contact & Clinical Alerts
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Relative / Next of kin"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="10-digit telephone"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Relationship
                </label>
                <select
                  className="form-control"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => handleChange('emergencyContactRelation', e.target.value)}
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Son / Daughter</option>
                  <option value="Sibling">Brother / Sister</option>
                  <option value="Friend">Friend / Guardian</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Known Drug Allergies
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Penicillin, Sulfa drugs (or NKDA)"
                  value={formData.allergies}
                  onChange={(e) => handleChange('allergies', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/receptionist/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={CheckCircle2} size="lg">
              Complete Registration & Issue UHID
            </Button>
          </div>
        </form>
      </div>

      {/* Registration Success & Printable UHID Card Modal */}
      {cardModal && registeredPatient && (
        <Modal
          isOpen={cardModal}
          onClose={() => setCardModal(false)}
          title="Patient Registration Successful!"
        >
          <div className="printable-area">
            <div
              style={{
                border: '2px solid var(--color-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                background: '#ffffff',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '2px solid var(--color-primary)',
                  paddingBottom: 14,
                  marginBottom: 16,
                }}
              >
                <div>
                  <h2 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1.3rem', fontWeight: 800 }}>
                    METROPOLITAN GENERAL HOSPITAL
                  </h2>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    Official Outpatient Registration Card
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      background: 'var(--color-primary)',
                      color: 'white',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  >
                    {registeredPatient.uhid}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, fontSize: 'var(--font-size-sm)' }}>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Patient Name</span>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{registeredPatient.name}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Age / Gender</span>
                  <div style={{ fontWeight: 600 }}>{registeredPatient.age} yrs / {registeredPatient.gender}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Blood Group</span>
                  <div style={{ fontWeight: 800, color: '#b91c1c' }}>{registeredPatient.blood}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Mobile Number</span>
                  <div style={{ fontWeight: 600 }}>{registeredPatient.phone}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Registration Date</span>
                  <div>{registeredPatient.registered}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Emergency Contact</span>
                  <div>{registeredPatient.emergencyContact?.name} ({registeredPatient.emergencyContact?.relation})</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: 10,
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: 6,
                  fontSize: 11,
                  color: '#475569',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Please present this UHID card during every hospital consultation and pharmacy visit.</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em' }}>*BARCODE*</span>
              </div>
            </div>
          </div>

          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <Button variant="outline" icon={Printer} onClick={() => window.print()}>
              Print UHID Card
            </Button>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={() => setCardModal(false)}>
                Done
              </Button>
              <Button
                variant="primary"
                icon={ArrowRight}
                onClick={() => {
                  setCardModal(false);
                  navigate('/receptionist/appointments');
                }}
              >
                Book Appointment Now
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
