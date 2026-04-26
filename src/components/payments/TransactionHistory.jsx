import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Search, Filter, ChevronLeft, ChevronRight, 
  ExternalLink, Clock, CheckCircle2, XCircle, AlertCircle,
  Calendar, CreditCard
} from 'lucide-react';
import API from '../../api/axios';

const STATUS_MAP = {
  'SUCCESS': { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2, label: 'Success' },
  'PENDING': { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock, label: 'Pending' },
  'FAILED': { color: 'text-rose-600 bg-rose-50 border-rose-100', icon: XCircle, label: 'Failed' },
  'ESCROW': { color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: AlertCircle, label: 'Escrow' },
};

const TransactionHistory = ({ onViewDetail }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const { data } = await API.get(`/clinics/${user.clinic_id}/transactions/history`, {
        params: { page, size: pageSize }
      });
      
      setTransactions(data.items || []);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <History size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Payment History</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Real-time payment audit log</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
             <input 
              type="text" 
              placeholder="Search Trans ID..." 
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all w-48"
             />
          </div>
          <button className="p-2 bg-slate-50 text-slate-400 rounded-xl border border-slate-200 hover:bg-white hover:text-slate-600 transition-all">
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction / Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer / Patient</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence mode="wait">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded ml-auto" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded-full mx-auto" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-100 rounded-lg mx-auto" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-slate-400">No transactions found.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const status = STATUS_MAP[tx.status] || STATUS_MAP['PENDING'];
                  const StatusIcon = status.icon;
                  
                  return (
                    <motion.tr 
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-xs font-black text-slate-700 font-mono tracking-tight">{tx.id.substring(0, 12)}...</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{formatDate(tx.created_at)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-700">{tx.customer_name || 'N/A'}</p>
                        <p className="text-[10px] font-medium text-slate-400">{tx.customer_phone || 'No Phone'}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-black text-slate-900 tracking-tight">₹{tx.amount}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${status.color}`}>
                          <StatusIcon size={10} />
                          <span className="text-[10px] font-black uppercase tracking-wider">{status.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => onViewDetail(tx.id)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="View Details"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
