import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const OTPInput = ({ value, onChange, disabled }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Synchronize local state with prop value if it's changed externally
    if (value && value.length === 6) {
      setOtp(value.split(""));
    } else if (!value) {
      setOtp(new Array(6).fill(""));
    }
  }, [value]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value.substring(element.value.length - 1);
    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Move to next input if current field is filled
    if (element.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").substring(0, 6).split("");
    if (pasteData.every(char => !isNaN(char))) {
      const newOtp = [...otp];
      pasteData.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      onChange(newOtp.join(""));
      
      // Focus the last filled input or the next empty one
      const focusIndex = Math.min(pasteData.length, 5);
      inputRefs.current[focusIndex].focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center mb-2">
      {otp.map((data, index) => (
        <motion.input
          key={index}
          type="text"
          maxLength={1}
          value={data}
          disabled={disabled}
          ref={(el) => (inputRefs.current[index] = el)}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={`w-11 h-12 text-center text-lg font-black rounded-xl border-2 transition-all outline-none 
            ${disabled ? 'bg-slate-50 border-slate-100 text-slate-400' : 
              data ? 'bg-white border-blue-500 text-blue-600 shadow-md shadow-blue-100' : 
              'bg-slate-50 border-slate-200 text-slate-700 focus:border-blue-300 focus:bg-white'}
          `}
          initial={false}
          animate={data ? { scale: 1.05 } : { scale: 1 }}
        />
      ))}
    </div>
  );
};

export default OTPInput;
