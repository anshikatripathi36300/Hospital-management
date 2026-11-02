/**
 * demoData.js — Development-only mock data
 *
 * ⚠️  DEMO MODE ONLY — Not real patient data.
 *     All names, records, and credentials are fictional
 *     and exist solely to demonstrate the UI.
 */

// ---------------------------------------------------------------------------
// Demo user accounts (for mock login only)
// These are NOT real credentials. The backend will replace this entirely.
// ---------------------------------------------------------------------------
export const DEMO_USERS = [
  {
    id: 'u001',
    name: 'Admin User',
    email: 'admin@hospital.demo',
    password: 'demo1234',       // never store real passwords like this
    role: 'admin',
    avatar: 'AU',
    department: 'Administration',
  },
  {
    id: 'u002',
    name: 'Dr. Priya Sharma',
    email: 'doctor@hospital.demo',
    password: 'demo1234',
    role: 'doctor',
    avatar: 'PS',
    department: 'Cardiology',
    specialization: 'Cardiologist',
  },
  {
    id: 'u003',
    name: 'Rahul Verma',
    email: 'patient@hospital.demo',
    password: 'demo1234',
    role: 'patient',
    avatar: 'RV',
    patientId: 'P-001',
  },
  {
    id: 'u004',
    name: 'Anjali Nair',
    email: 'receptionist@hospital.demo',
    password: 'demo1234',
    role: 'receptionist',
    avatar: 'AN',
    department: 'Front Desk',
  },
  {
    id: 'u005',
    name: 'Meena Patel',
    email: 'nurse@hospital.demo',
    password: 'demo1234',
    role: 'nurse',
    avatar: 'MP',
    department: 'General Ward',
  },
  {
    id: 'u006',
    name: 'Arjun Reddy',
    email: 'lab@hospital.demo',
    password: 'demo1234',
    role: 'lab_technician',
    avatar: 'AR',
    department: 'Laboratory',
  },
  {
    id: 'u007',
    name: 'Sneha Gupta',
    email: 'pharmacy@hospital.demo',
    password: 'demo1234',
    role: 'pharmacist',
    avatar: 'SG',
    department: 'Pharmacy',
  },
  {
    id: 'u008',
    name: 'Vikram Joshi',
    email: 'billing@hospital.demo',
    password: 'demo1234',
    role: 'accountant',
    avatar: 'VJ',
    department: 'Billing & Accounts',
  },
];

// ---------------------------------------------------------------------------
// Role → home route mapping
// ---------------------------------------------------------------------------
export const ROLE_HOME_ROUTES = {
  admin:          '/admin/dashboard',
  doctor:         '/doctor/dashboard',
  patient:        '/patient/dashboard',
  receptionist:   '/receptionist/dashboard',
  nurse:          '/nurse/dashboard',
  lab_technician: '/lab/dashboard',
  pharmacist:     '/pharmacy/dashboard',
  accountant:     '/billing/dashboard',
};

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------
export const DEPARTMENTS = [
  { id: 'd01', name: 'Cardiology',       head: 'Dr. Priya Sharma',   doctors: 4, patients: 38 },
  { id: 'd02', name: 'Neurology',        head: 'Dr. Arun Kumar',     doctors: 3, patients: 25 },
  { id: 'd03', name: 'Orthopaedics',     head: 'Dr. Sunita Mehta',   doctors: 5, patients: 42 },
  { id: 'd04', name: 'Paediatrics',      head: 'Dr. Kiran Das',      doctors: 4, patients: 30 },
  { id: 'd05', name: 'General Medicine', head: 'Dr. Ravi Iyer',      doctors: 6, patients: 60 },
  { id: 'd06', name: 'Gynaecology',      head: 'Dr. Usha Pillai',    doctors: 3, patients: 28 },
  { id: 'd07', name: 'Emergency',        head: 'Dr. Suresh Rao',     doctors: 8, patients: 55 },
  { id: 'd08', name: 'Radiology',        head: 'Dr. Nalini Singh',   doctors: 2, patients: 20 },
];

// ---------------------------------------------------------------------------
// Demo Patients (fictional)
// ---------------------------------------------------------------------------
export const PATIENTS = [
  {
    id: 'P-001',
    uhid: 'UHID-2024-1001',
    name: 'Rahul Verma',
    age: 32,
    gender: 'Male',
    blood: 'B+',
    phone: '9876543210',
    email: 'rahul@demo.test',
    address: '12 MG Road, Bangalore',
    status: 'active',
    admissionStatus: 'outpatient',
    department: 'Cardiology',
    assignedDoctor: 'Dr. Priya Sharma',
    bed: 'OPD Chamber 4',
    registered: '2024-01-15',
    lastVisit: '2024-10-10',
    vitals: { bp: '122/80 mmHg', pulse: '74 bpm', temp: '98.4°F', spo2: '99%', weight: '71 kg' },
    diagnosis: 'Hypertension Stage 1, Post-angina review',
    emergencyContact: { name: 'Sunita Verma', phone: '9876500001', relation: 'Spouse' },
    allergies: 'Penicillin',
    conditions: 'Mild Hypertension',
  },
  {
    id: 'P-002',
    uhid: 'UHID-2024-1002',
    name: 'Lakshmi Devi',
    age: 45,
    gender: 'Female',
    blood: 'O+',
    phone: '9876543211',
    email: 'lakshmi@demo.test',
    address: '34 Park St, Chennai',
    status: 'active',
    admissionStatus: 'inpatient',
    department: 'Neurology',
    assignedDoctor: 'Dr. Arun Kumar',
    bed: 'Ward-B-14',
    registered: '2024-02-20',
    lastVisit: '2024-10-15',
    vitals: { bp: '130/85 mmHg', pulse: '82 bpm', temp: '99.1°F', spo2: '97%', weight: '62 kg' },
    diagnosis: 'Chronic Migraine with Aura, Cervical radiculopathy',
    emergencyContact: { name: 'Karthik Devi', phone: '9876500002', relation: 'Son' },
    allergies: 'Sulfa drugs',
    conditions: 'Vertigo',
  },
  {
    id: 'P-003',
    uhid: 'UHID-2024-1003',
    name: 'Suresh Babu',
    age: 58,
    gender: 'Male',
    blood: 'A-',
    phone: '9876543212',
    email: 'suresh@demo.test',
    address: '56 Lake View, Hyderabad',
    status: 'active',
    admissionStatus: 'inpatient',
    department: 'Orthopaedics',
    assignedDoctor: 'Dr. Sunita Mehta',
    bed: 'Ward-A-08',
    registered: '2024-03-05',
    lastVisit: '2024-10-08',
    vitals: { bp: '138/88 mmHg', pulse: '76 bpm', temp: '98.6°F', spo2: '98%', weight: '84 kg' },
    diagnosis: 'Bilateral Knee Osteoarthritis Grade 3',
    emergencyContact: { name: 'Geeta Babu', phone: '9876500003', relation: 'Spouse' },
    allergies: 'None reported',
    conditions: 'Type 2 Diabetes',
  },
  {
    id: 'P-004',
    uhid: 'UHID-2024-1004',
    name: 'Anita Kulkarni',
    age: 29,
    gender: 'Female',
    blood: 'AB+',
    phone: '9876543213',
    email: 'anita@demo.test',
    address: '78 Shivaji Nagar, Pune',
    status: 'active',
    admissionStatus: 'outpatient',
    department: 'General Medicine',
    assignedDoctor: 'Dr. Ravi Iyer',
    bed: 'OPD Chamber 1',
    registered: '2024-04-12',
    lastVisit: '2024-10-20',
    vitals: { bp: '118/76 mmHg', pulse: '70 bpm', temp: '98.2°F', spo2: '99%', weight: '54 kg' },
    diagnosis: 'Acute Viral Pharyngitis, General fatigue',
    emergencyContact: { name: 'Vikram Kulkarni', phone: '9876500004', relation: 'Brother' },
    allergies: 'Pollen',
    conditions: 'None',
  },
  {
    id: 'P-005',
    uhid: 'UHID-2024-1005',
    name: 'Mohammed Irfan',
    age: 41,
    gender: 'Male',
    blood: 'O-',
    phone: '9876543214',
    email: 'irfan@demo.test',
    address: '90 Brigade Rd, Bangalore',
    status: 'inactive',
    admissionStatus: 'discharged',
    department: 'Cardiology',
    assignedDoctor: 'Dr. Priya Sharma',
    bed: 'Discharged',
    registered: '2024-01-28',
    lastVisit: '2024-07-15',
    vitals: { bp: '124/82 mmHg', pulse: '72 bpm', temp: '98.6°F', spo2: '98%', weight: '76 kg' },
    diagnosis: 'Stable Angina, Follow-up ECG clear',
    emergencyContact: { name: 'Fatima Irfan', phone: '9876500005', relation: 'Spouse' },
    allergies: 'None',
    conditions: 'Dyslipidemia',
  },
  {
    id: 'P-006',
    uhid: 'UHID-2024-1006',
    name: 'Kavita Sundaram',
    age: 36,
    gender: 'Female',
    blood: 'B-',
    phone: '9876543215',
    email: 'kavita@demo.test',
    address: '45 Residency Rd, Bengaluru',
    status: 'active',
    admissionStatus: 'inpatient',
    department: 'Emergency',
    assignedDoctor: 'Dr. Suresh Rao',
    bed: 'ICU-04',
    registered: '2024-05-18',
    lastVisit: '2024-10-25',
    vitals: { bp: '142/92 mmHg', pulse: '98 bpm', temp: '100.4°F', spo2: '95%', weight: '59 kg' },
    diagnosis: 'Acute Pyelonephritis, Sepsis screening',
    emergencyContact: { name: 'Manoj Sundaram', phone: '9876500006', relation: 'Spouse' },
    allergies: 'Ciprofloxacin',
    conditions: 'Asthma',
  },
  {
    id: 'P-007',
    uhid: 'UHID-2024-1007',
    name: 'Deepak Chopra',
    age: 63,
    gender: 'Male',
    blood: 'A+',
    phone: '9876543216',
    email: 'deepak@demo.test',
    address: '88 Cyber City, Gurugram',
    status: 'active',
    admissionStatus: 'outpatient',
    department: 'Paediatrics',
    assignedDoctor: 'Dr. Kiran Das',
    bed: 'OPD Chamber 3',
    registered: '2024-06-11',
    lastVisit: '2024-10-22',
    vitals: { bp: '128/84 mmHg', pulse: '68 bpm', temp: '98.5°F', spo2: '98%', weight: '80 kg' },
    diagnosis: 'Routine wellness & Geriatric screening',
    emergencyContact: { name: 'Ritu Chopra', phone: '9876500007', relation: 'Daughter' },
    allergies: 'Aspirin',
    conditions: 'Pre-diabetes',
  },
  {
    id: 'P-008',
    uhid: 'UHID-2024-1008',
    name: 'Pooja Bhatt',
    age: 24,
    gender: 'Female',
    blood: 'O+',
    phone: '9876543217',
    email: 'pooja@demo.test',
    address: '22 Marine Drive, Mumbai',
    status: 'active',
    admissionStatus: 'outpatient',
    department: 'General Medicine',
    assignedDoctor: 'Dr. Ravi Iyer',
    bed: 'OPD Chamber 2',
    registered: '2024-07-02',
    lastVisit: '2024-10-26',
    vitals: { bp: '112/74 mmHg', pulse: '76 bpm', temp: '98.4°F', spo2: '100%', weight: '50 kg' },
    diagnosis: 'Seasonal allergic rhinitis',
    emergencyContact: { name: 'Neelam Bhatt', phone: '9876500008', relation: 'Mother' },
    allergies: 'Dust, Pollen',
    conditions: 'None',
  },
];

