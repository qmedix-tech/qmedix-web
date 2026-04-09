import React from 'react';
import { ListFilter } from 'lucide-react';

const TransactionPlaceholder = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
          <ListFilter size={24} className="text-slate-200" />
        </div>
        <h3 className="text-md font-bold text-slate-900">No Transactions Found</h3>
        <p className="text-[11px] text-slate-400 max-w-[240px] mt-1 font-medium italic">
          Transaction logs will appear here once clinical payments are received.
        </p>
      </div>
    </div>
  );
};

export default TransactionPlaceholder;
