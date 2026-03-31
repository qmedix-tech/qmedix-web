import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Save, MapPin, Phone, Clock,
  CheckCircle2, Loader2, Sparkles, ChevronRight,
  ShieldCheck, Globe, Hash, Info, User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../api/axios';
import Input from '../components/Input';
import Button from '../components/Button';
import Sidebar from '../components/Sidebar';
import { fetchAddressFromPincode } from '../services/pincodeService';

const ClinicProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    zipcode: '',
    city: '',
    state: '',
    address: '',
    avg_service_minutes: '15',
    is_open: true,
  });

  useEffect(() => {
    fetchClinicDetails();
  }, []);

  const fetchClinicDetails = async () => {
    try {
      setInitialLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = user.clinic_id;

      if (!clinicId) {
        setInitialLoading(false);
        return;
      }
      const { data } = await API.get(`/clinics/${clinicId}`);
      const clinic = data.data || data;
      if (clinic) {
        setFormData({
          name: clinic.name || '',
          phone: clinic.phone || '',
          zipcode: clinic.zipcode || '',
          city: clinic.city || '',
          state: clinic.state || '',
          address: clinic.address || '',
          avg_service_minutes: String(clinic.avg_service_minutes || '15'),
          is_open: clinic.is_open ?? true,
        });
      }
    } catch (error) {
      console.error('Failed to fetch clinic details:', error);
      toast.error('Failed to load clinic profile.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if ((name === 'zipcode' || name === 'phone') && value !== '' && !/^\d+$/.test(value)) {
      return;
    }

    if (name === 'is_open') {
      setFormData((prev) => ({ ...prev, [name]: value === 'true' }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Pincode auto-fill logic
  useEffect(() => {
    if (formData.zipcode.length === 6) {
      handlePincodeFetch();
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
      }
    } catch (err) {
      console.error('Pincode fetch failed:', err);
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = user.clinic_id;
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        avg_service_minutes: parseInt(formData.avg_service_minutes),
        is_open: formData.is_open,
      };
      await API.put(`/clinics/${clinicId}`, payload);
      toast.success('Clinic profile updated successfully!', {
        icon: <CheckCircle2 className="text-emerald-500" />
      });

      // Update local storage clinicName if changed
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        clinicName: formData.name
      }));

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      const message = error.response?.data?.errorMessage || 'Failed to update profile.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Loading Workspace Profile...</p>
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Building2 size={16} className="text-blue-600" />
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Clinic Profile</h1>
            </div>
            <p className="text-xs font-medium text-slate-500">Configure your hospital settings and preferences</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
               <ShieldCheck size={14} className="text-emerald-500" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified Workspace</span>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1000px] mx-auto">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-100 rounded-[40px] shadow-2xl shadow-slate-200/50 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              
              <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
                
                {/* SECTION: BASIC INFO */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-50">
                  <div className="lg:col-span-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                        <User size={18} />
                      </div>
                      <h3 className="font-bold text-slate-900 tracking-tight">Identity</h3>
                    </div>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">Name and primary contact information for your clinic.</p>
                  </div>
                  
                  <div className="lg:col-span-8 space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Clinic Name</label>
                      <div className="relative group/input">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-500 transition-colors">
                          <Building2 size={18} />
                        </div>
                        <input
                          name="name"
                          placeholder="e.g. LifeCare Wellness Hospital"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Public Phone</label>
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
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">The physical location where patients will check in.</p>
                  </div>
                  
                  <div className="lg:col-span-8 space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Street Address</label>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pincode</label>
                        <div className="relative group/input">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-500 transition-colors">
                            <Hash size={18} />
                          </div>
                          <input
                            name="zipcode"
                            placeholder="400001"
                            maxLength={6}
                            value={formData.zipcode}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
                            required
                          />
                          {pincodeLoading && (
                            <div className="absolute right-4 inset-y-0 flex items-center">
                              <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">City & State</label>
                        <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-500 italic flex items-center gap-2">
                          <MapPin size={14} className="text-slate-400" />
                          {formData.city && formData.state ? `${formData.city}, ${formData.state}` : "Autofilled from pincode"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION: SETTINGS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                  <div className="lg:col-span-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner">
                        <Clock size={18} />
                      </div>
                      <h3 className="font-bold text-slate-900 tracking-tight">Operations</h3>
                    </div>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">Adjust your queue dynamics and hospital availability.</p>
                  </div>
                  
                  <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Avg Service Time</label>
                        <select
                          name="avg_service_minutes"
                          value={formData.avg_service_minutes}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200"
                        >
                          {[5, 10, 15, 20, 30, 45, 60].map(m => (
                            <option key={m} value={m}>
                              {m} Minutes per session
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Status</label>
                        <select
                          name="is_open"
                          value={formData.is_open?.toString() || "true"}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200"
                        >
                          <option value="true">Open (Online)</option>
                          <option value="false">Closed (Offline)</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-start gap-4">
                       <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
                       <p className="text-xs font-medium text-slate-500 leading-relaxed">
                         Changing your service time will affect the estimated wait time shown to new patients scanning your QR code.
                       </p>
                    </div>
                  </div>
                </div>

                {/* ACTION: SAVE */}
                <div className="pt-8 flex flex-col md:flex-row items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full md:flex-1 py-5 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      <>
                        <Save size={20} />
                        Update Workspace Profile
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ backgroundColor: '#f8fafc' }}
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="w-full md:w-auto px-8 py-5 border border-slate-200 text-slate-600 rounded-3xl font-bold text-lg transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>

              </form>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClinicProfile;
