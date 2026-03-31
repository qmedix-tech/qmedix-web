import React from 'react';
import {
  LayoutDashboard, Users2, Building2, LogOut, QrCode, BarChart3, Stethoscope, ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: Stethoscope, label: 'Doctors', path: '/dashboard/doctors' },
    { icon: Users2, label: 'Patients', path: '/dashboard/patientlist' },
    { icon: Building2, label: 'Clinic', path: '/dashboard/clinic' },
    { icon: QrCode, label: 'QR Code', path: '/dashboard/qrcode' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
      
      {/* BRANDING */}
      <div 
        onClick={() => navigate('/dashboard')}
        className="p-6 cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform duration-200">
            <img src="/qmedics-logo.svg" alt="QMedix" className="w-6 h-6 brightness-0 invert" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Q<span className="text-blue-600">Medix</span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Clinic Portal</p>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
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
              className={`w-full flex items-center justify-between group px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? "bg-white shadow-sm" : "bg-transparent group-hover:bg-white group-hover:shadow-sm"
                }`}>
                  <item.icon size={18} className={isActive ? "text-blue-600" : "text-slate-500"} />
                </div>
                {item.label}
              </div>
              {isActive && (
                <motion.div layoutId="active-pill">
                  <ChevronRight size={14} className="text-blue-400" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* FOOTER / LOGOUT */}
      <div className="p-4 mt-auto border-t border-slate-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-white">
            <LogOut size={18} />
          </div>
          Logout
        </button>
        
        <div className="mt-4 px-2 py-3 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium text-center">© 2026 QMedix v2.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
