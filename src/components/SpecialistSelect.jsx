import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, ChevronDown, Check, Users, Search 
} from 'lucide-react';

/**
 * SpecialistSelect Component
 * A premium, portrait-enabled dropdown for selecting clinic practitioners.
 */
const SpecialistSelect = ({ doctors, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDoctor = doctors.find(doc => doc.doctor_id === selectedId);

  return (
    <div className="relative" ref={containerRef}>
      {/* TRIGGER */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl pl-3 pr-5 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm min-w-[240px] text-left group"
      >
        <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-inner group-hover:bg-blue-100 transition-colors">
          {selectedDoctor?.dp_url ? (
            <img 
              src={selectedDoctor.dp_url} 
              alt={selectedDoctor.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <Stethoscope size={18} className="text-blue-500" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-slate-900 leading-none mb-1 truncate">
            {selectedDoctor?.name || 'All Specialists'}
          </p>
          <p className="text-[10px] font-medium text-slate-400 leading-none truncate uppercase tracking-widest">
            {selectedDoctor?.specialty || 'Clinic Overview'}
          </p>
        </div>

        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </motion.button>

      {/* DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[28px] shadow-2xl shadow-blue-900/5 overflow-hidden z-50 p-2 border-t-0"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            {/* OPTION: ALL SPECIALISTS */}
            <button
              onClick={() => {
                onSelect('');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group ${
                !selectedId ? 'bg-blue-50/50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                <Users size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className={`text-xs font-black ${!selectedId ? 'text-blue-600' : 'text-slate-700'}`}>All Specialists</p>
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Aggregate View</p>
              </div>
              {!selectedId && <Check size={14} className="text-blue-600" />}
            </button>

            <div className="my-2 h-px bg-slate-50 mx-4" />

            {/* DOCTOR OPTIONS */}
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1">
              {doctors.length === 0 ? (
                <div className="p-8 text-center text-slate-300 italic text-xs">
                  No specialists registered
                </div>
              ) : (
                doctors.map((doc) => (
                  <button
                    key={doc.doctor_id}
                    onClick={() => {
                      onSelect(doc.doctor_id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group ${
                      selectedId === doc.doctor_id ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center shadow-sm">
                        {doc.dp_url ? (
                          <img 
                            src={doc.dp_url} 
                            alt={doc.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Stethoscope size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                        )}
                      </div>
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${doc.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <p className={`text-xs font-black truncate ${selectedId === doc.doctor_id ? 'text-blue-600' : 'text-slate-700'}`}>
                        {doc.name}
                      </p>
                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest truncate">
                        {doc.specialty}
                      </p>
                    </div>

                    {selectedId === doc.doctor_id && (
                      <Check size={14} className="text-blue-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpecialistSelect;
