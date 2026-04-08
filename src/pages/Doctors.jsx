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
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors(searchQuery, statusFilter);
  }, [statusFilter]);

  // Fetch fresh status when doctor is selected to ensure toggle is accurate
  useEffect(() => {
    if (selectedDoctor && selectedDoctor.doctor_id) {
      const fetchFreshStatus = async () => {
        try {
          const { data } = await API.get(`/doctor/${selectedDoctor.doctor_id}`);
          if (data && typeof data.is_active !== 'undefined') {
            setSelectedDoctor(prev => prev ? { ...prev, is_active: data.is_active } : null);
          }
        } catch (error) {
          console.error('Failed to fetch individual doctor status', error);
        }
      };
      fetchFreshStatus();
    }
  }, [selectedDoctor?.doctor_id]);

  const fetchDoctors = async (queryStr = '', status = 'all') => {
    try {
      setLoading(true);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = stored.clinic_id;

      let url = `/doctors/${clinicId}`;
      const params = new URLSearchParams();
      
      if (queryStr && queryStr.trim() !== '') {
        params.append('query', queryStr.trim());
      }
      
      if (status === 'active') {
        params.append('is_active', 'true');
      } else if (status === 'inactive') {
        params.append('is_active', 'false');
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
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
    
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'specialty') return (a.specialty || '').localeCompare(b.specialty || '');
      return 0;
    });

    return result;
  }, [doctors, sortBy]);

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
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                >
                  <span className="transition-transform group-hover:-translate-x-1">←</span>
                  Back to Dashboard
                </button>

                <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                  <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${selectedDoctor.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {selectedDoctor.is_active ? 'Active Specialist' : 'Inactive specialist'}
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        const newStatus = !selectedDoctor.is_active;
                        await API.patch(`/doctors/${selectedDoctor.doctor_id}`, { is_active: newStatus });
                        toast.success(`${selectedDoctor.name} is now ${newStatus ? 'Active' : 'Inactive'}`);
                        setSelectedDoctor({ ...selectedDoctor, is_active: newStatus });
                        fetchDoctors(searchQuery, statusFilter);
                      } catch (error) {
                        toast.error('Failed to update status');
                      }
                    }}
                    className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${selectedDoctor.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <motion.div
                      animate={{ x: selectedDoctor.is_active ? 20 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm flex items-center justify-center p-0.5"
                    >
                      {selectedDoctor.is_active ? (
                        <Check size={10} strokeWidth={4} className="text-emerald-600" />
                      ) : (
                        <X size={10} strokeWidth={4} className="text-slate-400" />
                      )}
                    </motion.div>
                  </button>
                </div>
              </div>
              
              <DoctorDetails
                doctorId={selectedDoctor.doctor_id}
                onDeleteSuccess={() => {
                  setSelectedDoctor(null);
                  fetchDoctors();
                }}
                onUpdateSuccess={() => fetchDoctors(searchQuery, statusFilter)}
                onLoad={(doctor) => {
                  if (selectedDoctor && doctor && doctor.is_active !== selectedDoctor.is_active) {
                    setSelectedDoctor(prev => prev ? { ...prev, is_active: doctor.is_active } : null);
                    // Also update the doctors list to keep it in sync
                    setDoctors(prev => prev.map(d => d.doctor_id === doctor.doctor_id ? { ...d, is_active: doctor.is_active } : d));
                  }
                }}
              />
            </div>
          ) : (
            <>
              {/* FILTERS */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative group flex-1 md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Search size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search doctors by name or specialty..."
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSearchQuery(val);
                        fetchDoctors(val, statusFilter);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Filter size={16} />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer min-w-[170px]"
                    >
                      <option value="all">All Specialists</option>
                      <option value="active">Only Active</option>
                      <option value="inactive">Only Inactive</option>
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
                <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 flex-shrink-0" />
                    <span>Doctor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-[14px] flex-shrink-0" />
                    <span>Contact</span>
                  </div>
                  <span>Specialty</span>
                  <span className="pl-10">Action</span>
                </div>

                <div className="divide-y divide-slate-50 relative">
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] px-8 py-5 items-center animate-pulse border-b border-slate-50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100" />
                          <div className="h-4 bg-slate-100 rounded-md w-32" />
                        </div>
                        <div className="h-4 bg-slate-50 rounded-md w-24" />
                        <div className="h-4 bg-slate-50 rounded-md w-32" />
                        <div className="h-8 bg-slate-100 rounded-lg w-24 justify-self-end" />
                      </div>
                    ))
                  ) : filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc) => (
                      <div
                        key={doc.doctor_id}
                        className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] px-8 py-5 items-center hover:bg-slate-50/80 transition-colors group border-b border-slate-200 last:border-0"
                      >
                        {/* DOCTOR */}
                        <div className="flex items-center gap-4 min-w-0 pr-4">
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
                        <div className="text-sm font-semibold text-slate-600 font-mono tracking-tight flex items-center gap-1.5">
                          <Phone size={14} className="opacity-40" />
                          {doc.phone || 'N/A'}
                        </div>

                        {/* SPECIALTY */}
                        <div>
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100/50 text-[10px] font-bold uppercase tracking-wider rounded-lg inline-block whitespace-nowrap">
                            {doc.specialty}
                          </span>
                        </div>

                        {/* ACTION */}
                        <div className="pl-4">
                          <button
                            onClick={() => setSelectedDoctor(doc)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center gap-1.5"
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
