import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, XCircle, SkipForward, 
  Clock, RefreshCcw, Sparkles, Activity, PieChart, ChevronRight, Zap, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';

const TodayAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchAnalytics(parsedUser.clinic_id);
    } else {
      navigate('/get-started');
    }
  }, [navigate]);

  const fetchAnalytics = async (clinicId) => {
    try {
      setLoading(true);
      const { data } = await API.get(`/clinics/${clinicId}/analytics`);
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err.response?.data?.errorMessage || 'Could not load analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const cards = [
    {
      label: 'Booked',
      value: stats?.total_booked || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      borderColor: 'border-blue-100',
      description: 'New appointments today'
    },
    {
      label: 'Served',
      value: stats?.total_completed || 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      description: 'Visits completed'
    },
    {
      label: 'Skipped',
      value: stats?.total_skipped || 0,
      icon: SkipForward,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      borderColor: 'border-amber-100',
      description: 'Standby patients'
    },
    {
      label: 'Cancelled',
      value: stats?.total_cancelled || 0,
      icon: XCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      borderColor: 'border-rose-100',
      description: 'Removed appointments'
    }
  ];

  const completionRate = stats?.total_booked > 0 
    ? Math.round((stats.total_completed / stats.total_booked) * 100) 
    : 0;

  return (
    <div className="min-h-screen flex bg-[#F4F7FE]">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <PieChart size={16} className="text-blue-600" />
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Daily Analytics</h1>
            </div>
            <p className="text-xs font-medium text-slate-500">Live performance monitoring for {user?.clinicName || "Clinic"}</p>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchAnalytics(user.clinic_id)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all border border-blue-100 shadow-sm"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </motion.button>
        </header>

        {/* CONTENT */}
        <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
          {error ? (
            <div className="max-w-xl mx-auto bg-rose-50 border border-rose-100 text-rose-600 p-6 rounded-[32px] text-center font-bold text-sm">
              <Activity size={24} className="mx-auto mb-2 opacity-50" />
              {error}
            </div>
          ) : (
            <div className="max-w-[1400px] mx-auto space-y-8">
              {/* PRIMARY STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    className={`bg-white p-5 rounded-2xl border ${card.borderColor} shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden group`}
                  >
                     <div className={`absolute -right-4 -top-4 w-16 h-16 ${card.bg} rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
                     
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-3 rounded-2xl ${card.bg} shadow-inner`}>
                        <card.icon className={card.color} size={24} />
                      </div>
                      {loading && <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />}
                    </div>
                    
                    <div className="relative">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                        {loading ? (
                          <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg" />
                        ) : (
                          card.value
                        )}
                      </h3>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                      <p className="text-xs font-medium text-slate-400 mt-3 flex items-center gap-1.5 grayscale opacity-70">
                         {card.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* SECONDARY ANALYTICS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* EFFICIENCY OVERVIEW */}
                <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <TrendingUp size={160} />
                  </div>
                  
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">Efficiency Overview</h3>
                      <p className="text-sm font-medium text-slate-500">Service completion rate and timing metrics</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                      <Activity size={24} />
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="relative">
                      <div className="flex mb-4 items-end justify-between">
                        <div>
                          <span className="text-[10px] font-black inline-block py-1 px-3 uppercase rounded-full text-indigo-700 bg-indigo-100 border border-indigo-200 tracking-widest">
                            Completion Rate
                          </span>
                          <h4 className="text-sm font-bold text-slate-700 mt-2">Visits finalized today</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-4xl font-black text-indigo-600 tracking-tighter leading-none">
                            {completionRate}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-4 flex rounded-full bg-slate-100 shadow-inner border border-slate-50">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${completionRate}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full relative"
                        >
                           <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:24px_24px] animate-[progress_1s_linear_infinite]" />
                        </motion.div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                      <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">Avg. Patient Stay</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-slate-100">
                             <Clock size={20} />
                          </div>
                          <div>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                              {loading ? '--' : `${stats?.avg_service_time_today || 0} min`}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Today's Average</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">Current Activity</p>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100 ${stats?.total_booked > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                             <Activity size={20} className={stats?.total_booked > 0 ? 'animate-pulse' : ''} />
                          </div>
                          <div>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                              {stats?.total_booked > 0 ? 'Peak' : 'Quiet'}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Live Status</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT SUMMARY CARD */}
                <div className="lg:col-span-4 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-8 rounded-3xl shadow-2xl shadow-blue-200/50 relative overflow-hidden flex flex-col justify-between group">
                  {/* Decorative Elements */}
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
                  <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
                  
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-xl border border-white/20 shadow-xl group-hover:scale-110 transition-transform duration-500">
                      <Sparkles size={28} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight mb-4 leading-tight">Insight Summary</h3>
                    <p className="text-blue-100 font-medium text-sm leading-relaxed opacity-90">
                      {stats?.total_completed > 0 
                        ? `Exceptional work! You've successfully finished ${stats.total_completed} patient visits today.` 
                        : "Ready to start? Your first completed appointment will appear here."}
                      {stats?.total_skipped > 0 && ` Heads up: ${stats.total_skipped} skipped patients are pending return.`}
                    </p>
                    
                    <div className="mt-8 flex gap-2">
                       <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-widest border border-white/10 backdrop-blur-sm">
                         Live Data
                       </span>
                    </div>
                  </div>

                  <div className="relative z-10 mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-blue-300 text-[10px] uppercase font-black tracking-[0.2em] mb-1.5 opacity-60">Last Refresh</p>
                      <p className="text-white font-bold text-sm tracking-tight flex items-center gap-2">
                        <Clock size={14} className="text-blue-300" />
                        {stats?.last_updated ? new Date(stats.last_updated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Real-time'}
                      </p>
                    </div>
                    <motion.div 
                      whileHover={{ x: 5 }}
                      className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white"
                    >
                       <ChevronRight size={18} />
                    </motion.div>
                  </div>
                </div>
              </div>

               {/* BOTTOM TIP */}
               <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm max-w-2xl">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Pro Management Tip</h4>
                    <p className="text-xs font-medium text-slate-500">Monitor skipped appointments regularly to keep your queue moving and avoid sudden rush periods.</p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
      
      {/* GLOBAL CSS FOR BAR ANIMATION */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          from { background-position: 0 0; }
          to { background-position: 24px 0; }
        }
      `}} />
    </div>
  );
};

export default TodayAnalytics;
