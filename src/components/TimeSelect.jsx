import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const TimeSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const containerRef = useRef(null);

  // Handle positioning
  const updatePosition = () => {
    if (containerRef.current) {
      setRect(containerRef.current.getBoundingClientRect());
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true); // true captures scroll events inside modal
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen]);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking the button itself
      if (containerRef.current && containerRef.current.contains(event.target)) return;
      // Don't close if clicking inside the portal dropdown
      if (event.target.closest('.time-select-portal')) return;
      
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full bg-white border border-slate-100 rounded-xl pl-4 pr-3 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
      >
        <span>{selectedOption?.label || value}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Render the dropdown via Portal directly to body */}
      {createPortal(
        <AnimatePresence>
          {isOpen && rect && (
            <motion.div
              className="fixed z-[99999] time-select-portal drop-shadow-2xl"
              style={{ 
                top: rect.bottom + 6, 
                left: rect.left, 
                width: rect.width 
              }}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <div className="bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden">
                <div className="max-h-[220px] overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                        opt.value === value
                          ? 'bg-blue-50 text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{opt.label}</span>
                        {opt.value === value && <Check size={14} className="text-blue-600" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default TimeSelect;

