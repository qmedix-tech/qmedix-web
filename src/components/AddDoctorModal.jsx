import React, { useState } from 'react';
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

const AddDoctorModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialty: '',
    description: '',
    is_active: true,
    schedules: [
      { day_of_week: 0, start_time: '09:00', end_time: '17:00' }
    ]
  });

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
      toast.error('Please fill in required fields');
      return;
    }

    if (formData.phone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = user.clinic_id;

      if (!clinicId) {
        toast.error('Clinic context missing');
        return;
      }

      // ✅ FIXED PAYLOAD (SCHEMA COMPLIANT)
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

      await API.post(`/doctors/${clinicId}`, payload);

      toast.success('Doctor registered successfully!', {
        icon: <CheckCircle2 className="text-emerald-500" />
      });

      onSuccess();
      onClose();

      // reset
      setFormData({
        name: '',
        phone: '',
        specialty: '',
        description: '',
        is_active: true,
        schedules: [{ day_of_week: 0, start_time: '09:00', end_time: '17:00' }]
      });

    } catch (error) {
      console.error('Failed to add doctor:', error);
      const errorMessage =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        'Failed to register doctor.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
        >
          {/* TOP ACCENT */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

          {/* HEADER */}
          <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                <Stethoscope size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Register Specialist</h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5 uppercase tracking-widest">Adding to clinic database</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2.5 rounded-xl transition-all text-slate-400 hover:text-slate-900"
            >
              <X size={24} />
            </motion.button>
          </div>

          {/* FORM BODY */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
            {/* SECTION: IDENTITY */}
            <div className="grid md:grid-cols-2 gap-8">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Dr. Sarah Jenkins"
                required
              />

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-500 transition-colors">
                    <Phone size={18} />
                  </div>
                  <div className="absolute inset-y-0 left-11 flex items-center pointer-events-none">
                    <span className="text-sm font-bold text-slate-400 border-r border-slate-200 pr-2 mr-2 leading-none">
                      +91
                    </span>
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-[88px] pr-4 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
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
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <div className="relative group/input">
                   <select
                    name="is_active"
                    value={formData.is_active.toString()}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none cursor-pointer hover:border-slate-300 transition-all duration-200"
                  >
                    <option value="true">Active & Ready</option>
                    <option value="false">Currently Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Overview</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Mention qualifications, expertise, and focus areas..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-slate-300 transition-all duration-200 resize-none font-medium italic"
              />
            </div>

            {/* SECTION: SCHEDULES */}
            <div className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner">
                     <CalendarDays size={20} />
                   </div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Duty Rotation</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={addScheduleRow}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-colors border border-blue-100 shadow-sm"
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
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={idx}
                      className="flex flex-col sm:flex-row items-end gap-4 p-5 bg-slate-50 border border-slate-100 rounded-3xl relative group"
                    >
                      <div className="w-full sm:flex-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Availability Day</label>
                        <select
                          value={row.day_of_week}
                          onChange={(e) => handleScheduleChange(idx, 'day_of_week', e.target.value)}
                          className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm cursor-pointer"
                        >
                          {DAYS.map(day => (
                            <option key={day.value} value={day.value}>{day.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full sm:w-32">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Start Time</label>
                        <div className="relative">
                           <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                           <input
                            type="time"
                            value={row.start_time}
                            onChange={(e) => handleScheduleChange(idx, 'start_time', e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="w-full sm:w-32">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">End Time</label>
                        <div className="relative">
                           <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                           <input
                            type="time"
                            value={row.end_time}
                            onChange={(e) => handleScheduleChange(idx, 'end_time', e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm cursor-pointer"
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

              <div className="mt-6 flex items-center gap-3 py-4 px-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
                 <Sparkles size={18} className="text-blue-500 shrink-0" />
                 <p className="text-[11px] font-medium text-blue-700 leading-tight">
                   Adding schedules helps patients know when specific specialists are available, improving clinic transparency and reducing wait-time queries.
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
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1 py-4 shadow-2xl shadow-blue-200"
              icon={Save}
              onClick={handleSubmit}
            >
              Complete Registration
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddDoctorModal;