// ---------------------------------------------------------------------------
// Demo Doctors (fictional)
// ---------------------------------------------------------------------------
export const DOCTORS = [
  {
    id: 'D-001',
    name: 'Dr. Priya Sharma',
    specialization: 'Cardiologist',
    department: 'Cardiology',
    experience: 12,
    phone: '9811111111',
    email: 'priya@hospital.demo',
    status: 'active',
    qualifications: 'MD, DM Cardiology',
    licenseNumber: 'MCI-2012-0842',
    chamber: 'OPD Chamber 4 (Block A)',
    fee: 800,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    shift: '09:00 - 14:00',
  },
  {
    id: 'D-002',
    name: 'Dr. Arun Kumar',
    specialization: 'Neurologist',
    department: 'Neurology',
    experience: 9,
    phone: '9811111112',
    email: 'arun@hospital.demo',
    status: 'active',
    qualifications: 'MD, DM Neurology',
    licenseNumber: 'MCI-2015-1102',
    chamber: 'OPD Chamber 7 (Block B)',
    fee: 900,
    availableDays: ['Mon', 'Wed', 'Fri'],
    shift: '10:00 - 15:00',
  },
  {
    id: 'D-003',
    name: 'Dr. Sunita Mehta',
    specialization: 'Orthopaedic Surgeon',
    department: 'Orthopaedics',
    experience: 15,
    phone: '9811111113',
    email: 'sunita@hospital.demo',
    status: 'active',
    qualifications: 'MS Orthopaedics, Fellowship Joint Replacement',
    licenseNumber: 'MCI-2009-0318',
    chamber: 'OPD Chamber 3 (Block A)',
    fee: 850,
    availableDays: ['Tue', 'Thu', 'Sat'],
    shift: '09:00 - 13:00',
  },
  {
    id: 'D-004',
    name: 'Dr. Kiran Das',
    specialization: 'Paediatrician',
    department: 'Paediatrics',
    experience: 7,
    phone: '9811111114',
    email: 'kiran@hospital.demo',
    status: 'active',
    qualifications: 'MD Paediatrics, DCH',
    licenseNumber: 'MCI-2017-0941',
    chamber: 'OPD Chamber 1 (Block C)',
    fee: 600,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    shift: '09:00 - 14:00',
  },
  {
    id: 'D-005',
    name: 'Dr. Ravi Iyer',
    specialization: 'General Physician',
    department: 'General Medicine',
    experience: 20,
    phone: '9811111115',
    email: 'ravi@hospital.demo',
    status: 'active',
    qualifications: 'MBBS, MD General Medicine',
    licenseNumber: 'MCI-2004-0105',
    chamber: 'OPD Chamber 2 (Block A)',
    fee: 500,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    shift: '08:30 - 14:30',
  },
  {
    id: 'D-006',
    name: 'Dr. Suresh Rao',
    specialization: 'Emergency Medicine Consultant',
    department: 'Emergency',
    experience: 14,
    phone: '9811111116',
    email: 'suresh@hospital.demo',
    status: 'active',
    qualifications: 'MD Emergency Medicine, MRCEM',
    licenseNumber: 'MCI-2010-0493',
    chamber: 'Emergency Triage Bay 1',
    fee: 1000,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    shift: 'On-Call 24x7',
  },
  {
    id: 'D-007',
    name: 'Dr. Usha Pillai',
    specialization: 'Gynaecologist & Obstetrician',
    department: 'Gynaecology',
    experience: 11,
    phone: '9811111117',
    email: 'usha@hospital.demo',
    status: 'active',
    qualifications: 'MS Obstetrics & Gynaecology, DGO',
    licenseNumber: 'MCI-2013-0662',
    chamber: 'OPD Chamber 5 (Block B)',
    fee: 750,
    availableDays: ['Mon', 'Wed', 'Thu', 'Sat'],
    shift: '10:00 - 14:00',
  },
];

