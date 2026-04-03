import React, { useState, useEffect } from 'react';
import {
  Users2, Search, Filter, Phone, Calendar, ArrowRight,
  Loader2, MoreVertical, CreditCard, UserPlus, ChevronRight, Sparkles, Inbox, X, CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../api/axios';
import Button from '../components/Button';
import Sidebar from '../components/Sidebar';
import NewPatientModal from '../components/NewPatientModal';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

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
      toast.error('Failed to load patients');
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
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    // We remove client-side text filtering because API handles it, but keep date filtering.
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
            onClick={() => setIsPatientModalOpen(true)}
            className="btn-premium btn-primary flex items-center gap-2 shadow-lg shadow-blue-100"
          >
            <UserPlus size={18} />
            Register New Patient
          </motion.button>
        </header>

        {/* TOOLS / FILTERS */}
        <div className="px-8 py-6 bg-white/40 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* SEARCH */}
            <div className="relative group flex-1 md:w-80 lg:w-96">
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
                className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
               >
                 Clear Filters
               </button>
             )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            {/* TABLE VIEW */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              {/* HEADER */}
              <div className="grid grid-cols-5 px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
                <span className="col-span-2">Patient</span>
                <span>Contact</span>
                <span>Registered</span>
                <span>Status</span>
              </div>

              {/* BODY */}
              <div className="divide-y divide-slate-50 relative min-h-[200px]">
                {loading && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                     <Loader2 className="animate-spin text-blue-500" size={32} />
                  </div>
                )}
                
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id || patient.patient_id || Math.random()}
                    className="grid grid-cols-5 px-8 py-5 items-center hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <div className="col-span-2 flex items-center gap-4">
                      <div className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-[#1E293B] font-bold text-base bg-white border border-slate-100 shadow-sm group-hover:bg-[#1E293B] group-hover:text-white transition-all">
                        { (patient.patient_name || patient.name || 'P')[0]?.toUpperCase() }
                      </div>
                      <div className="min-w-0 pr-4">
                         <p className="font-bold text-slate-900 truncate">{patient.patient_name || patient.name || 'Anonymous'}</p>
                      </div>
                    </div>

                    <span className="text-sm font-semibold text-slate-600 font-mono tracking-tight">{patient.patient_phone || patient.phone || 'N/A'}</span>
                    
                    <span className="text-sm font-medium text-slate-500">
                      {patient.created_at
                         ? new Date(patient.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                         : patient.date || "Unknown"}
                    </span>

                    <div>
                      {patient.token_number ? (
                         <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100/50 text-[10px] font-bold uppercase tracking-wider rounded-lg inline-block">
                           Token #{patient.token_number}
                         </span>
                      ) : (
                         <span className="px-3 py-1 bg-slate-50 text-slate-400 border border-slate-100 text-[10px] font-bold uppercase tracking-wider rounded-lg inline-block">
                           No Token
                         </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredPatients.length === 0 && !loading && (
                  <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">No patients found</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <NewPatientModal
          isOpen={isPatientModalOpen}
          onClose={() => setIsPatientModalOpen(false)}
          onSuccess={fetchPatients}
        />
      </main>
    </div>
  );
};

export default PatientsList;
