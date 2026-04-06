import React, { useState } from 'react';
import { X, Plus, Trash2, Loader2, Save, Stethoscope, Phone, Info, CalendarDays, CheckCircle2, Clock, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../api/axios';
import Input from './Input';
import Button from './Button';
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
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '21:00', label: '9:00 PM' },
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
      { day_of_week: 'MONDAY', start_time: '09:00', end_time: '17:00' }
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
    const currentRow = newSchedules[index];

    if (field === 'start_time') {
      currentRow.start_time = value;
      // If new start_time is >= current end_time, set end_time to next slot
      const startIndex = TIME_OPTIONS.findIndex(opt => opt.value === value);
      const endIndex = TIME_OPTIONS.findIndex(opt => opt.value === currentRow.end_time);

      if (startIndex >= endIndex) {
        const nextSlot = TIME_OPTIONS[startIndex + 1] || TIME_OPTIONS[startIndex];
        currentRow.end_time = nextSlot.value;
      }
    } else if (field === 'end_time') {
      const startIndex = TIME_OPTIONS.findIndex(opt => opt.value === currentRow.start_time);
      const endIndex = TIME_OPTIONS.findIndex(opt => opt.value === value);

      if (endIndex <= startIndex) {
        toast.warn('End time must be after start time');
        return;
      }
      currentRow.end_time = value;
    } else {
      currentRow[field] = value;
    }

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

      // ✅ FIXED PAYLOAD (NEW NESTED SCHEMA)
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
        schedules: [{ day_of_week: 'MONDAY', start_time: '09:00', end_time: '17:00' }]
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

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Primary Specialty</label>
                <div className="relative group/input">
                   <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none cursor-pointer hover:border-slate-300 transition-all duration-200"
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
                    className="group/toggle flex items-center justify-between w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 cursor-pointer hover:border-blue-200 transition-all"
                  >
                    <span className={`text-sm font-bold transition-colors ${formData.is_active ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {formData.is_active ? 'Active & Available' : 'Currently Offline'}
                    </span>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <motion.div
                        initial={false}
                        animate={{ x: formData.is_active ? 24 : 0 }}
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </div>
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
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-slate-300 transition-all duration-200 resize-none font-medium "
              />
            </div>

            {/* SECTION: SCHEDULES */}
            <div className="pt-0">
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
                        <div className="relative group/select">
                          <select
                            value={row.day_of_week}
                            onChange={(e) => handleScheduleChange(idx, 'day_of_week', e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm cursor-pointer appearance-none transition-all duration-200"
                          >
                            {DAYS.map(day => (
                              <option key={day.value} value={day.value}>{day.label}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 group-focus-within/select:text-blue-500 transition-colors">
                            <ChevronDown size={14} />
                          </div>
                        </div>
                      </div>

                      <div className="w-full sm:w-32">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Start Time</label>
                        <div className="relative">
                          <TimeSelect
                            value={row.start_time}
                            onChange={(val) => handleScheduleChange(idx, 'start_time', val)}
                            options={TIME_OPTIONS.slice(0, -1)}
                          />

                        </div>
                      </div>

                      <div className="w-full sm:w-32">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">End Time</label>
                        <div className="relative">
                          <TimeSelect
                            value={row.end_time}
                            onChange={(val) => handleScheduleChange(idx, 'end_time', val)}
                            options={TIME_OPTIONS.filter(opt => {
                              const startIndex = TIME_OPTIONS.findIndex(o => o.value === row.start_time);
                              const currentIndex = TIME_OPTIONS.findIndex(o => o.value === opt.value);
                              return currentIndex > startIndex;
                            })}
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
