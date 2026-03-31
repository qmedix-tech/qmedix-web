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

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = user.clinic_id;

      if (!clinicId) {
        toast.error('Identity UID missing');
        return;
      }

      const { data } = await API.get(`/clinics/${clinicId}/patients`);
      const patientList = Array.isArray(data) ? data : (data.patients || data.data || []);
      setPatients(patientList);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast.error('Failed to load patients list');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const name = p.name || '';
    const phone = p.phone || '';
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

    const matchesName = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhone = phone.includes(searchQuery);
    const matchesDate = !dateFilter || formattedDate === dateFilter;

    return (matchesName || matchesPhone) && matchesDate;
  });

  return (
    <div className="min-h-screen flex bg-slate-50/50">
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
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="h-40 bg-white border border-slate-100 rounded-[32px] animate-pulse" />
                ))}
              </div>
            ) : filteredPatients.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10"
              >
                <AnimatePresence mode="popLayout">
                  {filteredPatients.map((patient, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={patient.id || idx}
                      className="group relative bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                          { (patient.patient_name || patient.name || 'P')[0]?.toUpperCase() }
                        </div>
                        {patient.token_number && (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Token</span>
                            <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                              #{patient.token_number}
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-[17px] font-black text-slate-900 tracking-tight mb-1 truncate">
                        {patient.patient_name || patient.name || 'Anonymous'}
                      </h3>
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Phone size={14} className="text-slate-300" />
                          <span className="text-xs font-bold tracking-tight">{patient.patient_phone || patient.phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <CalendarDays size={14} className="text-slate-300" />
                          <span className="text-[11px] font-medium">
                            Registered: {patient.created_at
                              ? new Date(patient.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : patient.date || "Unknown Date"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-1">
                           View Details <ChevronRight size={12} />
                         </span>
                         <motion.button whileHover={{ scale: 1.1 }} className="p-1.5 rounded-lg text-slate-300 hover:text-slate-600 transition-colors">
                           <MoreVertical size={16} />
                         </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-24 flex flex-col items-center text-center max-w-2xl mx-auto mt-10"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Inbox size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No Patient Records</h3>
                <p className="text-slate-500 font-medium max-w-xs mt-2">
                  {searchQuery || dateFilter 
                    ? "We couldn't find any patients matching your current filters." 
                    : "Your patient directory is currently empty. Start by adding your first patient."}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={searchQuery || dateFilter ? () => { setSearchQuery(''); setDateFilter(''); } : () => setIsPatientModalOpen(true)}
                  className="mt-8 btn-premium btn-primary gap-2 px-10"
                >
                  {searchQuery || dateFilter ? "Clear Filters" : "Register Patient"}
                </motion.button>
              </motion.div>
            )}
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
