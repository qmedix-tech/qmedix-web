import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Receipt, User, Phone, Calendar, Clock, 
  Stethoscope, CreditCard, Hash, CheckCircle2,
  XCircle, AlertCircle, Loader2
} from 'lucide-react';
import API from '../../api/axios';

const STATUS_MAP = {
  'SUCCESS': { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2, label: 'Success' },
  'PENDING': { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock, label: 'Pending' },
  'FAILED': { color: 'text-rose-600 bg-rose-50 border-rose-100', icon: XCircle, label: 'Failed' },
  'ESCROW': { color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: AlertCircle, label: 'Escrow' },
};

const TransactionDetailModal = ({ isOpen, onClose, transactionId }) => {
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchDetail();
    }
  }, [isOpen, transactionId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const { data } = await API.get(`/clinics/${user.clinic_id}/transactions/${transactionId}`);
      setTx(data);
    } catch (error) {
      console.error('Failed to fetch transaction detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const status = tx ? (STATUS_MAP[tx.status] || STATUS_MAP['PENDING']) : null;
  const StatusIcon = status?.icon;

  const formatTime = (time) => {
    if (!time) return '--:--';
    const [h, m] = time.split(':');
    const hh = parseInt(h);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

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
          className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
        >
          <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
          
          <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                <Receipt size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Transaction Receipt</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Audit Details</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {loading ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header Shimmer */}
                <div className="flex flex-col items-center gap-4 pb-6 border-b border-slate-50">
                  <div className="w-24 h-6 bg-slate-100 rounded-full animate-shimmer" />
                  <div className="w-32 h-10 bg-slate-100 rounded-xl animate-shimmer" />
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-48 h-3 bg-slate-100 rounded animate-shimmer" />
                    <div className="w-32 h-2 bg-slate-50 rounded animate-shimmer" />
                  </div>
                </div>

                {/* Grid Shimmer: Row 1 */}
                <div className="grid grid-cols-2 gap-8 border-b border-slate-50 pb-3">
                  <div className="space-y-3">
                    <div className="w-20 h-2 bg-slate-100 rounded animate-shimmer" />
                    <div className="w-32 h-4 bg-slate-50 rounded animate-shimmer" />
                  </div>
                  <div className="space-y-3 flex flex-col items-end">
                    <div className="w-20 h-2 bg-slate-100 rounded animate-shimmer" />
                    <div className="w-24 h-4 bg-slate-50 rounded animate-shimmer" />
                  </div>
                </div>

                {/* Grid Shimmer: Row 2 */}
                <div className="grid grid-cols-2 gap-8 pt-3">
                  <div className="space-y-4">
                    <div className="w-24 h-2 bg-slate-100 rounded animate-shimmer" />
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-slate-50 rounded animate-shimmer" />
                      <div className="w-20 h-3 bg-slate-50 rounded animate-shimmer" />
                    </div>
                  </div>
                  <div className="space-y-4 flex flex-col items-end">
                    <div className="w-24 h-2 bg-slate-100 rounded animate-shimmer" />
                    <div className="space-y-2 flex flex-col items-end">
                      <div className="w-28 h-4 bg-slate-50 rounded animate-shimmer" />
                      <div className="w-32 h-3 bg-slate-50 rounded animate-shimmer" />
                    </div>
                  </div>
                </div>
              </div>
            ) : tx ? (
              <div className="space-y-6">
                {/* Status & Amount */}
                <div className="text-center space-y-2 pb-6 border-b border-slate-50">
                   <div className="flex justify-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${status.color}`}>
                      <StatusIcon size={14} />
                      <span className="text-xs font-black uppercase tracking-widest">{status.label}</span>
                    </span>
                   </div>
                   <h3 className="text-4xl font-black text-slate-900 tracking-tighter">₹{tx.amount}</h3>
                   <div className="space-y-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                       ID: {tx.id}
                     </p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                       {new Date(tx.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                     </p>
                   </div>
                </div>

                {/* Row 1: Patient Details */}
                <div className="grid grid-cols-2 gap-6 border-b border-slate-50 pb-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Patient Name</label>
                    <div className="flex items-center gap-2 text-slate-700">
                      <User size={14} className="text-slate-400" />
                      <span className="text-sm font-bold tracking-tight">{tx.patient_name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Phone Number</label>
                    <div className="flex items-center gap-2 text-slate-700 justify-end">
                      <span className="text-sm font-medium tracking-tight">{tx.patient_phone}</span>
                      <Phone size={14} className="text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Row 2: Specialist & Slot Timing */}
                <div className="grid grid-cols-2 gap-6 pt-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Doctor & Appointment No.</label>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Stethoscope size={14} className="text-slate-400" />
                        <span className="text-sm font-bold tracking-tight">{tx.doctor_name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 pl-0.5">
                        <Hash size={12} className="text-blue-500" />
                        <span className="text-[11px] font-black text-blue-600 uppercase tracking-tight">No. #{tx.token_number}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Date & Slot</label>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-700 justify-end">
                        <span className="text-sm font-bold tracking-tight">{tx.booked_date}</span>
                        <Calendar size={14} className="text-slate-400" />
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 justify-end">
                        <span className="text-xs font-medium tracking-tight">
                          {formatTime(tx.slot_start)} - {formatTime(tx.slot_end)}
                        </span>
                        <Clock size={14} className="text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                Data could not be loaded.
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TransactionDetailModal;
