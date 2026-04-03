import React, { useState, useEffect } from 'react';
import {
  QrCode, Download, Copy, ExternalLink,
  CheckCircle2, Loader2, Sparkles, Printer,
  Share2, ArrowRight, Info, ShieldCheck, Globe, Link as LinkIcon, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';

const QRCodeGenerator = () => {
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    fetchQRData();
  }, []);

  const fetchQRData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = user.clinic_id;

      if (!clinicId) {
        toast.error('Clinic identity not found');
        return;
      }

      const { data } = await API.get(`/qr/clinic/${clinicId}`);
      const extractedData = data.qr_data_string;
      setQrData(typeof extractedData === 'string' ? extractedData : JSON.stringify(extractedData));
    } catch (error) {
      console.error('Failed to fetch QR data:', error);
      toast.error('Could not generate QR registration link');
    } finally {
      setLoading(false);
    }
  };

  const qrImageUrl = qrData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}&margin=10&bgcolor=ffffff&color=2563eb`
    : '';

  const handleCopyLink = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(qrData);
      toast.success('Registration link copied!', {
        icon: <CheckCircle2 className="text-emerald-500" />
      });
      setTimeout(() => setCopying(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `QMedix_Clinic_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloading high-res QR Code...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex bg-[#F4F7FE]">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <QrCode size={16} className="text-blue-600" />
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">QR Registration</h1>
            </div>
            <p className="text-xs font-medium text-slate-500">Generate and manage your clinic's patient intake QR code</p>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrint}
              className="btn-premium btn-secondary flex items-center gap-2 px-4 py-2"
            >
              <Printer size={16} />
              <span className="hidden md:inline">Print Asset</span>
            </motion.button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

            {/* LEFT: QR CARD */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-white border border-slate-100 rounded-[40px] p-10 shadow-2xl shadow-slate-200/50 flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
                
                <div className="relative mb-8 group">
                  <div className="absolute -inset-4 bg-blue-50 rounded-[32px] scale-95 group-hover:scale-100 transition-transform duration-500 opacity-50" />
                  <div className="relative p-6 bg-white rounded-[28px] shadow-inner border border-slate-50">
                    {loading ? (
                      <div className="w-56 h-56 flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                      </div>
                    ) : (
                      <img
                        src={qrImageUrl}
                        alt="Clinic Registration QR"
                        className="w-56 h-56 transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-slate-100 rounded-xl shadow-lg flex items-center justify-center text-blue-600">
                    <QrCode size={20} />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Scan to Register</h3>
                <p className="text-sm font-medium text-slate-500 mb-8 max-w-[240px]">
                  Place this at your reception to let patients join the queue instantly.
                </p>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadQR}
                    className="btn-premium btn-secondary gap-2 text-[13px] py-3.5"
                  >
                    <Download size={16} />
                    Download
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyLink}
                    className="btn-premium btn-primary gap-2 text-[13px] py-3.5 shadow-lg shadow-blue-100"
                  >
                    {copying ? <Check size={16} /> : <Copy size={16} />}
                    {copying ? "Copied!" : "Copy Link"}
                  </motion.button>
                </div>
              </motion.div>

              <div className="mt-8 flex items-center gap-3 px-6 py-4 bg-blue-50 border border-blue-100 rounded-[28px]">
                 <ShieldCheck size={20} className="text-blue-600 shrink-0" />
                 <p className="text-[11px] font-bold text-blue-800 leading-relaxed text-left">
                   Secure & Encrypted. Every scan generates a unique patient profile tied to your clinic's digital workspace.
                 </p>
              </div>
            </div>

            {/* RIGHT: INFO & STEPS */}
            <div className="lg:col-span-7 space-y-6">
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                    <Sparkles size={20} />
                  </div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">How it works</h2>
                </div>

                <div className="space-y-6">
                   {[
                     { 
                       title: "Deploy Physical Assets", 
                       desc: "Print and display the QR code at your reception, entry points, or waiting area for easy access.",
                       icon: Printer
                     },
                     { 
                       title: "Automated Intake", 
                       desc: "Patients scan with any smartphone camera to open a simple registration form—no app required.",
                       icon: Globe
                     },
                     { 
                       title: "Instant Queue Entry", 
                       desc: "Once submitted, patients are automatically added to your dashboard and receive their token via SMS.",
                       icon: ArrowRight
                     }
                   ].map((step, i) => (
                     <div key={i} className="flex gap-4 group">
                       <div className="flex flex-col items-center">
                         <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
                           <step.icon size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                         </div>
                         {i < 2 && <div className="flex-1 w-px bg-slate-100 my-2" />}
                       </div>
                       <div className="pt-1">
                         <h4 className="text-[15px] font-bold text-slate-800 mb-1 leading-none">{step.title}</h4>
                         <p className="text-xs font-medium text-slate-400 leading-relaxed">{step.desc}</p>
                       </div>
                     </div>
                   ))}
                </div>
              </motion.div>

              {/* DIRECT LINK CARD */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                     <LinkIcon size={16} className="text-blue-600" />
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Public Registration URL</p>
                   </div>
                   <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className="text-[11px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 underline underline-offset-4"
                   >
                     {copying ? "Link Saved" : "Quick Copy"}
                   </motion.button>
                </div>

                <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] p-4 flex items-center gap-4 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate font-mono">
                      {loading ? "Encrypting registration endpoint..." : qrData}
                    </p>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400">
                    <ExternalLink size={14} />
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-4 py-4 px-6 bg-amber-50 border border-amber-100 rounded-2xl">
                   <Info size={18} className="text-amber-600 shrink-0" />
                   <p className="text-[11px] font-medium text-amber-800 leading-tight">
                     Keep this link secure. This URL allows patients to bypass physical intake and join your clinic queue directly.
                   </p>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRCodeGenerator;
