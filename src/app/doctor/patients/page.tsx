'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('appointments');
    if (stored) {
      setPatients(JSON.parse(stored));
      setLoading(false);
    } else {
      fetch('https://mocki.io/v1/e7847e95-9773-41b2-a063-c1885c70c42a')
        .then((res) => res.json())
        .then((data) => {
          const updated = data.map((p: any) => ({
            ...p,
            status: p.status || 'pending',
          }));
          setPatients(updated);
          localStorage.setItem('appointments', JSON.stringify(updated));
        })
        .catch((err) => console.error('Fetch error:', err))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    const updated = patients.map((p) =>
      p.id === id ? { ...p, status: newStatus } : p
    );
    setPatients(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'seen':
        return 'bg-green-50 border border-green-500';
      case 'cancelled':
        return 'bg-red-50 border border-red-500';
      default:
        return 'bg-white border border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-blue-500">Patient Appointments</h1>
        <div className="flex gap-4">
          <Link href="/doctor/calendar">
            <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded cursor-pointer">
              View Calendar
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : patients.length === 0 ? (
        <div className="text-center text-red-500">No patients found.</div>
      ) : (
        <div className="grid gap-6 max-w-4xl mx-auto">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className={`shadow-lg rounded-lg p-5 ${getStatusClasses(patient.status)}`}
            >
              <p><strong className="text-gray-700">Name:</strong> {patient.name}</p>
              <p><strong className="text-gray-700">Appointment Date:</strong> {patient.appointmentDate}</p>
              <p><strong className="text-gray-700">Time:</strong> {patient.appointmentTime}</p>
              <p><strong className="text-gray-700">Status:</strong> <span className="capitalize">{patient.status}</span></p>

              <div className="mt-4 flex flex-wrap gap-4">
                {patient.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(patient.id, 'cancelled')}
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleStatusChange(patient.id, 'seen')}
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded cursor-pointer"
                    >
                      Mark as Seen
                    </button>
                  </>
                )}

                {patient.status === 'seen' && (
                  <Link
                    href={`/doctor/prescriptions?patientId=${patient.id}&name=${encodeURIComponent(patient.name)}`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-4 rounded cursor-pointer"
                  >
                    Make Prescription
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
