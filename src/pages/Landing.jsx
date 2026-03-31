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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-[150px]" />
        </div>

        <div className="container max-w-[1200px]">
          <div className="text-center space-y-8">
            {/* HERO BADGE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-100 shadow-sm"
            >
              <Sparkles size={16} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] pt-0.5">Revolutionizing Patient Flow</span>
            </motion.div>

            {/* MAIN HEADLINE */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]"
            >
              Manage Clinic Queues <br />
              <span className="text-blue-600">Without the Chaos.</span>
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
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Button
                onClick={() => navigate("/get-started")}
                className="px-10 py-5 text-lg shadow-2xl shadow-blue-200"
                icon={ArrowRight}
                iconPosition="right"
              >
                Get Started for Free
              </Button>
              <button 
                className="flex items-center gap-3 px-10 py-5 bg-white text-slate-600 font-bold rounded-[22px] border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group"
              >
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
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
      <section className="py-24 bg-slate-50/50">
        <div className="container max-w-[1200px] px-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Smart Tokens",
                  desc: "Automated digital queuing system that keeps patients informed in real-time.",
                  icon: Zap,
                  color: "text-amber-500",
                  bg: "bg-amber-50"
                },
                {
                  title: "Clinic Analytics",
                  desc: "Deep insights into patient flow, wait times, and operational efficiency.",
                  icon: Activity,
                  color: "text-blue-500",
                  bg: "bg-blue-50"
                },
                {
                  title: "Instant Setup",
                  desc: "Get your clinic up and running in less than 5 minutes with our onboarding flow.",
                  icon: Sparkles,
                  color: "text-purple-500",
                  bg: "bg-purple-50"
                }
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -8 }}
                  className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                   <div className={`w-14 h-14 ${feat.bg} ${feat.color} rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
                     <feat.icon size={28} />
                   </div>
                   <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{feat.title}</h3>
                   <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
