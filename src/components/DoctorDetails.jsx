import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Stethoscope, Clock, Pencil, Trash2, CalendarDays, Loader2, XCircle, ArrowLeft, PackageOpen
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../api/axios';
import EditDoctorModal from './EditDoctorModal';

const DoctorDetails = ({ doctorId = null, onDeleteSuccess, onUpdateSuccess, onLoad }) => {
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Helper to convert 24h to AM/PM
  const formatTime = (time24) => {
    if (!time24) return '--:--';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    fetchData();
  }, [doctorId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: detailData } = await API.get(`/doctors/details/${doctorId}`);
      setDoctorInfo(detailData.doctor);
      setAvailability(detailData.availability);
      if (onLoad) onLoad(detailData.doctor);
      setError(null);
    } catch (err) {
      setError('Error loading doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = () => {
    fetchData(); // Refresh current detail view
    if (onUpdateSuccess) onUpdateSuccess(); // Notify parent to refresh list
  };



  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to deactivate and delete this doctor?")) return;
    try {
      await API.delete(`/doctors/${doctorInfo.id}`);
      toast.success('Doctor deleted successfully');
      onDeleteSuccess();
    } catch (err) {
      toast.error("Failed to delete doctor.");
    }
  };

  if (loading) {
    return (
      <div className="flex gap-6 animate-pulse p-4">
        <div className="w-80 h-96 bg-white rounded-2xl shadow-sm border border-slate-100" />
        <div className="flex-1 h-96 bg-white rounded-2xl shadow-sm border border-slate-100" />
      </div>
    );
  }

  if (error || !doctorInfo) {
    return (
      <div className="p-6 bg-white border border-rose-100 rounded-2xl text-rose-500 flex items-center gap-2 shadow-sm min-h-[400px] m-4">
        <XCircle /> {error || 'Doctor not found'}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-8 w-full items-start">
        {/* LEFT CARD - Profile Info */}
        <div className="w-full md:w-[350px] bg-white rounded-2xl shadow-sm p-8 flex flex-col shrink-0 border border-slate-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-6 bg-gradient-to-br from-slate-50 to-slate-100 border-4 border-white shadow-md relative flex items-center justify-center">
              {doctorInfo.dp_url && doctorInfo.dp_url.startsWith('http') ? (
                <img src={doctorInfo.dp_url} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <Stethoscope size={40} className="text-slate-300" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{doctorInfo.name}</h2>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-2 px-3 py-1 bg-blue-50 rounded-full inline-block">
              {doctorInfo.specialty}
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100/50">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Number</p>
              <p className="text-sm text-slate-700 font-bold tracking-tight">{doctorInfo.phone}</p>
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Clinical Expertise</p>
              <p className="text-sm text-slate-500 leading-relaxed italic border-l-4 border-slate-200 pl-4">
                {doctorInfo.description || 'No description provided.'}
              </p>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-3">
            <button 
              onClick={handleDelete} 
              className="px-4 py-3 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl hover:bg-rose-100 transition-all h-11 flex items-center justify-center"
              title="Delete Specialist"
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={() => setIsEditModalOpen(true)} 
              className="flex-1 py-3 bg-[#1E293B] text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all uppercase tracking-wider h-11"
            >
              <Pencil size={14} /> Edit profile
            </button>
          </div>
        </div>

        {/* RIGHT CARD - Allocated Shifts Only */}
        <div className="flex-1 w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
            <div className="p-8">
                  <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Clock size={20} />
                    </div>
                    Allocated Shifts
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Weekly availability and professional schedule</p>
                </div>
              </div>

              {availability?.weekly_schedule?.length > 0 ? (
                <div className="grid gap-6">
                  {availability.weekly_schedule.map((schedule, idx) => (
                    <div key={idx} className="flex flex-col gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:border-blue-100 transition-colors">
                      <h4 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em]">{schedule.day}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {schedule.slots.map((slot, sIdx) => (
                          <div key={sIdx} className="flex flex-col gap-1 p-3 bg-slate-50 border border-slate-100/50 rounded-xl group/slot hover:border-blue-200 transition-all">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available window</span>
                            <span className="text-sm font-bold text-slate-700 tracking-tight">
                              {formatTime(slot.start_time.substring(0, 5))} – {formatTime(slot.end_time.substring(0, 5))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20">
                  <div className="p-6 bg-slate-50 rounded-full mb-6">
                    <PackageOpen size={60} strokeWidth={1} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">No Shifts Assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditDoctorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        doctor={doctorInfo}
        availability={availability}
        onSuccess={handleUpdateSuccess}
        onDeleteSuccess={onDeleteSuccess}
      />
    </>
  );
};

export default DoctorDetails;
