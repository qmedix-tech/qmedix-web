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
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Focus the hidden input when the dropdown opens to capture typing
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery(''); // Reset search on close
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDoctor = doctors.find(doc => doc.doctor_id === selectedId);

  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* HIDDEN INPUT FOR TYPE-TO-FILTER */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* TRIGGER */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl pl-3 pr-10 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm w-full text-left group relative"
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

        <div className="flex-1 min-w-0 pr-2">
          <p className="text-[12px] font-black text-slate-900 leading-none mb-1 truncate">
            {selectedDoctor?.name || 'Select Specialist'}
          </p>
          <p className="text-[10px] font-medium text-slate-400 leading-none truncate uppercase tracking-widest">
            {selectedDoctor?.specialty || 'Loading...'}
          </p>
        </div>

        <div className="absolute right-4 flex items-center pointer-events-none text-slate-400">
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </motion.button>

      {/* DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[28px] shadow-2xl shadow-blue-900/5 overflow-hidden z-50 p-2 border-t-0 w-full"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            {/* SEARCH INDICATOR (SOFT) */}
            {searchQuery && (
              <div className="px-4 py-2 mb-1 border-b border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Search size={12} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filtering for:</span>
                    <span className="text-[11px] font-black text-blue-600">"{searchQuery}"</span>
                 </div>
                 <button 
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                 >
                   Clear
                 </button>
              </div>
            )}

            {/* DOCTOR OPTIONS */}
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1 p-1">
              {filteredDoctors.length === 0 ? (
                <div className="p-8 text-center text-slate-300 italic text-xs">
                  {searchQuery ? 'No matching specialists' : 'No specialists registered'}
                </div>
              ) : (
                filteredDoctors.map((doc) => (


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
