import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Search, UserPlus, Plus 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import AddDoctorModal from '../components/AddDoctorModal';
import DoctorDetails from '../components/DoctorDetails';

/**
 * Doctors Management Page.
 * Displays a vertical list of horizontal specialist rows.
 * Optimizes space for deep specialist details and professional bios.
 */
const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = user.clinic_id;

      if (!clinicId) return;

      const { data } = await API.get(`/doctors/${clinicId}`);
      const doctorList = Array.isArray(data) ? data : (data.doctors || []);
      setDoctors(doctorList);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      const errorMessage = error.response?.data?.errorMessage || error.response?.data?.message || 'Failed to load doctors list';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const name = doc.name || '';
    const bio = doc.description || '';
    const specialty = doc.specialty || '';
    
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           specialty.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-3 mb-0.5">
              <div className="p-2 bg-blue-50 rounded-xl">
                 <Stethoscope size={20} className="text-blue-600" />
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Specialist Directory</h1>
            </div>
            <p className="text-xs font-medium text-slate-400 ml-12">Monitor your clinic's medical professionals and their operational availability</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-200 flex items-center gap-2.5 transition-all hover:bg-blue-700"
          >
            <UserPlus size={18} />
            Register Specialist
          </motion.button>
        </header>

        {/* SEARCH & FILTERS */}
        <div className="px-10 py-6 bg-white/40 border-b border-slate-100 flex gap-6 flex-shrink-0">
          <div className="relative group w-full md:w-[600px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search specialists by name, specialty, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-3xl pl-12 pr-6 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-sm"
            />
          </div>
          
          <div className="hidden md:flex items-center gap-3 px-6 py-2.5 bg-blue-50 text-blue-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border border-blue-100 h-full self-center">
            {filteredDoctors.length} Registered Practitioners
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1700px] mx-auto">
            {loading && doctors.length === 0 ? (
               <div className="space-y-6">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className="h-[140px] bg-white border border-slate-100 rounded-[32px] animate-pulse shadow-sm" />
                 ))}
               </div>
            ) : filteredDoctors.length > 0 ? (
              <div className="space-y-6 pb-12">
                <AnimatePresence mode="popLayout">
                  {filteredDoctors.map((doc, idx) => (
                    <div key={doc.doctor_id || doc.id || idx}>
                       {/* ROW-WISE HORIZONTAL CARD */}
                       <DoctorDetails 
                         doctorId={doc.doctor_id || doc.id || doc._id} 
                         onDeleteSuccess={fetchDoctors}
                       />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl mx-auto mt-20 bg-white border-2 border-dashed border-slate-200 rounded-[48px] p-24 flex flex-col items-center text-center shadow-sm"
              >
                <div className="w-28 h-28 bg-slate-50 rounded-[32px] flex items-center justify-center mb-8 shadow-inner">
                  <Stethoscope size={48} className="text-slate-300" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Expand Your Directory</h3>
                <p className="text-slate-500 font-medium max-w-sm mt-4 text-base leading-relaxed">
                  {searchQuery 
                    ? "We couldn't find any specialists matching your search query. Try clearing filters." 
                    : "Register your first clinic practitioner to begin coordinating patient bookings."}
                </p>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={searchQuery ? () => setSearchQuery('') : () => setIsModalOpen(true)}
                  className="mt-12 px-12 py-5 bg-blue-600 text-white rounded-[24px] text-lg font-black shadow-2xl shadow-blue-200 flex items-center gap-3 transition-all hover:bg-blue-700"
                >
                  {searchQuery ? "Clear Search" : <><Plus size={24} /> Add First Specialist</>}
                </motion.button>
              </motion.div>
            )}
          </div>
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
