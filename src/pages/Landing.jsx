import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, Sparkles, Activity, ShieldCheck, Zap } from "lucide-react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";

/**
 * Redesigned Premium Landing Page for QMedix.
 * Optimized for high conversion and modern SaaS aesthetics.
 * Resolved redundant badge issues from earlier iterations.
 */
const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        {/* DECORATIVE BACKGROUND */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-40">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#DBEAFE] rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#A7F3D0] rounded-full blur-[150px] opacity-70" />
        </div>

        <div className="container max-w-[1200px]">
          <div className="text-center space-y-8">
            {/* HERO BADGE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E293B] text-white rounded-full shadow-[0_8px_30px_rgb(30,41,59,0.15)]"
            >
              <Sparkles size={16} className="text-[#6EE7B7]" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] pt-0.5">Revolutionizing Patient Flow</span>
            </motion.div>

            {/* MAIN HEADLINE */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-[#1E293B] tracking-tighter leading-[0.9]"
            >
              Manage Clinic Queues <br />
              <span className="text-emerald-500">Without the Chaos.</span>
            </motion.h1>

            {/* SUB-HEADLINE */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed"
            >
              QMedix streamlines patient flow with intelligent digital tokens, helping
              clinics focus on care while we handle the crowd.
            </motion.p>

            {/* CTA BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
            >
              <Button
                onClick={() => navigate("/get-started")}
                className="px-10 py-5 text-[17px] bg-[#1E293B] hover:bg-[#0F172A] text-white shadow-[0_15px_40px_rgb(30,41,59,0.3)] rounded-2xl"
                icon={ArrowRight}
                iconPosition="right"
              >
                Get Started for Free
              </Button>
              <button 
                className="flex items-center gap-3 px-10 py-5 bg-white text-[#1E293B] font-black rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Play size={14} fill="currentColor" />
                </div>
                Watch Video Demo
              </button>
            </motion.div>
          </div>

          {/* SOCIAL PROOF / TRUST BADGES */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-24 pt-12 border-t border-slate-100 flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
          >
             <div className="flex items-center gap-2 font-black text-slate-400">
               <ShieldCheck size={24} /> <span className="tracking-widest">ISO SECURE</span>
             </div>
             <div className="flex items-center gap-2 font-black text-slate-400">
               <Zap size={24} /> <span className="tracking-widest">REAL-TIME</span>
             </div>
             <div className="flex items-center gap-2 font-black text-slate-400">
               <Activity size={24} /> <span className="tracking-widest">10k+ PATIENTS</span>
             </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURE PREVIEW / VALUE PROP */}
      <section className="py-24 bg-[#F4F7FE]">
        <div className="container max-w-[1200px] px-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Smart Tokens",
                  desc: "Automated digital queuing system that keeps patients informed in real-time.",
                  icon: Zap,
                  color: "text-amber-800",
                  bgCard: "bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A]",
                  borderColor: "border-amber-300/50",
                  iconBg: "bg-amber-100/50"
                },
                {
                  title: "Clinic Analytics",
                  desc: "Deep insights into patient flow, wait times, and operational efficiency.",
                  icon: Activity,
                  color: "text-blue-800",
                  bgCard: "bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE]",
                  borderColor: "border-blue-300/50",
                  iconBg: "bg-blue-100/50"
                },
                {
                  title: "Instant Setup",
                  desc: "Get your clinic up and running in less than 5 minutes with our onboarding flow.",
                  icon: Sparkles,
                  color: "text-emerald-800",
                  bgCard: "bg-gradient-to-br from-[#A7F3D0] to-[#6EE7B7]",
                  borderColor: "border-emerald-300/50",
                  iconBg: "bg-emerald-100/50"
                }
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -8 }}
                  className={`relative ${feat.bgCard} p-10 rounded-[32px] border ${feat.borderColor} shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group transition-all duration-300 hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)]`}
                >
                   <div className={`absolute top-0 right-0 w-32 h-32 ${feat.iconBg} rounded-full -mr-16 -mt-16 opacity-50 transition-transform group-hover:scale-110 duration-500 blur-2xl`} />
                   
                   <div className={`w-14 h-14 ${feat.iconBg} mix-blend-multiply opacity-80 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-sm relative z-10`}>
                     <feat.icon size={28} className={feat.color} />
                   </div>
                   <h3 className={`text-2xl font-black ${feat.color} mix-blend-color-burn mb-3 tracking-tight relative z-10`}>{feat.title}</h3>
                   <p className={`text-sm font-bold ${feat.color} mix-blend-color-burn opacity-70 leading-relaxed relative z-10`}>{feat.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
