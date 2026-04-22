import React from "react";
import { Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Input from "../Input";
import Button from "../Button";

/**
 * First step of the Auth flow: Email collection.
 */
const EmailStep = ({ email, onInputChange, onRequestOTP, loading }) => {
  return (
    <motion.form
      key="email-step"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      onSubmit={onRequestOTP}
      className="space-y-5"
    >
      <Input
        label="Clinic Email"
        name="email"
        type="email"
        placeholder="admin@clinic.com"
        value={email}
        onChange={onInputChange}
        icon={Mail}
        required
      />

      <Button
        type="submit"
        loading={loading}
        className="w-full py-4 text-sm font-bold bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/20 rounded-xl transition-all active:scale-[0.98]"
        icon={ArrowRight}
        iconPosition="right"
      >
        Request OTP
      </Button>
    </motion.form>
  );
};

export default EmailStep;
