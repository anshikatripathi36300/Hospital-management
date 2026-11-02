/**
 * PatientRegister.jsx
 *
 * Full-featured Patient Self-Registration Wizard.
 * 4-Step clinical onboarding workflow:
 *  - Step 1: Personal Demographics & Vitals (Name, DOB, Gender, Blood Group, Marital Status)
 *  - Step 2: Contact & Address (Phone, Email, Street Address, City, State, Pincode)
 *  - Step 3: Medical History & Emergency (Emergency Contact, Relationship, Allergies, Medical History)
 *  - Step 4: Security & Consent (Password Strength, Confirmation, Consent Terms)
 *
 * Generates an official UHID & Patient ID card and directly persists
 * to AuthContext so patients can log in immediately.
 *
 * Part 3 Roadmap Implementation.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Cross,
  AlertCircle,
  Calendar,
  Heart,
  Shield,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Printer,
  Download,
  Activity,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'];
const EMERGENCY_RELATIONS = ['Parent', 'Spouse', 'Child', 'Sibling', 'Guardian', 'Friend', 'Other'];

export default function PatientRegister() {
  const navigate = useNavigate();
  const { registerPatient } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  // Comprehensive Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    name: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+',
    maritalStatus: 'Single',

    // Step 2: Contact
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',

    // Step 3: Medical & Emergency
    emergencyName: '',
    emergencyRelation: 'Spouse',
    emergencyPhone: '',
    allergies: '',
    conditions: '',

    // Step 4: Security & Consent
    password: '',
    confirmPassword: '',
    consentTerms: false,
    consentPrivacy: false,
  });

  const [errors, setErrors] = useState({});

  // Field change handler
  function handleChange(field) {
    return (e) => {
      const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setFormData((prev) => ({ ...prev, [field]: val }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    };
  }

  // Password strength calculation
  function calculatePasswordStrength(pass) {
    if (!pass) return { score: 0, text: '', color: 'transparent' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, text: 'Weak', color: 'var(--color-danger)' };
    if (score === 2) return { score: 50, text: 'Fair', color: 'var(--color-warning)' };
    if (score === 3) return { score: 75, text: 'Good', color: '#0284c7' };
    return { score: 100, text: 'Strong', color: 'var(--color-success)' };
  }

  const pwStrength = calculatePasswordStrength(formData.password);

  // Validation per step
  function validateStep(step) {
    const errs = {};
    if (step === 1) {
      if (!formData.name.trim()) errs.name = 'Full name is required.';
      if (!formData.dob) {
        errs.dob = 'Date of birth is required.';
      } else {
        const birthDate = new Date(formData.dob);
        if (birthDate > new Date()) errs.dob = 'Date of birth cannot be in the future.';
      }
    } else if (step === 2) {
      if (!formData.phone.trim()) {
        errs.phone = 'Mobile phone number is required.';
      } else if (!/^\d{10}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
        errs.phone = 'Enter a valid 10-digit mobile number.';
      }
      if (!formData.email.trim()) {
        errs.email = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errs.email = 'Enter a valid email address.';
      }
      if (!formData.address.trim()) errs.address = 'Residential street address is required.';
      if (!formData.city.trim()) errs.city = 'City is required.';
      if (formData.pincode && !/^\d{6}$/.test(formData.pincode.trim())) {
        errs.pincode = 'Pincode must be 6 digits.';
      }
    } else if (step === 3) {
      if (!formData.emergencyName.trim()) errs.emergencyName = 'Emergency contact person is required.';
      if (!formData.emergencyPhone.trim()) {
        errs.emergencyPhone = 'Emergency phone number is required.';
      } else if (!/^\d{10}$/.test(formData.emergencyPhone.replace(/[\s-]/g, ''))) {
        errs.emergencyPhone = 'Enter a valid 10-digit emergency number.';
      }
    } else if (step === 4) {
      if (!formData.password) {
        errs.password = 'Password is required.';
      } else if (formData.password.length < 8) {
        errs.password = 'Password must be at least 8 characters long.';
      }
      if (formData.confirmPassword !== formData.password) {
        errs.confirmPassword = 'Passwords do not match.';
      }
      if (!formData.consentTerms) {
        errs.consentTerms = 'You must agree to the Hospital Terms & Conditions.';
      }
      if (!formData.consentPrivacy) {
        errs.consentPrivacy = 'Consent to Medical Privacy Policy is required.';
      }
    }
    return errs;
  }

  function handleNextStep() {
    const errs = validateStep(currentStep);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  }

  function handlePrevStep() {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  // Final Registration Submission
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateStep(4);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    // Register into AuthContext state
    const result = registerPatient(formData, false);
    setLoading(false);

    if (result.success) {
      setSubmittedResult(result);
    }
  }

  // Handle direct sign-in from success screen
  function handleDirectLogin() {
    if (submittedResult?.user) {
      registerPatient(formData, true); // re-logs in with active session
      navigate('/patient/dashboard', { replace: true });
    }
  }

  // Print Registration Slip
  function handlePrintSlip() {
    window.print();
  }

  // ── Success State View ─────────────────────────────────────────────────────
  if (submittedResult) {
    const { patient, user } = submittedResult;
    return (
      <AuthLayout>
        <div className="auth-card auth-card-wide" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 6 }}>
            Registration Complete!
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              marginBottom: 24,
            }}
          >
            Your patient record and Unique Health Identifier (UHID) have been generated.
          </p>

          {/* Digital UHID Card */}
          <div className="uhid-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="uhid-badge">
                  <Activity size={12} />
                  GOVERNMENT OF HEALTH AFFILIATED • MEDICARE HMS
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.85, textTransform: 'uppercase' }}>
                  Unique Health Identification (UHID)
                </div>
                <div className="uhid-number">{submittedResult.uhid}</div>
              </div>
              <div
                style={{
                  background: 'white',
                  color: 'var(--color-primary-dark)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '11px',
                }}
              >
                STATUS: ACTIVE
              </div>
            </div>

            <div className="uhid-details-grid">
              <div>
                <div className="uhid-detail-label">Patient Name</div>
                <div className="uhid-detail-value">{patient.name}</div>
              </div>
              <div>
                <div className="uhid-detail-label">Blood Group / Age</div>
                <div className="uhid-detail-value">
                  {patient.blood} • {patient.age} yrs ({patient.gender})
                </div>
              </div>
              <div>
                <div className="uhid-detail-label">Primary Phone</div>
                <div className="uhid-detail-value">{patient.phone}</div>
              </div>
              <div>
                <div className="uhid-detail-label">Emergency Contact</div>
                <div className="uhid-detail-value">
                  {formData.emergencyName} ({formData.emergencyRelation}) - {formData.emergencyPhone}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Button
              variant="primary"
              size="lg"
              full
              icon={ArrowRight}
              iconPosition="right"
              onClick={handleDirectLogin}
            >
              Enter Patient Portal Directly
            </Button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Button
                variant="secondary"
                icon={Printer}
                onClick={handlePrintSlip}
              >
                Print Health Card
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  navigate('/login', {
                    state: {
                      registeredEmail: user.email,
                      registeredName: user.name,
                      tempPassword: formData.password,
                    },
                  })
                }
              >
                Go to Sign In
              </Button>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // ── Multi-Step Form View ───────────────────────────────────────────────────
  return (
    <AuthLayout>
      <div className="auth-card auth-card-wide">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Cross size={22} color="white" />
          </div>
          <div className="auth-logo-text">
            <h1>MediCare HMS</h1>
            <p>Patient Self-Registration Portal</p>
          </div>
        </div>

        {/* Wizard Step Bar */}
        <div className="wizard-steps" role="navigation" aria-label="Registration steps">
          {[
            { step: 1, label: 'Personal' },
            { step: 2, label: 'Contact' },
            { step: 3, label: 'Medical' },
            { step: 4, label: 'Security' },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;
            return (
              <button
                key={item.step}
                type="button"
                className={`wizard-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  if (item.step < currentStep) setCurrentStep(item.step);
                }}
                disabled={item.step > currentStep}
              >
                <div className="wizard-step-circle">
                  {isCompleted ? <CheckCircle2 size={18} /> : item.step}
                </div>
                <span className="wizard-step-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── STEP 1: Personal Demographics ── */}
          {currentStep === 1 && (
            <div>
              <div className="wizard-section-title">
                <User size={18} color="var(--color-primary)" />
                <span>Step 1: Patient Demographics &amp; Vitals</span>
              </div>

              <InputField
                id="reg-fullname"
                label="Full Legal Name"
                required
                placeholder="e.g. Ramesh Kumar Patel"
                value={formData.name}
                onChange={handleChange('name')}
                error={errors.name}
                iconLeft={User}
              />

              <div className="form-row">
                <InputField
                  id="reg-dob"
                  label="Date of Birth"
                  type="date"
                  required
                  value={formData.dob}
                  onChange={handleChange('dob')}
                  error={errors.dob}
                  iconLeft={Calendar}
                />

                <div className="form-group">
                  <label htmlFor="reg-gender" className="form-label required">
                    Gender
                  </label>
                  <select
                    id="reg-gender"
                    className="form-select"
                    value={formData.gender}
                    onChange={handleChange('gender')}
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reg-blood" className="form-label required">
                    Blood Group
                  </label>
                  <select
                    id="reg-blood"
                    className="form-select"
                    value={formData.bloodGroup}
                    onChange={handleChange('bloodGroup')}
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-marital" className="form-label">
                    Marital Status
                  </label>
                  <select
                    id="reg-marital"
                    className="form-select"
                    value={formData.maritalStatus}
                    onChange={handleChange('maritalStatus')}
                  >
                    {MARITAL_STATUSES.map((ms) => (
                      <option key={ms} value={ms}>
                        {ms}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Contact & Address ── */}
          {currentStep === 2 && (
            <div>
              <div className="wizard-section-title">
                <Phone size={18} color="var(--color-primary)" />
                <span>Step 2: Contact &amp; Residential Information</span>
              </div>

              <div className="form-row">
                <InputField
                  id="reg-phone"
                  label="Mobile Number (10 Digits)"
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  error={errors.phone}
                  iconLeft={Phone}
                />

                <InputField
                  id="reg-email"
                  label="Email Address"
                  type="email"
                  required
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={errors.email}
                  iconLeft={Mail}
                />
              </div>

              <InputField
                id="reg-address"
                label="Street Address / House No."
                required
                placeholder="e.g. Flat 302, Green Valley Apts, Outer Ring Rd"
                value={formData.address}
                onChange={handleChange('address')}
                error={errors.address}
                iconLeft={MapPin}
              />

              <div className="form-row">
                <InputField
                  id="reg-city"
                  label="City"
                  required
                  placeholder="e.g. Bengaluru"
                  value={formData.city}
                  onChange={handleChange('city')}
                  error={errors.city}
                />

                <InputField
                  id="reg-state"
                  label="State / Province"
                  placeholder="e.g. Karnataka"
                  value={formData.state}
                  onChange={handleChange('state')}
                />

                <InputField
                  id="reg-pincode"
                  label="Pincode / Postal Code"
                  placeholder="e.g. 560100"
                  value={formData.pincode}
                  onChange={handleChange('pincode')}
                  error={errors.pincode}
                />
              </div>
            </div>
          )}

          {/* ── STEP 3: Medical & Emergency ── */}
          {currentStep === 3 && (
            <div>
              <div className="wizard-section-title">
                <Heart size={18} color="var(--color-primary)" />
                <span>Step 3: Emergency Contact &amp; Clinical Background</span>
              </div>

              <div className="form-row">
                <InputField
                  id="reg-emergency-name"
                  label="Emergency Contact Person"
                  required
                  placeholder="Full name of emergency contact"
                  value={formData.emergencyName}
                  onChange={handleChange('emergencyName')}
                  error={errors.emergencyName}
                  iconLeft={User}
                />

                <div className="form-group">
                  <label htmlFor="reg-emergency-rel" className="form-label required">
                    Relationship
                  </label>
                  <select
                    id="reg-emergency-rel"
                    className="form-select"
                    value={formData.emergencyRelation}
                    onChange={handleChange('emergencyRelation')}
                  >
                    {EMERGENCY_RELATIONS.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <InputField
                id="reg-emergency-phone"
                label="Emergency Phone Number"
                type="tel"
                required
                placeholder="10-digit emergency contact number"
                value={formData.emergencyPhone}
                onChange={handleChange('emergencyPhone')}
                error={errors.emergencyPhone}
                iconLeft={Phone}
              />

              <div className="form-group">
                <label htmlFor="reg-allergies" className="form-label">
                  Known Drug or Food Allergies (Optional)
                </label>
                <input
                  id="reg-allergies"
                  className="form-input"
                  placeholder="e.g. Penicillin, Peanuts, Sulfa drugs (Leave blank if none)"
                  value={formData.allergies}
                  onChange={handleChange('allergies')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-conditions" className="form-label">
                  Existing Medical Conditions or Past Surgeries (Optional)
                </label>
                <textarea
                  id="reg-conditions"
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                  value={formData.conditions}
                  onChange={handleChange('conditions')}
                />
              </div>
            </div>
          )}

          {/* ── STEP 4: Security & Consent ── */}
          {currentStep === 4 && (
            <div>
              <div className="wizard-section-title">
                <Shield size={18} color="var(--color-primary)" />
                <span>Step 4: Account Security &amp; Legal Consent</span>
              </div>

              <InputField
                id="reg-pw"
                label="Create Portal Password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Minimum 8 characters with letters & numbers"
                value={formData.password}
                onChange={handleChange('password')}
                error={errors.password}
                iconLeft={Lock}
                iconRight={showPassword ? EyeOff : Eye}
                onIconRightClick={() => setShowPassword((s) => !s)}
              />

              {/* Password strength meter */}
              {formData.password && (
                <div style={{ marginBottom: 16 }}>
                  <div className="password-strength-bar">
                    <div
                      className="password-strength-fill"
                      style={{
                        width: `${pwStrength.score}%`,
                        backgroundColor: pwStrength.color,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <span>Strength: {pwStrength.text}</span>
                    <span>Min. 8 characters</span>
                  </div>
                </div>
              )}

              <InputField
                id="reg-confirm-pw"
                label="Confirm Password"
                type="password"
                required
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                error={errors.confirmPassword}
                iconLeft={Lock}
              />

              {/* Legal Consents */}
              <div
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  marginTop: 16,
                  marginBottom: 16,
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.consentTerms}
                    onChange={handleChange('consentTerms')}
                    style={{ marginTop: 2, accentColor: 'var(--color-primary)' }}
                  />
                  <span>
                    I confirm that the medical and contact details provided are accurate. I consent to medical care and emergency contact procedures.
                  </span>
                </label>
                {errors.consentTerms && (
                  <span className="form-error" style={{ marginLeft: 24 }}>
                    {errors.consentTerms}
                  </span>
                )}

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.consentPrivacy}
                    onChange={handleChange('consentPrivacy')}
                    style={{ marginTop: 2, accentColor: 'var(--color-primary)' }}
                  />
                  <span>
                    I agree to MediCare HMS data privacy policies and electronic medical records retention.
                  </span>
                </label>
                {errors.consentPrivacy && (
                  <span className="form-error" style={{ marginLeft: 24 }}>
                    {errors.consentPrivacy}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Form Navigation Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 24,
              paddingTop: 16,
              borderTop: '1px solid var(--color-border)',
            }}
          >
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="secondary"
                icon={ArrowLeft}
                onClick={handlePrevStep}
              >
                Previous Step
              </Button>
            ) : (
              <Link to="/login" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                ← Back to Login
              </Link>
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                onClick={handleNextStep}
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                icon={CheckCircle2}
                iconPosition="right"
              >
                Complete Registration
              </Button>
            )}
          </div>

          <p
            style={{
              textAlign: 'center',
              marginTop: 20,
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
