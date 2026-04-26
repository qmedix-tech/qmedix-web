import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle2 } from 'lucide-react';
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
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [clinicId, doctorId, refreshTrigger]);

  const fetchStats = async () => {
    if (!clinicId || !doctorId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true); // Ensure loading starts only when we have data to fetch
      const { data } = await API.get(`/queues/${clinicId}/doctor/${doctorId}/state`);
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteVisit = async () => {
    try {
      setActionLoading(true);
      await API.post(`/queues/${clinicId}/doctor/${doctorId}/complete`);
      toast.success("Completed");
      onAction && onAction();
    } catch {
      toast.error("Error");
    } finally {
      setActionLoading(false);
    }
  };

  const cards = [
    {
      label: "Now Serving",
      value: stats.current_token ? `#${stats.current_token}` : "--",
      color: "emerald",
      isNowServing: true,
    },
    {
      label: "Waiting List",
      value: stats.total_waiting,
      color: "blue",
    },
    {
      label: "Avg. Wait Time",
      value: `${stats.avg_wait_minutes}m`,
      color: "amber",
    },
  ];

  const colorMap = {
    emerald: {
      bg: "from-emerald-200 to-emerald-100",
      border: "border-emerald-300",
      text: "text-emerald-900",
      badge: "bg-emerald-500 text-white",
    },
    blue: {
      bg: "from-blue-200 to-blue-100",
      border: "border-blue-300",
      text: "text-blue-900",
      badge: "bg-blue-500 text-white",
    },
    amber: {
      bg: "from-amber-200 to-amber-100",
      border: "border-amber-300",
      text: "text-amber-900",
      badge: "bg-amber-500 text-white",
    },
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {cards.map((card, i) => {
        const c = colorMap[card.color];

        return (
          <motion.div
            key={i}
            whileHover={{ y: -4 }}
            className={`relative p-5 rounded-2xl border ${c.border}
            bg-gradient-to-br ${c.bg}
            h-[190px] flex flex-col justify-between shadow-sm ${loading ? 'animate-pulse' : ''}`}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <div className="w-9 h-9 rounded-xl bg-white/50 flex items-center justify-center">
                {loading ? null : (
                  <>
                    {card.isNowServing && <CheckCircle2 size={16} />}
                    {card.color === "blue" && <Users size={16} />}
                    {card.color === "amber" && <Clock size={16} />}
                  </>
                )}
              </div>

              <div className={`text-xs px-2 py-1 rounded-full ${c.badge} ${loading ? 'bg-slate-300' : ''}`}>
                {loading ? "..." : (card.isNowServing
                  ? stats.current_token > 0
                    ? "ACTIVE"
                    : "STANDBY"
                  : card.color === "blue"
                    ? "+Today"
                    : "OPTIMAL")}
              </div>
            </div>

            {/* MAIN */}
            <div>
              <p className="text-xs font-semibold opacity-70">
                {card.label}
              </p>

              {loading ? (
                <div className="h-10 bg-black/5 rounded-lg w-20 mt-1" />
              ) : (
                <h2 className={`text-3xl font-bold ${c.text}`}>
                  {card.value}
                </h2>
              )}
            </div>

            {/* FOOTER */}
            <div className="text-xs space-y-1">
              {loading ? (
                <div className="space-y-1.5 pt-1">
                  <div className="h-3 bg-black/5 rounded w-full" />
                  <div className="h-3 bg-black/5 rounded w-2/3" />
                </div>
              ) : (
                <>
                  {/* NOW SERVING */}
                  {card.isNowServing ? (
                    stats.current_token > 0 ? (
                      <>
                        <p className="font-semibold truncate">
                          {stats.current_patient_name}
                        </p>
                        <p className="truncate opacity-70">
                          {stats.current_patient_phone}
                        </p>

                        <button
                          onClick={handleCompleteVisit}
                          disabled={actionLoading}
                          className="mt-1 w-full py-1 rounded-md bg-white/60 flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 size={12} />
                          {actionLoading ? "..." : "Complete"}
                        </button>
                      </>
                    ) : (
                      <p className="opacity-70 italic">
                        No patient assigned
                      </p>
                    )
                  ) : null}

                  {/* WAITING LIST */}
                  {!card.isNowServing && card.label === "Waiting List" && (
                    <>
                      <p className="opacity-70">Queue is active</p>
                      <p className="font-semibold">
                        Next: #{stats.current_token + 1 || "--"}
                      </p>
                    </>
                  )}

                  {/* AVG WAIT */}
                  {!card.isNowServing && card.label === "Avg. Wait Time" && (
                    <>
                      <p className="opacity-70">Per consultation</p>
                      <p className="font-semibold">Live updated</p>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default QueueStats;
