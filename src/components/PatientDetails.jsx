import React, { useState, useEffect } from 'react';
import {
  User, Phone, CalendarDays, Loader2, XCircle, Clock, Stethoscope, PackageOpen
} from 'lucide-react';
import API from '../api/axios';

const PatientDetails = ({ patient = null, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patient) {
      fetchHistory();
    }
  }, [patient]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const patientId = patient.id || patient.patient_id;
      const { data } = await API.get(`/patients/${patientId}/history`);

      const items = data?.items || [];
      setHistory(items);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error loading patient history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl items-start animate-pulse mt-4">
        <div className="w-full md:w-[340px] h-96 bg-white border border-slate-100 rounded-xl" />
        <div className="flex-1 h-96 bg-white border border-slate-100 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 mt-4 bg-white border border-rose-100 rounded-2xl text-rose-500 flex items-center gap-2 shadow-sm min-h-[300px]">
        <XCircle /> {error}
      </div>
    );
  }

  const patientName = patient?.patient_name || patient?.name || 'Anonymous';
  const initial = patientName[0]?.toUpperCase() || 'P';
  const dpUrl = patient.dp_url || patient.doctor_dp_url;

  return (
    <div className="mt-2">
      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 px-4 py-2 mb-6
                   bg-white border border-slate-200 rounded-xl
                   text-sm font-semibold text-slate-700
                   shadow-sm hover:shadow-md
                   hover:border-blue-300 hover:text-blue-600
                   transition-all duration-200"
      >
        <span className="transition-transform group-hover:-translate-x-1">
          ←
        </span>
        Back to Patients
      </button>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl items-start">
        {/* LEFT CARD */}
        <div className="w-full md:w-[340px] bg-white rounded-xl shadow-sm p-8 flex flex-col shrink-0 border border-slate-100">
          <div className="flex flex-col items-center text-center">
             <div className="w-32 h-32 rounded-full mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-white shadow-xl shadow-blue-500/10 flex flex-col items-center justify-center text-blue-600 font-bold overflow-hidden relative group/dp">
               {dpUrl ? (
                 <img
                   src={dpUrl}
                   alt="Patient"
                   className="w-full h-full object-cover transition-transform duration-500 group-hover/dp:scale-110"
                 />
               ) : (
                 <span className="text-3xl tracking-tighter">
                   {initial}
                 </span>
               )}
               <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
             </div>
             <h2 className="text-xl font-bold text-slate-900 tracking-tight">{patientName}</h2>
             <p className="text-xs font-semibold text-slate-400 mt-1.5 uppercase tracking-widest">
               Patient Profile
             </p>
          </div>

          <div className="mt-12 space-y-6">
             <div>
               <p className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                 <Phone size={14} className="text-slate-400" /> Phone Number
               </p>
               <p className="text-sm text-slate-500 mt-1.5 font-mono ml-6">{patient?.patient_phone || patient?.phone || 'N/A'}</p>
             </div>
             <div>
               <p className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                 <CalendarDays size={14} className="text-slate-400" /> Registered
               </p>
               <p className="text-sm text-slate-500 mt-1.5 ml-6">
                 {patient?.created_at
                   ? new Date(patient.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                   : patient?.date || "Unknown date"}
               </p>
             </div>
          </div>
        </div>

        {/* RIGHT CARD CONTAINER */}
        <div className="flex-1 w-full flex flex-col gap-5">
           {/* TOP NAV TABS */}
           <div className="bg-white rounded-xl shadow-sm px-8 py-1.5 flex items-center gap-8 border border-slate-100">
             <button
               className="py-3.5 font-bold text-sm tracking-wide border-b-2 transition-colors border-[#222E3C] text-[#222E3C]"
             >
               Appointment History
             </button>
           </div>

           {/* MAIN TAB CONTENT */}
           <div className="bg-white rounded-xl shadow-sm p-10 flex-1 min-h-[500px] border border-slate-100">
             <div className="flex items-center gap-8 mb-10 border-b border-slate-100">
                <button className="text-sm font-bold tracking-wide text-[#222E3C] border-b-2 border-[#222E3C] pb-3 -mb-[2px]">
                  Past Visits
                </button>
             </div>

             {history.length > 0 ? (
                <div className="grid gap-4">
                  {history.map((visit, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full overflow-hidden border border-slate-100 shadow-sm shrink-0 flex flex-col items-center justify-center">
                           {visit.doctor_dp_url && visit.doctor_dp_url.startsWith("http") ? (
                             <img src={visit.doctor_dp_url} alt={visit.doctor_name} className="w-full h-full object-cover" />
                           ) : (
                             <Stethoscope size={20} className="text-slate-300" />
                           )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{visit.doctor_name || 'General Doctor'}</h4>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">{visit.doctor_specialty || visit.clinic_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 sm:justify-end">
                         <div className="text-right">
                            <p className="text-sm text-slate-700 font-bold flex items-center justify-end gap-1.5">
                              <CalendarDays size={14} className="text-slate-400" />
                              {new Date(visit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-1">
                              {visit.booked_day}
                            </p>
                         </div>
                         <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                         <div className="text-right">
                           <p className="text-sm text-slate-700 font-mono font-bold flex items-center justify-end gap-1.5">
                             <Clock size={14} className="text-blue-500" />
                             {visit.slot?.start_time?.substring(0, 5) || '--:--'} - {visit.slot?.end_time?.substring(0, 5) || '--:--'}
                           </p>
                           <p className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded border border-indigo-100/50">
                             Token #{visit.token_number}
                           </p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center pt-24 pb-12">
                   <div className="relative mb-6">
                      <div className="text-blue-400 drop-shadow-[0_10px_20px_rgba(96,165,250,0.3)] opacity-90">
                        <PackageOpen size={100} strokeWidth={1} />
                      </div>
                      <div className="absolute inset-x-0 -bottom-6 h-4 bg-slate-200/50 blur-xl rounded-[100%]"></div>
                   </div>
                   <p className="text-slate-500 font-bold text-lg mb-1 tracking-tight">No Visit History</p>
                   <p className="text-slate-400 text-sm font-medium">This patient hasn't completed any visits yet.</p>
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
