import React from "react";
import { ShieldCheck } from "lucide-react";

/**
 * Premium Header for Auth pages.
 * Includes animated icon and centralized title section.
 */
const LoginHeader = () => {
  return (
    <div className="text-center mb-6 space-y-2">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-[20px] bg-primary flex items-center justify-center shadow-xl shadow-primary/25 relative transition-transform hover:scale-105 duration-300">
          <div className="absolute inset-0 rounded-[20px] bg-white opacity-20 blur-sm animate-pulse" />
          <ShieldCheck size={28} className="text-white relative z-10" />
        </div>
      </div>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinic Gateway</h1>
      <p className="text-slate-500 font-medium text-xs max-w-[240px] mx-auto leading-relaxed">
        Enter your credentials to access your secure dashboard.
      </p>
    </div>
  );
};

export default LoginHeader;
