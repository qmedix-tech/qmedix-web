import React, { useState, useEffect } from 'react';
import {
  Clock, Phone, MoreVertical, AlertCircle, ChevronRight, UserPlus, CheckCircle2, FastForward, UserCheck, Inbox, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import Button from '../../components/Button';

const ActiveQueue = ({ doctorId, onNewPatient, onQueueUpdate, refreshTrigger }) => {
  const [activeTokens, setActiveTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchActiveTokens();
  }, [doctorId, refreshTrigger]);

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

  const handleQueueAction = async (action, tokenId = null) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const clinicId = user.clinic_id;

    if (!clinicId) {
      toast.error("Clinic ID not found.");
      return;
    }

    try {
      setActionLoading({ action, tokenId });
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
       const tokenId = token.id || token.token_id;
       setActionLoading({ action: 'cancel', tokenId });
       
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
            disabled={actionLoading?.action === 'call-next' || loading}
            className="btn-premium btn-primary bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.25)] rounded-xl py-2.5 px-5"
          >
            {actionLoading?.action === 'call-next' ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <UserCheck size={18} />
            )}
            Call Next Patient
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewPatient}
            className="btn-premium btn-secondary bg-white border border-slate-200 text-slate-700 flex items-center gap-2 rounded-xl py-2.5 px-5"
          >
            <UserPlus size={18} className="text-blue-600" />
            Add Patient
          </motion.button>
        </div>
      </div>

      {/* QUEUE CONTENT */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* TABLE HEADER */}
        <div className="grid grid-cols-[1fr_1.5fr_1fr_1.5fr_auto] gap-4 p-5 border-b border-slate-50 bg-[#F4F7FE]">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Token</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patient</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status / Action</div>
          <div className="w-10"></div>
        </div>

        {/* TABLE BODY */}
        <div className="p-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : activeTokens.length > 0 ? (
            <motion.div layout className="space-y-2">
              <AnimatePresence mode="popLayout">
                {activeTokens.map((token, idx) => (
                  <motion.div
                    key={token.id || token.token_number}
                    layout
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, x: -10 }}
                    className="group flex items-center grid grid-cols-[1fr_1.5fr_1fr_1.5fr_auto] gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 pl-2">
                      <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center font-bold">
                        #{token.token_number}
                      </div>
                    </div>

                    <div>
                      <p className="text-[14px] font-bold text-slate-800 line-clamp-1">
                        {token.patient_name || token.name || 'Anonymous Patient'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Phone size={14} className="opacity-50" />
                      <span className="text-sm font-medium">{token.patient_phone || token.phone || '--'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {idx === 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-widest border border-blue-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Next
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-widest border border-slate-200">
                          Waiting
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end pr-2">
                      <button
                        onClick={() => handleQueueAction('skip', token.id || token.token_id)}
                        disabled={!!actionLoading}
                        className="relative p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100 flex items-center justify-center"
                        title="Skip"
                      >
                         {actionLoading?.action === 'skip' && actionLoading?.tokenId === (token.id || token.token_id) ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                         ) : (
                            <FastForward size={16} />
                         )}
                      </button>
                      <button
                        onClick={() => handleCancelToken(token)}
                        disabled={!!actionLoading}
                        className="relative p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 flex items-center justify-center"
                        title="Delete"
                      >
                         {actionLoading?.action === 'cancel' && actionLoading?.tokenId === (token.id || token.token_id) ? (
                            <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                         ) : (
                            <Trash2 size={16} />
                         )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Inbox size={28} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Queue is Clear</h3>
              <p className="text-sm text-slate-500 max-w-xs mt-1">No patients are currently in the active queue.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNewPatient}
                className="mt-6 btn-premium btn-secondary gap-2"
              >
                <UserPlus size={16} />
                Add First Patient
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveQueue;
