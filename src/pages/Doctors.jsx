import React, { useState, useEffect } from 'react';
import {
  Stethoscope, Search, UserPlus, Phone, Filter, ChevronDown, Inbox, Check, X
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
  const [sortBy, setSortBy] = useState('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

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

  const filteredDoctors = React.useMemo(() => {
    let result = [...doctors];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.specialty?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'specialty') return (a.specialty || '').localeCompare(b.specialty || '');
      if (sortBy === 'status') return (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0);
      return 0;
    });

    return result;
  }, [doctors, searchQuery, sortBy]);

  const handleToggleStatus = async (doc, e) => {
    e.stopPropagation();
    try {
      const newStatus = !doc.is_active;
      const payload = { is_active: newStatus };
      await API.patch(`/doctors/${doc.doctor_id}`, payload);

      toast.success(`${doc.name} is now ${newStatus ? 'Active' : 'Inactive'}`);

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
        <header className="h-20 flex-shrink-0 bg-white px-10 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Stethoscope className="text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">Doctors Directory</h1>
              <p className="text-xs font-medium text-slate-500">Manage your clinic specialists and their visibility.</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl flex items-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:bg-blue-700 transition-all font-bold text-sm"
          >
            <UserPlus size={18} />
            Add Doctor
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {selectedDoctor ? (
            <div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="group flex items-center gap-2 px-4 py-2 mb-6 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
              >
                <span className="transition-transform group-hover:-translate-x-1">←</span>
                Back to Directory
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
              {/* FILTERS */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                  <div className="relative group flex-1 md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Search size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search doctors by name or specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Filter size={16} />
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer min-w-[160px]"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="specialty">Sort by Specialty</option>
                      <option value="status">Sort by Status</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100/50">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    {filteredDoctors.length} Specialist{filteredDoctors.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* TABLE */}
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {/* HEADER */}
                <div className="grid grid-cols-[2fr_1.2fr_1.5fr_0.8fr_1fr] px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
                  <span>Doctor</span>
                  <span>Contact</span>
                  <span>Specialty</span>
                  <span>Status</span>
                  <span className='pl-14'>Action</span>
                </div>

                <div className="divide-y divide-slate-50 relative">
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="grid grid-cols-[2fr_1.2fr_1.5fr_0.8fr_1fr] px-8 py-5 items-center animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100" />
                          <div className="h-4 bg-slate-100 rounded-md w-32" />
                        </div>
                        <div className="h-4 bg-slate-50 rounded-md w-24" />
                        <div className="h-4 bg-slate-50 rounded-md w-32" />
                        <div className="h-5 w-10 bg-slate-100 rounded-full" />
                        <div className="h-8 bg-slate-100 rounded-lg w-24 justify-self-end" />
                      </div>
                    ))
                  ) : filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc) => (
                      <div
                        key={doc.doctor_id}
                        className="grid grid-cols-[2fr_1.2fr_1.5fr_0.8fr_1fr] px-8 py-5 items-center hover:bg-slate-50 transition-colors group"
                      >
                        {/* DOCTOR */}
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-slate-100 shadow-sm group-hover:bg-[#1E293B] group-hover:text-white transition-all">
                            {doc.dp_url ? (
                              <img src={doc.dp_url} alt={doc.name} className="w-full h-full object-cover" />
                            ) : (
                              <Stethoscope size={20} className="text-[#1E293B] group-hover:text-white" />
                            )}
                          </div>
                          <p className="font-bold text-slate-900 truncate">{doc.name}</p>
                        </div>

                        {/* CONTACT */}
                        <div className="text-sm font-semibold text-slate-600 font-mono tracking-tight flex items-center gap-1.5 focus:outline-none">
                          <Phone size={14} className="opacity-40" />
                          {doc.phone || 'N/A'}
                        </div>

                        {/* SPECIALTY */}
                        <div>
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100/50 text-[10px] font-bold uppercase tracking-wider rounded-lg inline-block whitespace-nowrap">
                            {doc.specialty}
                          </span>
                        </div>

                        {/* STATUS */}
                        <div className="flex items-center">
                          <button
                            onClick={(e) => handleToggleStatus(doc, e)}
                            className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 flex items-center ${doc.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                            <motion.div
                              animate={{ x: doc.is_active ? 20 : 0 }}
                              className="w-3 h-3 bg-white rounded-full shadow-sm flex items-center justify-center p-0.5"
                            >
                              {doc.is_active ? (
                                <Check size={8} strokeWidth={4} className="text-emerald-600" />
                              ) : (
                                <X size={8} strokeWidth={4} className="text-slate-400" />
                              )}
                            </motion.div>
                          </button>
                        </div>

                        {/* ACTION */}
                        <div className="text-right">
                          <button
                            onClick={() => setSelectedDoctor(doc)}
                            className="px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <Inbox size={48} className="opacity-10 mb-4" />
                      <p className="text-sm font-medium">No specialists registered yet</p>
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
