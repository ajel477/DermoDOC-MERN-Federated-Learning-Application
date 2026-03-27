import React from "react";
import "./App.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./AuthenticationPages/AuthProvider";
import PrivateRoute from "./AuthenticationPages/PrivateRoute";
import Login from "./AuthenticationPages/Login";
import LandingPage from "./LandingPage";
import Sidebar from "./Sidebar";
import PatientDashboard from "./patient/UserDash";
import DoctorDashboard from "./doctor/DocDash";
import FindDoctors from "./patient/FindDoctors";
import MyRequests from "./patient/MyRequests";
import ConsultationChat from "./patient/ConsultationChat";
import MyPrescriptions from "./patient/MyPrescriptions";
import MyPayments from "./patient/MyPayments";
import MyProfile from "./patient/MyProfile";
import ConsultationRequests from "./doctor/ConsultationRequests";
import MyPatients from "./doctor/MyPatients";
import ConsultationChatDoc from "./doctor/ConsultationChatDoc";
import DoctorPrescriptions from "./doctor/DoctorPrescriptions";
import DoctorPayments from "./doctor/DoctorPayments";
import MyDocProfile from "./doctor/DocProfile";
import SkinPrediction from "./patient/SkinPrediction";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/patient-dashboard"
            element={
              <PrivateRoute>
                <PatientDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/doctors"
            element={
              <PrivateRoute>
                <FindDoctors />
              </PrivateRoute>
            }
          />
            <Route
            path="/patient/predict"
            element={
              <PrivateRoute>
                <SkinPrediction />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/requests"
            element={
              <PrivateRoute>
                <MyRequests />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/chat"
            element={
              <PrivateRoute>
                <ConsultationChat />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <PrivateRoute>
                <MyPrescriptions />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/payments"
            element={
              <PrivateRoute>
                <MyPayments />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <PrivateRoute>
                <MyProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor-dashboard"
            element={
              <PrivateRoute>
                <DoctorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/requests"
            element={
              <PrivateRoute>
                <ConsultationRequests />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <PrivateRoute>
                <MyPatients />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/consultation"
            element={
              <PrivateRoute>
                <ConsultationChatDoc />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/prescriptions"
            element={
              <PrivateRoute>
                <DoctorPrescriptions />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/payments"
            element={
              <PrivateRoute>
                <DoctorPayments />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <PrivateRoute>
                <MyDocProfile />
              </PrivateRoute>
            }
          />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
