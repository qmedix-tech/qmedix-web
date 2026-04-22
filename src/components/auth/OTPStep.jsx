import React from "react";
import { Mail, ChevronLeft, KeyRound, LogIn, Loader2, RefreshCcw, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Input from "../Input";
import Button from "../Button";

/**
 * Second step of the Auth flow: OTP verification.
 * Includes resend logic and navigation cooldown.
 */
const OTPStep = ({ 
  email, 
  otp, 
  onInputChange, 
  onLogin, 
  onGoBack, 
  onRequestOTP,
  loading, 
  requestingOtp, 
  resendTimer 
}) => {
  return (
    <motion.form
      key="otp-step"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      onSubmit={onLogin}
      className="space-y-5"
    >
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between group">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Mail size={14} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Signed in as</p>
            <p className="text-xs font-bold text-slate-700 truncate max-w-[180px]">{email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onGoBack}
          disabled={resendTimer > 0}
          className={`p-1.5 rounded-lg transition-all border border-transparent ${
            resendTimer > 0 
            ? "text-slate-300 cursor-not-allowed bg-slate-50" 
            : "text-slate-400 hover:text-primary hover:bg-white hover:border-slate-200"
          }`}
          title={resendTimer > 0 ? `Please wait ${resendTimer}s` : "Change Email"}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      <Input
        label="Enter OTP"
        name="otp"
        type="text"
        placeholder="000000"
        value={otp}
        onChange={onInputChange}
        icon={KeyRound}
        required
        maxLength={6}
      />

      <div className="space-y-3">
        <Button
          type="submit"
          loading={loading}
          className="w-full py-4 text-sm font-bold bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/20 rounded-xl transition-all active:scale-[0.98]"
          icon={LogIn}
          iconPosition="right"
        >
          Verify & Sign In
        </Button>

        <button
          type="button"
          onClick={onRequestOTP}
          disabled={requestingOtp || resendTimer > 0}
          className={`w-full flex items-center justify-center gap-2 text-[10px] font-bold transition-all py-1.5 uppercase tracking-widest ${
            resendTimer > 0 
            ? "text-slate-400 cursor-not-allowed opacity-80" 
            : "text-slate-500 hover:text-primary active:scale-95"
          }`}
        >
          {requestingOtp ? (
            <Loader2 size={12} className="animate-spin" />
          ) : resendTimer > 0 ? (
            <Clock size={12} className="animate-pulse" />
          ) : (
            <RefreshCcw size={12} />
          )}
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
        </button>
      </div>
    </motion.form>
  );
};

export default OTPStep;