// ---------------------------------------------------------------------------
// Hospital Staff Members (fictional)
// ---------------------------------------------------------------------------
export const STAFF_MEMBERS = [
  {
    id: 'ST-001',
    name: 'Meena Patel',
    role: 'Nurse',
    department: 'General Ward',
    shift: 'Morning (07:00 - 15:00)',
    phone: '9822000001',
    email: 'nurse@hospital.demo',
    status: 'active',
    qualification: 'B.Sc Nursing, RN',
    joinedDate: '2022-04-10',
  },
  {
    id: 'ST-002',
    name: 'Anjali Nair',
    role: 'Receptionist',
    department: 'Front Desk',
    shift: 'Morning (08:00 - 16:00)',
    phone: '9822000002',
    email: 'receptionist@hospital.demo',
    status: 'active',
    qualification: 'B.A, Healthcare Reception Cert',
    joinedDate: '2021-08-15',
  },
  {
    id: 'ST-003',
    name: 'Arjun Reddy',
    role: 'Lab Technician',
    department: 'Laboratory',
    shift: 'Regular (09:00 - 17:00)',
    phone: '9822000003',
    email: 'lab@hospital.demo',
    status: 'active',
    qualification: 'DMLT, B.Sc Medical Lab Tech',
    joinedDate: '2020-03-01',
  },
  {
    id: 'ST-004',
    name: 'Sneha Gupta',
    role: 'Pharmacist',
    department: 'Pharmacy',
    shift: 'Evening (14:00 - 22:00)',
    phone: '9822000004',
    email: 'pharmacy@hospital.demo',
    status: 'active',
    qualification: 'B.Pharm, Registered Pharmacist',
    joinedDate: '2021-11-20',
  },
  {
    id: 'ST-005',
    name: 'Vikram Joshi',
    role: 'Accountant',
    department: 'Billing & Accounts',
    shift: 'Regular (09:00 - 18:00)',
    phone: '9822000005',
    email: 'billing@hospital.demo',
    status: 'active',
    qualification: 'M.Com, Certified Hospital Billing',
    joinedDate: '2019-06-12',
  },
  {
    id: 'ST-006',
    name: 'Deepak Varma',
    role: 'Nurse',
    department: 'Intensive Care (ICU)',
    shift: 'Night (22:00 - 07:00)',
    phone: '9822000006',
    email: 'deepak.v@hospital.demo',
    status: 'active',
    qualification: 'Post-Basic Critical Care Nursing',
    joinedDate: '2023-01-15',
  },
  {
    id: 'ST-007',
    name: 'Sangeeta Roy',
    role: 'Nurse',
    department: 'Emergency Ward',
    shift: 'Rotational',
    phone: '9822000007',
    email: 'sangeeta.r@hospital.demo',
    status: 'active',
    qualification: 'B.Sc Nursing, BLS/ACLS Certified',
    joinedDate: '2022-09-01',
  },
  {
    id: 'ST-008',
    name: 'Rohan Deshmukh',
    role: 'Receptionist',
    department: 'Front Desk',
    shift: 'Evening (14:00 - 22:00)',
    phone: '9822000008',
    email: 'rohan.d@hospital.demo',
    status: 'active',
    qualification: 'B.Com, Customer Relations Cert',
    joinedDate: '2023-05-10',
  },
];

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------
export const APPOINTMENTS = [
  { id: 'A-001', patientId: 'P-001', patientName: 'Rahul Verma',    doctorId: 'D-001', doctorName: 'Dr. Priya Sharma', department: 'Cardiology',       date: '2024-10-28', time: '09:00', type: 'Consultation', status: 'confirmed',  reason: 'Chest pain follow-up', fee: 800, tokenNumber: 1 },
  { id: 'A-002', patientId: 'P-002', patientName: 'Lakshmi Devi',   doctorId: 'D-002', doctorName: 'Dr. Arun Kumar',   department: 'Neurology',        date: '2024-10-28', time: '10:30', type: 'Follow-up',    status: 'pending',    reason: 'Migraine treatment', fee: 900, tokenNumber: 2 },
  { id: 'A-003', patientId: 'P-003', patientName: 'Suresh Babu',    doctorId: 'D-003', doctorName: 'Dr. Sunita Mehta', department: 'Orthopaedics',     date: '2024-10-28', time: '11:00', type: 'Consultation', status: 'completed',  reason: 'Knee pain assessment', fee: 850, tokenNumber: 3 },
  { id: 'A-004', patientId: 'P-004', patientName: 'Anita Kulkarni', doctorId: 'D-005', doctorName: 'Dr. Ravi Iyer',    department: 'General Medicine', date: '2024-10-29', time: '09:30', type: 'Routine',      status: 'confirmed',  reason: 'Annual health checkup', fee: 500, tokenNumber: 4 },
  { id: 'A-005', patientId: 'P-005', patientName: 'Mohammed Irfan', doctorId: 'D-001', doctorName: 'Dr. Priya Sharma', department: 'Cardiology',       date: '2024-10-25', time: '14:00', type: 'Consultation', status: 'cancelled',  reason: 'ECG review', fee: 800, cancellationReason: 'Patient rescheduled to next week', tokenNumber: 5 },
  { id: 'A-006', patientId: 'P-006', patientName: 'Kavita Sundaram', doctorId: 'D-006', doctorName: 'Dr. Suresh Rao',  department: 'Emergency',        date: '2024-10-28', time: '11:30', type: 'Emergency',   status: 'confirmed',  reason: 'High fever and abdominal colic', fee: 1000, tokenNumber: 6 },
  { id: 'A-007', patientId: 'P-007', patientName: 'Deepak Chopra',  doctorId: 'D-004', doctorName: 'Dr. Kiran Das',    department: 'Paediatrics',      date: '2024-10-30', time: '10:00', type: 'Consultation', status: 'pending',    reason: 'Pediatric immunizations', fee: 600, tokenNumber: 7 },
  { id: 'A-008', patientId: 'P-008', patientName: 'Pooja Bhatt',    doctorId: 'D-007', doctorName: 'Dr. Usha Pillai',   department: 'Gynaecology',      date: '2024-10-29', time: '11:15', type: 'Routine',      status: 'confirmed',  reason: 'Prenatal health screening', fee: 750, tokenNumber: 8 },
  { id: 'A-009', patientId: 'P-001', patientName: 'Rahul Verma',    doctorId: 'D-005', doctorName: 'Dr. Ravi Iyer',    department: 'General Medicine', date: '2024-10-31', time: '12:00', type: 'Follow-up',    status: 'pending',    reason: 'Blood pressure medicine adjustment', fee: 500, tokenNumber: 9 },
  { id: 'A-010', patientId: 'P-003', patientName: 'Suresh Babu',    doctorId: 'D-003', doctorName: 'Dr. Sunita Mehta', department: 'Orthopaedics',     date: '2024-10-26', time: '15:00', type: 'Consultation', status: 'completed',  reason: 'X-ray joint assessment', fee: 850, tokenNumber: 10 },
];

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Revenue chart data (demo - 12 full months with breakdown)
// ---------------------------------------------------------------------------
export const MONTHLY_REVENUE = [
  { month: 'Nov', revenue: 230000, expenses: 172000, profit: 58000, opd: 95000, ipd: 90000, pharmacy: 45000 },
  { month: 'Dec', revenue: 248000, expenses: 181000, profit: 67000, opd: 102000, ipd: 98000, pharmacy: 48000 },
  { month: 'Jan', revenue: 255000, expenses: 185000, profit: 70000, opd: 105000, ipd: 100000, pharmacy: 50000 },
  { month: 'Feb', revenue: 268000, expenses: 195000, profit: 73000, opd: 110000, ipd: 105000, pharmacy: 53000 },
  { month: 'Mar', revenue: 290000, expenses: 205000, profit: 85000, opd: 120000, ipd: 112000, pharmacy: 58000 },
  { month: 'Apr', revenue: 275000, expenses: 198000, profit: 77000, opd: 115000, ipd: 104000, pharmacy: 56000 },
  { month: 'May', revenue: 310000, expenses: 215000, profit: 95000, opd: 130000, ipd: 118000, pharmacy: 62000 },
  { month: 'Jun', revenue: 335000, expenses: 230000, profit: 105000, opd: 140000, ipd: 128000, pharmacy: 67000 },
  { month: 'Jul', revenue: 298000, expenses: 210000, profit: 88000, opd: 125000, ipd: 113000, pharmacy: 60000 },
  { month: 'Aug', revenue: 320000, expenses: 220000, profit: 100000, opd: 135000, ipd: 122000, pharmacy: 63000 },
  { month: 'Sep', revenue: 345000, expenses: 240000, profit: 105000, opd: 145000, ipd: 132000, pharmacy: 68000 },
  { month: 'Oct', revenue: 362000, expenses: 252000, profit: 110000, opd: 152000, ipd: 138000, pharmacy: 72000 },
];

// ---------------------------------------------------------------------------
// Bed Occupancy & Ward Capacity
// ---------------------------------------------------------------------------
export const BED_OCCUPANCY_DATA = [
  { ward: 'Intensive Care (ICU)', total: 24, occupied: 20, available: 4, rate: 83.3, status: 'critical', color: '#dc2626' },
  { ward: 'Emergency Ward', total: 18, occupied: 15, available: 3, rate: 83.3, status: 'warning', color: '#f59e0b' },
  { ward: 'General Ward', total: 110, occupied: 86, available: 24, rate: 78.2, status: 'normal', color: '#16a34a' },
  { ward: 'Private Suites', total: 48, occupied: 35, available: 13, rate: 72.9, status: 'normal', color: '#2563eb' },
];

