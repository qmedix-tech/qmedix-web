import React, { useState, useEffect } from 'react';
import { CalendarDays, Phone, Inbox, Loader2, Sparkles, Clock, CalendarClock } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import SpecialistSelect from '../components/SpecialistSelect';

const UpcomingBookings = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = user.clinic_id;

      if (!clinicId) return;

      // 1. Fetch clinic doctors
      const { data: docsRes } = await API.get(`/doctors/${clinicId}`);
      const doctorList = Array.isArray(docsRes) ? docsRes : (docsRes.doctors || []);
      setDoctors(doctorList);

      if (doctorList.length > 0) {
        setSelectedDoctorId(doctorList[0].doctor_id);
      }


      // 2. Fetch upcoming bookings for the whole clinic
      const { data: bookingsRes } = await API.get(`/queues/${clinicId}/upcoming-bookings`);
      setAllBookings(Array.isArray(bookingsRes) ? bookingsRes : []);

    } catch (error) {
      console.error('Failed to load upcoming bookings:', error);
      toast.error('Failed to load booking schedule');
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctorInfo = doctors.find(d => d.doctor_id === selectedDoctorId);

  const filteredBookings = allBookings.filter(b => {
    if (!selectedDoctorInfo) return false;
    // Strict match on doctor name as returned by API
    return b.doctor_name === selectedDoctorInfo.name;
  });

  return (
    <div className="min-h-screen flex bg-[#F4F7FE]">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <CalendarClock size={16} className="text-blue-600" />
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Bookings</h1>
            </div>
            <p className="text-xs font-medium text-slate-500">View future registered appointments by specialist</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <Sparkles size={12} className="text-blue-600" />
              <span className="text-[11px] font-bold text-slate-700">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        {/* TOOLS / FILTERS */}
        <div className="px-8 py-6 bg-white/40 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* SPECIALIST SELECTOR */}
            <div className="flex items-center gap-4">
              <SpecialistSelect
                doctors={doctors}
                selectedId={selectedDoctorId}
                onSelect={setSelectedDoctorId}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
              {filteredBookings.length} Future Bookings
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col relative h-auto">

              {/* TABLE HEADER */}
              <div className="grid grid-cols-[1fr_2fr_1.5fr_1.5fr_1fr] px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
                <span>Token</span>
                <span>Patient Name</span>
                <span>Contact</span>
                <span>Scheduled Date</span>
                <span>Arrival Window</span>
              </div>

              {/* TABLE BODY */}
              <div className="relative">
                {loading ? (
                  <div className="divide-y divide-slate-50">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="grid grid-cols-[1fr_2fr_1.5fr_1.5fr_1fr] px-8 py-6 items-center">
                        <div className="w-24 h-6 rounded-lg animate-shimmer" />
                        <div className="w-48 h-5 rounded-lg animate-shimmer" />
                        <div className="w-32 h-5 rounded-lg animate-shimmer" />
                        <div className="w-36 h-5 rounded-lg animate-shimmer" />
                        <div className="w-20 h-5 rounded-lg animate-shimmer" />
                      </div>
                    ))}
                  </div>
                ) : filteredBookings.length > 0 ? (

                  <div>
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking.token_id || booking.token_number || Math.random()}
                        className="grid grid-cols-[1fr_2fr_1.5fr_1.5fr_1fr] px-8 py-5 items-center hover:bg-slate-50 cursor-pointer transition-colors group border-b border-slate-100 last:border-0"
                      >
                        <div>
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100/50 text-[10px] font-bold uppercase tracking-wider rounded-lg inline-block">
                            Token #{booking.token_number}
                          </span>
                        </div>
                        <div className="min-w-0 pr-4">
                          <p className="font-bold text-slate-900 truncate">{booking.patient_name || 'Anonymous'}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone size={14} className="opacity-50" />
                          <span className="text-sm font-semibold font-mono tracking-tight">{booking.patient_phone || 'N/A'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                            <CalendarDays size={14} className="text-blue-500" />
                            {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-700 font-mono font-bold flex items-center gap-1.5">
                            <Clock size={14} className="text-blue-500" />
                            {booking.booked_slot_start?.substring(0, 5) || '--:--'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !loading && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[400px] py-16">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium text-slate-800">No upcoming appointments</p>
                    <p className="text-[13px] font-medium mt-1">This specialist has no future bookings mapped yet.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default UpcomingBookings;
