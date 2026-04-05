import React, { useEffect, useState } from 'react';
import {
  Building2, Bell, Sparkles, Layout, Stethoscope
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
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
       // ✅ ONLY SHOW ACTIVE DOCTORS ON DASHBOARD
       const activeDoctors = doctorList.filter(d => d.is_active === true);
       setDoctors(activeDoctors);

       // Default to the first doctor if available
       if (activeDoctors.length > 0 && !selectedDoctorId) {
         setSelectedDoctorId(activeDoctors[0].doctor_id);
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
              <Sparkles size={16} className="text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </h1>
            </div>
            <p className="text-sm font-medium text-slate-500">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-6">



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
