import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import Input from '../components/Input';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import { fetchAddressFromPincode } from '../services/pincodeService';
import {
  Save, Clock, Building2, MapPin, Phone, Hash, Globe,
  Sparkles, CheckCircle2, ChevronRight, ChevronDown, Loader2, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Standardized Onboarding for clinic owners to set up their portal.
 * Fixed missing Lucide icon imports and refined layout density.
 */
const Onboarding = () => {
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    zipcode: '',
    city: '',
    state: '',
    address: '',
    avg_service_minutes: '15',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if ((name === 'zipcode' || name === 'phone') && value !== '' && !/^\d+$/.test(value)) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  useEffect(() => {
    if (formData.zipcode.length === 6) {
      handlePincodeFetch();
    } else {
      setFormData(prev => ({ ...prev, city: '', state: '' }));
    }
  }, [formData.zipcode]);

  const handlePincodeFetch = async () => {
    setPincodeLoading(true);
    try {
      const results = await fetchAddressFromPincode(formData.zipcode);
      if (results && results.length > 0) {
        setFormData(prev => ({
          ...prev,
          city: results[0].district,
          state: results[0].state
        }));
        // toast.info(`Address found for ${formData.zipcode}`);
      }
    } catch (err) {
      toast.error("Invalid pincode");
    } finally {
      setPincodeLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Required";
    if (formData.zipcode.length !== 6) newErrors.zipcode = "6 digits";
    if (!formData.city) newErrors.city = "Required";
    if (!formData.state) newErrors.state = "Required";
    if (!formData.address) newErrors.address = "Required";
    if (formData.phone.length !== 10) newErrors.phone = "10 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.warning("Please fill all required fields correctly.");
      return;
    };

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone,
        address: formData.address.trim(),
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        avg_service_minutes: parseInt(formData.avg_service_minutes),
      };

      const { data } = await API.post('/clinics/register', payload);

      const clinicId = data.clinic_id;
      const clinicName = data.name;

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...storedUser,
        clinic_id: clinicId,
        clinicName: clinicName
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Clinic registered successfully!', {
        icon: <CheckCircle2 className="text-emerald-500" />
      });
      navigate('/dashboard');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FE]">
      <Navbar />

      <div className="flex-1 flex items-start justify-center p-6 pt-32 pb-20 overflow-y-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[800px]"
        >
          {/* INTRO */}
          <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-3">
                <Sparkles size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest mt-0.5">Setup Workspace</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Complete clinic setup</h1>
              <p className="text-slate-500 font-medium mt-2">Personalize your portal to start managing patients effectively.</p>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Progress: 90%
            </div>
          </div>

          {/* FORM CARD */}
          <div className="bg-white border border-slate-100 rounded-[48px] shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <form onSubmit={handleSubmit} className="p-8 md:p-14 space-y-12">

              {/* SECTION: BASIC INFO */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-50">
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                      <Building2 size={18} />
                    </div>
                    <h3 className="font-bold text-slate-900 tracking-tight">Clinic Details</h3>
                  </div>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed">Basic information about your facility.</p>
                </div>

                <div className="lg:col-span-8 space-y-8">
                  <Input
                    label="Official Clinic Name"
                    name="name"
                    placeholder="e.g. LifeCare Wellness Hospital"
                    value={formData.name}
                    onChange={handleInputChange}
                    icon={Building2}
                    error={errors.name}
                    required
                  />

                  <Input
                    label="Contact Phone"
                    name="phone"
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    icon={Phone}
                    prefixText="+91"
                    error={errors.phone}
                    required
                  />
                </div>
              </div>

              {/* SECTION: ADDRESS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-50">
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                      <MapPin size={18} />
                    </div>
                    <h3 className="font-bold text-slate-900 tracking-tight">Location</h3>
                  </div>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed">Helps patients find you easily.</p>
                </div>

                <div className="lg:col-span-8 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Street Address</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 pt-4 flex items-start pointer-events-none text-slate-400 group-focus-within/input:text-blue-500 transition-colors">
                        <Globe size={18} />
                      </div>
                      <textarea
                        name="address"
                        rows="3"
                        placeholder="e.g. 123 Health Ave, Medical District"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 resize-none"
                        required
                      />
                    </div>
                    {errors.address && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input
                      label="Pincode"
                      name="zipcode"
                      placeholder="400001"
                      maxLength={6}
                      value={formData.zipcode}
                      onChange={handleInputChange}
                      icon={Hash}
                      error={errors.zipcode}
                      required
                    />

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">City & State</label>
                      <div className="w-full bg-slate-100/50 border border-slate-100 rounded-2xl px-5 py-[1.125rem] text-sm font-black text-slate-500 italic flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400" />
                        {formData.city && formData.state ? `${formData.city}, ${formData.state}` : "Autofilled from pincode"}
                        {pincodeLoading && <Loader2 size={14} className="animate-spin ml-auto text-blue-500" />}
                      </div>
                      {(errors.city || errors.state) && <p className="text-[10px] font-bold text-rose-500 ml-1">Location required</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: OPERATIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-4">
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                      <Clock size={18} />
                    </div>
                    <h3 className="font-bold text-slate-900 tracking-tight">Operations</h3>
                  </div>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed">Queue management settings.</p>
                </div>

                <div className="lg:col-span-8 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Avg Service Time</label>
                      <div className="relative group/select">
                        <select
                          name="avg_service_minutes"
                          value={formData.avg_service_minutes}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200"
                        >
                          {[5, 10, 15, 20, 30, 45, 60].map(m => (
                            <option key={m} value={m}>
                              {m} Minutes per patient
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-slate-400 group-hover/select:text-blue-500 transition-colors">
                          <ChevronDown size={18} strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* INFO BOX */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-[32px] p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/50 backdrop-blur-sm border border-blue-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-blue-900 mb-0.5 uppercase tracking-tighter">Queue Optimization Active</h4>
                      <p className="text-xs font-medium text-blue-700/80 leading-relaxed italic">QMedix will intelligently predict wait durations for your patients based on these settings.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION: SAVE */}
              <div className="pt-8 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner group transition-all">
                  <ShieldCheck size={20} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block leading-none mb-0.5">Secure Registration</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">End-to-end encrypted</span>
                  </div>
                </div>

                <div className="flex-1 w-full flex justify-end">
                   <Button
                    type="submit"
                    loading={loading}
                    className="w-full lg:w-auto px-12 py-5 text-lg shadow-2xl shadow-blue-200"
                    icon={ChevronRight}
                    iconPosition="right"
                  >
                    Save & Activate Portal
                  </Button>
                </div>
              </div>

            </form>
          </div>

          <div className="mt-12 text-center text-slate-400 font-bold text-[11px] uppercase tracking-widest mb-10">
            Log out to switch account
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
