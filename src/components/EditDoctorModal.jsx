import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, Save, Stethoscope, Phone, Info, CalendarDays, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../api/axios';
import Input from './Input';
import Button from './Button';

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

/**
 * EditDoctorModal Component.
 * Dedicated component for updating specialist profiles.
 * Implements schedule mapping from backend ranges back to simplified form rows.
 * Uses PATCH /doctors/{doctor_id} for schema-compliant updates.
 */
const EditDoctorModal = ({ isOpen, onClose, onSuccess, doctor }) => {
  console.log(doctor);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialty: '',
    description: '',
    is_active: true,
    schedules: []
  });

  // INITIALIZE FORM DATA FROM PROP
  useEffect(() => {
    if (isOpen && doctor) {
      // Map backend schedules (with ranges) to local form format (linear rows)
      const mappedSchedules = doctor.schedules?.map(s => {
        const range = s.ranges?.[0] || {};
        return {
          day_of_week: s.day_of_week,
          start_time: range.start?.substring(0, 5) || '09:00',
          end_time: range.end?.substring(0, 5) || '17:00'
        };
      }) || [{ day_of_week: 0, start_time: '09:00', end_time: '17:00' }];

      setFormData({
        name: doctor.name || '',
        phone: doctor.phone || '',
        specialty: doctor.specialty || '',
        description: doctor.description || '',
        is_active: doctor.is_active !== false,
        schedules: mappedSchedules
      });
    }
  }, [isOpen, doctor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && value !== '' && !/^\d+$/.test(value)) return;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'is_active' ? value === 'true' : value
    }));
  };

  const addScheduleRow = () => {
    setFormData(prev => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        { day_of_week: 0, start_time: '09:00', end_time: '17:00' }
      ]
    }));
  };

  const removeScheduleRow = (index) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index)
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedules = [...formData.schedules];
    newSchedules[index][field] = field === 'day_of_week' ? parseInt(value) : value;
    setFormData(prev => ({ ...prev, schedules: newSchedules }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.specialty) {
      toast.error('Required fields are missing.');
      return;
    }

    setLoading(true);
    try {
      // ✅ PATCH SCHEMA COMPLIANT PAYLOAD
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        specialty: formData.specialty.trim(),
        description: formData.description?.trim() || null,
        is_active: formData.is_active,
        schedules: formData.schedules.map(s => ({
          day_of_week: Number(s.day_of_week),
          ranges: [
            {
              start: s.start_time,
              end: s.end_time
            }
          ]
        }))
      };

      await API.patch(`/doctors/${doctor.doctor_id}`, payload);

      toast.success('Specialist profile updated!', {
        icon: <CheckCircle2 className="text-emerald-500" />
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Update failed:', error);
      const errorMessage = error.response?.data?.errorMessage || error.response?.data?.message || 'Failed to update specialist profile.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
        >
          {/* HEADER ACCENT */}
          <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />

          {/* HEADER */}
          <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                <Stethoscope size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Edit Specialist Profile</h2>
                <p className="text-[10px] font-black text-slate-400 mt-0.5 uppercase tracking-widest leading-none">ID: {doctor.doctor_id}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={24} />
            </motion.button>
          </div>

          {/* FORM BODY */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">

            {/* IDENTITY SECTION */}
            <div className="grid md:grid-cols-2 gap-8">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Dr. Name"
                required
              />

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Phone size={18} />
                  </div>
                  <div className="absolute inset-y-0 left-11 flex items-center">
                    <span className="text-sm font-bold text-slate-400 border-r border-slate-200 pr-2 mr-2 leading-none">
                      +91
                    </span>
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-[88px] pr-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <Input
                label="Primary Specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleInputChange}
                placeholder="e.g. Pediatrics"
                required
              />

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Operational Status</label>
                <div className="relative group/input">
                   <select
                    name="is_active"
                    value={formData.is_active.toString()}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="true">Active & Available</option>
                    <option value="false">Inactive / Offline</option>
                  </select>
                </div>
              </div>
            </div>

            {/* BIO SECTION */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Overview</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Modify qualifications or focus areas..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none italic"
              />
            </div>

            {/* SCHEDULE SECTION */}
            <div className="pt-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner">
                     <CalendarDays size={20} />
                   </div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mt-0.5">Duty Rotation</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={addScheduleRow}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100"
                >
                  <Plus size={14} />
                  Add Time Slot
                </motion.button>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {formData.schedules.map((row, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={idx}
                      className="flex flex-col sm:flex-row items-end gap-4 p-6 bg-slate-50/50 border border-slate-100 rounded-[32px] relative group hover:bg-white hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-full sm:flex-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Week Day</label>
                        <select
                          value={row.day_of_week}
                          onChange={(e) => handleScheduleChange(idx, 'day_of_week', e.target.value)}
                          className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm cursor-pointer"
                        >
                          {DAYS.map(day => (
                            <option key={day.value} value={day.value}>{day.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full sm:w-32">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Start</label>
                        <div className="relative">
                           <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                           <input
                            type="time"
                            value={row.start_time}
                            onChange={(e) => handleScheduleChange(idx, 'start_time', e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-xl pl-9 pr-3 py-2.5 text-xs font-black text-slate-700 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="w-full sm:w-32">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">End</label>
                        <div className="relative">
                           <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                           <input
                            type="time"
                            value={row.end_time}
                            onChange={(e) => handleScheduleChange(idx, 'end_time', e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-xl pl-9 pr-3 py-2.5 text-xs font-black text-slate-700 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm"
                          />
                        </div>
                      </div>

                      {formData.schedules.length > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: '#fee2e2' }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeScheduleRow(idx)}
                          className="p-2.5 text-rose-400 bg-white rounded-xl shadow-sm border border-slate-100"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-8 flex items-center gap-3 py-5 px-8 bg-blue-50/50 border border-blue-100 rounded-[32px] mb-6">
                 <Sparkles size={20} className="text-blue-500 shrink-0" />
                 <p className="text-xs font-bold text-blue-700 leading-tight italic">
                   Updating duty schedules will automatically sync with the patient booking portal, providing real-time availability for appointments.
                 </p>
              </div>
            </div>
          </form>

          {/* FOOTER ACTIONS */}
          <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 py-4 border-slate-200 text-slate-500 font-bold"
              onClick={onClose}
            >
              Cancel Changes
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1 py-4 shadow-2xl shadow-blue-200"
              icon={Save}
              onClick={handleSubmit}
            >
              Save Profile Updates
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditDoctorModal;
