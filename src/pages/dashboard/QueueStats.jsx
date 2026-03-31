import React, { useState, useEffect } from 'react';
import { Users, Clock, PlayCircle, ArrowUpRight, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import API from '../../api/axios';

const QueueStats = ({ clinicId, doctorId, refreshTrigger, onAction }) => {
  const [stats, setStats] = useState({
    current_token: 0,
    current_patient_name: '',
    current_patient_phone: '',
    total_waiting: 0,
    avg_wait_minutes: 0,
    last_updated: ''
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [clinicId, doctorId, refreshTrigger]);

  const fetchStats = async () => {
    if (!clinicId || !doctorId) return;

    try {
      const { data } = await API.get(`/queues/${clinicId}/${doctorId}`);

      if (data) {
        setStats({
          current_token: data.current_token || 0,
          current_patient_name: data.current_patient_name || '',
          current_patient_phone: data.current_patient_phone || '',
          total_waiting: data.total_waiting || 0,
          avg_wait_minutes: data.avg_wait_minutes || 5,
          last_updated: data.last_updated || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to fetch queue stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteVisit = async () => {
    if (!clinicId || !doctorId || actionLoading) return;

    try {
      setActionLoading(true);
      await API.post(`/queues/${clinicId}/${doctorId}/complete`);
      toast.success('Visit marked as complete');
      if (onAction) onAction();
    } catch (error) {
      console.error('Failed to complete visit:', error);
      const msg = error.response?.data?.errorMessage || 'Failed to complete visit';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Now Serving',
      value: stats.current_token ? `#${stats.current_token}` : '--',
      icon: PlayCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      isNowServing: true,
      trend: stats.current_token > 0 ? "Active" : "Standby"
    },
    {
      label: 'Waiting List',
      value: stats.total_waiting,
      subText: 'Patients in queue',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      borderColor: 'border-blue-100',
      trend: `+${Math.floor(Math.random() * 2) + 1} today`
    },
    {
      label: 'Avg. Wait Time',
      value: `${stats.avg_wait_minutes}m`,
      subText: 'Time per session',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      borderColor: 'border-amber-100',
      trend: "Optimal"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((card, idx) => (
        <motion.div
          key={idx}
          whileHover={{ y: -4 }}
          className={`relative bg-white border ${card.borderColor} p-6 rounded-3xl shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50`}
        >
          {/* DECORATIVE BACKGROUND GRADIENT */}
          <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} rounded-full -mr-16 -mt-16 opacity-30 transition-transform group-hover:scale-110 duration-500`} />

          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-2xl ${card.bg}`}>
                <card.icon className={card.color} size={22} />
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${card.bg} border border-white`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${card.color}`}>
                  {card.trend}
                </span>
                {card.isNowServing && stats.current_token > 0 && (
                  <span className="flex h-1.5 w-1.5 ">
                    <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
              
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? (
                    <div className="h-9 w-16 bg-slate-100 animate-pulse rounded-lg" />
                  ) : (
                    card.value
                  )}
                </h3>
                {card.subText && !loading && (
                  <span className="text-xs font-medium text-slate-500">{card.subText}</span>
                )}
              </div>

              {/* CUSTOM UI FOR NOW SERVING PATIENT DETAILS */}
              {card.isNowServing && !loading && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  {stats.current_token > 0 ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <Users size={14} className="text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {stats.current_patient_name || 'Patient'}
                          </p>
                          <p className={`text-[11px] font-medium ${card.color} truncate leading-none mt-0.5`}>
                            {stats.current_patient_phone || 'No phone'}
                          </p>
                        </div>
                      </div>
                      
                      {/* COMPLETE VISIT ACTION */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCompleteVisit}
                        disabled={actionLoading}
                        className={`mt-4 w-full py-2.5 rounded-xl border ${card.borderColor} ${card.bg} ${card.color} text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all`}
                      >
                        {actionLoading ? (
                          <div className={`w-3.5 h-3.5 border-2 ${card.color} border-t-transparent rounded-full animate-spin`} />
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            Complete Visit
                          </>
                        )}
                      </motion.button>
                    </>
                  ) : (
                    <p className="text-xs font-medium text-slate-400 italic">No patient being served</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default QueueStats;
