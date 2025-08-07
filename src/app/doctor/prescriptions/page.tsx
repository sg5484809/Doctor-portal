'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Patient {
  id: string;
  name: string;
  appointmentDate: string;
  appointmentTime: string;
}

interface Prescription {
  id: string;
  patientId: string;
  medicineName: string;
  dosage: string;
  duration: string;
  notes: string;
}

export default function PrescriptionsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [form, setForm] = useState({
    medicineName: '',
    dosage: '',
    duration: '',
    notes: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://mocki.io/v1/e7847e95-9773-41b2-a063-c1885c70c42a')
      .then(res => res.json())
      .then(data => setPatients(data));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('prescriptions');
    if (stored) {
      setPrescriptions(JSON.parse(stored));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPrescription: Prescription = {
      id: editingId || uuidv4(),
      patientId: selectedPatientId,
      medicineName: form.medicineName,
      dosage: form.dosage,
      duration: form.duration,
      notes: form.notes,
    };

    const updated = editingId
      ? prescriptions.map(p => (p.id === editingId ? newPrescription : p))
      : [...prescriptions, newPrescription];

    setPrescriptions(updated);
    localStorage.setItem('prescriptions', JSON.stringify(updated));
    resetForm();
  };

  const resetForm = () => {
    setSelectedPatientId('');
    setForm({ medicineName: '', dosage: '', duration: '', notes: '' });
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    const pres = prescriptions.find(p => p.id === id);
    if (pres) {
      setSelectedPatientId(pres.patientId);
      setForm({
        medicineName: pres.medicineName,
        dosage: pres.dosage,
        duration: pres.duration,
        notes: pres.notes,
      });
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    const filtered = prescriptions.filter(p => p.id !== id);
    setPrescriptions(filtered);
    localStorage.setItem('prescriptions', JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="p-6 max-w-4xl mx-auto bg-cyan-100 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-cyan-900">Prescription Management</h1>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8 text-cyan-800">
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-0"
            required
          >
            <option value="">Select Patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.appointmentDate})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Medicine Name"
            value={form.medicineName}
            onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-0"
            required
          />
          <input
            type="text"
            placeholder="Dosage"
            value={form.dosage}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-0"
            required
          />
          <input
            type="text"
            placeholder="Duration"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-0"
            required
          />
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-0"
          />

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {editingId ? 'Update Prescription' : 'Add Prescription'}
          </button>
        </form>

        <div className="space-y-4">
          {prescriptions.map((p) => {
            const patient = patients.find((pat) => pat.id === p.patientId);
            return (
              <div key={p.id} className="p-4 border rounded bg-white shadow-sm">
                <h2 className="font-semibold text-green-600">{patient?.name || 'Unknown Patient'}</h2>
                <p className='text-cyan-950'>Date: {patient?.appointmentDate}</p>
                <p className='text-cyan-900'>Medicine: {p.medicineName}</p>
                <p className='text-cyan-800'>Dosage: {p.dosage}</p>
                <p className='text-cyan-700'>Duration: {p.duration}</p>
                <p className='text-cyan-600'>Notes: {p.notes}</p>
                <div className="space-x-2 mt-2">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                    onClick={() => handleEdit(p.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
                  </button>
                </div> 
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
