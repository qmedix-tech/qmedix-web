import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';

// Sub-components
import GatewayConfigForm from '../components/payments/GatewayConfigForm';
import GatewayStats from '../components/payments/GatewayStats';
import TransactionHistory from '../components/payments/TransactionHistory';
import TransactionDetailModal from '../components/payments/TransactionDetailModal';

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
  const [isEditing, setIsEditing] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    key_id: '',
    key_secret: '',
    webhook_secret: ''
  });

  const fetchConfig = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;

      const { clinic_id } = JSON.parse(storedUser);
      if (!clinic_id) return;

      setLoading(true);
      const response = await API.get(`/clinics/${clinic_id}/payment-config`);
      const configData = response.data?.data || response.data;
      setConfig(configData);
    } catch (error) {
      if (error.response?.status !== 404 && error.response?.status !== 500) {
        toast.error(error.response?.data?.errorMessage || 'Failed to load settings');
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
      if (!clinic_id) return;

      setIsSubmitting(true);
      await API.post(`/clinics/${clinic_id}/payment-config`, formData);
      toast.success(isEditing ? 'Configuration updated!' : 'Gateway initialized!');
      setIsEditing(false);
      fetchConfig();
    } catch (error) {
      toast.error(error.response?.data?.errorMessage || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWebhookUrl = () => {
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    if (user?.clinic_id) {
      setWebhookUrl(`${import.meta.env.VITE_API_BASE_URL}/webhooks/razorpay/${user.clinic_id}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const onUpdateStart = () => {
    setFormData({
      key_id: '',
      key_secret: '',
      webhook_secret: ''
    });
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen flex bg-[#F4F7FE]">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <CreditCard size={16} className="text-blue-600" />
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Payments & Gateway</h1>
            </div>
            <p className="text-xs font-medium text-slate-500">Razorpay integration for QMedix clinics.</p>
          </div>
          <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100/50">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={14} /> PCI-DSS Compliant
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
              <div className="p-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center p-2.5 shadow-inner">
                    <img src="https://razorpay.com/favicon.png" className="w-full h-full object-contain" alt="Razorpay" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Razorpay Gateway</h2>
                    <p className="text-xs text-slate-500 font-medium">Standard Payment Integration</p>
                  </div>

                  {config?.key_id && (
                    <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${config.is_active ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${config.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {config.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-4">
                      <PaymentShimmer />
                    </motion.div>
                  ) : (!config || !config.key_id) || isEditing ? (
                    <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <GatewayConfigForm
                        formData={formData} setFormData={setFormData}
                        isSubmitting={isSubmitting} handleSetup={handleSetup}
                        isEditing={isEditing} onCancel={() => setIsEditing(false)}
                        showSecret={showSecret} setShowSecret={setShowSecret}
                        webhookUrl={webhookUrl} generateWebhookUrl={generateWebhookUrl}
                        copyToClipboard={copyToClipboard} copied={copied}
                      />
                    </motion.div>
                  ) : (
                    <motion.div key="stats" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                      <GatewayStats
                        config={config}
                        isKeyVisible={isKeyVisible} setIsKeyVisible={setIsKeyVisible}
                        onUpdateClick={onUpdateStart}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {!isEditing && (
              <TransactionHistory
                onViewDetail={(id) => {
                  setSelectedTxId(id);
                  setIsDetailModalOpen(true);
                }}
              />
            )}
          </div>
        </div>
      </main>

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transactionId={selectedTxId}
      />
    </div>
  );
};

export default Payments;
