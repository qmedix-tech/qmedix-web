import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";

// Modular Components
import LoginHeader from "../components/auth/LoginHeader";
import EmailStep from "../components/auth/EmailStep";
import OTPStep from "../components/auth/OTPStep";
import LoginFooter from "../components/auth/LoginFooter";

/**
 * Modernized OTP-based Login Page.
 * Refactored into modular components for better maintainability.
 */
const GetStarted = () => {
  const [loading, setLoading] = useState(false);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    otp: ""
  });

  const navigate = useNavigate();

  // Handle countdown timer for Resend OTP
  useEffect(() => {
    let interval;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    if (!formData.email) {
      toast.error("Please enter your email");
      return;
    }

    setRequestingOtp(true);
    try {
      await API.post("/auth/request-otp", {
        email: formData.email
      });
      setOtpSent(true);
      setResendTimer(60); // Start 60s countdown
      toast.success("OTP sent to your email!");
    } catch (error) {
      const message = error.response?.data?.errorMessage || "Failed to send OTP";
      toast.error(message);
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!formData.otp) {
      toast.error("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/auth/login-with-otp", {
        email: formData.email,
        otp: formData.otp,
        role: "CLINIC"
      });

      const { email, role, access_token, refresh_token, clinic_id } = data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          clinic_id,
          email,
          role
        })
      );

      if (!clinic_id) {
        toast.info("Setup your clinic profile");
        navigate("/onboarding");
      } else {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error) {
      const message = error.response?.data?.errorMessage || "Invalid OTP";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setOtpSent(false);
    setResendTimer(0);
    setFormData(prev => ({ ...prev, otp: "" }));
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F4F7FE] overflow-hidden relative selection:bg-primary/20 selection:text-primary-dark font-sans">
      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_top_right,var(--color-primary-soft),transparent)] opacity-50" />
      <div className="absolute bottom-0 right-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_bottom_left,var(--color-secondary-soft),transparent)] opacity-30" />

      <main className="relative z-10 p-4 w-full max-w-[440px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="z-10"
        >
          <div className="bg-white rounded-[32px] border border-white p-6 md:p-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden">
            {/* TOP ACCENT BAR */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-blue-400 to-teal-400" />

            <LoginHeader />

            <AnimatePresence mode="wait">
              {!otpSent ? (
                <EmailStep
                  email={formData.email}
                  onInputChange={handleInputChange}
                  onRequestOTP={handleRequestOTP}
                  loading={requestingOtp}
                />
              ) : (
                <OTPStep
                  email={formData.email}
                  otp={formData.otp}
                  onInputChange={handleInputChange}
                  onLogin={handleLogin}
                  onGoBack={handleGoBack}
                  onRequestOTP={handleRequestOTP}
                  loading={loading}
                  requestingOtp={requestingOtp}
                  resendTimer={resendTimer}
                />
              )}
            </AnimatePresence>
          </div>

          <LoginFooter />
        </motion.div>
      </main>
    </div>
  );
};

export default GetStarted;
