import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Phone, CalendarDays, Clock,
  Info, Loader2, CheckCircle2, XCircle,
  ArrowRight, Hash, Globe, Building2, Pencil
} from 'lucide-react';
import API from '../api/axios';
import EditDoctorModal from './EditDoctorModal';

const DAYS_NAME = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

/**
 * DoctorDetails Component.
 * Horizontal Row Specialists Profile.
 * Receives 'doctorId' as a prop or auto-discovers the first doctor record.
 * Layout: Left (Identity) | Middle (Bio/Contact) | Right (Schedules)
 */
const DoctorDetails = ({ doctorId = null, onDeleteSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [doctorId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let targetDoctorId = doctorId;

      if (!targetDoctorId) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const clinicId = user.clinic_id;

        if (!clinicId) {
          throw new Error("Login context required.");
        }

        const { data: listData } = await API.get(`/doctors/${clinicId}`);
        const doctorList = Array.isArray(listData) ? listData : (listData.doctors || []);

        if (doctorList.length === 0) {
          setDoctor(null);
          setLoading(false);
          return;
        }

        targetDoctorId = doctorList[0].doctor_id;
      }

      const { data: detailData } = await API.get(`/doctors/details/${targetDoctorId}`);
      setDoctor(detailData);

    } catch (err) {
      console.error('Fetch failed:', err);
      const errorMessage = err.response?.data?.errorMessage || err.response?.data?.message || err.message || 'Error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col lg:flex-row items-center gap-10 shadow-sm animate-pulse min-h-[140px]">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="w-48 h-4 bg-slate-50 rounded-full" />
          <div className="w-full h-3 bg-slate-50/50 rounded-full" />
        </div>
        <div className="w-64 h-10 bg-slate-50 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-[32px] border border-rose-100 p-6 flex items-center justify-between shadow-sm min-h-[140px]">
        <div className="flex items-center gap-4 text-rose-500 font-bold text-sm">
          <XCircle size={20} />
          <span>Error loading specialist: {error}</span>
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all">Retry</button>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-[32px] border border-slate-100 shadow-[0_10px_35px_-15px_rgba(37,99,235,0.06)] hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 flex flex-col lg:flex-row items-stretch group overflow-hidden border-l-4 border-l-blue-600"
    >
      {/* SECTION: IDENTITY (LEFT) */}
      <div className="p-6 lg:p-8 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-slate-50 lg:w-[320px] shrink-0 bg-slate-50/20">
        <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 overflow-hidden">
          {doctor.dp_url ? (
            <img
              src={doctor.dp_url}
              alt={doctor.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <Stethoscope size={32} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 whitespace-nowrap">
            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none truncate">{doctor.name}</h2>
            <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border shrink-0 ${doctor.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
              {doctor.is_active ? 'Active' : 'Offline'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-100 inline-block">
              {doctor.specialty}
            </p>
            <motion.button
              whileHover={{ scale: 1.1, color: '#2563eb' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 px-2 py-0.5 rounded-lg hover:border-blue-200 transition-all bg-white shadow-sm"
            >
              <Pencil size={10} />
              Edit Profile
            </motion.button>
          </div>
        </div>
      </div>

      {/* SECTION: BIO & CONTACT (MIDDLE) */}
      <div className="p-6 lg:p-8 flex flex-col md:flex-row gap-8 flex-1 justify-center">

        {/* BIO SNIPPET */}
        <div className="flex-1 space-y-2">
           <div className="flex items-center gap-2 px-1">
              <Info size={14} className="text-blue-500" />
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mt-0.5">Professional Summary</h3>
           </div>
           <p className="text-[11px] font-medium text-slate-500 leading-relaxed line-clamp-2 italic px-1">
            {doctor.description || "Dedicated medical professional committed to excellence in patient-centric consultation and coordinated clinic operations."}
           </p>
        </div>

        {/* METADATA LIST */}
        <div className="flex flex-col gap-3 justify-center border-l border-slate-50 pl-8 shrink-0 min-w-[180px]">
           <div className="flex items-center gap-3 group/meta">
             <Phone size={14} className="text-blue-500 opacity-40 group-hover/meta:opacity-100 transition-opacity" />
             <div>
               <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-0.5">Contact</p>
               <p className="text-xs font-black text-slate-700 tracking-tighter font-mono">+91 {doctor.phone}</p>
             </div>
           </div>
           <div className="flex items-center gap-3 group/meta">
             <CalendarDays size={14} className="text-purple-500 opacity-40 group-hover/meta:opacity-100 transition-opacity" />
             <div>
               <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-0.5">Joined</p>
               <p className="text-xs font-black text-slate-700 tracking-tighter font-mono">
                 {doctor.created_at ? new Date(doctor.created_at).toLocaleDateString() : 'N/A'}
               </p>
             </div>
           </div>
        </div>
      </div>

      {/* SECTION: DUTY GRID (RIGHT) */}
      <div className="p-6 lg:p-8 bg-slate-50/40 border-t lg:border-t-0 lg:border-l border-slate-50 lg:w-[360px] shrink-0 flex flex-col justify-center">
         <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
               <Clock size={14} className="text-indigo-500" />
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mt-0.5">Duty Rotation</h3>
            </div>
            <span className="text-[9px] font-black text-slate-300 italic opacity-60">ID: {doctor.doctor_id?.substring(0, 8) || 'N/A'}</span>
         </div>

         <div className="flex flex-wrap gap-2">
            {doctor.schedules && doctor.schedules.length > 0 ? doctor.schedules.map((schedule, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-100 px-3 py-2 rounded-xl flex items-center gap-3 shadow-sm hover:border-blue-100 transition-colors"
                title={`${DAYS_NAME[schedule.day_of_week]}: ${schedule.start_time?.substring(0, 5)} - ${schedule.end_time?.substring(0, 5)}`}
              >
                <span className="text-[9px] font-black text-blue-600 uppercase w-7">{DAYS_NAME[schedule.day_of_week]?.substring(0, 3)}</span>
                <span className="text-[10px] font-black text-slate-400 opacity-70">{schedule.start_time?.substring(0, 5)}</span>
              </div>
            )) : (
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic ml-1">No shifts scheduled</p>
            )}
         </div>
      </div>

      <EditDoctorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        doctor={doctor}
        onSuccess={fetchData}
        onDeleteSuccess={onDeleteSuccess}
      />

      {/* VERTICAL STATUS ACCENT (HOVER ONLY) */}
      <div className="absolute right-0 inset-y-0 w-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

export default DoctorDetails;