// ---------------------------------------------------------------------------
// Department Workload & Performance
// ---------------------------------------------------------------------------
export const DEPARTMENT_METRICS = [
  { name: 'Cardiology', doctors: 4, activePatients: 38, todayAppointments: 12, revenue: 115000, satisfaction: 4.9, color: '#1d4ed8' },
  { name: 'Neurology', doctors: 3, activePatients: 25, todayAppointments: 8, revenue: 84000, satisfaction: 4.8, color: '#7c3aed' },
  { name: 'Orthopaedics', doctors: 5, activePatients: 42, todayAppointments: 14, revenue: 98000, satisfaction: 4.7, color: '#059669' },
  { name: 'Paediatrics', doctors: 4, activePatients: 30, todayAppointments: 10, revenue: 65000, satisfaction: 4.9, color: '#d97706' },
  { name: 'General Medicine', doctors: 6, activePatients: 60, todayAppointments: 22, revenue: 76000, satisfaction: 4.6, color: '#0284c7' },
  { name: 'Emergency', doctors: 8, activePatients: 55, todayAppointments: 18, revenue: 142000, satisfaction: 4.7, color: '#dc2626' },
];

// ---------------------------------------------------------------------------
// Weekly Appointment Trends
// ---------------------------------------------------------------------------
export const WEEKLY_APPOINTMENTS_DATA = [
  { day: 'Mon', completed: 28, scheduled: 6, cancelled: 2 },
  { day: 'Tue', completed: 32, scheduled: 8, cancelled: 3 },
  { day: 'Wed', completed: 26, scheduled: 10, cancelled: 1 },
  { day: 'Thu', completed: 35, scheduled: 5, cancelled: 4 },
  { day: 'Fri', completed: 30, scheduled: 7, cancelled: 2 },
  { day: 'Sat', completed: 22, scheduled: 4, cancelled: 1 },
  { day: 'Sun', completed: 14, scheduled: 3, cancelled: 0 },
];

// ---------------------------------------------------------------------------
// Patient Demographics & Cohort Analysis
// ---------------------------------------------------------------------------
export const PATIENT_DEMOGRAPHICS = {
  ageGroups: [
    { range: '0-18', count: 48, percentage: 16 },
    { range: '19-35', count: 96, percentage: 32 },
    { range: '36-50', count: 78, percentage: 26 },
    { range: '51-65', count: 54, percentage: 18 },
    { range: '65+', count: 24, percentage: 8 },
  ],
  genderBreakdown: [
    { name: 'Female', value: 52, color: '#ec4899' },
    { name: 'Male', value: 45, color: '#3b82f6' },
    { name: 'Other', value: 3, color: '#8b5cf6' },
  ],
  admissionType: [
    { name: 'Outpatient (OPD)', value: 68, color: '#10b981' },
    { name: 'Inpatient (IPD)', value: 22, color: '#6366f1' },
    { name: 'Emergency', value: 10, color: '#ef4444' },
  ],
};

// ---------------------------------------------------------------------------
// Critical Operational Alerts
// ---------------------------------------------------------------------------
export const CRITICAL_ALERTS = [
  { id: 'alt-1', title: 'High ICU Occupancy', message: 'ICU ward is at 83.3% capacity. 4 beds remaining.', severity: 'warning', time: '10 mins ago' },
  { id: 'alt-2', title: 'Blood Bank Critical Stock', message: 'O-Negative reserve is down to 2 units. Urgent donor call initiated.', severity: 'danger', time: '25 mins ago' },
  { id: 'alt-3', title: 'On-Call Roster Update', message: 'Dr. Suresh Rao and 3 nursing officers assigned to emergency night shift.', severity: 'info', time: '1 hour ago' },
];

// ---------------------------------------------------------------------------
// Dashboard summary stats (computed from data above in real app — demo values)
// ---------------------------------------------------------------------------
export const DASHBOARD_STATS = {
  totalPatients: 298,
  totalDoctors: 28,
  totalStaff: 74,
  todayAppointments: 42,
  pendingAppointments: 9,
  completedToday: 31,
  monthlyRevenue: 362000,
  monthlyExpenses: 252000,
  netProfit: 110000,
  pendingBills: 8,
  totalBeds: 200,
  occupiedBeds: 156,
  bedOccupancyRate: 78,
  activeAdmissions: 64,
  criticalPatients: 8,
};

// ---------------------------------------------------------------------------
// Registered Patients Local Cache Helpers
// ---------------------------------------------------------------------------
const STORAGE_KEY_PATIENTS = 'hms_demo_registered_patients';
const STORAGE_KEY_USERS = 'hms_demo_registered_users';

