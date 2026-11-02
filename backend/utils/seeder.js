/**
 * utils/seeder.js — Seed the database with demo users and sample data
 *
 * Run with:  node utils/seeder.js
 *
 * ⚠️ DEMO DATA ONLY — Never use these credentials in production.
 */
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config({ path: '../.env' });

const User        = require('../models/User');
const Patient     = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Medicine    = require('../models/Medicine');

const connectDB = require('../config/db');

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@hospital.demo',
    password: 'demo1234',
    role: 'admin',
    phone: '+91 98765 00001',
    department: 'Administration',
    isActive: true,
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'doctor@hospital.demo',
    password: 'demo1234',
    role: 'doctor',
    phone: '+91 98765 00002',
    department: 'Cardiology',
    specialization: 'Cardiologist',
    licenseNumber: 'MCI-2024-001',
    isActive: true,
  },
  {
    name: 'Rahul Verma',
    email: 'patient@hospital.demo',
    password: 'demo1234',
    role: 'patient',
    phone: '+91 98765 00003',
    isActive: true,
  },
  {
    name: 'Anjali Nair',
    email: 'receptionist@hospital.demo',
    password: 'demo1234',
    role: 'receptionist',
    phone: '+91 98765 00004',
    department: 'Front Desk',
    isActive: true,
  },
  {
    name: 'Meena Patel',
    email: 'nurse@hospital.demo',
    password: 'demo1234',
    role: 'nurse',
    phone: '+91 98765 00005',
    department: 'General Ward',
    isActive: true,
  },
  {
    name: 'Ravi Kumar',
    email: 'lab@hospital.demo',
    password: 'demo1234',
    role: 'lab_technician',
    phone: '+91 98765 00006',
    department: 'Laboratory',
    isActive: true,
  },
  {
    name: 'Sunita Rao',
    email: 'pharmacy@hospital.demo',
    password: 'demo1234',
    role: 'pharmacist',
    phone: '+91 98765 00007',
    department: 'Pharmacy',
    isActive: true,
  },
  {
    name: 'Amit Joshi',
    email: 'billing@hospital.demo',
    password: 'demo1234',
    role: 'accountant',
    phone: '+91 98765 00008',
    department: 'Accounts',
    isActive: true,
  },
];

const demoMedicines = [
  { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic', manufacturer: 'Sun Pharma', batchNumber: 'B001', expiryDate: new Date('2026-12-31'), stockQuantity: 500, unitPrice: 2, reorderLevel: 100, unit: 'Tablet', requiresPrescription: false },
  { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Antibiotic', manufacturer: 'Cipla', batchNumber: 'B002', expiryDate: new Date('2026-06-30'), stockQuantity: 200, unitPrice: 8, reorderLevel: 50, unit: 'Capsule', requiresPrescription: true },
  { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', category: 'Cardiovascular', manufacturer: 'Dr Reddys', batchNumber: 'B003', expiryDate: new Date('2026-09-30'), stockQuantity: 30, unitPrice: 12, reorderLevel: 50, unit: 'Tablet', requiresPrescription: true },
  { name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'Antidiabetic', manufacturer: 'Lupin', batchNumber: 'B004', expiryDate: new Date('2026-11-30'), stockQuantity: 0, unitPrice: 5, reorderLevel: 100, unit: 'Tablet', requiresPrescription: true },
  { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Antacid', manufacturer: 'Zydus', batchNumber: 'B005', expiryDate: new Date('2027-03-31'), stockQuantity: 350, unitPrice: 6, reorderLevel: 80, unit: 'Capsule', requiresPrescription: false },
];

const seed = async () => {
  await connectDB();
  console.log('Connected to MongoDB. Seeding...');

  // Clear existing
  await User.deleteMany({});
  await Patient.deleteMany({});
  await Medicine.deleteMany({});
  console.log('Cleared existing data');

  // Seed users
  const createdUsers = await User.create(demoUsers);
  console.log(`Created ${createdUsers.length} users`);

  // Seed medicines
  const admin = createdUsers.find(u => u.role === 'admin');
  const medsWithAdmin = demoMedicines.map(m => ({ ...m, addedBy: admin._id }));
  const createdMeds = await Medicine.create(medsWithAdmin);
  console.log(`Created ${createdMeds.length} medicines`);

  // Seed one demo patient
  const doctor = createdUsers.find(u => u.role === 'doctor');
  const patient = await Patient.create({
    name: 'Rahul Verma',
    phone: '+91 98765 00003',
    email: 'patient@hospital.demo',
    gender: 'Male',
    bloodGroup: 'O+',
    dateOfBirth: new Date('1990-05-15'),
    address: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    allergies: ['Penicillin'],
    assignedDoctor: doctor._id,
    registeredBy: admin._id,
  });
  console.log(`Created patient: ${patient.name} (${patient.patientId})`);

  console.log('\n✅ Database seeded successfully!');
  console.log('\nDemo login credentials:');
  console.log('  Admin:       admin@hospital.demo    / demo1234');
  console.log('  Doctor:      doctor@hospital.demo   / demo1234');
  console.log('  Patient:     patient@hospital.demo  / demo1234');
  console.log('  Receptionist: receptionist@hospital.demo / demo1234');
  console.log('  Nurse:       nurse@hospital.demo    / demo1234');
  console.log('  Lab Tech:    lab@hospital.demo      / demo1234');
  console.log('  Pharmacist:  pharmacy@hospital.demo / demo1234');
  console.log('  Billing:     billing@hospital.demo  / demo1234');

  process.exit(0);
};

seed().catch(err => {
  console.error('Seeder error:', err);
  process.exit(1);
});

