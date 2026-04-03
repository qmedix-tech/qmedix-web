import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Stethoscope, Clock, Pencil, Trash2, CalendarDays, Loader2, XCircle, ArrowLeft, PackageOpen
} from 'lucide-react';
import API from '../api/axios';
import EditDoctorModal from './EditDoctorModal';

const DoctorDetails = ({ doctorId = null, onDeleteSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Schedule');

  useEffect(() => {
    fetchData();
  }, [doctorId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: detailData } = await API.get(`/doctors/details/${doctorId}`);
      setDoctorInfo(detailData.doctor);
      setAvailability(detailData.availability);
      setError(null);
    } catch (err) {
      setError('Error loading specialist');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to deactivate and delete this specialist?")) return;
    try {
      await API.delete(`/doctors/${doctorInfo.id}`);
      onDeleteSuccess();
    } catch (err) {
      alert("Failed to delete specialist.");
    }
  };

  if (loading) {
    return (
      <div className="flex gap-6 animate-pulse">
        <div className="w-80 h-96 bg-white rounded-2xl" />
        <div className="flex-1 h-96 bg-white rounded-2xl" />
      </div>
    );
  }

  if (error || !doctorInfo) {
    return (
      <div className="p-6 bg-white border border-rose-100 rounded-2xl text-rose-500 flex items-center gap-2 shadow-sm min-h-[400px]">
        <XCircle /> {error || 'Specialist not found'}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl items-start">
        {/* LEFT CARD */}
        <div className="w-full md:w-[340px] bg-white rounded-xl shadow-sm p-8 flex flex-col shrink-0 border border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <span className={`px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase rounded ${doctorInfo.status === 'ACTIVE' ? 'bg-[#34A853] text-white' : 'bg-[#EA4335] text-white'}`}>
               {doctorInfo.status || 'Offline'}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
             <div className="w-32 h-32 rounded-full overflow-hidden mb-6 bg-slate-100 border-4 border-slate-50 shadow-sm relative flex items-center justify-center">
                {doctorInfo.dp_url && doctorInfo.dp_url.startsWith('http') ? (
                   <img src={doctorInfo.dp_url} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                   <Stethoscope size={40} className="text-slate-300 absolute inset-0 m-auto" />
                )}
             </div>
             <h2 className="text-xl font-bold text-slate-800 tracking-tight">{doctorInfo.name}</h2>
             <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1.5">{doctorInfo.specialty}</p>
          </div>

          <div className="mt-12 space-y-6">
             <div>
               <p className="text-[13px] font-bold text-slate-800">Phone Number</p>
               <p className="text-sm text-slate-500 mt-1.5 font-mono">{doctorInfo.phone}</p>
             </div>
             <div>
               <p className="text-[13px] font-bold text-slate-800">Description</p>
               <p className="text-sm text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">{doctorInfo.description || 'No description provided.'}</p>
             </div>
          </div>

          <div className="mt-12 flex items-center justify-between gap-4">
             <button onClick={handleDelete} className="flex-1 py-3.5 bg-[#EAF7ED] text-[#D43425] font-bold text-xs rounded shadow-sm hover:bg-green-100 transition-colors tracking-wide">
               Deactivate
             </button>
             <button onClick={() => setIsEditModalOpen(true)} className="flex-1 py-3.5 bg-[#222E3C] text-white font-bold text-xs rounded shadow-sm flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors tracking-wide">
               <Pencil size={14} /> Edit Profile
             </button>
          </div>
        </div>

        {/* RIGHT CARD CONTAINER */}
        <div className="flex-1 w-full flex flex-col gap-5">
           {/* TOP NAV TABS */}
           <div className="bg-white rounded-xl shadow-sm px-8 py-1.5 flex items-center gap-8 border border-slate-100">
             <button
               className="py-3.5 font-bold text-sm tracking-wide border-b-2 transition-colors border-[#222E3C] text-[#222E3C]"
             >
               Weekly Schedule
             </button>
           </div>

           {/* MAIN TAB CONTENT */}
           <div className="bg-white rounded-xl shadow-sm p-10 flex-1 min-h-[500px] border border-slate-100">
                 <>
                  {/* Sub nav */}
                  <div className="flex items-center gap-8 mb-10 border-b border-slate-100">
                     <button className="text-sm font-bold tracking-wide text-[#222E3C] border-b-2 border-[#222E3C] pb-3 -mb-[2px]">
                       Allocated Shifts
                     </button>
                  </div>

                  {availability?.weekly_schedule?.length > 0 ? (
                     <div className="space-y-4 max-w-xl">
                       {availability.weekly_schedule.map((schedule, idx) => (
                         <div key={idx} className="flex items-center p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors rounded-lg">
                           <h4 className="font-bold text-sm text-[#222E3C] w-40 capitalize tracking-wide">{schedule.day.toLowerCase()}</h4>
                           <div className="flex-1 flex flex-wrap gap-2">
                             {schedule.slots.map((slot, sIdx) => (
                               <span key={sIdx} className="text-[13px] font-medium text-slate-500">
                                 {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                               </span>
                             ))}
                           </div>
                         </div>
                       ))}
                     </div>
                  ) : (
                     <div className="h-full flex flex-col items-center justify-center pt-24 pb-12">
                        <div className="relative mb-6">
                           <div className="text-[#FFC107] drop-shadow-[0_10px_20px_rgba(255,193,7,0.3)] opacity-90">
                             <PackageOpen size={100} strokeWidth={1} />
                           </div>
                           <div className="absolute inset-x-0 -bottom-6 h-4 bg-slate-200/50 blur-xl rounded-[100%]"></div>
                        </div>
                        <p className="text-slate-400 text-sm font-semibold tracking-wide">No Data</p>
                     </div>
                  )}
                 </>
           </div>
        </div>
      </div>

      <EditDoctorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        doctor={doctorInfo}
        availability={availability}
        onSuccess={fetchData}
        onDeleteSuccess={onDeleteSuccess}
      />
    </>
  );
};

export default DoctorDetails;
