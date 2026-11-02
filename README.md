# Hospital Management System (HMS)
## B.Tech CSE — Software Engineering Project

A comprehensive, full-stack Hospital Management System built with the **MERN Stack** (MongoDB, Express.js, React, Node.js) featuring role-based access control across **8 dedicated portals**.

---

## 🌐 Live Deployment

| Service | URL |
|---|---|
| **Frontend (Vercel)** | 🔗 *(coming soon)* |
| **Backend API (Render)** | 🔗 *(coming soon)* |

---

## 📁 Project Structure

```
Hospital-management/
├── frontend/    ← React 18 + Vite (deployed on Vercel)
└── backend/     ← Node.js + Express + MongoDB (deployed on Render)
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Vanilla CSS Modules |
| **Icons & Charts** | Lucide React, Recharts |
| **Backend API** | Node.js, Express 5, Mongoose 9 |
| **Database** | MongoDB (Community Server / MongoDB Atlas) |
| **Security & Auth** | JSON Web Tokens (JWT), bcryptjs, Helmet, CORS, Morgan |
| **Validation** | express-validator, custom audit middleware |

---

## 👥 User Roles & Portals

The application implements dedicated portals and dashboards for 8 hospital roles:

1. **Executive Admin Portal** (`/admin/dashboard`): Hospital KPIs, staff & doctor administration, department tracking, audit logs, settings.
2. **Doctor Portal** (`/doctor/dashboard`): Today's patient appointments, consultations, electronic prescriptions, lab test orders, availability schedule.
3. **Patient Portal** (`/patient/dashboard`): Online appointment booking, personal prescriptions, lab reports, invoices, notifications.
4. **Receptionist Desk** (`/receptionist/dashboard`): Patient registration, walk-in appointment scheduling, real-time queue management, doctor rosters.
5. **Nurse Station** (`/nurse/dashboard`): Assigned inpatient care, vital signs monitoring (BP, SpO2, Temp, HR, BMI), clinical alerts.
6. **Laboratory Portal** (`/lab/dashboard`): Diagnostic test requests, sample tracking, test results data entry, critical findings alerts.
7. **Pharmacy Portal** (`/pharmacy/dashboard`): Medicine catalog, stock replenishment, low-stock warnings, e-prescription dispensing with inventory deduction.
8. **Billing & Accounts** (`/billing/dashboard`): Invoicing, payment processing (Cash, Card, UPI, Insurance), revenue analytics and financial reporting.

---

## 🚀 Running the System

### Prerequisites
- **Node.js** ≥ 18
- **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 1. Database Setup & Seeding

```bash
# Seed default demonstration users, medicines, and sample records
npm run server:seed
```

### 2. Start the Backend API Server (Port 5000)

```bash
npm run server
```
*API health check endpoint available at `http://localhost:5000/api/health`*

### 3. Start the Frontend Application (Port 5173)

Open a second terminal:
```bash
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🔑 Fictional Demonstration Accounts

> ⚠️ *These credentials are for academic demonstration and development evaluation only.*

| Role | Email | Password | Home Route |
|---|---|---|---|
| **Admin** | `admin@hospital.demo` | `demo1234` | `/admin/dashboard` |
| **Doctor** | `doctor@hospital.demo` | `demo1234` | `/doctor/dashboard` |
| **Patient** | `patient@hospital.demo` | `demo1234` | `/patient/dashboard` |
| **Receptionist** | `receptionist@hospital.demo` | `demo1234` | `/receptionist/dashboard` |
| **Nurse** | `nurse@hospital.demo` | `demo1234` | `/nurse/dashboard` |
| **Lab Technician** | `lab@hospital.demo` | `demo1234` | `/lab/dashboard` |
| **Pharmacist** | `pharmacy@hospital.demo` | `demo1234` | `/pharmacy/dashboard` |
| **Accountant** | `billing@hospital.demo` | `demo1234` | `/billing/dashboard` |

---

## 📡 REST API Specifications

| Resource | Endpoints | Access |
|---|---|---|
| **Authentication** | `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/change-password` | Public / Token |
| **Patients** | `GET /api/patients`, `POST /api/patients`, `GET /api/patients/:id`, `PUT /api/patients/:id` | Doctor, Receptionist, Admin |
| **Appointments** | `GET /api/appointments`, `POST /api/appointments`, `PUT /api/appointments/:id/status` | Authorized Roles |
| **Vitals** | `GET /api/vitals`, `POST /api/vitals`, `GET /api/vitals/patient/:patientId` | Nurse, Doctor |
| **Prescriptions** | `GET /api/prescriptions`, `POST /api/prescriptions`, `PUT /api/prescriptions/:id/dispense` | Doctor, Pharmacist |
| **Laboratory** | `GET /api/lab-reports`, `POST /api/lab-reports`, `PUT /api/lab-reports/:id/complete` | Doctor, Lab Tech |
| **Pharmacy** | `GET /api/medicines`, `POST /api/medicines`, `POST /api/medicines/:id/restock` | Pharmacist, Admin |
| **Billing** | `GET /api/bills`, `POST /api/bills`, `PUT /api/bills/:id/pay`, `GET /api/bills/revenue-summary` | Accountant, Admin |
| **Analytics** | `GET /api/dashboard/admin`, `GET /api/dashboard/doctor` | Admin, Doctor |
| **Audit Logs** | `GET /api/audit-logs` | Admin |
