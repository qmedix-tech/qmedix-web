import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Users, 
  History, 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  Activity, 
  Search, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  Sparkles
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Landing = () => {
  const navigate = useNavigate();

  const clinicFeatures = [
    {
      title: "Doctor Management",
      desc: "Effortlessly add and manage multiple doctors across departments with custom schedules.",
      icon: Users,
    },
    {
      title: "Electronic Health Records",
      desc: "Securely store patient records and track booking history in a centralized database.",
      icon: History,
    },
    {
      title: "Real-Time Dashboard",
      desc: "A live view of your clinic's patient flow, wait times, and operational performance.",
      icon: LayoutDashboard,
    },
    {
      title: "Smart Scheduling",
      desc: "Robust appointment system that balances walk-ins and pre-booked online tokens.",
      icon: Calendar,
    },
  ];

  const patientFeatures = [
    {
      title: "Online Token Booking",
      desc: "Patients skip the physical queue by booking digital tokens through our mobile app.",
      icon: Ticket,
    },
    {
      title: "Live Queue Status",
      desc: "Real-time updates on queue position, allowing patients to arrive just in time.",
      icon: Activity,
    },
    {
      title: "Clinic Discovery",
      desc: "A comprehensive map-based search for clinics and specialists in the patient's area.",
      icon: Search,
    },
  ];

  const steps = [
    {
      id: "01",
      title: "Patient books a token online",
      desc: "Using the QMedix mobile app, patients find your clinic and book a digital token in seconds.",
    },
    {
      id: "02",
      title: "Clinic manages via dashboard",
      desc: "Your staff assigns doctors, tracks patient flow, and updates status in real-time.",
    },
    {
      id: "03",
      title: "Patients monitor in real time",
      desc: "Patients watch their queue position on their phones and arrive only when needed.",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-white font-sans text-slate-900 selection:bg-primary/20 selection:text-primary-dark">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-12 md:pt-28 md:pb-20 overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-6">
          {/* TEXT CONTENT */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 mb-6"
            >
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">The Future of Clinic Management</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight mb-4"
            >
              Skip the queue. <br />
              <span className="text-primary italic">Manage clinics</span> smarter.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-base text-slate-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Eliminate physical waiting lines with our intelligent digital queue system. 
              Real-time tracking for patients, effortless management for clinics.
            </motion.p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/get-started")}
                className="px-8 py-4 bg-primary text-white rounded-xl font-bold shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group">
                View Demo
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            {/* MAIN DASHBOARD MOCKUP */}
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-slate-100 transform -rotate-2 hover:rotate-0 transition-transform duration-700">
               <img 
                 src="dashboard_mockup_1775461761398.png" 
                 alt="Clinic Dashboard Mockup" 
                 className="w-full h-auto"
               />
            </div>
            {/* FLOATING MOBILE APP MOCKUP */}
            <div className="absolute -bottom-12 -left-12 z-20 w-[180px] md:w-[240px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white transform rotate-6 hidden sm:block">
               <img 
                 src="patient_app_mockup_1775461788162.png" 
                 alt="Patient App Mockup" 
                 className="w-full h-auto"
               />
            </div>
            {/* DECORATIVE BACKGROUND */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary/5 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features" className="py-24 bg-bg-soft px-6 border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Built for Modern Healthcare</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Comprehensive tools designed to manage clinics and enhance the patient experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...clinicFeatures, ...patientFeatures].map((feat, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -8 }}
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <feat.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">The Queue-less Workflow</h2>
                <p className="text-slate-500 text-lg">A simple 3-step loop that connects your clinic directly with your patients.</p>
              </div>
              <div className="space-y-10">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-6 relative group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary text-primary flex items-center justify-center font-black text-lg group-hover:bg-primary group-hover:text-white transition-all shadow-lg shadow-primary/10">
                      {step.id}
                    </div>
                    {idx !== steps.length - 1 && <div className="absolute top-12 left-6 w-0.5 h-10 bg-slate-100" />}
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-slate-900">{step.title}</h4>
                      <p className="text-slate-500 text-sm font-medium">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
           {/* HOW IT WORKS VISUAL */}
           <div className="relative rounded-[32px] overflow-hidden shadow-2xl bg-slate-900 aspect-square flex items-center justify-center p-12">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-teal-500/10 opacity-50" />
              <div className="relative z-10 text-center space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/20">
                  <Globe size={14} className="text-teal-400" /> Real-time Global Sync
                </div>
                <div className="space-y-2">
                  <p className="text-white text-3xl font-black">2.4m+</p>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Tokens Managed Monthly</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-left">
                      <p className="text-teal-400 text-xs font-bold uppercase mb-1">Clinic Upside</p>
                      <p className="text-white text-lg font-bold">+40% Efficiency</p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-left">
                      <p className="text-primary-light text-xs font-bold uppercase mb-1">Patient SAT</p>
                      <p className="text-white text-lg font-bold">4.9/5 Rating</p>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* 4. ABOUT SECTION */}
      <section id="about" className="py-24 px-6 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-10">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-blue-400 text-xs font-bold border border-white/10">
              <ShieldCheck size={16} /> Data Security & Compliance
           </div>
           <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Modernizing clinics. <br />
              Reducing anxiety.
           </h2>
           <p className="text-xl text-slate-400 leading-relaxed font-medium">
             QMedix is built to modernize clinics by removing long waiting times and bringing transparency to patient flow. We believe healthcare should be local, smart, and accessible—without the friction of middle-men or crowded waiting rooms.
           </p>
           <div className="pt-8">
              <Link to="/get-started" className="text-primary hover:text-primary-light font-bold flex items-center justify-center gap-2 group text-lg transition-colors">
                Learn more about our mission
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
           </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto bg-primary rounded-[40px] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/30 group">
           <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-indigo-600 opacity-50 transition-opacity group-hover:opacity-100" />
           <div className="relative z-10 space-y-10">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Start managing your clinic <br /> the smart way.
              </h2>
              <p className="text-primary-soft text-lg md:text-xl font-medium max-w-2xl mx-auto opacity-80">
                Join 500+ clinics that have digitized their patient flow with QMedix. Set up in minutes, manage for life.
              </p>
              <button
                onClick={() => navigate("/get-started")}
                className="px-12 py-5 bg-white text-primary rounded-2xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                Get Started Now
              </button>
           </div>
           {/* DECORATIVE ORBS */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
