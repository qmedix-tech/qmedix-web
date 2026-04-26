import React, { useState, useEffect } from 'react';
import { Phone, Inbox, Loader2, Sparkles, Clock, CalendarClock, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import SpecialistSelect from '../components/SpecialistSelect';
import { ChevronDown } from 'lucide-react';

const UpcomingBookings = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Helper to convert 24h to AM/PM
  const formatTime = (time24) => {
    if (!time24) return '--:--';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchSessions(selectedDoctorId, selectedDate);
    }
  }, [selectedDoctorId, selectedDate]);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchBookings();
    }
  }, [selectedDoctorId, selectedDate, selectedSlot]);

  const fetchInitialData = async () => {
    try {
      setDoctorsLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = user.clinic_id;
      if (!clinicId) return;

      const { data: docsRes } = await API.get(`/doctors/${clinicId}`);
      const doctorList = Array.isArray(docsRes) ? docsRes : (docsRes.doctors || []);
      setDoctors(doctorList);

      if (doctorList.length > 0) {
        setSelectedDoctorId(doctorList[0].doctor_id);
      }
    } catch (error) {
      console.error('Failed to load doctors:', error);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const fetchSessions = async (doctorId, date) => {
    try {
      setSessionsLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const targetDate = date || new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      const { data } = await API.get(`/queues/${user.clinic_id}/${doctorId}/sessions`, {
        params: { target_date: targetDate }
      });
      const allSessions = Array.isArray(data) ? data : [];
      setSessions(allSessions);

      // Default Behavior: Select session matching current time, or default to first
      if (allSessions.length > 0) {
        const now = new Date();
        const currentHHMMSS = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        // Only set default if no slot is currently selected
        if (!selectedSlot) {
          const matchingSession = allSessions.find(s => 
            currentHHMMSS >= s.start_time && currentHHMMSS <= s.end_time
          );

          if (matchingSession) {
            setSelectedSlot(matchingSession.start_time);
          } else {
            setSelectedSlot(allSessions[0].start_time);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const clinicId = user.clinic_id;

      if (!clinicId) return;

      const params = {};
      if (selectedDate) params.target_date = selectedDate;
      if (selectedSlot) params.slot_start = selectedSlot;

      const { data: bookingsRes } = await API.get(`/queues/${clinicId}/upcoming-bookings`, { params });
      setAllBookings(Array.isArray(bookingsRes) ? bookingsRes : []);

    } catch (error) {
      console.error('Failed to load upcoming bookings:', error);
      toast.error(error.response?.data?.errorMessage || 'Failed to load booking schedule');
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctorInfo = doctors.find(d => d.doctor_id === selectedDoctorId);

  const filteredBookings = allBookings.filter(b => {
    if (!selectedDoctorInfo) return false;

    // Filter by doctor name
    const matchesDoctor = b.doctor_name === selectedDoctorInfo.name;

    return matchesDoctor;
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
            <div className="flex flex-wrap items-center gap-4 w-full">
              <SpecialistSelect
                doctors={doctors}
                selectedId={selectedDoctorId}
                onSelect={(id) => {
                  setSelectedDoctorId(id);
                  setSelectedSlot('');
                }}
                loading={doctorsLoading}
              />

              {/* DATE FILTER */}
              <div className="relative group/date">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/date:text-blue-500 transition-colors pointer-events-none">
                  <Calendar size={16} />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-[13px] font-bold rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all cursor-pointer shadow-sm"
                />
              </div>

              {/* SLOT FILTER */}
              {sessions.length > 0 && (
                <div className="relative group/slot">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/slot:text-blue-500 transition-colors pointer-events-none">
                    <Clock size={16} />
                  </div>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="pl-10 pr-10 py-2.5 bg-white border border-slate-200 text-slate-700 text-[13px] font-bold rounded-xl appearance-none focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all cursor-pointer min-w-[180px] shadow-sm"
                  >
                    {sessions.map((session, idx) => (
                      <option key={idx} value={session.start_time}>
                        {formatTime(session.start_time)} – {formatTime(session.end_time)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within/slot:rotate-180 transition-transform duration-300">
                    <ChevronDown size={14} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 whitespace-nowrap">
              {filteredBookings.length} Upcoming Appointments
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col relative h-auto">

              {/* TABLE HEADER */}
              <div className="grid grid-cols-[1fr_1.2fr_2fr_1.5fr_1fr] px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
                <span>Slot No</span>
                <span>Date</span>
                <span>Patient Name</span>
                <span>Phone No</span>
                <span className="text-right">Arrival Time</span>
              </div>

              {/* TABLE BODY */}
              <div className="relative">
                {loading ? (
                  <div className="divide-y divide-slate-50">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="grid grid-cols-[1.2fr_1.5fr_2fr_1.5fr_1fr] px-8 py-6 items-center">
                        <div className="w-24 h-5 rounded-lg animate-shimmer" />
                        <div className="w-20 h-5 rounded-lg animate-shimmer" />
                        <div className="w-48 h-5 rounded-lg animate-shimmer" />
                        <div className="w-32 h-5 rounded-lg animate-shimmer" />
                        <div className="w-20 h-5 rounded-lg animate-shimmer ml-auto" />
                      </div>
                    ))}
                  </div>
                ) : filteredBookings.length > 0 ? (

                  <div>
                    {filteredBookings.map((booking) => (
                        <div
                          key={booking.token_id || booking.token_number || Math.random()}
                          className="grid grid-cols-[1fr_1.2fr_2fr_1.5fr_1fr] px-8 py-5 items-center hover:bg-slate-50 cursor-pointer transition-colors group border-b border-slate-100 last:border-0"
                        >
                          <div>
                            <p className="text-sm text-slate-700 font-bold flex items-center gap-1.5">
                              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[13px]">
                                #{booking.token_number}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                              <Calendar size={14} className="text-blue-500" />
                              {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="min-w-0 pr-4">
                            <p className="font-bold text-slate-900 truncate">{booking.patient_name || 'Anonymous'}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone size={14} className="opacity-50" />
                            <span className="text-sm font-semibold font-mono tracking-tight">{booking.patient_phone || 'N/A'}</span>
                          </div>
                          <div className="text-right">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100/50 text-[10px] font-bold uppercase tracking-wider rounded-lg inline-block">
                            {formatTime(booking.estimated_arrival_time?.substring(0, 5))}
                            </span>
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
