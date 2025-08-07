'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Patient {
  id: string;
  name: string;
  appointmentDate: string;
  appointmentTime: string;
  status?: string;
}

interface Prescription {
  id: string;
  patientId: string;
  medicines: string[];
  dosage: string;
  duration: string;
  notes: string;
}

export default function PrescriptionsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [medicines, setMedicines] = useState<string[]>(['']);
  const [dosage, setDosage] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const storedAppointments = localStorage.getItem('appointments');
    if (storedAppointments) {
      const parsed = JSON.parse(storedAppointments);
      setPatients(parsed.filter((p: Patient) => p.status === 'seen'));
    } else {
      fetch('https://mocki.io/v1/e7847e95-9773-41b2-a063-c1885c70c42a')
        .then((res) => res.json())
        .then((data) => {
          const filtered = data.filter((p: Patient) => p.status === 'seen');
          setPatients(filtered);
        });
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('prescriptions');
    if (stored) {
      setPrescriptions(JSON.parse(stored));
    }
  }, []);

  const handleMedicineChange = (index: number, value: string) => {
    const updated = [...medicines];
    updated[index] = value;
    setMedicines(updated);
  };

  const addMedicineField = () => {
    setMedicines([...medicines, '']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPrescription: Prescription = {
      id: editingId || uuidv4(),
      patientId: selectedPatientId,
      medicines,
      dosage,
      duration,
      notes,
    };

    const updated = editingId
      ? prescriptions.map((p) => (p.id === editingId ? newPrescription : p))
      : [...prescriptions, newPrescription];

    setPrescriptions(updated);
    localStorage.setItem('prescriptions', JSON.stringify(updated));
    resetForm();
  };

  const resetForm = () => {
    setSelectedPatientId('');
    setMedicines(['']);
    setDosage('');
    setDuration('');
    setNotes('');
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    const pres = prescriptions.find((p) => p.id === id);
    if (pres) {
      setSelectedPatientId(pres.patientId);
      setMedicines(pres.medicines);
      setDosage(pres.dosage);
      setDuration(pres.duration);
      setNotes(pres.notes);
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    const filtered = prescriptions.filter((p) => p.id !== id);
    setPrescriptions(filtered);
    localStorage.setItem('prescriptions', JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-4xl mx-auto bg-cyan-100 p-6 shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center text-cyan-900 mb-6">
          Prescription Management
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8 text-cyan-800">
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-0"
            required
          >
            <option value="">Select Patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.appointmentDate})
              </option>
            ))}
          </select>

          {medicines.map((medicine, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                placeholder={`Medicine ${index + 1}`}
                value={medicine}
                onChange={(e) => handleMedicineChange(index, e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-0"
                required
              />
              <button
                type="button"
                onClick={addMedicineField}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                +
              </button>
            </div>
          ))}

          <input
            type="text"
            placeholder="Dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-0"
            required
          />

          <input
            type="text"
            placeholder="Duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-0"
            required
          />

          <textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-0"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200"
          >
            {editingId ? 'Update Prescription' : 'Add Prescription'}
          </button>
        </form>

        <div className="space-y-6">
          {prescriptions.map((p) => {
            const patient = patients.find((pat) => pat.id === p.patientId);
            return (
              <div
                key={p.id}
                className="bg-white border rounded-md shadow-sm p-5"
              >
                <h2 className="text-lg font-semibold text-green-700">
                  {patient?.name || 'Unknown Patient'}
                </h2>
                <p className="text-cyan-950">Date: {patient?.appointmentDate}</p>
                <p className="text-cyan-900">
                  Medicines: {p.medicines.join(', ')}
                </p>
                <p className="text-cyan-800">Dosage: {p.dosage}</p>
                <p className="text-cyan-700">Duration: {p.duration}</p>
                <p className="text-cyan-600">Notes: {p.notes}</p>

                <div className="mt-4 flex gap-2">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                    onClick={() => handleEdit(p.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
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
