import React from 'react';
import {
  LayoutDashboard, Users2, Building2, LogOut, QrCode, BarChart3, Stethoscope, ChevronRight, CalendarClock
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);

  // Restore scroll position on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('sidebar_scroll_pos');
    if (savedPosition && navRef.current) {
      navRef.current.scrollTop = parseInt(savedPosition, 10);
    }
  }, []);

  const handleScroll = () => {
    if (navRef.current) {
      localStorage.setItem('sidebar_scroll_pos', navRef.current.scrollTop);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users2, label: 'Patients', path: '/dashboard/patientlist' },
    { icon: CalendarClock, label: 'Upcoming', path: '/dashboard/upcoming' },
    { icon: Stethoscope, label: 'Doctors', path: '/dashboard/doctors' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: QrCode, label: 'QR Code', path: '/dashboard/qrcode' },
    { icon: Building2, label: 'Clinic', path: '/dashboard/clinic' },
  ];

  return (
    <aside className="w-64 bg-[#1E293B] flex flex-col h-screen sticky top-0">

      {/* BRANDING */}
      <div
        onClick={() => navigate('/dashboard')}
        className="p-6 cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200">
            <img src="/qmedics-logo.svg" alt="QMedix" className="w-6 h-6 brightness-0 invert" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              QMedix
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Clinic Portal</p>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav 
        ref={navRef}
        onScroll={handleScroll}
        className="flex-1 px-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className="mb-4 px-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Main Menu</span>
        </div>

        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;

          return (
            <motion.button
              key={i}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between group px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${isActive
                  ? "text-white"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              {/* ANIMATED BACKGROUND PILL */}
              {isActive && (
                <motion.div 
                  layoutId="active-highlight"
                  className="absolute inset-0 bg-slate-700/50 rounded-xl"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35
                  }}
                />
              )}

              <div className="flex items-center gap-3 relative z-10">
                <div className={`p-1.5 rounded-lg transition-colors ${isActive
                    ? "bg-slate-700 text-white"
                    : "bg-transparent group-hover:bg-slate-700 group-hover:text-white"
                  }`}>
                  <item.icon size={18} />
                </div>
                {item.label}
              </div>
              
              {isActive && (
                <motion.div 
                  layoutId="active-chevron"
                  className="relative z-10"
                >
                  <ChevronRight size={14} className="text-slate-400" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 mt-auto border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all duration-200"
        >
          <div className="p-1.5 rounded-lg bg-transparent">
            <LogOut size={18} />
          </div>
          Logout
        </button>

        <div className="mt-4 px-2 py-3">
          <p className="text-[10px] text-slate-500 font-medium text-center">© 2026 QMedix v2.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
