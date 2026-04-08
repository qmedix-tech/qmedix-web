import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axios";
import Input from "../components/Input";
import Button from "../components/Button";
import Navbar from "../components/Navbar";
import { ArrowRight, Loader2, Sparkles, ShieldCheck, Mail, Lock, LogIn } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Redesigned GetStarted (Login) page.
 * Optimized for vertical clearance to avoid Navbar overlap.
 * Uses standardized components and follows the new SaaS design system.
 */
const GetStarted = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post("/auth/login", {
        email: formData.email,
        password: formData.password,
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
      const message = error.response.data.errorMessage;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-soft selection:bg-primary/20 selection:text-primary-dark font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 pt-32 pb-20 relative overflow-hidden">
        {/* BACKGROUND DECOR */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_top_right,var(--color-primary-soft),transparent)] opacity-50" />
        <div className="absolute bottom-0 right-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_bottom_left,var(--color-secondary-soft),transparent)] opacity-30" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[480px] z-10"
        >
          <div className="bg-white rounded-3xl border border-slate-100 p-8 md:p-12 shadow-premium relative overflow-hidden">
            {/* TOP ACCENT BAR */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-teal-500" />

            <div className="text-center mb-12 space-y-3">
               <div className="flex justify-center mb-6">
                 <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                   <ShieldCheck size={28} className="text-white" />
                 </div>
               </div>
               <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinic Gateway</h1>
               <p className="text-slate-500 font-medium text-sm">
                 Access your clinic dashboard and manage patient queues with ease.
               </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                label="Clinic Email"
                name="email"
                type="email"
                placeholder="admin@clinic.com"
                value={formData.email}
                onChange={handleInputChange}
                icon={Mail}
                required
              />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  icon={Lock}
                  required
                />

              <Button
                type="submit"
                loading={loading}
                className="w-full py-4 text-base font-bold bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/20 rounded-xl"
                icon={LogIn}
                iconPosition="right"
              >
                Sign In
              </Button>
            </form>


          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-slate-400">
             <div className="flex items-center gap-1.5 grayscale opacity-70">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest mt-0.5">SSL Secure</span>
             </div>
             <div className="w-1 h-1 rounded-full bg-slate-300" />
             <div className="text-[10px] font-black uppercase tracking-widest mt-0.5 opacity-50">
               © 2026 QMedix
             </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};


export default GetStarted;
