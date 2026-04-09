import React from 'react';
import { Key, Webhook, Clock, EyeOff, Eye, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

const GatewayStats = ({ 
  config, 
  isKeyVisible, 
  setIsKeyVisible, 
  onUpdateClick 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Key size={12} />
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Key ID</p>
          </div>
          <button 
            onClick={() => setIsKeyVisible(!isKeyVisible)}
            className="p-1 px-2 text-[10px] font-bold text-blue-500 hover:bg-blue-50 rounded transition-all flex items-center gap-1"
          >
            {isKeyVisible ? <EyeOff size={12} /> : <Eye size={12} />}
            {isKeyVisible ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="text-sm font-bold text-slate-700 font-mono tracking-tighter overflow-hidden text-ellipsis whitespace-nowrap">
          {isKeyVisible ? config.key_id : '•••• •••• •••• ••••'}
        </p>
      </div>

      <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Webhook size={12} />
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Webhook Status</p>
        </div>
        <div className="flex items-center gap-2">
          {config.has_webhook ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-amber-500" />}
          <p className="text-xs font-bold text-slate-700">{config.has_webhook ? 'Synchronized' : 'Incomplete'}</p>
        </div>
      </div>

      <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between group hover:border-blue-200 transition-all">
         <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Clock size={12} />
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Config Life Cycle</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-500">Updated {config.updated_at ? new Date(config.updated_at).toLocaleDateString() : 'recently'}</p>
          
          <button 
            onClick={onUpdateClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
          >
            <RefreshCw size={10} />
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default GatewayStats;
