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

  // 🔥 NEW STATE
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = user.clinic_id;

      const { data } = await API.get(`/doctors/${clinicId}`);
      const doctorList = Array.isArray(data) ? data : (data.doctors || []);
      setDoctors(doctorList);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc =>
    doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-[#F4F7FE]">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-24 bg-white px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="text-blue-600" />
            <h1 className="text-xl font-bold">Doctors</h1>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <UserPlus size={16} />
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
                onDeleteSuccess={fetchDoctors}
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
                  <span className="col-span-2">Specialist</span>
                  <span>Contact</span>
                  <span>Category</span>
                  <span>Status</span>
                </div>

                {/* BODY */}
                <div className="divide-y divide-slate-50">
                  {filteredDoctors.map((doc) => (
                    <div
                      key={doc.doctor_id}
                      onClick={() => setSelectedDoctor(doc)}
                      className="grid grid-cols-5 px-8 py-5 items-center hover:bg-slate-50/80 cursor-pointer transition-colors group"
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
                          <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">{doc.specialty}</p>
                        </div>
                      </div>

                      <span className="text-sm font-semibold text-slate-600 font-mono tracking-tight">{doc.phone}</span>

                      <div>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-indigo-100/50">
                          {doc.specialty.split(' ')[0]}
                        </span>
                      </div>

                      <div>
                        {doc.is_active === true ? (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredDoctors.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                      <Stethoscope size={40} className="mb-3 opacity-20" />
                      <p className="text-sm font-medium">No specialists found</p>
                    </div>
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
