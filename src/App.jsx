import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { toast, ToastContainer, Slide, Zoom } from "react-toastify";
import { requestForToken, onMessageListener } from './firebase';
import API from './api/axios';
import 'react-toastify/dist/ReactToastify.css';
import Landing from './pages/Landing';
import GetStarted from './pages/GetStarted';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/dashboard/Dashboard';
import PatientsList from './pages/PatientsList';
import ClinicProfile from './pages/ClinicProfile';
import QRCodeGenerator from './pages/QRCodeGenerator';
import TodayAnalytics from './pages/TodayAnalytics';
import Doctors from './pages/Doctors';
import UpcomingBookings from './pages/UpcomingBookings';
import ProtectedRoute from './routes/ProtectedRoute';


const App = () => {
  useEffect(() => {
    const setupFCM = async () => {
      try {
        const token = await requestForToken();
        if (token) {
          localStorage.setItem('fcm_token', token);

          // Get clinicId from stored user and register token
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const { clinic_id } = JSON.parse(storedUser);
            if (clinic_id) {
              await API.post('/push-notification/register-fcm-token', {
                clinicId: clinic_id,
                fcmTokens: [token]
              });
            }
          }
        }
      } catch (err) {
        console.log('FCM setup failed:', err);
      }
    };

    setupFCM();

    // Listen for foreground multiple messages
    onMessageListener((payload) => {
      if (payload?.notification) {
        toast.info(
          <div className="flex flex-col gap-1">
            <p className="font-bold">{payload.notification.title}</p>
            <p className="text-xs">{payload.notification.body}</p>
          </div>,
          { icon: "🔔" }
        );
      }
    });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/patientlist" element={<PatientsList />} />
          <Route path="/dashboard/clinic" element={<ClinicProfile />} />
          <Route path="/dashboard/qrcode" element={<QRCodeGenerator />} />
          <Route path="/dashboard/analytics" element={<TodayAnalytics />} />
          <Route path="/dashboard/doctors" element={<Doctors />} />
          <Route path="/dashboard/upcoming" element={<UpcomingBookings />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        transition={Slide}   // try Zoom also
        toastClassName="!rounded-xl !shadow-lg"
        bodyClassName="text-sm font-medium"
      />
    </Router>
  );
};

export default App;
