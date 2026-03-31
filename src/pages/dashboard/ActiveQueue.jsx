import React, { useState, useEffect } from 'react';
import {
  Clock, Phone, MoreVertical, AlertCircle, ChevronRight, UserPlus, CheckCircle2, FastForward, UserCheck, Inbox, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import Button from '../../components/Button';

const ActiveQueue = ({ doctorId, onNewPatient, onQueueUpdate }) => {
  const [activeTokens, setActiveTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchActiveTokens();
  }, [doctorId]);

  const fetchActiveTokens = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = user.clinic_id;

      if (!clinicId || !doctorId) return;

      const { data } = await API.get(`/queues/${clinicId}/${doctorId}/active-tokens`);
      const list = Array.isArray(data) ? data : [];
      const sortedTokens = list.sort((a, b) => (a.token_number || 0) - (b.token_number || 0));

      setActiveTokens(sortedTokens);
    } catch (error) {
      console.error('Failed to fetch active tokens:', error);
      const msg = error.response?.data?.errorMessage || error.response?.data?.message || 'Failed to fetch queue';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQueueAction = async (action) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const clinicId = user.clinic_id;

    if (!clinicId) {
      toast.error("Clinic ID not found.");
      return;
    }

    try {
      setActionLoading(action);
      await API.post(`/queues/${clinicId}/${doctorId}/${action}`);

      const actionLabels = {
        'call-next': 'Next patient called',
        'complete': 'Patient visit completed',
        'skip': 'Patient skipped'
      };

      toast.success(actionLabels[action] || `Action ${action} successful`);

      await fetchActiveTokens();
      if (onQueueUpdate) onQueueUpdate();
    } catch (error) {
      const msg = error.response?.data?.errorMessage || `Failed to perform ${action}`;
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelToken = async (token) => {
     if (!token || actionLoading) return;

     const confirmText = `Are you sure you want to cancel token #${token.token_number} for ${token.patient_name || 'this patient'}? This action cannot be undone.`;
     if (!window.confirm(confirmText)) return;

     try {
       setActionLoading('cancel');
       const tokenId = token.id || token.token_id;
       await API.delete(`/tokens/${tokenId}/cancel`);
       toast.success(`Token #${token.token_number} cancelled`);

       await fetchActiveTokens();
       if (onQueueUpdate) onQueueUpdate();
     } catch (error) {
       console.error('Failed to cancel token:', error);
       const msg = error.response?.data?.errorMessage || 'Failed to cancel token';
       toast.error(msg);
     } finally {
       setActionLoading(null);
     }
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Patient Queue
            <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {activeTokens.length} Active
            </span>
          </h2>
          <p className="text-sm font-medium text-slate-500">Manage ongoing visits and next calls</p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleQueueAction('call-next')}
            disabled={actionLoading === 'call-next' || loading}
            className="btn-premium btn-primary flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            {actionLoading === 'call-next' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <UserCheck size={18} />
            )}
            Call Next Patient
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewPatient}
            className="btn-premium btn-secondary flex items-center gap-2"
          >
            <UserPlus size={18} className="text-blue-600" />
            Add Patient
          </motion.button>
        </div>
      </div>

      {/* QUEUE CONTENT */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-white border border-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : activeTokens.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {activeTokens.map((token, idx) => (
              <motion.div
                key={token.id || token.token_number}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                {/* TOKEN BADGE */}
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-blue-200 border-4 border-white rotate-12 group-hover:rotate-0 transition-transform duration-300">
                  {token.token_number}
                </div>

                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg">
                      In Progress
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mt-3 line-clamp-1">
                      {token.patient_name || token.name || 'Anonymous Patient'}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                      <Phone size={13} />
                      <span className="text-xs font-medium">{token.patient_phone || token.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-slate-50 flex items-center gap-3">
                    {/* SKIP ACTION */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQueueAction('skip')}
                      disabled={actionLoading}
                      className="flex-1 btn-premium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 text-[13px] font-bold py-2 gap-2"
                    >
                      {actionLoading === 'skip' ? (
                        <div className="w-3.5 h-3.5 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
                      ) : (
                        <FastForward size={16} />
                      )}
                      Skip
                    </motion.button>

                    {/* CANCEL ACTION */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCancelToken(token)}
                      disabled={actionLoading}
                      className="flex-1 btn-premium bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 text-[13px] font-bold py-2 gap-2"
                    >
                      {actionLoading === 'cancel' ? (
                        <div className="w-3.5 h-3.5 border-2 border-rose-400/30 border-t-rose-500 rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-16 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Inbox size={32} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Queue is Clear</h3>
          <p className="text-slate-500 max-w-xs mt-2">No patients are currently in the active queue. Call the next patient or add a new one manually.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNewPatient}
            className="mt-8 btn-premium btn-primary gap-2 px-8"
          >
            <UserPlus size={18} />
            Add First Patient
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ActiveQueue;
