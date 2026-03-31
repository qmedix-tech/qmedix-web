import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, Slide, Zoom } from "react-toastify";
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
import ProtectedRoute from './routes/ProtectedRoute';


const App = () => {
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
