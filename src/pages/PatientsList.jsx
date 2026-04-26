import React, { useState, useEffect } from 'react';
import {
  Users2, Search, Filter, Phone, Calendar,
  Loader2, UserPlus, Inbox, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../api/axios';
import Button from '../components/Button';
import Sidebar from '../components/Sidebar';
import NewPatientModal from '../components/NewPatientModal';
import PatientDetails from '../components/PatientDetails';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [preFillData, setPreFillData] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchPatients(searchQuery);
      } else if (searchQuery.length === 0) {
        fetchPatients();
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = user.clinic_id;

      if (!clinicId) return;

      const { data } = await API.get(`/clinics/${clinicId}/patients`);
      const patientList = Array.isArray(data) ? data : (data.patients || data.data || []);
      setPatients(patientList);
    } catch (error) {
      toast.error(error.response?.data?.errorMessage || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async (query) => {
    try {
      setLoading(true);
      const { data } = await API.get('/patients/search', { params: { query } });
      const patientList = Array.isArray(data) ? data : (data.patients || data.data || []);
      setPatients(patientList);
    } catch (error) {
      toast.error(error.response?.data?.errorMessage || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const rawDate = p.created_at;
    let formattedDate = '';

    if (rawDate) {
      try {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString().split('T')[0];
        } else {
          formattedDate = String(rawDate).split(' ')[0];
        }
      } catch (e) {
        formattedDate = '';
      }
    }

    return !dateFilter || formattedDate === dateFilter;
  });

  return (
    <div className="min-h-screen flex bg-[#F4F7FE]">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Users2 size={16} className="text-blue-600" />
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Patient Directory</h1>
            </div>
            <p className="text-xs font-medium text-slate-500">Access and manage all patient records</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setPreFillData(null);
              setIsPatientModalOpen(true);
            }}
            className="btn-premium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center gap-2 shadow-lg shadow-blue-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
          >
            <UserPlus size={18} />
            Register New Patient
          </motion.button>
        </header>

        {/* TOOLS / FILTERS */}
        <div className="px-8 py-6 bg-white/40 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* SEARCH */}
            <div className="relative group flex-1 md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* DATE PICKER */}
            <div className="relative group hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Filter size={16} />
              </div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 shadow-sm cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
              {filteredPatients.length} Records Found
            </div>
            {(searchQuery || dateFilter) && (
              <button
                onClick={() => { setSearchQuery(''); setDateFilter(''); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 border border-transparent hover:border-rose-100"
              >
                <X size={14} />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full">
            {false ? (
              <PatientDetails patient={null} onBack={() => {}} />
            ) : (
              /* TABLE VIEW */
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {/* HEADER */}
                <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 bg-slate-50/50 items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 flex-shrink-0" />
                    <span>Patient</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-[14px] flex-shrink-0" />
                    <span>Contact</span>
                  </div>
                  <span>Registered</span>
                  <span className="pl-10">Action</span>
                </div>

                {/* BODY */}
                <div className="relative">
                  {loading && (
                    <div className="divide-y divide-slate-100">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] px-8 py-5 items-center relative overflow-hidden">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl animate-shimmer shrink-0" />
                            <div className="h-4 w-32 rounded-md animate-shimmer" />
                          </div>
                          <div className="h-4 w-24 rounded-md animate-shimmer" />
                          <div className="h-4 w-28 rounded-md animate-shimmer" />
                          <div className="pl-6">
                            <div className="h-8 w-24 rounded-lg animate-shimmer" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!loading && filteredPatients.map((patient) => (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={patient.id || patient.patient_id || Math.random()}
                      className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] px-8 py-5 items-center hover:bg-slate-50/80 transition-colors group border-b border-slate-200 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-slate-100 shadow-sm group-hover:bg-[#1E293B] group-hover:text-white transition-all">
                          {patient.dp_url ? (
                            <img
                              src={patient.dp_url}
                              alt="Patient"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[#1E293B] font-bold text-base group-hover:text-white">
                              {(patient.patient_name || patient.name || 'P')[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 pr-4">
                          <p className="font-bold text-slate-900 truncate">{patient.patient_name || patient.name || 'Anonymous'}</p>
                        </div>
                      </div>

                      <div className="text-sm font-semibold text-slate-600 font-mono tracking-tight flex items-center gap-1.5">
                        <Phone size={14} className="opacity-40" />
                        {patient.patient_phone || patient.phone || 'N/A'}
                      </div>

                      <span className="text-sm font-medium text-slate-500">
                        {patient.created_at
                          ? new Date(patient.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : patient.date || "Unknown"}
                      </span>

                      <div className="pl-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreFillData(patient);
                            setIsPatientModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm inline-flex items-center gap-1.5"
                        >
                          <Calendar size={14} />
                          Book Again
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {filteredPatients.length === 0 && !loading && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[400px] py-16">
                      <Inbox size={48} className="mb-4 opacity-20" />
                      <p className="text-sm font-medium">No patients found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        <NewPatientModal
          isOpen={isPatientModalOpen}
          onClose={() => {
            setIsPatientModalOpen(false);
            setPreFillData(null);
          }}
          initialData={preFillData}
          onSuccess={fetchPatients}
        />
      </main>
    </div>
  );
};

export default PatientsList;
