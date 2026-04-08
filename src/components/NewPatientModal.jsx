import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Calendar, Loader2, CheckCircle2, UserPlus, Sparkles, Stethoscope, Clock, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../api/axios';
import Input from './Input';
import Button from './Button';

const NewPatientModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);

  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    doctor_id: '',
    date: new Date().toISOString().split('T')[0],
    slot_start: '',
    slot_end: '',
  });

  // Helper to convert 24h to AM/PM
  const formatTime = (time24) => {
    if (!time24) return '--:--';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const [doctorSchedule, setDoctorSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.doctor_id && isOpen) {
      fetchDoctorSchedule(formData.doctor_id);
    }
  }, [formData.doctor_id, isOpen]);

  const fetchDoctorSchedule = async (doctorId) => {
    if (!doctorId) return;
    try {
      setScheduleLoading(true);
      const { data } = await API.get(`/doctors/details/${doctorId}`);
      setDoctorSchedule(data.availability?.weekly_schedule || []);
    } catch (e) {
      console.error('Failed to load schedule:', e);
      setDoctorSchedule([]);
    } finally {
      setScheduleLoading(false);
    }
  };

  const getDaySlots = () => {
    if (!formData.date || !doctorSchedule.length) return [];

    // Convert YYYY-MM-DD safely into a Day string
    const [year, month, day] = formData.date.split('-');
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

    const schedule = doctorSchedule.find(s => s.day === dayOfWeek);
    const slots = schedule?.slots || [];

    // 🔥 Filter if booking date is TODAY: Only show future slots
    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.date === todayStr) {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      return slots.filter(slot => slot.start_time.substring(0, 5) >= currentHHMM);
    }

    return slots;
  };

  const availableSlots = getDaySlots();

  useEffect(() => {
    // Auto-select first slot when date/schedule changes
    if (availableSlots.length > 0) {
      const firstSlot = availableSlots[0];
      setFormData(prev => ({
        ...prev,
        slot_start: firstSlot.start_time.substring(0, 5),
        slot_end: firstSlot.end_time.substring(0, 5)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        slot_start: '',
        slot_end: ''
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.date, doctorSchedule]);

  const fetchDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = user.clinic_id;

      if (!clinicId) return;

      const { data } = await API.get(`/doctors/${clinicId}`);

      const doctorList = Array.isArray(data) ? data : (data.doctors || []);

      // ✅ Only keep active doctors (safe UX)
      const activeDoctors = doctorList.filter(d => d.is_active !== false);

      setDoctors(activeDoctors);

      // ✅ Auto select first doctor safely
      if (activeDoctors.length > 0) {
        setFormData(prev => ({
          ...prev,
          doctor_id: activeDoctors[0].doctor_id
        }));
      }

    } catch (error) {
      console.error('Failed to fetch specialists:', error);
      toast.error('Could not load doctor list');
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'patient_phone' && value !== '' && !/^\d+$/.test(value)) return;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // ✅ Validation
    if (!formData.patient_name || !formData.patient_phone || !formData.doctor_id) {
      toast.error('Please fill in all details including specialist selection');
      return;
    }

    if (formData.patient_phone.length !== 10) {
      toast.warning('Phone number must be 10 digits.');
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = user.clinic_id;

      if (!clinicId) {
        toast.error('Clinic identity not found. Please log in again.');
        return;
      }

      // ✅ FINAL SCHEMA-CORRECT PAYLOAD
      const payload = {
        clinic_id: String(clinicId),
        doctor_id: String(formData.doctor_id),
        patient_name: formData.patient_name.trim(),
        patient_phone: formData.patient_phone.trim(),
        date: formData.date,
        slot_start: formData.slot_start,
        slot_end: formData.slot_end
      };

      const { data } = await API.post('/tokens/manual-book', payload);

      toast.success('Token booked successfully!', {
        icon: <CheckCircle2 className="text-emerald-500" />
      });

      if (onSuccess) onSuccess(data);
      onClose();

      // ✅ Reset form safely
      setFormData({
        patient_name: '',
        patient_phone: '',
        doctor_id: '',
        date: new Date().toISOString().split('T')[0],
        slot_start: '',
        slot_end: '',
      });

    } catch (error) {
      console.error('Manual booking failed:', error);

      const errorMessage =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        'Failed to register patient.';

      toast.error(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

        {/* BACKDROP */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />

        {/* MODAL */}
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
                <UserPlus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Book Token</h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5 uppercase tracking-widest">Manual Registration</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900"
            >
              <X size={24} />
            </motion.button>
          </div>

          {/* BODY */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">

            <div className="space-y-6">
              {/* ROW 1: PATIENT NAME */}
              <div className="w-full">
                <Input
                  label="Patient Name"
                  name="patient_name"
                  value={formData.patient_name}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  icon={User}
                  required
                />
              </div>

              {/* ROW 2: CONTACT & SPECIALIST */}
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Phone Number"
                  name="patient_phone"
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={formData.patient_phone}
                  onChange={handleInputChange}
                  icon={Phone}
                  prefixText="+91"
                  required
                />

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Consulting Specialist
                  </label>

                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                      <Stethoscope size={18} />
                    </div>

                    <select
                      name="doctor_id"
                      value={formData.doctor_id}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm appearance-none"
                      required
                    >
                      <option value="" disabled>Select a doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.doctor_id} value={doctor.doctor_id}>
                          {doctor.name} ({doctor.specialty})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown size={18} />
                    </div>
                    {doctorsLoading && (
                      <div className="absolute inset-y-0 right-14 flex items-center">
                        <Loader2 size={14} className="animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ROW 3: DATE & TIME */}
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Booking Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  icon={Calendar}
                  required
                />

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Select Time Slot
                  </label>

                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                      <Clock size={18} />
                    </div>

                    <select
                      name="time_slot"
                      value={formData.slot_start ? `${formData.slot_start}-${formData.slot_end}` : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        const [start, end] = val.split('-');
                        setFormData(prev => ({ ...prev, slot_start: start, slot_end: end }));
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm appearance-none"
                      required
                    >
                      <option value="" disabled>Select available time</option>
                      {availableSlots.map((slot, idx) => {
                        const start = slot.start_time.substring(0, 5);
                        const end = slot.end_time.substring(0, 5);
                        return (
                          <option key={idx} value={`${start}-${end}`}>
                            {formatTime(start)} to {formatTime(end)}
                          </option>
                        )
                      })}
                    </select>
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown size={18} />
                    </div>
                    {scheduleLoading && (
                      <div className="absolute inset-y-0 right-14 flex items-center">
                        <Loader2 size={14} className="animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </form>


          {/* FOOTER */}
          <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex gap-4 mt-9">
            <Button
              type="button"
              variant="outline"
              className="flex-1 py-4"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={loading}
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-200 rounded-2xl"
              icon={CheckCircle2}
              onClick={handleSubmit}
            >
              Add Patient
            </Button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewPatientModal;
