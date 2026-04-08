import React, { useState, useEffect } from 'react';
import {
  Clock, Phone, MoreVertical, AlertCircle, ChevronRight, UserPlus, CheckCircle2, FastForward, UserCheck, Inbox, Trash2, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import Button from '../../components/Button';

const ActiveQueue = ({ doctorId, onNewPatient, onQueueUpdate, refreshTrigger }) => {
  const [activeTokens, setActiveTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Helper to convert 24h to AM/PM
  const formatTime = (time24) => {
    if (!time24) return '--:--';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (doctorId) {
      fetchSessions(doctorId);
    }
  }, [doctorId, refreshTrigger]);

  const fetchSessions = async (id) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const clinicId = user.clinic_id;

    if (!clinicId || !id) {
      setSessionsLoading(false);
      return;
    }

    try {
      setSessionsLoading(true);
      const { data } = await API.get(`/queues/${clinicId}/${id}/sessions`);
      const allSessions = Array.isArray(data) ? data : [];
      
      // Filter only sessions with waiting patients
      const activeSessions = allSessions.filter(s => s.waiting_count > 0);
      setSessions(activeSessions);

      // Default Behavior: Select session matching current time if it has waiting patients
      const now = new Date();
      const currentHHMMSS = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      const matchingSession = activeSessions.find(s => 
        currentHHMMSS >= s.start_time && currentHHMMSS <= s.end_time
      );

      if (matchingSession) {
        setSelectedSlot(matchingSession.start_time);
      } else if (activeSessions.length > 0) {
        // Default to the first available session if no current session matches
        setSelectedSlot(activeSessions[0].start_time);
      }
    } catch (e) {
      console.error('Failed to load sessions:', e);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTokens();
  }, [doctorId, refreshTrigger, selectedSlot]);

  const fetchActiveTokens = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const clinicId = user.clinic_id;

    if (!clinicId || !doctorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const params = {};
      if (selectedSlot) {
        params.slot_start = selectedSlot;
      }

      const { data } = await API.get(`/queues/${clinicId}/${doctorId}/active-tokens`, { params });
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
        <div className="flex items-center gap-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Patient Queue
              <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                {activeTokens.length} Active
              </span>
            </h2>
            <p className="text-sm font-medium text-slate-500">Manage ongoing visits and next calls</p>
          </div>

          {/* SLOT FILTER DROPDOWN - Aligned Center-Left */}
          {sessions.length > 0 && (
            <div className="relative group/slot">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/slot:text-blue-500 transition-colors pointer-events-none">
                <Clock size={16} />
              </div>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="pl-10 pr-10 py-2.5 bg-white border border-slate-200 text-slate-700 text-[13px] font-bold rounded-xl appearance-none focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all cursor-pointer min-w-[200px] shadow-sm"
              >
                {sessions.map((session, idx) => (
                  <option key={idx} value={session.start_time}>
                    {formatTime(session.start_time)} – {formatTime(session.end_time)}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within/slot:rotate-180 transition-transform duration-300">
                <ChevronDown size={14} />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {activeTokens.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQueueAction('call-next')}
              disabled={actionLoading?.action === 'call-next' || loading}
              className="btn-premium bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 text-blue-700 flex items-center gap-2 shadow-sm rounded-xl py-2.5 px-5 transition-all text-sm font-bold"
            >
              {actionLoading?.action === 'call-next' ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserCheck size={18} className="text-blue-600" />
              )}
              Call Next Patient
            </motion.button>
          )}
        </div>
      </div>

      {/* QUEUE CONTENT */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* TABLE HEADER */}
        <div className="grid grid-cols-[0.8fr_2fr_1.3fr_1.2fr_1fr_1.2fr] px-8 py-4 border-b border-slate-200 bg-slate-50/50 items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 flex-shrink-0" />
            <div className="text-[11px] font-black text-slate-400 border-none bg-transparent uppercase tracking-widest">Token</div>
          </div>
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Patient Details</div>
          <div className="flex items-center gap-1.5 pl-1.5 focus:outline-none focus:ring-0">
            <div className="w-[14px] flex-shrink-0" />
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Phone</div>
          </div>
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Booked Slot</div>
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</div>
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</div>
        </div>

        {/* TABLE BODY */}
        <div className="p-2">
          {loading ? (
            <div className="divide-y divide-slate-100">
              {[1, 2, 3].map(i => (
                <div key={i} className="grid grid-cols-[0.8fr_2fr_1.3fr_1.2fr_1fr_1.2fr] px-8 py-5 items-center relative overflow-hidden">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl animate-shimmer" />
                  <div className="h-4 bg-slate-100 rounded-md w-2/3 ml-6 animate-shimmer" />
                  <div className="h-4 bg-slate-50 rounded-md w-20 ml-4 animate-shimmer" />
                  <div className="h-4 bg-slate-50 rounded-md w-16 animate-shimmer" />
                  <div className="h-6 bg-slate-50 rounded-full w-16 animate-shimmer" />
                  <div className="flex gap-2 justify-center">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg animate-shimmer" />
                    <div className="w-8 h-8 bg-slate-100 rounded-lg animate-shimmer" />
                  </div>
                </div>
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
                    className="grid grid-cols-[0.8fr_2fr_1.3fr_1.2fr_1fr_1.2fr] px-8 py-5 items-center hover:bg-slate-50/80 transition-colors group border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex-shrink-0 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center font-bold shadow-sm transition-all group-hover:bg-[#1E293B] group-hover:text-white">
                        #{token.token_number}
                      </div>
                    </div>

                    <div className="pl-2">

                      <p className="text-[14px] font-bold text-slate-800 line-clamp-1">
                        {token.patient_name || token.name || 'Anonymous Patient'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 font-mono tracking-tight pl-1.5 focus:outline-none">
                      <Phone size={14} className="opacity-40" />
                      {token.patient_phone || token.phone || '--'}
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                      <Clock size={14} className="text-blue-500 opacity-60" />
                      <span className="text-[13px]">{formatTime(token.booked_slot_start?.substring(0, 5))}</span>
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

                    <div className="flex items-center gap-2 justify-center pr-2">
                      <button
                        onClick={() => handleQueueAction('skip', token.id || token.token_id)}
                        disabled={!!actionLoading}
                        className="relative p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-100 bg-white hover:border-blue-200 flex items-center justify-center shadow-sm"
                        title="Skip Patient"
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
                        className="relative p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-slate-100 bg-white hover:border-rose-200 flex items-center justify-center shadow-sm"
                        title="Delete Token"
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
                className="mt-6 btn-premium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center gap-2 rounded-xl py-2.5 px-6 shadow-lg shadow-blue-200 transition-all font-bold"
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
