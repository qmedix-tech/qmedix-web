import React, { useState, useEffect } from 'react';
import {
  Stethoscope, Search, UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import AddDoctorModal from '../components/AddDoctorModal';
import DoctorDetails from '../components/DoctorDetails';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDoctors(searchQuery);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchDoctors = async (queryStr = '') => {
    try {
      setLoading(true);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = stored.clinic_id;

      let url = `/doctors/${clinicId}`;
      if (queryStr && queryStr.trim() !== '') {
        url += `?query=${encodeURIComponent(queryStr.trim())}`;
      }

      const { data } = await API.get(url);
      const doctorList = Array.isArray(data) ? data : (data.doctors || []);
      setDoctors(doctorList);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: TOGGLE STATUS DIRECTLY IN LIST
  const handleToggleStatus = async (doc, e) => {
    e.stopPropagation(); // Avoid selecting the doctor row
    try {
      const newStatus = !doc.is_active;
      const payload = { is_active: newStatus };
      await API.patch(`/doctors/${doc.doctor_id}`, payload);

      toast.success(`${doc.name} is now ${newStatus ? 'Active' : 'Inactive'}`);

      // Update local state instead of full fetch for speed
      setDoctors(prev => prev.map(d =>
        d.doctor_id === doc.doctor_id ? { ...d, is_active: newStatus } : d
      ));
    } catch (error) {
       toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F4F7FE]">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-20 flex-shrink-0 bg-white px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">Doctors</h1>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl flex items-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:bg-blue-700 transition-all font-bold text-sm"
          >
            <UserPlus size={18} />
            Add Doctor
          </button>
        </header>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto">

          {/* 🔥 CONDITIONAL VIEW */}
          {selectedDoctor ? (
            <div>
              {/* BACK BUTTON */}
              <button
                onClick={() => setSelectedDoctor(null)}
                className="group flex items-center gap-2 px-4 py-2 mb-4
                bg-white border border-slate-200 rounded-xl
                text-sm font-semibold text-slate-700
                shadow-sm hover:shadow-md
                hover:border-blue-300 hover:text-blue-600
                transition-all duration-200"
              >
                <span className="transition-transform group-hover:-translate-x-1">
                  ←
                </span>
                Back to Doctors
              </button>

              <DoctorDetails
                doctorId={selectedDoctor.doctor_id}
                onDeleteSuccess={() => {
                  setSelectedDoctor(null);
                  fetchDoctors();
                }}
                onUpdateSuccess={() => fetchDoctors(searchQuery)}
              />
            </div>
          ) : (
            <>
              {/* SEARCH */}
              <div className="relative mb-8 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search specialist by name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>

              {/* TABLE */}
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {/* HEADER */}
                <div className="grid grid-cols-5 px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
                  <span className="col-span-2">Doctor</span>
                  <span>Contact</span>
                  <span>Specialty</span>
                  <span>Status</span>
                </div>

                {/* BODY */}
                <div className="divide-y divide-slate-50">
                  {loading ? (
                    // SHIMMER LOADING
                    [1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="grid grid-cols-5 px-8 py-5 items-center animate-pulse">
                        <div className="col-span-2 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-100 shadow-sm" />
                          <div className="space-y-2 w-full pr-12">
                            <div className="h-4 bg-slate-100 rounded-md w-2/3" />
                            <div className="h-3 bg-slate-50 rounded-md w-1/3" />
                          </div>
                        </div>
                        <div className="h-4 bg-slate-50 rounded-md w-24" />
                        <div className="h-4 bg-slate-50 rounded-md w-20" />
                        <div className="h-6 bg-slate-100 rounded-lg w-16" />
                      </div>
                    ))
                  ) : (
                    <>
                      {doctors.map((doc) => (
                        <div
                          key={doc.doctor_id}
                          onClick={() => setSelectedDoctor(doc)}
                          className="grid grid-cols-5 px-8 py-5 items-center border border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors group"
                        >
                          <div className="col-span-2 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-slate-100 shadow-sm flex-shrink-0 group-hover:shadow-md transition-shadow">
                              {doc.dp_url && doc.dp_url.startsWith('http') ? (
                                <img src={doc.dp_url} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <Stethoscope size={20} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 pr-4">
                              <p className="font-bold text-slate-900 truncate">{doc.name}</p>
                            </div>
                          </div>

                          <span className="text-sm font-semibold text-slate-600 font-mono tracking-tight">{doc.phone}</span>

                          <div>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-indigo-100/50">
                              {doc.specialty?.split(' ')[0] || 'General'}
                            </span>
                          </div>

                          <div className="flex items-center">
                            <div
                              onClick={(e) => handleToggleStatus(doc, e)}
                              className={`relative w-10 h-5 rounded-full p-1 cursor-pointer transition-colors duration-300 ${doc.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                              <motion.div
                                initial={false}
                                animate={{ x: doc.is_active ? 20 : 0 }}
                                className="w-3 h-3 bg-white rounded-full shadow-sm"
                              />
                            </div>
                            <span className={`ml-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${doc.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {doc.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      ))}

                      {doctors.length === 0 && (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                          <Stethoscope size={40} className="mb-3 opacity-20" />
                          <p className="text-sm font-medium">No doctors found</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <AddDoctorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchDoctors}
        />
      </main>
    </div>
  );
};

export default Doctors;
