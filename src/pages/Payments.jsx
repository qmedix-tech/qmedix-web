import React, { useState, useEffect } from 'react';
import {
  CreditCard, ShieldCheck, Key, Webhook, Clock, AlertCircle,
  ExternalLink, CheckCircle2, XCircle, Search, Filter,
  Download, ListFilter, IndianRupee, Eye, EyeOff, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';

const PaymentShimmer = () => (
  <div className="space-y-6">
    <div className="bg-white/50 border border-slate-100 p-8 rounded-2xl animate-pulse">
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-xl animate-shimmer" />
          <div className="space-y-2">
            <div className="w-32 h-4 bg-slate-200 rounded-lg animate-shimmer" />
            <div className="w-48 h-3 bg-slate-100 rounded-lg animate-shimmer" />
          </div>
        </div>
        <div className="w-24 h-8 bg-slate-100 rounded-xl animate-shimmer" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-5 bg-slate-50/30 rounded-2xl border border-slate-100 space-y-3">
            <div className="w-16 h-3 bg-slate-200 rounded animate-shimmer" />
            <div className="w-full h-4 bg-slate-100 rounded animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Payments = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [formData, setFormData] = useState({
    key_id: '',
    key_secret: '',
    webhook_secret: ''
  });

  const fetchConfig = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setLoading(false);
        return;
      }
      const { clinic_id } = JSON.parse(storedUser);
      if (!clinic_id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await API.get(`/clinics/${clinic_id}/payment-config`);
      
      // Handle response safely - some APIs wrap in .data
      const configData = response.data?.data || response.data;
      setConfig(configData);
    } catch (error) {
      // If 404 or 500, we treat as "not configured" to show setup form
      if (error.response?.status !== 404 && error.response?.status !== 500) {
        console.error('Error fetching payment config:', error);
        toast.error(error.response?.data?.errorMessage || 'Failed to load payment settings');
      }
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSetup = async (e) => {
    e.preventDefault();
    if (!formData.key_id || !formData.key_secret || !formData.webhook_secret) {
      toast.warning('Please fill all credentials');
      return;
    }

    try {
      const storedUser = localStorage.getItem('user');
      const { clinic_id } = JSON.parse(storedUser || '{}');
      if (!clinic_id) {
        toast.error('Clinic identification missing. Please re-login.');
        return;
      }

      setIsSubmitting(true);
      await API.post(`/clinics/${clinic_id}/payment-config`, formData);
      toast.success('Payment gateway configured successfully!');
      fetchConfig();
    } catch (error) {
      toast.error(error.response?.data?.errorMessage || 'Failed to setup payment gateway');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const { clinic_id } = JSON.parse(storedUser || '{}');
      if (!clinic_id) return;

      const newStatus = !config.is_active;
      // Optimistic update
      setConfig({ ...config, is_active: newStatus });
      
      await API.patch(`/clinics/${clinic_id}/payment-config`, { is_active: newStatus });
      toast.success(`Gateway is now ${newStatus ? 'Active' : 'Inactive'}`);
    } catch (error) {
      // Revert on error
      fetchConfig();
      toast.error(error.response?.data?.errorMessage || 'Failed to update status');
    }
  };

  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const generateWebhookUrl = () => {
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    const clinicId = user?.clinic_id;
    if (clinicId) {
      // Assuming absolute URL or just the path as requested
      const url = `${import.meta.env.VITE_API_BASE_URL}/webhooks/razorpay/${clinicId}`;
      setWebhookUrl(url);
    } else {
      toast.error("Clinic ID not found");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("Webhook URL copied!");
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div className="min-h-screen flex bg-[#F4F7FE]">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-20 flex-shrink-0 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <CreditCard className="text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">Payments & Gateway</h1>
              <p className="text-xs font-medium text-slate-500">Configure Razorpay and monitor clinical transactions.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100/50">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={14} /> PCI-DSS Compliant
                </span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* RAZORPAY CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />

              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center p-2.5 shadow-inner">
                      <img src="https://razorpay.com/favicon.png" className="w-full h-full object-contain" alt="Razorpay" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">Razorpay Gateway</h2>
                      <p className="text-xs text-slate-500 font-medium">Standard Payment Integration for QMedix</p>
                    </div>
                  </div>

                  {config?.key_id && (
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${config.is_active ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${config.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {config.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div 
                      key="loading" 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }} 
                      className="py-4"
                    >
                      <PaymentShimmer />
                    </motion.div>
                  ) : !config || !config.key_id ? (
                    /* NOT CONFIGURED */
                    <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="bg-blue-50/30 border border-blue-100/50 p-5 rounded-2xl flex flex-col md:flex-row items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <Webhook size={24} className="text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-900">Webhook Configuration</h4>
                          <p className="text-xs text-slate-600">Register this URL in your Razorpay dashboard to sync payments automatically.</p>
                        </div>

                        {!webhookUrl ? (
                          <button
                            onClick={generateWebhookUrl}
                            className="flex items-center gap-2 text-blue-600 font-bold text-xs bg-white px-4 py-2 rounded-lg border border-blue-100 hover:bg-blue-50 transition-all shadow-sm"
                          >
                            <Sparkles size={14} className="text-blue-500" />
                            Get Webhook URL
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 w-full md:w-auto">
                            <input
                              type="text"
                              readOnly
                              value={webhookUrl}
                              className="bg-white border border-blue-100 px-3 py-2 rounded-lg text-[10px] font-mono font-bold text-blue-600 w-full md:w-64 outline-none"
                            />
                            <button
                              onClick={copyToClipboard}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md flex-shrink-0"
                              title="Copy to Clipboard"
                            >
                              {copied ? <CheckCircle2 size={16} /> : <Download size={16} className="rotate-180" />}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Key ID</label>
                          <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                              type="text"
                              placeholder="rzp_live_..."
                              value={formData.key_id}
                              onChange={(e) => setFormData({...formData, key_id: e.target.value})}
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Key Secret</label>
                          <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                              type={showSecret ? "text" : "password"}
                              placeholder="Key Secret"
                              value={formData.key_secret}
                              onChange={(e) => setFormData({...formData, key_secret: e.target.value})}
                              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                            />
                            <button onClick={() => setShowSecret(!showSecret)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500 transition-colors">
                              {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Webhook Secret</label>
                          <div className="relative">
                            <Webhook className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                              type="text"
                              placeholder="Webhook Secret"
                              value={formData.webhook_secret}
                              onChange={(e) => setFormData({...formData, webhook_secret: e.target.value})}
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleSetup}
                          disabled={isSubmitting}
                          className="px-8 py-3 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 disabled:opacity-50 disabled:translate-y-0"
                        >
                          {isSubmitting ? 'Verifying...' : 'Initialize Gateway'}
                          <CheckCircle2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* CONFIGURED STATS */
                    <motion.div key="configured" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Key size={12} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Key ID</p>
                          </div>
                          <button 
                            onClick={() => setIsKeyVisible(!isKeyVisible)}
                            className="p-1 px-2 text-[10px] font-bold text-blue-500 hover:bg-blue-50 rounded transition-all flex items-center gap-1"
                          >
                            {isKeyVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                            {isKeyVisible ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <p className="text-sm font-bold text-slate-700 font-mono tracking-tighter overflow-hidden text-ellipsis whitespace-nowrap">
                          {isKeyVisible ? config.key_id : '•••• •••• •••• ••••'}
                        </p>
                      </div>

                      <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Webhook size={12} />
                          </div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Webhook Status</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {config.has_webhook ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-amber-500" />}
                          <p className="text-xs font-bold text-slate-700">{config.has_webhook ? 'Synchronized' : 'Incomplete'}</p>
                        </div>
                      </div>

                      <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between group hover:border-blue-200 transition-all">
                         <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Clock size={12} />
                          </div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Config Life Cycle</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-slate-500">Updated {config.updated_at ? new Date(config.updated_at).toLocaleDateString() : 'recently'}</p>
                          
                          <div 
                            onClick={handleToggleStatus}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out focus:outline-none ${config.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${config.is_active ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* PAYMENT HISTORY PLACEHOLDER */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <ListFilter size={24} className="text-slate-200" />
                  </div>
                  <h3 className="text-md font-bold text-slate-900">No Transactions Found</h3>
                  <p className="text-[11px] text-slate-400 max-w-[240px] mt-1 font-medium italic">
                    Transaction logs will appear here once clinical payments are received.
                  </p>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payments;
