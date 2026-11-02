/**
 * BookAppointment.jsx — Patient Self-Service Appointment Booking (Part 9)
 *
 * Features:
 * - 4-Step Interactive Booking Wizard:
 *   Step 1: Department Selection
 *   Step 2: Doctor Selection (with bio, degree, chamber & fees)
 *   Step 3: Date & Slot Picker (Morning, Afternoon, Evening)
 *   Step 4: Visit Reason & Instant Confirmation Slip
 * - Direct save to persistent appointments database
 * - Downloadable/Printable appointment voucher
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import {
  getAllDepartments,
  getAllDoctors,
  saveCustomAppointment,
  getAllPatients,
} from '../../data/demoData';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Printer,
  Sparkles,
  MapPin,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:15 AM',
  '11:45 AM',
  '02:30 PM',
  '03:15 PM',
  '04:00 PM',
  '04:45 PM',
  '05:30 PM',
  '06:15 PM',
];

export default function BookAppointment() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientRecord, setPatientRecord] = useState(null);

  // Selections
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [visitReason, setVisitReason] = useState('');
  const [consultationType, setConsultationType] = useState('New Consultation');

  // Confirmation result
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    const depts = getAllDepartments();
    setDepartments(depts);
    if (depts.length > 0) setSelectedDept(depts[0].name);

    const docs = getAllDoctors();
    setDoctors(docs);

    const allPts = getAllPatients();
    const patId = currentUser?.patientId || 'P-001';
    const match = allPts.find((p) => p.id === patId || p.email === currentUser?.email);
    setPatientRecord(match || allPts[0]);

    // Default booking date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, [currentUser]);

  // Filter doctors by selected department
  const filteredDoctors = doctors.filter(
    (d) => !selectedDept || d.department === selectedDept
  );

  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      alert('Please select a doctor, appointment date, and time slot.');
      return;
    }

    const newAppt = {
      id: `APT-${Date.now().toString().slice(-6)}`,
      patientId: patientRecord?.id || 'P-001',
      patientName: patientRecord?.name || currentUser?.name || 'Rahul Verma',
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      department: selectedDoctor.department,
      date: selectedDate,
      time: selectedSlot,
      type: consultationType,
      status: 'confirmed',
      reason: visitReason || 'General Health Consultation',
      fee: selectedDoctor.consultationFee || 600,
      chamber: selectedDoctor.chamber || 'Room 302',
    };

    saveCustomAppointment(newAppt);
    setConfirmedBooking(newAppt);
    setStep(4);
  };

  return (
    <AppLayout title="Book Appointment">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Book Doctor Consultation</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Schedule an in-person OPD consultation with hospital specialists.
          </p>
        </div>
      </div>

      {/* Progress Steps Header */}
      <div
        className="card"
        style={{
          padding: '16px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {[
          { num: 1, label: 'Department' },
          { num: 2, label: 'Select Doctor' },
          { num: 3, label: 'Date & Time' },
          { num: 4, label: 'Confirmation' },
        ].map((s, idx) => (
          <div
            key={s.num}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              opacity: step >= s.num ? 1 : 0.45,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: step >= s.num ? 'var(--color-primary)' : 'var(--color-border)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {step > s.num ? <CheckCircle2 size={16} /> : s.num}
            </div>
            <span style={{ fontWeight: step === s.num ? 700 : 500, fontSize: 'var(--font-size-sm)' }}>
              {s.label}
            </span>
            {idx < 3 && (
              <ChevronRight size={18} color="var(--color-text-muted)" style={{ marginLeft: 8 }} />
            )}
          </div>
        ))}
      </div>

      {/* STEP 1: Department Selection */}
      {step === 1 && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
            Choose Medical Speciality
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
              marginBottom: 24,
            }}
          >
            {departments.map((dept) => {
              const isSelected = selectedDept === dept.name;
              return (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.name)}
                  style={{
                    padding: 16,
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: isSelected ? '#eff6ff' : 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: isSelected ? 'var(--color-primary)' : 'inherit' }}>
                      {dept.name}
                    </div>
                    {isSelected && <CheckCircle2 size={18} color="var(--color-primary)" />}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                    HOD: {dept.headOfDepartment}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="primary"
              icon={ArrowRight}
              onClick={() => {
                const available = doctors.filter((d) => d.department === selectedDept);
                if (available.length > 0) setSelectedDoctor(available[0]);
                setStep(2);
              }}
            >
              Continue to Doctors
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Doctor Selection */}
      {step === 2 && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
              Select Consulting Physician ({selectedDept})
            </h3>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Showing specialists available in {selectedDept}
            </span>
          </div>

          {filteredDoctors.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No doctors currently listed under {selectedDept}.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16,
                marginBottom: 24,
              }}
            >
              {filteredDoctors.map((doc) => {
                const isSelected = selectedDoctor?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    className={`doctor-select-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectDoctor(doc)}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 15,
                        flexShrink: 0,
                      }}
                    >
                      {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                          {doc.name}
                        </div>
                        {isSelected && <CheckCircle2 size={16} color="var(--color-primary)" />}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {doc.specialization} · {doc.experience || '10+ yrs exp'}
                      </div>
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
                        Chamber: {doc.chamber || 'Room 302'}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          marginTop: 6,
                        }}
                      >
                        Consultation Fee: ₹{doc.consultationFee || 600}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="secondary" icon={ChevronLeft} onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              variant="primary"
              icon={ArrowRight}
              disabled={!selectedDoctor}
              onClick={() => setStep(3)}
            >
              Continue to Date & Slot
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Date & Slot Picker + Reason */}
      {step === 3 && (
        <form onSubmit={handleConfirmBooking}>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
              Select Consultation Schedule
            </h3>

            {/* Doctor Selected Recap */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: '#64748b' }}>Consulting Doctor</span>
                <div style={{ fontWeight: 700 }}>{selectedDoctor?.name} ({selectedDoctor?.specialization})</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>Fee</span>
                <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                  ₹{selectedDoctor?.consultationFee || 600}
                </div>
              </div>
            </div>

            {/* Date Picker & Type */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Appointment Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Consultation Type
                </label>
                <select
                  className="form-control"
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value)}
                >
                  <option value="New Consultation">New Consultation</option>
                  <option value="Follow-up Visit">Follow-up Visit</option>
                  <option value="Report Review">Lab Report Review</option>
                  <option value="Second Opinion">Second Opinion</option>
                </select>
              </div>
            </div>

            {/* Time Slots Pills */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                Available Consultation Time Slots
              </label>
              <div className="slot-pill-group">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`slot-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reason for Visit */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Symptoms & Reason for Visit
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Briefly describe your symptoms, duration, or reason for this appointment..."
                value={visitReason}
                onChange={(e) => setVisitReason(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="secondary" icon={ChevronLeft} onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={CheckCircle2}
              disabled={!selectedSlot}
            >
              Confirm & Book Appointment
            </Button>
          </div>
        </form>
      )}

      {/* STEP 4: Confirmation Slip Voucher */}
      {step === 4 && confirmedBooking && (
        <div className="card" style={{ padding: 24 }}>
          <div className="printable-area">
            <div
              style={{
                textAlign: 'center',
                padding: '20px 0',
                borderBottom: '2px solid var(--color-primary)',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>
                Appointment Confirmed!
              </h2>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Reference Token: <strong>{confirmedBooking.id}</strong>
              </div>
            </div>

            {/* Voucher Details Table */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-lg)',
                padding: 20,
                marginBottom: 24,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Patient Name</span>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{confirmedBooking.patientName}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>UHID: {confirmedBooking.patientId}</div>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Attending Physician</span>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{confirmedBooking.doctorName}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{confirmedBooking.department}</div>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Consultation Schedule</span>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {confirmedBooking.date} at {confirmedBooking.time}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Location / Chamber</span>
                  <div style={{ fontWeight: 600 }}>{confirmedBooking.chamber}</div>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Consultation Fee</span>
                  <div style={{ fontWeight: 800, color: '#16a34a' }}>₹{confirmedBooking.fee} (Payable at OPD Desk)</div>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Status</span>
                  <div>
                    <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outline"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Appointment Slip
            </Button>

            <Button
              variant="primary"
              onClick={() => navigate('/patient/appointments')}
            >
              View My Appointments
            </Button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
