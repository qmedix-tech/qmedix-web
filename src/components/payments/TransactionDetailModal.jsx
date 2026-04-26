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
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving Data...</p>
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
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                     ID: {tx.id}
                   </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Patient Details</label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-700">
                          <User size={14} className="text-slate-400" />
                          <span className="text-sm font-bold tracking-tight">{tx.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Phone size={14} className="text-slate-400" />
                          <span className="text-sm font-medium tracking-tight">{tx.customer_phone}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Specialist</label>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Stethoscope size={14} className="text-slate-400" />
                        <span className="text-sm font-bold tracking-tight">{tx.doctor_name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 text-right">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Slot Timing</label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-700 justify-end">
                          <span className="text-sm font-bold tracking-tight">{tx.booked_date}</span>
                          <Calendar size={14} className="text-slate-400" />
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 justify-end">
                          <span className="text-sm font-medium tracking-tight">
                            {formatTime(tx.slot_start)} - {formatTime(tx.slot_end)}
                          </span>
                          <Clock size={14} className="text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Payment Gateway</label>
                      <div className="flex items-center gap-2 text-slate-700 justify-end">
                        <span className="text-xs font-black font-mono text-blue-600 truncate max-w-[120px]">
                          {tx.gateway_payment_id || 'N/A'}
                        </span>
                        <Hash size={14} className="text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100/50">
                   <CreditCard size={18} className="text-slate-400" />
                   <div className="flex-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processor Info</p>
                     <p className="text-[11px] font-bold text-slate-600">This payment was processed via Razorpay Secure Gateway.</p>
                   </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                Data could not be loaded.
              </div>
            )}
          </div>

          <div className="px-6 py-5 bg-slate-50 border-t border-slate-50">
             <button 
              onClick={onClose}
              className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all shadow-sm active:scale-[0.98]"
             >
               Close Receipt
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TransactionDetailModal;
