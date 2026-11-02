/**
 * NurseTasks.jsx — Nursing Care Tasks & Medication Administration Record (MAR) (Part 11)
 *
 * Features:
 * - MAR schedule checklist for scheduled inpatient medication dispensing
 * - Scheduled clinical tasks: IV fluid changes, sterile wound dressings, CBG tests
 * - 1-Click task sign-off with nurse name and completion timestamp
 * - Priority indicators: Routine, High, STAT (Emergency)
 * - "Schedule Nursing Care Task" modal
 */
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  getAllNursingTasks,
  saveCustomNursingTask,
  toggleNursingTask,
  getAllPatients,
} from '../../data/demoData';
import {
  Pill,
  Clock,
  CheckCircle2,
  PlusCircle,
  Filter,
  Search,
  AlertTriangle,
  Flame,
  Droplet,
  HeartPulse,
  ClipboardList,
} from 'lucide-react';

export default function NurseTasks() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [inpatients, setInpatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');

  // Modal State
  const [createModal, setCreateModal] = useState(false);
  const [toast, setToast] = useState('');

  // Form State
  const [patientId, setPatientId] = useState('');
  const [taskType, setTaskType] = useState('Medication Administration');
  const [title, setTitle] = useState('');
  const [scheduleTime, setScheduleTime] = useState('10:00 AM');
  const [shift, setShift] = useState('Morning');
  const [priority, setPriority] = useState('Routine');
  const [instructions, setInstructions] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(() => {
    const all = getAllNursingTasks();
    setTasks(all);

    const allPts = getAllPatients();
    setInpatients(allPts.filter((p) => p.admissionStatus === 'inpatient'));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = (taskId) => {
    const nurseTitle = `${currentUser?.name || 'Meena Patel'}, RN`;
    const updated = toggleNursingTask(taskId, nurseTitle);
    loadData();
    showToast(
      updated?.status === 'completed'
        ? `Task signed off as completed by ${nurseTitle}.`
        : 'Task reopened as pending.'
    );
  };

  const handleOpenCreateModal = () => {
    if (inpatients.length > 0) setPatientId(inpatients[0].id);
    setTaskType('Medication Administration');
    setTitle('');
    setScheduleTime('10:00 AM');
    setShift('Morning');
    setPriority('Routine');
    setInstructions('');
    setCreateModal(true);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    const targetPt = inpatients.find((p) => p.id === patientId);
    if (!targetPt) return;

    const newTask = {
      id: `TASK-${Date.now().toString().slice(-6)}`,
      patientId: targetPt.id,
      patientName: targetPt.name,
      bed: targetPt.bed || 'Ward Bed',
      taskType,
      title,
      scheduleTime,
      shift,
      priority,
      instructions: instructions || 'Perform as scheduled in inpatient care protocol.',
      status: 'pending',
      completedAt: null,
      completedBy: null,
    };

    saveCustomNursingTask(newTask);
    loadData();
    setCreateModal(false);
    showToast(`Care task "${title}" scheduled for ${targetPt.name}.`);
  };

  const filtered = tasks.filter((t) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(term) ||
      t.patientName.toLowerCase().includes(term) ||
      (t.bed && t.bed.toLowerCase().includes(term));
    const matchesType = typeFilter === 'all' || t.taskType === typeFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesShift = shiftFilter === 'all' || t.shift === shiftFilter;
    return matchesSearch && matchesType && matchesStatus && matchesShift;
  });

  return (
    <AppLayout title="Nursing Tasks">
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Nursing Tasks & MAR Schedule</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Medication administration records, clinical procedures, and ward shift duties.
          </p>
        </div>
        <Button variant="primary" icon={PlusCircle} onClick={handleOpenCreateModal}>
          Schedule Care Task
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 20,
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search
            size={16}
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
            placeholder="Search by task title, patient name, or bed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>

        <select
          className="form-control"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ minWidth: 160 }}
        >
          <option value="all">All Care Categories</option>
          <option value="Medication Administration">Medication (MAR)</option>
          <option value="Vital Signs Monitoring">Vitals Monitoring</option>
          <option value="Wound Dressing">Wound Dressing</option>
          <option value="IV Infusion">IV Infusion</option>
          <option value="Blood Glucose Test">Blood Glucose</option>
          <option value="Respiratory Care">Respiratory Care</option>
        </select>

        <select
          className="form-control"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ minWidth: 130 }}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>

        <select
          className="form-control"
          value={shiftFilter}
          onChange={(e) => setShiftFilter(e.target.value)}
          style={{ minWidth: 130 }}
        >
          <option value="all">All Shifts</option>
          <option value="Morning">Morning</option>
          <option value="Evening">Evening</option>
          <option value="Night">Night</option>
        </select>
      </div>

      {/* Tasks Master Checklist Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ width: 50, textAlign: 'center' }}>Done</th>
                <th>Task & Procedure</th>
                <th>Patient & Bed</th>
                <th>Scheduled Time</th>
                <th>Priority</th>
                <th>Instructions</th>
                <th>Status / Sign-off</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                    No nursing tasks found matching your filter selection.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isDone = t.status === 'completed';
                  return (
                    <tr
                      key={t.id}
                      style={{
                        background: isDone ? '#f0fdf4' : undefined,
                        opacity: isDone ? 0.75 : 1,
                      }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => handleToggle(t.id)}
                          style={{ width: 18, height: 18, cursor: 'pointer' }}
                        />
                      </td>
                      <td>
                        <div
                          style={{
                            fontWeight: 700,
                            textDecoration: isDone ? 'line-through' : 'none',
                            color: isDone ? '#166534' : '#1e293b',
                          }}
                        >
                          {t.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {t.taskType} · Shift: {t.shift}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.patientName}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700 }}>
                          {t.bed}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{t.scheduleTime}</td>
                      <td>
                        {t.priority === 'STAT' ? (
                          <span
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              fontWeight: 800,
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 4,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Flame size={12} /> STAT
                          </span>
                        ) : t.priority === 'High' ? (
                          <span
                            style={{
                              background: '#fef3c7',
                              color: '#b45309',
                              fontWeight: 700,
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}
                          >
                            High
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              fontWeight: 600,
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}
                          >
                            Routine
                          </span>
                        )}
                      </td>
                      <td style={{ maxWidth: 220, fontSize: 12, color: '#475569' }}>
                        {t.instructions}
                      </td>
                      <td>
                        {isDone ? (
                          <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>
                            <CheckCircle2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                            Completed at {t.completedAt}
                            <div style={{ fontSize: 10, color: '#64748b' }}>by {t.completedBy}</div>
                          </div>
                        ) : (
                          <span
                            style={{
                              background: '#fef3c7',
                              color: '#b45309',
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}
                          >
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Schedule Care Task */}
      {createModal && (
        <Modal
          isOpen={createModal}
          onClose={() => setCreateModal(false)}
          title="Schedule Nursing Care Task"
          subtitle="Add an entry to the Medication Administration Record (MAR) or shift duty list"
        >
          <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Select Inpatient & Bed
              </label>
              <select
                className="form-control"
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                {inpatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.bed || 'Ward Bed'}) — UHID: {p.uhid}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Care Category
                </label>
                <select
                  className="form-control"
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                >
                  <option value="Medication Administration">Medication Administration (MAR)</option>
                  <option value="Vital Signs Monitoring">Vital Signs Monitoring</option>
                  <option value="Wound Dressing">Sterile Wound Dressing</option>
                  <option value="IV Infusion">IV Fluid / Line Maintenance</option>
                  <option value="Blood Glucose Test">Blood Glucose (CBG)</option>
                  <option value="Respiratory Care">Respiratory Care / Nebulization</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Priority Level
                </label>
                <select
                  className="form-control"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Routine">Routine</option>
                  <option value="High">High</option>
                  <option value="STAT">STAT (Immediate / Emergency)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Task Title / Medication & Strength
              </label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Ceftriaxone 1g IV Infusion / Post-Op Dressing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Scheduled Time
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. 10:00 AM"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Shift
                </label>
                <select
                  className="form-control"
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                >
                  <option value="Morning">Morning (07:00 - 15:00)</option>
                  <option value="Evening">Evening (15:00 - 23:00)</option>
                  <option value="Night">Night (23:00 - 07:00)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Nursing Instructions & Precautions
              </label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Aseptic technique, slow IV push over 5 mins, check allergy wristband..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button type="button" variant="secondary" onClick={() => setCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Add to Care Schedule
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
