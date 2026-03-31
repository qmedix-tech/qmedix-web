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

      const { uid, email, role, id_token, clinic_id, patient_id } = data;

      localStorage.setItem("id_token", id_token);
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
      const message =
        error.response?.data?.errorMessage ||
        "Invalid credentials. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 overflow-y-auto custom-scrollbar">
      <Navbar />

      {/* Added pt-32 to provide clearance for the fixed Navbar */}
      <main className="flex-1 flex items-center justify-center p-6 pt-32 lg:pt-40 pb-20 relative">
        {/* DECORATIVE ELEMENTS */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full -z-10 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[440px] z-10"
        >
          {/* LOGIN CARD */}
          <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
            {/* TOP ACCENT */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-4">
                <Sparkles size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest mt-0.5">Secure Gateway</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Clinic Login</h1>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                Empowering healthcare efficiency with digital-first solutions.
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-8">
              <Input
                label="Clinic Email"
                name="email"
                type="email"
                placeholder="clinic@example.com"
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
                className="w-full py-5 text-lg shadow-2xl shadow-blue-200"
                icon={LogIn}
                iconPosition="right"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-center gap-3 grayscale opacity-60">
              <ShieldCheck size={18} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enterprise Encrypted Access</span>
            </div>
          </div>

          <div className="mt-8 text-center text-slate-400 font-bold text-xs uppercase tracking-widest pointer-events-none opacity-50">
            © 2026 QMedix Solutions
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default GetStarted;