export function getCustomPatients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PATIENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomPatient(patient) {
  try {
    const existing = getCustomPatients();
    const updated = [patient, ...existing.filter((p) => p.id !== patient.id)];
    localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getAllPatients() {
  const custom = getCustomPatients();
  // Filter out any default patients that have custom overrides
  const customIds = new Set(custom.map((p) => p.id));
  return [...custom, ...PATIENTS.filter((p) => !customIds.has(p.id))];
}

export function updatePatientRecord(id, updates) {
  try {
    const all = getAllPatients();
    const target = all.find((p) => p.id === id);
    if (!target) return null;
    const updated = { ...target, ...updates };
    saveCustomPatient(updated);
    return updated;
  } catch {
    return null;
  }
}

export function archivePatientRecord(id) {
  return updatePatientRecord(id, { status: 'inactive', admissionStatus: 'discharged' });
}

export function getCustomUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomUser(user) {
  try {
    const existing = getCustomUsers();
    const updated = [user, ...existing.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase())];
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getAllUsers() {
  const custom = getCustomUsers();
  const customIds = new Set(custom.map((u) => u.id));
  return [
    ...custom,
    ...DEMO_USERS.map((u) => ({
      ...u,
      status: u.status || 'Active',
      lastLogin: u.lastLogin || '2026-10-27 14:15',
    })).filter((u) => !customIds.has(u.id)),
  ];
}

export function toggleUserStatus(userId) {
  const users = getAllUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return null;
  const newStatus = target.status === 'Active' ? 'Suspended' : 'Active';
  const updated = { ...target, status: newStatus };
  saveCustomUser(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Doctors Persistence Helpers
// ---------------------------------------------------------------------------
const STORAGE_KEY_DOCTORS = 'hms_demo_doctors';

export function getCustomDoctors() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOCTORS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomDoctor(doctor) {
  try {
    const existing = getCustomDoctors();
    const updated = [doctor, ...existing.filter((d) => d.id !== doctor.id)];
    localStorage.setItem(STORAGE_KEY_DOCTORS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getAllDoctors() {
  const custom = getCustomDoctors();
  const customIds = new Set(custom.map((d) => d.id));
  return [...custom, ...DOCTORS.filter((d) => !customIds.has(d.id))];
}

export function updateDoctorRecord(id, updates) {
  const all = getAllDoctors();
  const target = all.find((d) => d.id === id);
  if (!target) return null;
  const updated = { ...target, ...updates };
  saveCustomDoctor(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Staff Persistence Helpers
// ---------------------------------------------------------------------------
const STORAGE_KEY_STAFF = 'hms_demo_staff';

export function getCustomStaff() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STAFF);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomStaff(staff) {
  try {
    const existing = getCustomStaff();
    const updated = [staff, ...existing.filter((s) => s.id !== staff.id)];
    localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getAllStaff() {
  const custom = getCustomStaff();
  const customIds = new Set(custom.map((s) => s.id));
  return [...custom, ...STAFF_MEMBERS.filter((s) => !customIds.has(s.id))];
}

export function updateStaffRecord(id, updates) {
  const all = getAllStaff();
  const target = all.find((s) => s.id === id);
  if (!target) return null;
  const updated = { ...target, ...updates };
  saveCustomStaff(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Departments Persistence Helpers
// ---------------------------------------------------------------------------
const STORAGE_KEY_DEPTS = 'hms_demo_departments';

export function getCustomDepartments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEPTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomDepartment(dept) {
  try {
    const existing = getCustomDepartments();
    const updated = [dept, ...existing.filter((d) => d.id !== dept.id)];
    localStorage.setItem(STORAGE_KEY_DEPTS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getAllDepartments() {
  const custom = getCustomDepartments();
  const customIds = new Set(custom.map((d) => d.id));
  return [...custom, ...DEPARTMENTS.filter((d) => !customIds.has(d.id))];
}

export function updateDepartmentRecord(id, updates) {
  const all = getAllDepartments();
  const target = all.find((d) => d.id === id);
  if (!target) return null;
  const updated = { ...target, ...updates };
  saveCustomDepartment(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Appointments Persistence Helpers
// ---------------------------------------------------------------------------
const STORAGE_KEY_APPTS = 'hms_demo_appointments';

export function getCustomAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomAppointment(appt) {
  try {
    const existing = getCustomAppointments();
    const updated = [appt, ...existing.filter((a) => a.id !== appt.id)];
    localStorage.setItem(STORAGE_KEY_APPTS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getAllAppointments() {
  const custom = getCustomAppointments();
  const customIds = new Set(custom.map((a) => a.id));
  return [...custom, ...APPOINTMENTS.filter((a) => !customIds.has(a.id))];
}

export function updateAppointmentRecord(id, updates) {
  const all = getAllAppointments();
  const target = all.find((a) => a.id === id);
  if (!target) return null;
  const updated = { ...target, ...updates };
  saveCustomAppointment(updated);
  return updated;
}

export function cancelAppointmentRecord(id, cancellationReason = 'Cancelled by administrative office') {
  return updateAppointmentRecord(id, {
    status: 'cancelled',
    cancellationReason,
  });
}

// ---------------------------------------------------------------------------
// Common Medication Catalog (for Doctor Prescription Builder)
// ---------------------------------------------------------------------------
export const COMMON_MEDICATIONS = [
  { name: 'Amlodipine 5mg', defaultDosage: '1 tab', defaultFreq: '1-0-0', defaultDuration: '30 Days', instructions: 'After breakfast' },
  { name: 'Metformin 500mg', defaultDosage: '1 tab', defaultFreq: '1-0-1', defaultDuration: '30 Days', instructions: 'With meals' },
  { name: 'Atorvastatin 20mg', defaultDosage: '1 tab', defaultFreq: '0-0-1', defaultDuration: '30 Days', instructions: 'At bedtime' },
  { name: 'Paracetamol 650mg', defaultDosage: '1 tab', defaultFreq: '1-1-1', defaultDuration: '5 Days', instructions: 'Post meals as needed for fever/pain' },
  { name: 'Amoxicillin 500mg', defaultDosage: '1 cap', defaultFreq: '1-0-1', defaultDuration: '7 Days', instructions: 'Complete full course, after food' },
  { name: 'Pantoprazole 40mg', defaultDosage: '1 tab', defaultFreq: '1-0-0', defaultDuration: '14 Days', instructions: '30 mins before breakfast' },
  { name: 'Cetirizine 10mg', defaultDosage: '1 tab', defaultFreq: '0-0-1', defaultDuration: '10 Days', instructions: 'At night, may cause drowsiness' },
  { name: 'Azithromycin 500mg', defaultDosage: '1 tab', defaultFreq: '1-0-0', defaultDuration: '3 Days', instructions: '1 hour before or 2 hours after meals' },
  { name: 'Telmisartan 40mg', defaultDosage: '1 tab', defaultFreq: '1-0-0', defaultDuration: '30 Days', instructions: 'Morning after food' },
  { name: 'Ibuprofen 400mg', defaultDosage: '1 tab', defaultFreq: '1-0-1', defaultDuration: '5 Days', instructions: 'Strictly after food with plenty of water' },
];

// ---------------------------------------------------------------------------
// Common Diagnostic Lab Tests Catalog
// ---------------------------------------------------------------------------
export const COMMON_LAB_TESTS = [
  { id: 'T-01', name: 'Complete Blood Count (CBC)', department: 'Hematology', cost: 350, turnaroundHours: 4 },
  { id: 'T-02', name: 'Lipid Profile (Serum)', department: 'Biochemistry', cost: 650, turnaroundHours: 6 },
  { id: 'T-03', name: 'HbA1c (Glycated Hemoglobin)', department: 'Biochemistry', cost: 500, turnaroundHours: 4 },
  { id: 'T-04', name: 'Liver Function Test (LFT)', department: 'Biochemistry', cost: 750, turnaroundHours: 8 },
  { id: 'T-05', name: 'Kidney Function Test (KFT)', department: 'Biochemistry', cost: 600, turnaroundHours: 6 },
  { id: 'T-06', name: '12-Lead Electrocardiogram (ECG)', department: 'Cardiology', cost: 400, turnaroundHours: 1 },
  { id: 'T-07', name: 'Chest X-Ray (PA View)', department: 'Radiology', cost: 550, turnaroundHours: 2 },
  { id: 'T-08', name: 'Thyroid Profile (T3, T4, TSH)', department: 'Endocrinology', cost: 800, turnaroundHours: 12 },
  { id: 'T-09', name: 'Urine Routine & Microscopy', department: 'Pathology', cost: 250, turnaroundHours: 3 },
  { id: 'T-10', name: 'Serum Electrolytes (Na+, K+, Cl-)', department: 'Biochemistry', cost: 450, turnaroundHours: 4 },
];

// ---------------------------------------------------------------------------
// Mock Prescriptions
// ---------------------------------------------------------------------------
export const PRESCRIPTIONS = [
  {
    id: 'RX-2024-001',
    patientId: 'P-001',
    patientName: 'Rahul Verma',
    patientAge: 45,
    patientGender: 'Male',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Priya Sharma',
    department: 'Cardiology',
    date: '2024-10-24',
    diagnosis: 'Essential Hypertension Stage 1 & Dyslipidemia',
    medicines: [
      { name: 'Amlodipine 5mg', dosage: '1 tab', frequency: '1-0-0', duration: '30 Days', instructions: 'After breakfast' },
      { name: 'Atorvastatin 20mg', dosage: '1 tab', frequency: '0-0-1', duration: '30 Days', instructions: 'At bedtime' },
      { name: 'Pantoprazole 40mg', dosage: '1 tab', frequency: '1-0-0', duration: '14 Days', instructions: 'Empty stomach in morning' },
    ],
    generalAdvice: 'Low-sodium diet (<2g/day). 30 mins brisk walking 5 days a week. Keep weekly BP log.',
    followUpDate: '2024-11-24',
    status: 'active',
  },
  {
    id: 'RX-2024-002',
    patientId: 'P-002',
    patientName: 'Lakshmi Devi',
    patientAge: 62,
    patientGender: 'Female',
    doctorId: 'DOC-002',
    doctorName: 'Dr. Arun Kumar',
    department: 'Neurology',
    date: '2024-10-20',
    diagnosis: 'Chronic Migraine with Aura & Cervical Spondylosis',
    medicines: [
      { name: 'Paracetamol 650mg', dosage: '1 tab', frequency: '1-1-1', duration: '5 Days', instructions: 'Sos when headache occurs' },
      { name: 'Pantoprazole 40mg', dosage: '1 tab', frequency: '1-0-0', duration: '10 Days', instructions: 'Before food' },
    ],
    generalAdvice: 'Avoid bright screen triggers. Ergonomic neck pillow advised. Physiotherapy exercises twice daily.',
    followUpDate: '2024-11-05',
    status: 'active',
  },
  {
    id: 'RX-2024-003',
    patientId: 'P-004',
    patientName: 'Anita Kulkarni',
    patientAge: 29,
    patientGender: 'Female',
    doctorId: 'DOC-004',
    doctorName: 'Dr. Ravi Iyer',
    department: 'General Medicine',
    date: '2024-10-22',
    diagnosis: 'Acute Upper Respiratory Tract Infection',
    medicines: [
      { name: 'Azithromycin 500mg', dosage: '1 tab', frequency: '1-0-0', duration: '3 Days', instructions: 'Complete entire course' },
      { name: 'Cetirizine 10mg', dosage: '1 tab', frequency: '0-0-1', duration: '5 Days', instructions: 'At night' },
      { name: 'Paracetamol 650mg', dosage: '1 tab', frequency: '1-0-1', duration: '3 Days', instructions: 'Post meals' },
    ],
    generalAdvice: 'Warm saline gargles thrice daily. Drink plenty of warm water. Rest for 3 days.',
    followUpDate: '2024-10-28',
    status: 'completed',
  },
];

// ---------------------------------------------------------------------------
// Mock Diagnostic Lab Reports
// ---------------------------------------------------------------------------
export const LAB_REPORTS = [
  {
    id: 'LAB-2024-101',
    patientId: 'P-001',
    patientName: 'Rahul Verma',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Priya Sharma',
    testName: 'Lipid Profile (Serum)',
    category: 'Biochemistry',
    requestedDate: '2024-10-22',
    completedDate: '2024-10-23',
    priority: 'Routine',
    status: 'completed',
    results: [
      { parameter: 'Total Cholesterol', value: '215', unit: 'mg/dL', normalRange: '< 200', flag: 'high' },
      { parameter: 'Triglycerides', value: '185', unit: 'mg/dL', normalRange: '< 150', flag: 'high' },
      { parameter: 'HDL (Good) Cholesterol', value: '44', unit: 'mg/dL', normalRange: '> 40', flag: 'normal' },
      { parameter: 'LDL (Bad) Cholesterol', value: '134', unit: 'mg/dL', normalRange: '< 100', flag: 'high' },
      { parameter: 'VLDL Cholesterol', value: '37', unit: 'mg/dL', normalRange: '5 - 30', flag: 'high' },
    ],
    doctorNotes: 'Borderline elevated LDL & Triglycerides. Started on Atorvastatin 20mg. Repeat test in 12 weeks.',
  },
  {
    id: 'LAB-2024-102',
    patientId: 'P-001',
    patientName: 'Rahul Verma',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Priya Sharma',
    testName: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    requestedDate: '2024-10-22',
    completedDate: '2024-10-23',
    priority: 'Routine',
    status: 'completed',
    results: [
      { parameter: 'Hemoglobin', value: '14.8', unit: 'g/dL', normalRange: '13.5 - 17.5', flag: 'normal' },
      { parameter: 'Total RBC Count', value: '4.9', unit: 'mil/uL', normalRange: '4.5 - 5.9', flag: 'normal' },
      { parameter: 'Total Leukocyte Count (WBC)', value: '7,400', unit: '/cu mm', normalRange: '4,000 - 11,000', flag: 'normal' },
      { parameter: 'Platelet Count', value: '245,000', unit: '/cu mm', normalRange: '150,000 - 450,000', flag: 'normal' },
    ],
    doctorNotes: 'Normal blood count parameters. No signs of infection or anemia.',
  },
  {
    id: 'LAB-2024-103',
    patientId: 'P-002',
    patientName: 'Lakshmi Devi',
    doctorId: 'DOC-002',
    doctorName: 'Dr. Arun Kumar',
    testName: 'MRI Brain & Cervical Spine',
    category: 'Radiology',
    requestedDate: '2024-10-24',
    completedDate: null,
    priority: 'STAT',
    status: 'in-progress',
    results: [],
    doctorNotes: 'Scan scheduled. Evaluating C5-C6 disk bulges and migraine etiology.',
  },
];

// ---------------------------------------------------------------------------
// Mock Patient Bills & Invoices
// ---------------------------------------------------------------------------
export const PATIENT_BILLS = [
  {
    id: 'INV-2024-001',
    patientId: 'P-001',
    patientName: 'Rahul Verma',
    date: '2024-10-24',
    dueDate: '2024-11-05',
    department: 'Cardiology',
    doctorName: 'Dr. Priya Sharma',
    items: [
      { description: 'OPD Specialist Consultation — Dr. Priya Sharma', category: 'Consultation', amount: 800 },
      { description: 'Lipid Profile Comprehensive Lab Panel', category: 'Laboratory', amount: 650 },
      { description: 'Complete Blood Count (CBC)', category: 'Laboratory', amount: 350 },
      { description: 'Prescription Medicines (Amlodipine, Atorvastatin)', category: 'Pharmacy', amount: 480 },
    ],
    subtotal: 2280,
    tax: 114, // 5% GST
    discount: 0,
    totalAmount: 2394,
    paidAmount: 2394,
    status: 'paid',
    paymentMethod: 'UPI (Google Pay)',
    paymentDate: '2024-10-24 11:45 AM',
    transactionId: 'TXN-9984102914',
  },
  {
    id: 'INV-2024-002',
    patientId: 'P-001',
    patientName: 'Rahul Verma',
    date: '2024-10-25',
    dueDate: '2024-11-08',
    department: 'Cardiology',
    doctorName: 'Dr. Priya Sharma',
    items: [
      { description: '12-Lead Electrocardiogram (ECG) Procedure', category: 'Diagnostic', amount: 400 },
      { description: 'Cardiac Wellness Follow-up Review', category: 'Consultation', amount: 400 },
    ],
    subtotal: 800,
    tax: 40,
    discount: 0,
    totalAmount: 840,
    paidAmount: 0,
    status: 'pending',
    paymentMethod: null,
    paymentDate: null,
    transactionId: null,
  },
  {
    id: 'INV-2024-003',
    patientId: 'P-002',
    patientName: 'Lakshmi Devi',
    date: '2024-10-20',
    dueDate: '2024-11-02',
    department: 'Neurology',
    doctorName: 'Dr. Arun Kumar',
    items: [
      { description: 'Neurology Consultation & Neurological Assessment', category: 'Consultation', amount: 900 },
      { description: 'Pharmacy Dispensary (Pain relief & Migraine prophylactics)', category: 'Pharmacy', amount: 320 },
    ],
    subtotal: 1220,
    tax: 61,
    discount: 0,
    totalAmount: 1281,
    paidAmount: 1281,
    status: 'paid',
    paymentMethod: 'Credit Card (Visa)',
    paymentDate: '2024-10-20 03:15 PM',
    transactionId: 'TXN-778102391',
  },
];

// ---------------------------------------------------------------------------
// Prescriptions Persistence Helpers
// ---------------------------------------------------------------------------
const STORAGE_KEY_PRESCRIPTIONS = 'hms_demo_prescriptions';

export function getCustomPrescriptions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRESCRIPTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomPrescription(prescription) {
  try {
    const existing = getCustomPrescriptions();
    const updated = [prescription, ...existing.filter((p) => p.id !== prescription.id)];
    localStorage.setItem(STORAGE_KEY_PRESCRIPTIONS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getAllPrescriptions() {
  const custom = getCustomPrescriptions();
  const customIds = new Set(custom.map((p) => p.id));
  return [...custom, ...PRESCRIPTIONS.filter((p) => !customIds.has(p.id))];
}

export function updatePrescriptionRecord(id, updates) {
  const all = getAllPrescriptions();
  const target = all.find((p) => p.id === id);
  if (!target) return null;
  const updated = { ...target, ...updates };
  saveCustomPrescription(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Lab Reports Persistence Helpers
// ---------------------------------------------------------------------------
const STORAGE_KEY_LAB_REPORTS = 'hms_demo_lab_reports';

export function getCustomLabReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAB_REPORTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomLabReport(report) {
  try {
    const existing = getCustomLabReports();
    const updated = [report, ...existing.filter((r) => r.id !== report.id)];
    localStorage.setItem(STORAGE_KEY_LAB_REPORTS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getAllLabReports() {
  const custom = getCustomLabReports();
  const customIds = new Set(custom.map((r) => r.id));
  return [...custom, ...LAB_REPORTS.filter((r) => !customIds.has(r.id))];
}

export function updateLabReportRecord(id, updates) {
  const all = getAllLabReports();
  const target = all.find((r) => r.id === id);
  if (!target) return null;
  const updated = { ...target, ...updates };
  saveCustomLabReport(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Patient Bills Persistence Helpers
// ---------------------------------------------------------------------------
const STORAGE_KEY_BILLS = 'hms_demo_bills';

export function getCustomBills() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BILLS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomBill(bill) {
  try {
    const existing = getCustomBills();
    const updated = [bill, ...existing.filter((b) => b.id !== bill.id)];
    localStorage.setItem(STORAGE_KEY_BILLS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getAllBills() {
  const custom = getCustomBills();
  const customIds = new Set(custom.map((b) => b.id));
  return [...custom, ...PATIENT_BILLS.filter((b) => !customIds.has(b.id))];
}

export function payBillRecord(id, paymentMethod = 'UPI') {
  const all = getAllBills();
  const target = all.find((b) => b.id === id);
  if (!target) return null;
  const now = new Date();
  const updated = {
    ...target,
    status: 'paid',
    paidAmount: target.totalAmount,
    paymentMethod,
    paymentDate: now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    transactionId: `TXN-${Date.now().toString().slice(-8)}`,
  };
  saveCustomBill(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Mock Nursing Care Tasks (MAR & Inpatient Care Schedule)
// ---------------------------------------------------------------------------
export const NURSING_TASKS = [
  {
    id: 'TASK-101',
    patientId: 'P-002',
    patientName: 'Lakshmi Devi',
    bed: 'Ward-B-14',
    taskType: 'Medication Administration',
    title: 'Pantoprazole 40mg Tab (Oral)',
    scheduleTime: '08:00 AM',
    shift: 'Morning',
    priority: 'Routine',
    instructions: 'Administer 30 mins before breakfast. Monitor for epigastric discomfort.',
    status: 'completed',
    completedAt: '08:15 AM',
    completedBy: 'Meena Patel, RN',
  },
  {
    id: 'TASK-102',
    patientId: 'P-002',
    patientName: 'Lakshmi Devi',
    bed: 'Ward-B-14',
    taskType: 'Vital Signs Monitoring',
    title: 'Q4H Vitals & Neuro Check',
    scheduleTime: '10:00 AM',
    shift: 'Morning',
    priority: 'Routine',
    instructions: 'Record BP, Pulse, GCS score, and pupil reactivity.',
    status: 'pending',
    completedAt: null,
    completedBy: null,
  },
  {
    id: 'TASK-103',
    patientId: 'P-003',
    patientName: 'Suresh Babu',
    bed: 'Ward-A-08',
    taskType: 'Wound Dressing',
    title: 'Post-Op Knee Incision Dressing',
    scheduleTime: '09:30 AM',
    shift: 'Morning',
    priority: 'High',
    instructions: 'Aseptic technique, replace sterile gauze, apply cold compress for 15 mins.',
    status: 'pending',
    completedAt: null,
    completedBy: null,
  },
  {
    id: 'TASK-104',
    patientId: 'P-003',
    patientName: 'Suresh Babu',
    bed: 'Ward-A-08',
    taskType: 'Blood Glucose Test',
    title: 'Pre-Lunch CBG Fingerprick',
    scheduleTime: '12:30 PM',
    shift: 'Morning',
    priority: 'Routine',
    instructions: 'Target: 100-140 mg/dL. Inform Dr. Mehta if CBG > 200.',
    status: 'pending',
    completedAt: null,
    completedBy: null,
  },
  {
    id: 'TASK-105',
    patientId: 'P-006',
    patientName: 'Kavita Sundaram',
    bed: 'ICU-04',
    taskType: 'IV Infusion',
    title: 'IV Normal Saline 500ml @ 75ml/hr',
    scheduleTime: '09:00 AM',
    shift: 'Morning',
    priority: 'STAT',
    instructions: 'Monitor infusion pump rate. Check peripheral IV site for phlebitis.',
    status: 'completed',
    completedAt: '09:10 AM',
    completedBy: 'Meena Patel, RN',
  },
  {
    id: 'TASK-106',
    patientId: 'P-006',
    patientName: 'Kavita Sundaram',
    bed: 'ICU-04',
    taskType: 'Respiratory Care',
    title: 'High-Flow Oxygen & SpO2 Titration',
    scheduleTime: '11:00 AM',
    shift: 'Morning',
    priority: 'STAT',
    instructions: 'Maintain SpO2 > 96% on 4L nasal prongs. Report tachypnea > 24/min.',
    status: 'pending',
    completedAt: null,
    completedBy: null,
  },
  {
    id: 'TASK-107',
    patientId: 'P-001',
    patientName: 'Rahul Verma',
    bed: 'Ward-A-04',
    taskType: 'Medication Administration',
    title: 'Amlodipine 5mg Tab (Oral)',
    scheduleTime: '02:00 PM',
    shift: 'Evening',
    priority: 'Routine',
    instructions: 'Post-lunch dose with water. Check resting BP beforehand.',
    status: 'pending',
    completedAt: null,
    completedBy: null,
  },
];

// ---------------------------------------------------------------------------
// Mock Vitals Monitoring Logs
// ---------------------------------------------------------------------------
export const VITALS_RECORDS = [
  {
    id: 'VIT-101',
    patientId: 'P-002',
    patientName: 'Lakshmi Devi',
    bed: 'Ward-B-14',
    recordedAt: '2024-10-28 08:00 AM',
    bp: '130/85',
    pulse: '82',
    temp: '99.1',
    spo2: '97',
    respiratoryRate: '18',
    bloodSugar: '124',
    recordedBy: 'Meena Patel, RN',
    status: 'normal',
    notes: 'Patient resting comfortably. Mild headache reported.',
  },
  {
    id: 'VIT-102',
    patientId: 'P-003',
    patientName: 'Suresh Babu',
    bed: 'Ward-A-08',
    recordedAt: '2024-10-28 07:30 AM',
    bp: '138/88',
    pulse: '76',
    temp: '98.6',
    spo2: '98',
    respiratoryRate: '16',
    bloodSugar: '142',
    recordedBy: 'Meena Patel, RN',
    status: 'warning',
    notes: 'Slightly elevated blood glucose (fasting). Noted on charts.',
  },
  {
    id: 'VIT-103',
    patientId: 'P-006',
    patientName: 'Kavita Sundaram',
    bed: 'ICU-04',
    recordedAt: '2024-10-28 08:30 AM',
    bp: '105/68',
    pulse: '98',
    temp: '101.4',
    spo2: '94',
    respiratoryRate: '24',
    bloodSugar: '110',
    recordedBy: 'Meena Patel, RN',
    status: 'critical',
    notes: 'Febrile spike (101.4°F) and low oxygen. Paracetamol IV given, O2 increased to 4L.',
  },
];

// ---------------------------------------------------------------------------
// Nursing Tasks Persistence Helpers
// ---------------------------------------------------------------------------
const STORAGE_KEY_NURSING_TASKS = 'hms_demo_nursing_tasks';

export function getCustomNursingTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NURSING_TASKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomNursingTask(task) {
  try {
    const existing = getCustomNursingTasks();
    const updated = [task, ...existing.filter((t) => t.id !== task.id)];
    localStorage.setItem(STORAGE_KEY_NURSING_TASKS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getAllNursingTasks() {
  const custom = getCustomNursingTasks();
  const customIds = new Set(custom.map((t) => t.id));
  return [...custom, ...NURSING_TASKS.filter((t) => !customIds.has(t.id))];
}

export function updateNursingTaskRecord(id, updates) {
  const all = getAllNursingTasks();
  const target = all.find((t) => t.id === id);
  if (!target) return null;
  const updated = { ...target, ...updates };
  saveCustomNursingTask(updated);
  return updated;
}

export function toggleNursingTask(id, nurseName = 'Meena Patel, RN') {
  const all = getAllNursingTasks();
  const target = all.find((t) => t.id === id);
  if (!target) return null;

  const isCompleted = target.status === 'completed';
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const updated = {
    ...target,
    status: isCompleted ? 'pending' : 'completed',
    completedAt: isCompleted ? null : timeStr,
    completedBy: isCompleted ? null : nurseName,
  };
  saveCustomNursingTask(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Vitals Logs Persistence Helpers
// ---------------------------------------------------------------------------
const STORAGE_KEY_VITALS_LOGS = 'hms_demo_vitals_logs';

export function getCustomVitalsRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VITALS_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomVitalsRecord(vitalsEntry) {
  try {
    const existing = getCustomVitalsRecords();
    const updated = [vitalsEntry, ...existing.filter((v) => v.id !== vitalsEntry.id)];
    localStorage.setItem(STORAGE_KEY_VITALS_LOGS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getAllVitalsRecords() {
  const custom = getCustomVitalsRecords();
  const customIds = new Set(custom.map((v) => v.id));
  return [...custom, ...VITALS_RECORDS.filter((v) => !customIds.has(v.id))];
}

// ---------------------------------------------------------------------------
// Medicine Inventory Catalog & Persistence (Part 13)
// ---------------------------------------------------------------------------
export const MEDICINE_INVENTORY = [
  {
    id: 'MED-001',
    name: 'Amoxicillin Trihydrate',
    genericName: 'Amoxicillin',
    category: 'Antibiotics',
    dosageForm: 'Capsule',
    strength: '500 mg',
    unitPrice: 12.50,
    stock: 450,
    reorderLevel: 100,
    batchNo: 'AMX-2024-88',
    expiryDate: '2027-08-31',
    manufacturer: 'Cipla Ltd',
    location: 'Shelf A-12',
  },
  {
    id: 'MED-002',
    name: 'Paracetamol Tablets IP',
    genericName: 'Acetaminophen',
    category: 'Analgesics & Antipyretics',
    dosageForm: 'Tablet',
    strength: '650 mg',
    unitPrice: 3.20,
    stock: 1200,
    reorderLevel: 300,
    batchNo: 'PCM-2025-01',
    expiryDate: '2028-01-15',
    manufacturer: 'Micro Labs',
    location: 'Shelf B-04',
  },
  {
    id: 'MED-003',
    name: 'Metformin Hydrochloride',
    genericName: 'Metformin',
    category: 'Antidiabetic',
    dosageForm: 'Tablet ER',
    strength: '500 mg',
    unitPrice: 6.80,
    stock: 42,
    reorderLevel: 150,
    batchNo: 'MET-2024-19',
    expiryDate: '2026-11-30',
    manufacturer: 'Sun Pharma',
    location: 'Shelf C-08',
  },
  {
    id: 'MED-004',
    name: 'Atorvastatin Calcium',
    genericName: 'Atorvastatin',
    category: 'Cardiovascular',
    dosageForm: 'Tablet',
    strength: '20 mg',
    unitPrice: 18.50,
    stock: 280,
    reorderLevel: 80,
    batchNo: 'ATV-2024-92',
    expiryDate: '2027-04-20',
    manufacturer: 'Dr. Reddy\'s',
    location: 'Shelf D-02',
  },
  {
    id: 'MED-005',
    name: 'Pantoprazole Gastro-Resistant',
    genericName: 'Pantoprazole',
    category: 'Gastrointestinal',
    dosageForm: 'Tablet',
    strength: '40 mg',
    unitPrice: 9.75,
    stock: 65,
    reorderLevel: 120,
    batchNo: 'PAN-2024-44',
    expiryDate: '2026-09-15',
    manufacturer: 'Alkem Laboratories',
    location: 'Shelf E-01',
  },
  {
    id: 'MED-006',
    name: 'Azithromycin Tablets',
    genericName: 'Azithromycin',
    category: 'Antibiotics',
    dosageForm: 'Tablet',
    strength: '500 mg',
    unitPrice: 24.00,
    stock: 190,
    reorderLevel: 60,
    batchNo: 'AZI-2024-73',
    expiryDate: '2027-02-28',
    manufacturer: 'Lupin Pharma',
    location: 'Shelf A-06',
  },
  {
    id: 'MED-007',
    name: 'Amlodipine Besylate',
    genericName: 'Amlodipine',
    category: 'Cardiovascular',
    dosageForm: 'Tablet',
    strength: '5 mg',
    unitPrice: 5.40,
    stock: 310,
    reorderLevel: 100,
    batchNo: 'AML-2025-11',
    expiryDate: '2027-10-10',
    manufacturer: 'Torrent Pharma',
    location: 'Shelf D-05',
  },
  {
    id: 'MED-008',
    name: 'Salbutamol Inhaler (Asthalin)',
    genericName: 'Salbutamol',
    category: 'Respiratory',
    dosageForm: 'Inhaler (200 doses)',
    strength: '100 mcg/puff',
    unitPrice: 165.00,
    stock: 35,
    reorderLevel: 50,
    batchNo: 'SAL-2024-05',
    expiryDate: '2026-12-31',
    manufacturer: 'Cipla Ltd',
    location: 'Shelf R-02',
  },
  {
    id: 'MED-009',
    name: 'Ceftriaxone Injection IP',
    genericName: 'Ceftriaxone',
    category: 'Antibiotics (Injectable)',
    dosageForm: 'Vial with WFI',
    strength: '1000 mg',
    unitPrice: 78.00,
    stock: 15,
    reorderLevel: 40,
    batchNo: 'CTX-2024-30',
    expiryDate: '2026-07-20',
    manufacturer: 'Biocon Ltd',
    location: 'Cold Storage / B-01',
  },
  {
    id: 'MED-010',
    name: 'Insulin Glargine (Lantus)',
    genericName: 'Insulin Glargine',
    category: 'Antidiabetic (Injectable)',
    dosageForm: 'Cartridge / Pen',
    strength: '100 IU/ml',
    unitPrice: 680.00,
    stock: 22,
    reorderLevel: 30,
    batchNo: 'INS-2024-99',
    expiryDate: '2026-08-30',
    manufacturer: 'Sanofi India',
    location: 'Refrigerator 2-8°C',
  },
];

const STORAGE_KEY_MEDICINES = 'hms_demo_medicines';

export function getCustomMedicines() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEDICINES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomMedicine(med) {
  try {
    const existing = getCustomMedicines();
    const updated = [med, ...existing.filter((m) => m.id !== med.id)];
    localStorage.setItem(STORAGE_KEY_MEDICINES, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getAllMedicines() {
  const custom = getCustomMedicines();
  const customIds = new Set(custom.map((m) => m.id));
  return [...custom, ...MEDICINE_INVENTORY.filter((m) => !customIds.has(m.id))];
}

export function updateMedicineStock(id, qtyChange) {
  const all = getAllMedicines();
  const target = all.find((m) => m.id === id);
  if (!target) return null;
  const newStock = Math.max(0, target.stock + qtyChange);
  const updated = { ...target, stock: newStock };
  saveCustomMedicine(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Security & Administrative Audit Logs (Part 15)
// ---------------------------------------------------------------------------
export const AUDIT_LOGS = [
  {
    id: 'LOG-8801',
    timestamp: '2026-10-27 14:15:30',
    userId: 'u001',
    userName: 'Admin User',
    role: 'admin',
    action: 'USER_LOGIN',
    category: 'Authentication',
    ipAddress: '192.168.1.104',
    details: 'User authenticated successfully via credentials verification.',
  },
  {
    id: 'LOG-8802',
    timestamp: '2026-10-27 13:45:10',
    userId: 'u002',
    userName: 'Dr. Priya Sharma',
    role: 'doctor',
    action: 'PRESCRIPTION_CREATED',
    category: 'Clinical',
    ipAddress: '192.168.1.112',
    details: 'Electronic prescription RX-2026-001 issued for patient Rahul Verma (P-001).',
  },
  {
    id: 'LOG-8803',
    timestamp: '2026-10-27 12:20:00',
    userId: 'u005',
    userName: 'Meena Patel',
    role: 'nurse',
    action: 'VITALS_RECORDED',
    category: 'Patient Care',
    ipAddress: '192.168.1.140',
    details: 'Blood pressure and oxygen saturation recorded for patient Lakshmi Devi (P-002).',
  },
  {
    id: 'LOG-8804',
    timestamp: '2026-10-27 11:10:45',
    userId: 'u008',
    userName: 'Vikram Joshi',
    role: 'accountant',
    action: 'INVOICE_GENERATED',
    category: 'Billing',
    ipAddress: '192.168.1.125',
    details: 'Hospital invoice INV-2026-001 generated for ₹1,850.00 (Status: Paid via UPI).',
  },
  {
    id: 'LOG-8805',
    timestamp: '2026-10-27 10:05:12',
    userId: 'u006',
    userName: 'Arjun Reddy',
    role: 'lab_technician',
    action: 'SPECIMEN_COLLECTED',
    category: 'Laboratory',
    ipAddress: '192.168.1.133',
    details: 'Whole blood sample collected for Complete Blood Count (Order LAB-2026-001).',
  },
];

const STORAGE_KEY_AUDIT_LOGS = 'hms_demo_audit_logs';

export function getCustomAuditLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logAuditEvent({ userId = 'u001', userName = 'System User', role = 'system', action, category, details }) {
  try {
    const existing = getCustomAuditLogs();
    const now = new Date();
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${now.toTimeString().slice(0, 8)}`,
      userId,
      userName,
      role,
      action,
      category,
      ipAddress: '192.168.1.' + Math.floor(100 + Math.random() * 50),
      details,
    };
    const updated = [newLog, ...existing];
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(updated.slice(0, 100)));
    return newLog;
  } catch {
    return null;
  }
}

export function getAllAuditLogs() {
  const custom = getCustomAuditLogs();
  const customIds = new Set(custom.map((l) => l.id));
  return [...custom, ...AUDIT_LOGS.filter((l) => !customIds.has(l.id))];
}

// ---------------------------------------------------------------------------
// Hospital Institutional Settings (Part 15)
// ---------------------------------------------------------------------------
export const DEFAULT_HOSPITAL_SETTINGS = {
  hospitalName: 'Apex City Multispecialty Hospital',
  tagLine: 'Excellence in Healthcare, Compassion in Healing',
  registrationNo: 'REG/KA/MED/2021/8849',
  address: '42 Medical Enclave, Health City, Bengaluru, Karnataka 560029',
  phone: '+91 80 2345 6789',
  emergencyHotline: '+91 80 2345 9999',
  email: 'contact@apexhospital.org',
  gstNumber: '29ABCDE1234F1Z5',
  currencySymbol: '₹',
  taxRatePercent: 5.0,
  opdConsultationFee: 500,
  emergencyFee: 1500,
  bedChargeGeneralWard: 1200,
  bedChargeIcu: 6500,
  visitingHours: '10:00 AM – 12:00 PM & 05:00 PM – 07:00 PM',
  enableSmsAlerts: true,
  enableEmailAlerts: true,
  maintenanceMode: false,
};

const STORAGE_KEY_HOSPITAL_SETTINGS = 'hms_demo_hospital_settings';

export function getHospitalSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HOSPITAL_SETTINGS);
    return raw ? { ...DEFAULT_HOSPITAL_SETTINGS, ...JSON.parse(raw) } : DEFAULT_HOSPITAL_SETTINGS;
  } catch {
    return DEFAULT_HOSPITAL_SETTINGS;
  }
}

export function saveHospitalSettings(settings) {
  try {
    const merged = { ...getHospitalSettings(), ...settings };
    localStorage.setItem(STORAGE_KEY_HOSPITAL_SETTINGS, JSON.stringify(merged));
    return merged;
  } catch {
    return DEFAULT_HOSPITAL_SETTINGS;
  }
}
