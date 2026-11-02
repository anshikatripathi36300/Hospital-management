/**
 * PatientNotifications.jsx — Patient Health Alerts & Notifications Hub (Part 16)
 *
 * Real-time patient alerts:
 * - Consultation appointment reminders
 * - Verified lab report ready download notifications
 * - Pharmacy medication refills and billing status alerts
 */
import { useState, useEffect, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Calendar,
  FlaskConical,
  Pill,
  CreditCard,
  CheckCircle2,
  Trash2,
  CheckCheck,
  Clock,
  Filter,
} from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-01',
    title: 'Diagnostic Lab Report Verified & Ready',
    message: 'Your Complete Blood Count (CBC) test results have been verified by Dr. Rajeshwari Swaminathan and are ready for download.',
    category: 'lab',
    timestamp: 'Today at 02:30 PM',
    isRead: false,
    link: '/patient/lab-reports',
  },
  {
    id: 'NOTIF-02',
    title: 'Consultation Appointment Reminder',
    message: 'Upcoming cardiology follow-up with Dr. Priya Sharma scheduled for tomorrow at 10:30 AM in OPD Consultation Suite 4.',
    category: 'appointment',
    timestamp: 'Today at 10:15 AM',
    isRead: false,
    link: '/patient/appointments',
  },
  {
    id: 'NOTIF-03',
    title: 'Prescription Dispensed by Central Pharmacy',
    message: 'Your medication order (Amoxicillin, Paracetamol) has been fulfilled and dispensed at Pharmacy Counter 2.',
    category: 'pharmacy',
    timestamp: 'Yesterday at 04:45 PM',
    isRead: true,
    link: '/patient/prescriptions',
  },
  {
    id: 'NOTIF-04',
    title: 'Invoice Payment Clearance Acknowledged',
    message: 'Hospital invoice INV-2026-001 for ₹1,850.00 has been paid in full via UPI. Tax receipt generated.',
    category: 'billing',
    timestamp: 'Oct 25, 2026',
    isRead: true,
    link: '/patient/bills',
  },
  {
    id: 'NOTIF-05',
    title: 'Hospital Seasonal Influenza Vaccine Camp',
    message: 'Special immunization camp open this Saturday from 09:00 AM to 01:00 PM at Health City campus.',
    category: 'announcement',
    timestamp: 'Oct 24, 2026',
    isRead: true,
    link: '/patient/dashboard',
  },
];

const STORAGE_KEY = 'hms_demo_patient_notifications';

export default function PatientNotifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // storage quota or demo mode
    }
  }, [notifications]);

  // Mark single as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (categoryFilter === 'all') return notifications;
    if (categoryFilter === 'unread') return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.category === categoryFilter);
  }, [notifications, categoryFilter]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'appointment':
        return <Calendar size={18} color="#2563eb" />;
      case 'lab':
        return <FlaskConical size={18} color="#7c3aed" />;
      case 'pharmacy':
        return <Pill size={18} color="#059669" />;
      case 'billing':
        return <CreditCard size={18} color="#d97706" />;
      default:
        return <Bell size={18} color="var(--color-primary-600)" />;
    }
  };

  return (
    <AppLayout title="Notifications & Health Alerts">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={26} color="var(--color-primary-600)" />
            Health Alerts &amp; Notifications
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Stay updated with real-time consultation reminders, verified diagnostic reports, and pharmacy updates.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" icon={CheckCheck} onClick={markAllAsRead}>
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 20, padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Filter:
          </span>
          {[
            { id: 'all', label: `All Alerts (${notifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'appointment', label: 'Appointments' },
            { id: 'lab', label: 'Lab Reports' },
            { id: 'pharmacy', label: 'Pharmacy' },
            { id: 'billing', label: 'Billing' },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategoryFilter(id)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid var(--color-border)',
                background: categoryFilter === id ? 'var(--color-primary-600)' : 'var(--color-bg-secondary)',
                color: categoryFilter === id ? 'white' : 'var(--color-text-secondary)',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredNotifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
            <Bell size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>No notifications found</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
              You are all caught up on all health reminders and appointments!
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '16px 20px',
                borderLeft: notif.isRead ? '4px solid transparent' : '4px solid var(--color-primary-600)',
                background: notif.isRead ? 'var(--color-card-bg)' : '#f8fafc',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: 'var(--color-bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getCategoryIcon(notif.category)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      fontWeight: notif.isRead ? 600 : 700,
                      color: notif.isRead ? 'var(--color-text-primary)' : 'var(--color-primary-800)',
                    }}
                  >
                    {notif.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    <Clock size={12} />
                    {notif.timestamp}
                  </div>
                </div>

                <p style={{ margin: '0 0 10px', fontSize: '0.86rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {notif.message}
                </p>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {!notif.isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notif.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-primary-600)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: 0,
                      }}
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteNotification(notif.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.8rem',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Trash2 size={13} /> Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
