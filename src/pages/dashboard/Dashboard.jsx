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
    <div className="min-h-screen flex bg-slate-50/50">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Layout size={16} className="text-blue-600" />
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Overview</h1>
            </div>
            <p className="text-xs font-medium text-slate-500">Welcome back, {user?.clinicName || "Clinic"}</p>
          </div>

          <div className="flex items-center gap-6">

            {/* STATUS TOGGLE */}
            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">Status</span>
                <span className={`text-[12px] font-bold leading-none ${clinicStatus ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {clinicStatus ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
              
              <button
                onClick={handleToggleStatus}
                disabled={isToggling}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 ${
                  clinicStatus ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-300'
                } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-4 h-4 bg-white rounded-full shadow-sm flex items-center justify-center pointer-events-none"
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
            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">{user?.clinicName || "Clinic"}</p>
                <p className="text-[10px] font-medium text-slate-500">{user?.email}</p>
              </div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-100 border-2 border-white"
              >
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </motion.div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar bg-slate-50/50">

          <div className="max-w-[1400px] mx-auto space-y-8">
            {/* HERO-ISH SECTION / DATE */}
            <div className="flex items-center justify-between">
              <div>
                 <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Today's Pulse</h2>
                <p className="text-sm font-medium text-slate-500">Real-time queue monitoring and analytics</p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* DOCTOR SELECTOR */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                    <Stethoscope size={14} />
                  </div>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none cursor-pointer hover:border-slate-300 transition-all shadow-sm min-w-[200px]"
                  >
                    <option value="">All Specialists</option>
                    {doctors.map(doc => (
                      <option key={doc.doctor_id} value={doc.doctor_id}>
                        {doc.name} ({doc.specialty})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Bell size={12} />
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <Sparkles size={14} className="text-blue-600" />
                  <span className="text-xs font-bold text-slate-700">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>
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
