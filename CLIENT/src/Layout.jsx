// components/Layout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();
  
  // Determine role based on path or user data
  const getRoleFromPath = () => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/seller')) return 'seller';
    if (path.startsWith('/user')) return 'user';
    return 'user'; // default
  };

  const role = getRoleFromPath();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        role={role}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </h1>
        </div>
        
        {/* Main Content */}
        {children}
      </main>
    </div>
  );
};

export default Layout;