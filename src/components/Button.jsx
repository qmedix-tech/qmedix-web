import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

/**
 * Standardized Button component for the QMedix Premium UI.
 * Supports multiple variants and consistent hover/tap animations.
 */
const Button = ({
  children,
  type = "button",
  onClick,
  loading = false,
  disabled = false,
  className = "",
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left"
}) => {
  
  // Map internal variant names to CSS classes from index.css
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline border-slate-200 text-slate-600 hover:bg-slate-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200",
    ghost: "text-slate-500 hover:bg-slate-100 bg-transparent shadow-none"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[11px] rounded-xl font-black",
    md: "px-6 py-3.5 text-sm rounded-2xl font-black",
    lg: "px-8 py-4 text-base rounded-[24px] font-black"
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        btn-premium inline-flex items-center justify-center gap-2 transition-all 
        ${variants[variant] || variants.primary} 
        ${sizes[size] || sizes.md}
        ${disabled ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            {Icon && iconPosition === "left" && <Icon size={size === 'sm' ? 14 : 18} />}
            <span className="whitespace-nowrap">{children}</span>
            {Icon && iconPosition === "right" && <Icon size={size === 'sm' ? 14 : 18} />}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default Button;
