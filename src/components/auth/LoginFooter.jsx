import React from "react";
import { ShieldCheck } from "lucide-react";

/**
 * Modern Footer for Auth pages.
 * Includes SSL security badge and copyright notice.
 */
const LoginFooter = () => {
  return (
    <div className="mt-8 flex items-center justify-center gap-4 text-slate-400">
      <div className="flex items-center gap-1.5 grayscale opacity-60 hover:opacity-100 transition-opacity cursor-help">
        <ShieldCheck size={12} />
        <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">SSL Secure</span>
      </div>
      <div className="w-1 h-1 rounded-full bg-slate-300" />
      <div className="text-[9px] font-black uppercase tracking-widest mt-0.5 opacity-40">
        © 2026 QMedix
      </div>
    </div>
  );
};

export default LoginFooter;
