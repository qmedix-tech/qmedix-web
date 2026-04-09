import React from 'react';
import { Webhook, Key, ShieldCheck, Eye, EyeOff, CheckCircle2, Sparkles, Download } from 'lucide-react';

const GatewayConfigForm = ({ 
  formData, 
  setFormData, 
  isSubmitting, 
  handleSetup, 
  isEditing, 
  onCancel,
  showSecret,
  setShowSecret,
  webhookUrl,
  generateWebhookUrl,
  copyToClipboard,
  copied
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50/30 border border-blue-100/50 p-5 rounded-2xl flex flex-col md:flex-row items-center gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm">
          <Webhook size={24} className="text-blue-500" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-900">Webhook Configuration</h4>
          <p className="text-xs text-slate-600">Register this URL in your Razorpay dashboard to sync payments automatically.</p>
        </div>

        {!webhookUrl ? (
          <button
            onClick={generateWebhookUrl}
            className="flex items-center gap-2 text-blue-600 font-bold text-xs bg-white px-4 py-2 rounded-lg border border-blue-100 hover:bg-blue-50 transition-all shadow-sm"
          >
            <Sparkles size={14} className="text-blue-500" />
            Get Webhook URL
          </button>
        ) : (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="bg-white border border-blue-100 px-3 py-2 rounded-lg text-[10px] font-mono font-bold text-blue-600 w-full md:w-64 outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md flex-shrink-0"
              title="Copy to Clipboard"
            >
              {copied ? <CheckCircle2 size={16} /> : <Download size={16} className="rotate-180" />}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Key ID</label>
          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              type="text"
              placeholder="rzp_live_..."
              value={formData.key_id}
              onChange={(e) => setFormData({...formData, key_id: e.target.value})}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Key Secret</label>
          <div className="relative">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              type={showSecret ? "text" : "password"}
              placeholder="Key Secret"
              value={formData.key_secret}
              onChange={(e) => setFormData({...formData, key_secret: e.target.value})}
              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
            <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500 transition-colors">
              {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Webhook Secret</label>
          <div className="relative">
            <Webhook className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              type="text"
              placeholder="Webhook Secret"
              value={formData.webhook_secret}
              onChange={(e) => setFormData({...formData, webhook_secret: e.target.value})}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-white text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSetup}
          disabled={isSubmitting}
          className="px-8 py-3 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 disabled:opacity-50 disabled:translate-y-0"
        >
          {isSubmitting ? (isEditing ? 'Updating...' : 'Verifying...') : (isEditing ? 'Save Changes' : 'Initialize Gateway')}
          <CheckCircle2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default GatewayConfigForm;
