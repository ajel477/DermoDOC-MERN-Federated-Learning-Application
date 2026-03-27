// DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCalendarCheck, 
  FaVideo, 
  FaMoneyBillWave, 
  FaStar, 
  FaUserFriends,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaRupeeSign,
  FaChartLine,
  FaBell,
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaPrescriptionBottle,
  FaComments,
  FaUserMd,
  FaHeartbeat,
  FaClipboardList,
  FaArrowRight,
  FaChevronRight,
  FaSpinner,
  FaExclamationCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBirthdayCake,
  FaTransgender,
  FaHistory,
  FaUserCircle,
  FaCreditCard,
  FaFileInvoice,
  FaAmbulance,
  FaHospital,
  FaMedkit,
  FaChartBar,
  FaUsers,
  FaDollarSign,
  FaStarHalf
} from 'react-icons/fa';
import Sidebar from '../Sidebar';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import axiosInstance from '../AuthenticationPages/axiosConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);


const DoctorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, _setSelectedPeriod] = useState('all');
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Get doctor ID from localStorage
  const doctorData = JSON.parse(localStorage.getItem("UserData") || "{}").user;
  const doctorId = doctorData?._id;

  useEffect(() => {
    fetchDashboardData();
    fetchAppointmentRequests();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/doctor/stats/dashboard/${doctorId}?period=${selectedPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setDashboardData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await axiosInstance.get(
        `/appointment/doctor/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setRequests(response.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRequestAction = async (appointmentId, action) => {
    try {
      await axiosInstance.patch(
        `/appointment/status/${appointmentId}`,
        { requestStatus: action },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      // Refresh data
      fetchAppointmentRequests();
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating request:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="DOCTOR" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="DOCTOR" activeTab={1} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error || 'Failed to load dashboard'}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { doctor, overview, appointments, patients, earnings, feedback, consultations } = dashboardData;

  // Chart data for earnings
  const earningsChartData = {
    labels: earnings.monthly?.map((m) => {
      const date = new Date();
      date.setMonth(m._id.month - 1);
      return date.toLocaleString('default', { month: 'short' }) + ' ' + m._id.year;
    }) || [],
    datasets: [
      {
        label: 'Monthly Earnings (₹)',
        data: earnings.monthly?.map((m) => m.total) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Chart data for appointment status
  const appointmentStatusData = {
    labels: ['Pending', 'Accepted', 'Rejected', 'Completed'],
    datasets: [
      {
        data: [
          appointments.stats.pending,
          appointments.stats.accepted,
          appointments.stats.rejected,
          appointments.stats.completed
        ],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',  // pending - yellow
          'rgba(59, 130, 246, 0.8)',   // accepted - blue
          'rgba(239, 68, 68, 0.8)',     // rejected - red
          'rgba(34, 197, 94, 0.8)'      // completed - green
        ],
        borderWidth: 0
      }
    ]
  };

  // Chart data for patient demographics
  const demographicsData = {
    labels: Object.keys(patients.demographics.ageGroups),
    datasets: [
      {
        label: 'Patients by Age Group',
        data: Object.values(patients.demographics.ageGroups),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ]
      }
    ]
  };

  // Chart data for gender distribution
  const genderData = {
    labels: Object.keys(patients.demographics.gender),
    datasets: [
      {
        data: Object.values(patients.demographics.gender),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ]
      }
    ]
  };

  // Chart data for consultation types
  const consultationTypesData = {
    labels: ['Chat', 'Video'],
    datasets: [
      {
        data: [consultations.types.Chat, consultations.types.Video],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ]
      }
    ]
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="DOCTOR" activeTab={1}/>
      
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <FaBell size={20} />
                {overview.pendingAppointments > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {overview.pendingAppointments}
                  </span>
                )}
              </button>
              <div className="flex items-center space-x-3">
                <img 
                  src={doctor.image} 
                  alt={doctor.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Dr. {doctor.name}</p>
                  <p className="text-xs text-gray-500">{doctor.specialization}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="px-8 border-b flex space-x-6">
            {['overview', 'patients', 'earnings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 capitalize font-medium text-sm border-b-2 transition ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Welcome back, Dr. {doctor.name}! 👨‍⚕️</h2>
                <p className="text-blue-100 mb-4">{doctor.specialization} at {doctor.hospitalName}</p>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <p className="text-sm opacity-90">Consultation Fee</p>
                    <p className="text-xl font-semibold">₹{doctor.consultationFee}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <p className="text-sm opacity-90">Experience</p>
                    <p className="text-xl font-semibold">{doctor.experience} years</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={<FaCalendarCheck className="text-blue-600" size={24} />}
                  label="Total Appointments"
                  value={overview.totalAppointments}
                  bgColor="bg-blue-100"
                />
                <StatCard
                  icon={<FaUsers className="text-green-600" size={24} />}
                  label="Total Patients"
                  value={overview.totalPatients}
                  bgColor="bg-green-100"
                />
                <StatCard
                  icon={<FaRupeeSign className="text-purple-600" size={24} />}
                  label="Total Earnings"
                  value={`₹${overview.totalEarnings}`}
                  bgColor="bg-purple-100"
                />
                <StatCard
                  icon={<FaStar className="text-yellow-600" size={24} />}
                  label="Average Rating"
                  value={overview.averageRating > 0 ? overview.averageRating.toFixed(1) : 'New'}
                  bgColor="bg-yellow-100"
                />
              </div>

              {/* Pending Requests Alert */}
              {overview.pendingAppointments > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FaHourglassHalf className="text-yellow-600 mr-3" />
                    <div>
                      <p className="text-yellow-700 font-medium">
                        You have {overview.pendingAppointments} pending appointment request{overview.pendingAppointments > 1 ? 's' : ''}
                      </p>
                      <button 
                        onClick={() => setActiveTab('requests')}
                        className="text-sm text-yellow-600 hover:underline mt-1"
                      >
                        View requests →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Earnings Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Earnings Overview</h3>
                  {earnings.monthly?.length > 0 ? (
                    <Line 
                      data={earningsChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: (value) => `₹${value}`
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      No earnings data available
                    </div>
                  )}
                </div>

                {/* Appointment Status Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Appointment Status</h3>
                  {overview.totalAppointments > 0 ? (
                    <div className="flex items-center justify-center">
                      <div className="w-64">
                        <Doughnut 
                          data={appointmentStatusData}
                          options={{
                            cutout: '70%',
                            plugins: {
                              legend: { position: 'bottom' }
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      No appointments yet
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Patients & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Patients */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Recent Patients</h3>
                    <button 
                      onClick={() => setActiveTab('patients')}
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      View All <FaChevronRight className="ml-1" size={12} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {patients.list.map((patient) => (
                      <div key={patient._id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={patient.image || 'https://via.placeholder.com/40'}
                            alt={patient.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-800">{patient.name}</p>
                            <p className="text-xs text-gray-500">Patient ID: {patient._id.slice(-6)}</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          <FaEye />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <QuickActionButton
                      icon={<FaVideo />}
                      label="Start Consultation"
                      color="bg-blue-600"
                    />
                    <QuickActionButton
                      icon={<FaPrescriptionBottle />}
                      label="Write Prescription"
                      color="bg-green-600"
                    />
                    <QuickActionButton
                      icon={<FaComments />}
                      label="View Messages"
                      color="bg-purple-600"
                      badge={consultations.total}
                    />
                    <QuickActionButton
                      icon={<FaFileInvoice />}
                      label="Generate Invoice"
                      color="bg-orange-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">My Patients</h2>
              
              {/* Demographics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Age Distribution</h3>
                  <Bar 
                    data={demographicsData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Gender Distribution</h3>
                  <div className="flex items-center justify-center h-48">
                    <Doughnut 
                      data={genderData}
                      options={{
                        cutout: '60%',
                        plugins: {
                          legend: { position: 'bottom' }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Patients List */}
              <div className="space-y-4">
                {patients.list.map((patient) => (
                  <PatientCard key={patient._id} patient={patient} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Earnings Overview</h2>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-800">₹{earnings.total}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-yellow-600 mb-1">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-800">₹{earnings.pending}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">Total Consultations</p>
                  <p className="text-2xl font-bold text-gray-800">{overview.totalAppointments}</p>
                </div>
              </div>

              {/* Earnings Chart */}
              {earnings.monthly?.length > 0 ? (
                <div className="h-80">
                  <Line 
                    data={earningsChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: true }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaDollarSign className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No earnings data available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Patient Feedback</h2>
              
              {/* Rating Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-800 mb-2">
                    {feedback.average > 0 ? feedback.average.toFixed(1) : '0.0'}
                  </div>
                  <div className="flex items-center justify-center mb-2">
                    {[1,2,3,4,5].map((star) => (
                      <FaStar 
                        key={star}
                        className={star <= Math.round(feedback.average) ? 'text-yellow-400' : 'text-gray-300'}
                        size={24}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">Based on {feedback.total} reviews</p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5,4,3,2,1].map((rating) => (
                    <div key={rating} className="flex items-center">
                      <span className="w-8 text-sm text-gray-600">{rating}★</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                        <div 
                          className="h-2 bg-yellow-400 rounded-full"
                          style={{ 
                            width: feedback.total > 0 
                              ? `${(feedback.distribution[rating] / feedback.total) * 100}%` 
                              : '0%' 
                          }}
                        />
                      </div>
                      <span className="w-8 text-sm text-gray-600">
                        {feedback.distribution[rating]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Feedback */}
              <h3 className="font-semibold mb-4">Recent Reviews</h3>
              {feedback.recent.length > 0 ? (
                <div className="space-y-4">
                  {feedback.recent.map((fb, index) => (
                    <FeedbackCard key={index} feedback={fb} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaStarHalf className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No feedback yet</p>
                </div>
              )}
            </div>
          )}

     
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, bgColor }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 ${bgColor} rounded-lg`}>
        {icon}
      </div>
      <span className="text-2xl font-bold text-gray-800">{value}</span>
    </div>
    <p className="text-gray-600 text-sm">{label}</p>
  </div>
);

// Quick Action Button Component
const QuickActionButton = ({ icon, label, color, badge }) => (
  <button className={`w-full ${color} text-white rounded-lg p-3 flex items-center justify-between hover:opacity-90 transition`}>
    <div className="flex items-center">
      <span className="mr-2">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
    {badge > 0 && (
      <span className="bg-white text-gray-800 text-xs px-2 py-1 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

// Request Card Component
const RequestCard = ({ request, onAccept, onReject }) => {
  const patient = request.patientId;
  
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src={patient?.image || 'https://via.placeholder.com/50'}
            alt={patient?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-800">{patient?.name}</h4>
            <p className="text-sm text-gray-600">
              <FaPhone className="inline mr-1" size={12} />
              {patient?.mobileNumber}
            </p>
            {request.symptoms && (
              <p className="text-xs text-gray-500 mt-1">
                <FaHeartbeat className="inline mr-1" size={10} />
                {request.symptoms}
              </p>
            )}
          </div>
        </div>
        <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full">
          Pending
        </span>
      </div>
      
      {request.appointmentDate && (
        <div className="mt-3 flex items-center text-sm text-gray-600">
          <FaCalendarAlt className="mr-2" />
          {new Date(request.appointmentDate).toLocaleDateString()} at {new Date(request.appointmentDate).toLocaleTimeString()}
        </div>
      )}
      
      <div className="mt-4 flex space-x-3">
        <button 
          onClick={onAccept}
          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center justify-center"
        >
          <FaCheckCircle className="mr-2" size={14} />
          Accept
        </button>
        <button 
          onClick={onReject}
          className="flex-1 px-3 py-2 border border-red-600 text-red-600 rounded-lg text-sm hover:bg-red-50 flex items-center justify-center"
        >
          <FaTimesCircle className="mr-2" size={14} />
          Reject
        </button>
      </div>
    </div>
  );
};

// Patient Card Component
const PatientCard = ({ patient }) => (
  <div className="border rounded-lg p-4 hover:shadow-md transition">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <img 
          src={patient.image || 'https://via.placeholder.com/50'}
          alt={patient.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h4 className="font-semibold text-gray-800">{patient.name}</h4>
          <p className="text-sm text-gray-600">Patient ID: {patient._id.slice(-6)}</p>
        </div>
      </div>
      <button className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
        View History
      </button>
    </div>
  </div>
);

// Feedback Card Component
const FeedbackCard = ({ feedback }) => (
  <div className="border rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <FaUserCircle className="text-gray-400" size={24} />
        <span className="font-medium text-gray-800">Anonymous Patient</span>
      </div>
      <div className="flex">
        {[1,2,3,4,5].map((star) => (
          <FaStar 
            key={star}
            className={star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'}
            size={14}
          />
        ))}
      </div>
    </div>
    <p className="text-sm text-gray-600">{feedback.comment}</p>
    <p className="text-xs text-gray-400 mt-2">{new Date(feedback.createdAt).toLocaleDateString()}</p>
  </div>
);

export default DoctorDashboard;