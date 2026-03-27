import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";

import {
  FaUserMd,
  FaUsers,
  FaComments,
  FaClipboardList,
  FaFileInvoice,
  FaMoneyBill,
  FaSearch,
  FaCreditCard,
  FaUserCircle,
  FaVideo,
} from "react-icons/fa";
import { toast } from "react-toastify";

// -------------------- Doctor Menu --------------------





const doctorMenu = [
  {
    id: 1,
    label: "Dashboard",
    icon: <MdDashboard />,
    path: "/doctor-dashboard",
  },
  {
    id: 2,
    label: "Consultation Requests",
    icon: <FaClipboardList />,
    path: "/doctor/requests",
  },
  {
    id: 3,
    label: "My Patients",
    icon: <FaUsers />,
    path: "/doctor/patients",
  },
  {
    id: 4,
    label: "Remote Consultation",
    icon: <FaVideo />,
    path: "/doctor/consultation",
  },
  {
    id: 5,
    label: "Prescriptions",
    icon: <FaFileInvoice />,
    path: "/doctor/prescriptions",
  },
  {
    id: 6,
    label: "Payments",
    icon: <FaMoneyBill />,
    path: "/doctor/payments",
  },
  {
    id: 7,
    label: "Doctor Profile",
    icon: <FaUserCircle />,
    path: "/doctor/profile",
  },
];

// -------------------- Patient Menu --------------------

const patientMenu = [
  {
    id: 1,
    label: "Dashboard",
    icon: <MdDashboard />,
    path: "/patient-dashboard",
  },
  {
    id: 2,
    label: "Skin Disease Prediction",
    icon: <FaSearch />,
    path: "/patient/predict",
  },
  {
    id: 3,
    label: "Find Doctors",
    icon: <FaUserMd />,
    path: "/patient/doctors",
  },
  {
    id: 4,
    label: "My Requests",
    icon: <FaClipboardList />,
    path: "/patient/requests",
  },
  {
    id: 5,
    label: "Consultation Chat",
    icon: <FaComments />,
    path: "/patient/chat",
  },
  {
    id: 6,
    label: "My Prescriptions",
    icon: <FaFileInvoice />,
    path: "/patient/prescriptions",
  },
  {
    id: 7,
    label: "Payments",
    icon: <FaCreditCard />,
    path: "/patient/payments",
  },
  {
    id: 8,
    label: "My Profile",
    icon: <FaUserCircle />,
    path: "/patient/profile",
  },
];

// -------------------- Sidebar Component --------------------

const Sidebar = ({ role }) => {
  const getMenu = () => {
    switch (role) {
      case "DOCTOR":
        return doctorMenu;

      case "PATIENT":
        return patientMenu;

      default:
        return [];
    }
  };
  const navigate = useNavigate();

  const menuItems = getMenu();
  const handleLogout =()=>{
    localStorage.removeItem("UserData");
    localStorage.removeItem("token");
    navigate("/");
    toast.success("Logout Successfully......")

  }

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-5 text-xl font-bold border-b border-gray-700">
        DermAID
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition 
               ${isActive ? "bg-blue-600" : "hover:bg-gray-700"}`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 p-2 rounded-lg">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
