import React, { useEffect, useState } from 'react';
import {
  Building2, Bell, Power, PowerOff, Sparkles, Layout, Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import ActiveQueue from './ActiveQueue';
import QueueStats from './QueueStats';
import NewPatientModal from '../../components/NewPatientModal';
import SpecialistSelect from '../../components/SpecialistSelect';
import API from '../../api/axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [clinicStatus, setClinicStatus] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchClinicData();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchDoctors(parsedUser.clinic_id);
    } else {
      navigate('/get-started');
    }
  }, [navigate]);

  const fetchDoctors = async (clinicId) => {
     if (!clinicId) return;
     try {
       const { data } = await API.get(`/doctors/${clinicId}`);
       const doctorList = Array.isArray(data) ? data : (data.doctors || []);
       setDoctors(doctorList);

       // Default to the first doctor if available
       if (doctorList.length > 0 && !selectedDoctorId) {
         setSelectedDoctorId(doctorList[0].doctor_id);
       }
     } catch (error) {
       console.error('Failed to fetch doctors:', error);
     }
  };

  const fetchClinicData = async () => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) return;
      const { clinic_id } = JSON.parse(stored);
      const { data: clincData } = await API.get(`/clinics/${clinic_id}`);

      const clinicName = clincData.name;
      const is_open = clincData.is_open;

      setClinicStatus(is_open);

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...storedUser,
        clinicName: clinicName
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to fetch clinic data:', error);
    }
  }

  const handleToggleStatus = async () => {
    if (!user?.clinic_id || isToggling) return;

    const newStatus = !clinicStatus;
    setIsToggling(true);

    try {
      await API.patch(`/clinics/${user.clinic_id}/status`, {
        is_open: newStatus
      });

      setClinicStatus(newStatus);
      toast.success(`Clinic is now ${newStatus ? 'OPEN' : 'CLOSED'}`, {
        icon: newStatus ? <Power className="text-emerald-500" /> : <PowerOff className="text-rose-500" />
      });
    } catch (error) {
      console.error('Failed to update clinic status:', error);
      toast.error('Failed to update clinic status');
    } finally {
      setIsToggling(false);
    }
  };

  const handleQueueUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#F4F7FE]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-24 bg-white/40 backdrop-blur-xl border-b border-white/60 px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Layout size={16} className="text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Overview</h1>
            </div>
            <p className="text-sm font-medium text-slate-500">Welcome back, {user?.clinicName || "Clinic"}</p>
          </div>

          <div className="flex items-center gap-6">

            {/* DATE */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-slate-200">
              <Sparkles size={12} className="text-blue-600" />
              <span className="text-[11px] font-bold text-slate-700">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* STATUS TOGGLE */}
            <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-full border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <div className="flex flex-col items-end justify-center h-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1.5">Status</span>
                <span className={`text-xs font-black leading-none ${clinicStatus ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {clinicStatus ? 'OPEN' : 'CLOSED'}
                </span>
              </div>

              <button
                onClick={handleToggleStatus}
                disabled={isToggling}
                className={`relative w-[52px] h-7 rounded-full transition-all duration-300 flex items-center px-1 ${
                  clinicStatus ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]' : 'bg-slate-200'
                } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center pointer-events-none"
                  style={{ x: clinicStatus ? 24 : 0 }}
                >
                  {isToggling ? (
                    <div className="w-2 h-2 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    clinicStatus ? <Power size={10} className="text-emerald-600" /> : <PowerOff size={10} className="text-slate-400" />
                  )}
                </motion.div>
              </button>
            </div>

            {/* USER PROFILE */}
            <div className="flex items-center gap-4 pl-8 border-l border-slate-200/60">
              <div className="text-right hidden sm:block">
                <p className="text-[15px] font-bold text-slate-900 leading-tight">{user?.clinicName || "Clinic"}</p>
                <p className="text-[11px] font-medium text-slate-400">{user?.email}</p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-11 h-11 bg-[#0ea5e9] text-white rounded-2xl flex items-center justify-center text-[15px] font-bold shadow-[0_8px_20px_rgba(14,165,233,0.3)] border-2 border-white"
              >
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </motion.div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 p-5 md:p-6 space-y-5 overflow-y-auto custom-scrollbar">

          <div className="max-w-[1200px] mx-auto space-y-5">
            {/* HERO-ISH SECTION / DATE */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm overflow-hidden relative group/avatar">
                  {doctors.find(d => d.doctor_id === selectedDoctorId)?.dp_url ? (
                    <img
                      src={doctors.find(d => d.doctor_id === selectedDoctorId).dp_url}
                      alt="Specialist"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                    />
                  ) : (
                    <Stethoscope size={22} className="text-slate-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight mb-0">Today's Pulse</h2>
                  <p className="text-[13px] font-medium text-slate-500">
                    {selectedDoctorId
                      ? `Monitoring queue for ${doctors.find(d => d.doctor_id === selectedDoctorId)?.name || 'Specialist'}`
                      : 'Real-time queue monitoring and analytics'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* DOCTOR SELECTOR */}
                <SpecialistSelect
                  doctors={doctors}
                  selectedId={selectedDoctorId}
                  onSelect={setSelectedDoctorId}
                />
              </div>
            </div>

            {/* QUEUE STATS (TOP) */}
            <QueueStats
              clinicId={user.clinic_id}
              doctorId={selectedDoctorId}
              refreshTrigger={refreshTrigger}
              onAction={handleQueueUpdate}
            />

            {/* ACTIVE QUEUE (BOTTOM) */}
            <ActiveQueue
              doctorId={selectedDoctorId}
              onNewPatient={() => setIsPatientModalOpen(true)}
              onQueueUpdate={handleQueueUpdate}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </main>

      {/* MODAL */}
      <NewPatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
};

export default Dashboard;
