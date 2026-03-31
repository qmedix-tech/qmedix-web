import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, LayoutDashboard, HeartPulse, Sparkles, LogOut } from "lucide-react";
import { toast } from "react-toastify";

/**
 * Standardized Premium Navbar for QMedix.
 * Optimized for both public-facing and authenticated routes.
 * Logic added to hide redundant CTA on auth pages and guard Dashboard access.
 * NEW: Added Log Out button for Onboarding page.
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isLandingPage = location.pathname === "/";
  const isOnboarding = location.pathname === "/onboarding";
  const isAuthPage =
    location.pathname === "/get-started" ||
    location.pathname === "/onboarding";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    const checkAuth = () =>
      setIsAuthenticated(!!localStorage.getItem("id_token"));

    window.addEventListener("scroll", handleScroll);
    checkAuth();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  /**
   * Guards Dashboard access.
   * Redirects to onboarding if clinic_id is missing.
   */
  const handleDashboardClick = () => {
    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr || '{}');
    const clinicId = user.clinic_id;

    if (!clinicId) {
      toast.info("Setup your clinic profile first");
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }
    setIsOpen(false);
  };

  /**
   * Clears session and logs out.
   */
  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/");
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-[1440px] z-50 transition-all duration-500 rounded-[32px] px-8 py-4 flex items-center justify-between border
        ${scrolled || !isLandingPage
          ? "bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
          : "bg-transparent border-transparent"
        }`}
    >
      {/* LOGO */}
      <Link to="/" className="flex items-center gap-3">
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
             <img src="/qmedics-logo.svg" alt="QMedix Logo" className="w-6 h-6 brightness-0 invert" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900 leading-none">
            Q<span className="text-blue-600">Medix</span>
          </span>
        </motion.div>
      </Link>

      {/* CENTER BADGE (LANDING ONLY) */}
      {isLandingPage && (
        <div className="hidden lg:flex items-center justify-center">
           <div className="px-6 py-2 bg-blue-50/50 backdrop-blur-sm border border-blue-100/50 rounded-full flex items-center gap-2">
             <Sparkles size={14} className="text-blue-600" />
             <span className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] leading-none pt-0.5">
               THE FUTURE OF CLINIC MANAGEMENT
             </span>
           </div>
        </div>
      )}

      {/* RIGHT ACTIONS */}
      <div className="hidden md:flex items-center gap-6">
        {isAuthenticated && !isAuthPage ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDashboardClick}
            className="flex items-center gap-2.5 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 transition-all"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </motion.button>
        ) : (
          <div className="flex items-center gap-4">
             {/* SIGN IN LINK - Only visible if not already on login page */}
             {!isAuthPage && !isAuthenticated && (
               <Link to="/get-started" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors px-4">
                 Sign In
               </Link>
             )}
             
             {/* GET STARTED CTA - Hidden on Login/Onboarding to avoid redundancy */}
             {!isAuthPage && !isAuthenticated && (
               <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/get-started")}
                className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-[0_15px_30px_rgba(37,99,235,0.25)] flex items-center gap-2 transition-all hover:bg-blue-700"
              >
                Get Started
                <ArrowRight size={18} />
              </motion.button>
             )}

             {/* LOGOUT BUTTON - Specifically for Onboarding Page */}
             {isOnboarding && (
               <motion.button
                whileHover={{ scale: 1.05, color: '#e11d48' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl text-sm font-bold transition-all"
              >
                <LogOut size={18} />
                Log Out
              </motion.button>
             )}
          </div>
        )}
      </div>

      {/* MOBILE TRIGGER */}
      <button className="md:hidden p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-24 left-0 right-0 mx-6 bg-white border border-slate-100 rounded-[40px] shadow-2xl p-8 flex flex-col gap-4 md:hidden overflow-hidden"
          >
            {/* MOBILE ACCENT */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-500" />
            
            <button
              onClick={() => {
                if (isAuthenticated) {
                  if (isOnboarding) {
                    handleLogout();
                  } else {
                    handleDashboardClick();
                  }
                } else {
                  navigate("/get-started");
                }
                setIsOpen(false);
              }}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3"
            >
              {isAuthenticated ? (isOnboarding ? 'Log Out' : 'Go to Dashboard') : 'Get Started Now'}
              <ArrowRight size={20} />
            </button>
            <div className="text-center">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Experience seamless healthcare</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
