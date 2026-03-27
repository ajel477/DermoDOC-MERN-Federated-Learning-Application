// PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCalendarCheck, 
  FaRupeeSign,
  FaChartLine,
  FaBell,
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaPrescriptionBottle,
  FaUserMd,
  FaHeartbeat,
  FaSpinner,
  FaExclamationCircle,
  FaCalendarAlt,
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
import { useNavigate } from 'react-router-dom';

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

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, _setSelectedPeriod] = useState('all');

  // Get patient ID from localStorage/session
  const patientId = JSON.parse(localStorage.getItem("UserData")).user?._id;
  

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/patient/stats/dashboard/${patientId}?period=${selectedPeriod}`,
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

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="PATIENT" />
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
        <Sidebar role="PATIENT" activeTab={1} />
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

  const { patient, overview, appointments, doctors, payments, predictions, prescriptions, consultations, timeline } = dashboardData;

  // Chart data for spending trends
  const spendingChartData = {
    labels: payments.monthly?.map((m) => {
      const date = new Date();
      date.setMonth(m._id.month - 1);
      return date.toLocaleString('default', { month: 'short' }) + ' ' + m._id.year;
    }) || [],
    datasets: [
      {
        label: 'Monthly Spending (₹)',
        data: payments.monthly?.map((m) => m.total) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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

  // Chart data for prediction confidence
  const predictionConfidenceData = {
    labels: predictions.trends?.map((t) => t.month) || [],
    datasets: [
      {
        label: 'Average Confidence (%)',
        data: predictions.trends?.map((t) => t.averageConfidence * 100) || [],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderRadius: 6
      }
    ]
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="PATIENT" />
      
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Patient Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <FaBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <img 
                  src={patient.image || 'https://via.placeholder.com/40'} 
                  alt={patient.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{patient.name}</p>
                  <p className="text-xs text-gray-500">Patient</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="px-8 border-b flex space-x-6">
            {['overview', 'appointments', 'doctors', 'payments', 'predictions', 'prescriptions'].map((tab) => (
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
                <h2 className="text-2xl font-bold mb-2">Welcome back, {patient.name}! 👋</h2>
                <p className="text-blue-100 mb-4">Member since {new Date(patient.accountCreatedAt).toLocaleDateString()}</p>
                {appointments.nextAppointment ? (
                  <div className="bg-white/20 rounded-lg p-4 inline-block">
                    <p className="text-sm opacity-90">Next Appointment</p>
                    <p className="font-semibold">
                      {new Date(appointments.nextAppointment.appointmentDate).toLocaleDateString()} at {new Date(appointments.nextAppointment.appointmentDate).toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <button onClick={()=>navigate("/patient/doctors")} className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition">
                    Book Your First Appointment
                  </button>
                )}
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
                  icon={<FaUserMd className="text-green-600" size={24} />}
                  label="Doctors Consulted"
                  value={overview.totalDoctorsConsulted}
                  bgColor="bg-green-100"
                />
                <StatCard
                  icon={<FaRupeeSign className="text-purple-600" size={24} />}
                  label="Total Spent"
                  value={`₹${overview.totalSpent}`}
                  bgColor="bg-purple-100"
                />
                <StatCard
                  icon={<FaHeartbeat className="text-red-600" size={24} />}
                  label="Predictions"
                  value={overview.totalPredictions}
                  bgColor="bg-red-100"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Spending Overview</h3>
                  {payments.monthly?.length > 0 ? (
                    <Line 
                      data={spendingChartData}
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
                      No spending data available
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

              {/* Recent Activity & Favorite Doctors */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Timeline */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {timeline.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          item.type === 'appointment' ? 'bg-blue-100' :
                          item.type === 'prediction' ? 'bg-purple-100' : 'bg-green-100'
                        }`}>
                          {item.type === 'appointment' ? <FaCalendarCheck className="text-blue-600" /> :
                           item.type === 'prediction' ? <FaHeartbeat className="text-purple-600" /> :
                           <FaPrescriptionBottle className="text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{item.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString()}
                          </p>
                          {item.type === 'appointment' && (
                            <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                              item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                              item.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                              item.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Favorite Doctors */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Favorite Doctors</h3>
                  <div className="space-y-4">
                    {doctors.favorite.map((doc, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <img 
                          src={doc.doctor.image || 'https://via.placeholder.com/40'}
                          alt={doc.doctor.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">Dr. {doc.doctor.name}</p>
                          <p className="text-xs text-gray-500">{doc.doctor.specialization}</p>
                          <p className="text-xs text-blue-600">{doc.consultations} consultations</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">My Appointments</h2>
              
              {/* Upcoming Appointments */}
              {appointments.upcoming.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
                  <div className="space-y-4">
                    {appointments.upcoming.map((apt) => (
                      <AppointmentCard key={apt._id} appointment={apt} type="upcoming" />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Appointments */}
              {appointments.past.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Past Appointments</h3>
                  <div className="space-y-4">
                    {appointments.past.map((apt) => (
                      <AppointmentCard key={apt._id} appointment={apt} type="past" />
                    ))}
                  </div>
                </div>
              )}

              {appointments.upcoming.length === 0 && appointments.past.length === 0 && (
                <div className="text-center py-12">
                  <FaCalendarCheck className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No appointments found</p>
                  <button onClick={()=>navigate("/patient/doctors")} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Book Your First Appointment
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'doctors' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">My Doctors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.favorite.map((doc) => (
                  <div key={doc.doctor._id} className="border rounded-lg p-4 hover:shadow-lg transition">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={doc.doctor.image || 'https://via.placeholder.com/60'}
                        alt={doc.doctor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">Dr. {doc.doctor.name}</h3>
                        <p className="text-sm text-gray-600">{doc.doctor.specialization}</p>
                        <p className="text-xs text-blue-600 mt-1">{doc.consultations} consultations</p>
                      </div>
                      <button className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                        Book Again
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Payment History</h2>
              
              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-800">₹{payments.total}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-yellow-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-gray-800">₹{payments.pending}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">Transactions</p>
                  <p className="text-2xl font-bold text-gray-800">{payments.recent?.length || 0}</p>
                </div>
              </div>

              {/* Payment List */}
              <div className="space-y-4">
                {payments.recent?.map((payment) => (
                  <div key={payment._id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">Dr. {payment.doctorId?.name}</p>
                      <p className="text-sm text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">₹{payment.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        payment.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {payment.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Skin Analysis History</h2>
              
              {/* Prediction Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 mb-1">Total Analyses</p>
                  <p className="text-2xl font-bold text-gray-800">{predictions.total}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">Avg Confidence</p>
                  <p className="text-2xl font-bold text-gray-800">{(predictions.stats?.averageConfidence * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">Unique Conditions</p>
                  <p className="text-2xl font-bold text-gray-800">{Object.keys(predictions.stats?.byDisease || {}).length}</p>
                </div>
              </div>

              {/* Predictions List */}
              <div className="space-y-4">
                {predictions.history?.map((pred) => (
                  <div key={pred._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">{pred.predictedDisease}</p>
                        <p className="text-sm text-gray-500">{new Date(pred.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
                          {(pred.confidence * 100).toFixed(1)}% confidence
                        </span>
                      </div>
                    </div>
                    {pred.image && (
                      <img 
                        src={pred.image} 
                        alt="Skin analysis"
                        className="mt-3 w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">My Prescriptions</h2>
              
              {prescriptions.all?.length > 0 ? (
                <div className="space-y-4">
                  {prescriptions.all.map((pres) => (
                    <div key={pres._id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">Dr. {pres.doctorId?.name}</p>
                          <p className="text-sm text-gray-500">{pres.doctorId?.specialization}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(pres.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          <FaDownload />
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Medicines:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{pres.medicines}</p>
                        {pres.notes && (
                          <>
                            <p className="text-sm font-medium text-gray-700 mt-3 mb-1">Notes:</p>
                            <p className="text-sm text-gray-600">{pres.notes}</p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaPrescriptionBottle className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No prescriptions yet</p>
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

// Appointment Card Component
const AppointmentCard = ({ appointment, type }) => {
  const doctor = appointment.doctorId;
  
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src={doctor?.image || 'https://via.placeholder.com/50'}
            alt={doctor?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-800">Dr. {doctor?.name}</h4>
            <p className="text-sm text-gray-600">{doctor?.specialization}</p>
            <p className="text-xs text-gray-500">{doctor?.hospitalName}</p>
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full ${
          appointment.requestStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
          appointment.requestStatus === 'Accepted' ? 'bg-blue-100 text-blue-700' :
          appointment.requestStatus === 'Completed' ? 'bg-green-100 text-green-700' :
          'bg-red-100 text-red-700'
        }`}>
          {appointment.requestStatus}
        </span>
      </div>
      
      {appointment.appointmentDate && (
        <div className="mt-3 flex items-center text-sm text-gray-600">
          <FaCalendarAlt className="mr-2" />
          {new Date(appointment.appointmentDate).toLocaleDateString()} at {new Date(appointment.appointmentDate).toLocaleTimeString()}
        </div>
      )}
      
      {appointment.symptoms && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Symptoms:</span> {appointment.symptoms}
        </div>
      )}
      
      {type === 'upcoming' && (
        <div className="mt-3 flex space-x-2">
          <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            Join Consultation
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Reschedule
          </button>
        </div>
      )}
      
      {type === 'past' && appointment.requestStatus === 'Completed' && (
        <div className="mt-3 flex space-x-2">
          <button className="flex-1 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm hover:bg-blue-50">
            View Prescription
          </button>
          <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Give Feedback
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;