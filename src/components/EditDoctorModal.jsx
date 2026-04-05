import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, Save, Stethoscope, Phone, Info, CalendarDays, CheckCircle2, Clock, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../api/axios';
import Input from './Input';
import Button from './Button';
import DoctorProfileUpload from './DoctorProfileUpload';
import TimeSelect from './TimeSelect';

const DAYS = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
];

const TIME_OPTIONS = [
  { value: '09:00', label: '09:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '01:00 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '17:00', label: '05:00 PM' },
  { value: '18:00', label: '06:00 PM' },
  { value: '19:00', label: '07:00 PM' },
  { value: '20:00', label: '08:00 PM' },
  { value: '21:00', label: '09:00 PM' },
];

/**
 * EditDoctorModal Component.
 * Dedicated component for updating specialist profiles.
 * Implements schedule mapping from backend ranges back to simplified form rows.
 * Uses PATCH /doctors/{doctor_id} for schema-compliant updates.
 */
const EditDoctorModal = ({ isOpen, onClose, onSuccess, onDeleteSuccess, doctor, availability }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
      const mappedSchedules = availability?.weekly_schedule?.map(s => {
        const firstSlot = s.slots?.[0] || {};
        return {
          day_of_week: s.day,
          start_time: firstSlot.start_time?.substring(0, 5) || '09:00',
          end_time: firstSlot.end_time?.substring(0, 5) || '17:00'
        };
      }) || [{ day_of_week: 'MONDAY', start_time: '09:00', end_time: '17:00' }];

      setFormData({
        name: doctor.name || '',
        phone: doctor.phone || '',
        specialty: doctor.specialty || '',
        description: doctor.description || '',
        is_active: doctor.status === 'ACTIVE',
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
        { day_of_week: 'MONDAY', start_time: '09:00', end_time: '17:00' }
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
    newSchedules[index][field] = value;
    setFormData(prev => ({ ...prev, schedules: newSchedules }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.specialty) {
      toast.error('Required fields are missing.');
      return;
    }

    setIsUpdating(true);
    try {
      // ✅ PATCH SCHEMA COMPLIANT PAYLOAD
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        specialty: formData.specialty.trim(),
        description: formData.description?.trim() || null,
        is_active: formData.is_active,
        availability: {
          weekly_schedule: formData.schedules.map(s => ({
            day: s.day_of_week,
            slots: [
              {
                start_time: s.start_time,
                end_time: s.end_time
              }
            ]
          }))
        }
      };

      await API.patch(`/doctors/${doctor.id}`, payload);

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
      setIsUpdating(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!doctor.id || !window.confirm('WARNING: Are you sure you want to permanently delete this specialist record? This action cannot be undone.')) return;

    setIsDeleting(true);
    try {
      await API.delete(`/doctors/${doctor.id}`);

      toast.success('Specialist record deleted successfully', {
        icon: <Trash2 className="text-rose-500" />
      });

      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
      const errorMessage = error.response?.data?.errorMessage || error.response?.data?.message || 'Failed to delete specialist.';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
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
                <p className="text-[10px] font-black text-slate-400 mt-0.5 uppercase tracking-widest leading-none">ID: {doctor.id}</p>
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
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">

            {/* PROFILE IMAGE UPLOAD */}
            <div className="flex justify-center pb-4 border-b border-slate-50">
              <DoctorProfileUpload
                doctorId={doctor.id}
                currentDpUrl={doctor.dp_url}
                onUpdateSuccess={onSuccess}
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">

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

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Primary Specialty</label>
                  <div className="relative group/input">
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select Specialty</option>
                      <option value="General Practice">General Practice</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Orthopedic">Orthopedic</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Gynecology">Gynecology</option>
                      <option value="ENT">ENT</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Dentistry">Dentistry</option>
                      <option value="Ophthalmology">Ophthalmology</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="Physiotherapy">Physiotherapy</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Operational Status</label>
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                    className="group/toggle flex items-center justify-between w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 cursor-pointer hover:border-blue-200 transition-all shadow-sm active:scale-[0.98] transition-transform"
                  >
                    <span className={`text-sm font-bold transition-colors ${formData.is_active ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {formData.is_active ? 'Active & Available' : 'Currently Offline'}
                    </span>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <motion.div
                        initial={false}
                        animate={{ x: formData.is_active ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="w-4 h-4 bg-white rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                      />
                    </div>
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
              <div className="pt-0">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner">
                      <CalendarDays size={20} />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mt-0.5">Schedule</h3>
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

                <div className="space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                  <AnimatePresence mode="popLayout">
                    {formData.schedules.map((row, idx) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={idx}
                        className="flex flex-col sm:flex-row items-end gap-6 p-6 bg-slate-50/50 border border-slate-100 rounded-[32px] relative group hover:bg-white hover:shadow-md transition-all duration-300"
                      >
                        <div className="w-full sm:flex-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Availability Day</label>
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
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Start Time</label>
                          <div className="relative">
                            <TimeSelect
                              value={row.start_time}
                              onChange={(val) => handleScheduleChange(idx, 'start_time', val)}
                              options={TIME_OPTIONS}
                            />
                          </div>
                        </div>

                        <div className="w-full sm:w-32">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">End Time</label>
                          <div className="relative">
                            <TimeSelect
                              value={row.end_time}
                              onChange={(val) => handleScheduleChange(idx, 'end_time', val)}
                              options={TIME_OPTIONS}
                            />
                          </div>
                        </div>

                        {formData.schedules.length > 1 && (
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: '#fee2e2' }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => removeScheduleRow(idx)}
                            className="p-2.5 text-rose-400 hover:text-rose-600 bg-white rounded-xl transition-all shadow-sm border border-slate-100 mb-0"
                          >
                            <Trash2 size={18} />
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
          </div>

          {/* FOOTER ACTIONS */}
          <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-w-[140px] py-4 border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-100 font-bold flex items-center justify-center gap-2"
              onClick={handleDeleteDoctor}
              loading={isDeleting}
              disabled={isUpdating}
              icon={Trash2}
            >
              Delete Specialist
            </Button>
            <div className="flex flex-1 gap-4 min-w-[300px]">
              <Button
                type="button"
                variant="outline"
                className="flex-1 py-4 border-slate-200 text-slate-500 font-bold"
                onClick={onClose}
                disabled={isUpdating || isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isUpdating}
                disabled={isDeleting}
                className="flex-[2] py-4 shadow-2xl shadow-blue-200"
                icon={Save}
                onClick={handleSubmit}
              >
                Save Profile Updates
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


export default EditDoctorModal;
