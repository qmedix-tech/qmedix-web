import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

/**
 * Standardized Premium Input component.
 * Supports prefix icons, prefix text, and password visibility toggle.
 */
const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  error,
  readOnly = false,
  className = "",
  maxLength,
  required = false,
  icon: Icon,
  prefixText = "",
  disabled = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative group/input-container">
        {/* PREFIX ICON */}
        {Icon && !prefixText && (
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input-container:text-blue-500 transition-colors z-10">
            <Icon size={18} />
          </div>
        )}

        {/* PREFIX TEXT (e.g., +91) + ICON */}
        {prefixText && (
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
            {Icon && <Icon size={18} className="text-slate-400 mr-2 group-focus-within/input-container:text-blue-500 transition-colors" />}
            <span className="text-sm font-bold text-slate-400 border-r border-slate-200 pr-2 mr-2 leading-none">
              {prefixText}
            </span>
          </div>
        )}

        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          maxLength={maxLength}
          required={required}
          className={`
            w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200
            ${Icon && !prefixText ? 'pl-11' : ''}
            ${prefixText ? (Icon ? 'pl-[96px]' : 'pl-[64px]') : 'px-5'}
            ${(readOnly || disabled) ? "bg-slate-100/50 text-slate-500 cursor-not-allowed border-slate-100" : "hover:border-slate-300"} 
            ${error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 shadow-sm" : ""}
          `}
        />

        {/* PASSWORD TOGGLE EYE BUTTON */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 rounded-lg text-slate-300 hover:text-slate-900 hover:border-slate-100 transition-all z-20"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* ERROR ICON */}
        {error && !isPassword && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none z-10">
            <AlertCircle size={18} />
          </div>
        )}
      </div>

      {error && (
        <span className="text-[11px] font-bold text-rose-500 ml-1 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
