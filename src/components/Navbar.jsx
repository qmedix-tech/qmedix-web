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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const checkAuth = () =>
      setIsAuthenticated(!!localStorage.getItem("access_token"));

    window.addEventListener("scroll", handleScroll);
    checkAuth();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

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

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/");
    setIsOpen(false);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/#features" },
    { name: "About", href: "/#about" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 py-4
        ${scrolled || !isLandingPage
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm"
          : "bg-transparent border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <HeartPulse size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            QMedix
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {isLandingPage && navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && !isAuthPage ? (
            <button
              onClick={handleDashboardClick}
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-md active:scale-95"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
          ) : (
            <div className="flex items-center gap-4">
              {!isAuthPage && !isAuthenticated && (
                <Link
                  to="/get-started"
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight size={16} />
                </Link>
              )}
              {isOnboarding && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-all active:scale-95"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              )}
            </div>
          )}
        </div>

        {/* MOBILE TRIGGER */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {isLandingPage && navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-base font-medium text-slate-700 py-2 border-b border-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    handleDashboardClick();
                  } else {
                    navigate("/get-started");
                  }
                  setIsOpen(false);
                }}
                className="w-full py-3 bg-primary text-white rounded-lg font-bold shadow-md flex items-center justify-center gap-2 mt-2"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Now'}
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
