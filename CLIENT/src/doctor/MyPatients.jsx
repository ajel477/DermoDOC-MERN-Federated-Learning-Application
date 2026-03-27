// doctor/MyPatients.jsx
import React, { useState, useEffect } from "react";
import {
  FaUserMd,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaHeartbeat,
  FaNotesMedical,
  FaPrescriptionBottle,
  FaSpinner,
  FaExclamationCircle,
  FaBell,
  FaSearch,
  FaFilter,
  FaEye,
  FaDownload,
  FaHistory,
  FaTransgender,
  FaBirthdayCake,
  FaStethoscope,
  FaHospital,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
  FaFileMedical,
  FaClipboardList,
  FaChartLine,
  FaWeight,
  FaTint,
  FaComments,
  FaVideo,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../AuthenticationPages/axiosConfig";
import Sidebar from "../Sidebar";

const MyPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("recent");
  const patientsPerPage = 6;

  // Get doctor data from localStorage
  const doctorData = JSON.parse(localStorage.getItem("UserData") || "{}").user;
  const doctorId = doctorData?._id;

  useEffect(() => {
    if (doctorId) {
      fetchPatients();
    }
  }, [doctorId]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // Get all appointments for this doctor to extract unique patients
      const response = await axiosInstance.get(
        `/appointment/doctor/${doctorId}`,
      );

      // Extract unique patients from appointments
      const uniquePatients = [];
      const patientMap = new Map();

      response.data.forEach((appointment) => {
        const patient = appointment.patientId;
        if (patient && patient._id && !patientMap.has(patient._id)) {
          patientMap.set(patient._id, {
            ...patient,
            lastAppointment: appointment.appointmentDate,
            appointmentStatus: appointment.requestStatus,
            consultationType: appointment.consultationType,
            symptoms: appointment.symptoms,
            appointmentId: appointment._id,
          });
          uniquePatients.push({
            ...patient,
            lastAppointment: appointment.appointmentDate,
            appointmentStatus: appointment.requestStatus,
            consultationType: appointment.consultationType,
            symptoms: appointment.symptoms,
            appointmentId: appointment._id,
          });
        }
      });

      setPatients(uniquePatients);
      setError(null);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load patients");
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientHistory = async (patientId) => {
    try {
      setLoadingHistory(true);
      // Get all appointments for this patient with this doctor
      const response = await axiosInstance.get(
        `/appointment/patient/${patientId}`,
      );

      // Filter appointments for this doctor
      const doctorAppointments = response.data.filter(
        (apt) => apt.doctorId?._id === doctorId,
      );

      setPatientHistory(doctorAppointments);
    } catch (err) {
      console.error("Error fetching patient history:", err);
      toast.error("Failed to load patient history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewPatient = async (patient) => {
    setSelectedPatient(patient);
    await fetchPatientHistory(patient._id);
    setShowDetailsModal(true);
  };

  // Filter patients based on search
  const filteredPatients = patients.filter((patient) => {
    const patientName = patient.name?.toLowerCase() || "";
    const patientEmail = patient.email?.toLowerCase() || "";
    const patientPhone = patient.mobileNumber?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    return (
      patientName.includes(searchLower) ||
      patientEmail.includes(searchLower) ||
      patientPhone.includes(searchLower)
    );
  });

  // Sort patients
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (sortBy === "recent") {
      return (
        new Date(b.lastAppointment || 0) - new Date(a.lastAppointment || 0)
      );
    } else if (sortBy === "name") {
      return (a.name || "").localeCompare(b.name || "");
    } else if (sortBy === "oldest") {
      return (
        new Date(a.lastAppointment || 0) - new Date(b.lastAppointment || 0)
      );
    }
    return 0;
  });

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = sortedPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient,
  );
  const totalPages = Math.ceil(sortedPatients.length / patientsPerPage);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No appointments yet";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Accepted":
        return "bg-blue-100 text-blue-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="DOCTOR" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your patients...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="DOCTOR" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchPatients}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="DOCTOR" />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">My Patients</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <FaBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Patients"
              value={patients.length}
              icon={<FaUserCircle />}
              bgColor="bg-blue-100"
              textColor="text-blue-600"
            />
            <StatCard
              label="Active Consultations"
              value={
                patients.filter((p) => p.appointmentStatus === "Accepted")
                  .length
              }
              icon={<FaHeartbeat />}
              bgColor="bg-green-100"
              textColor="text-green-600"
            />
            <StatCard
              label="Completed"
              value={
                patients.filter((p) => p.appointmentStatus === "Completed")
                  .length
              }
              icon={<FaCheckCircle />}
              bgColor="bg-purple-100"
              textColor="text-purple-600"
            />
            <StatCard
              label="New This Month"
              value={
                patients.filter((p) => {
                  const lastMonth = new Date();
                  lastMonth.setMonth(lastMonth.getMonth() - 1);
                  return new Date(p.lastAppointment) > lastMonth;
                }).length
              }
              icon={<FaChartLine />}
              bgColor="bg-yellow-100"
              textColor="text-yellow-600"
            />
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Sort By */}
              <div className="relative">
                <FaFilter className="absolute left-3 top-3 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-end text-gray-600">
                <span>{filteredPatients.length} patients found</span>
              </div>
            </div>
          </div>

          {/* Patients Grid */}
          {filteredPatients.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPatients.map((patient) => (
                  <PatientCard
                    key={patient._id}
                    patient={patient}
                    onView={() => handleViewPatient(patient)}
                    formatDate={formatDate}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 border rounded-lg ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <FaUserCircle className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No patients found</p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Clear search
                </button>
              ) : (
                <p className="text-sm text-gray-400 mt-2">
                  Patients will appear here after appointments are booked
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      {showDetailsModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Patient Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle size={20} />
                </button>
              </div>

              {/* Patient Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 mb-6 text-white">
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      selectedPatient.image || "https://via.placeholder.com/80"
                    }
                    alt={selectedPatient.name}
                    className="w-20 h-20 rounded-full border-4 border-white object-cover"
                  />
                  <div>
                    <h3 className="text-2xl font-bold">
                      {selectedPatient.name}
                    </h3>
                    <p className="text-blue-100">
                      Patient ID: #{selectedPatient._id?.slice(-8)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaUserCircle className="mr-2 text-blue-600" />
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    <p className="text-sm flex items-center">
                      <FaEnvelope className="mr-2 text-gray-400" size={14} />
                      <span className="font-medium mr-2">Email:</span>
                      {selectedPatient.email || "Not provided"}
                    </p>
                    <p className="text-sm flex items-center">
                      <FaPhone className="mr-2 text-gray-400" size={14} />
                      <span className="font-medium mr-2">Phone:</span>
                      {selectedPatient.mobileNumber || "Not provided"}
                    </p>
                    <p className="text-sm flex items-center">
                      <FaTransgender className="mr-2 text-gray-400" size={14} />
                      <span className="font-medium mr-2">Gender:</span>
                      {selectedPatient.gender || "Not provided"}
                    </p>
                    <p className="text-sm flex items-center">
                      <FaBirthdayCake
                        className="mr-2 text-gray-400"
                        size={14}
                      />
                      <span className="font-medium mr-2">Age:</span>
                      {selectedPatient.age || "Not provided"} years
                    </p>
                    <p className="text-sm flex items-start">
                      <FaMapMarkerAlt
                        className="mr-2 text-gray-400 mt-1"
                        size={14}
                      />
                      <span className="font-medium mr-2">Address:</span>
                      <span>{selectedPatient.address || "Not provided"}</span>
                    </p>
                  </div>
                </div>

                {/* Current Appointment */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaHeartbeat className="mr-2 text-blue-600" />
                    Current Appointment
                  </h4>
                  <div className="space-y-3">
                    <p className="text-sm flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-400" size={14} />
                      <span className="font-medium mr-2">Date:</span>
                      {formatDate(selectedPatient.lastAppointment)}
                    </p>
                    <p className="text-sm flex items-center">
                      <FaClipboardList
                        className="mr-2 text-gray-400"
                        size={14}
                      />
                      <span className="font-medium mr-2">Status:</span>
                      <span
                        className={`${getStatusBadge(selectedPatient.appointmentStatus)} px-2 py-1 rounded-full text-xs`}
                      >
                        {selectedPatient.appointmentStatus}
                      </span>
                    </p>
                    <p className="text-sm flex items-center">
                      {selectedPatient.consultationType === "video" ? (
                        <FaVideo className="mr-2 text-blue-400" size={14} />
                      ) : (
                        <FaComments className="mr-2 text-green-400" size={14} />
                      )}
                      <span className="font-medium mr-2">Type:</span>
                      {selectedPatient.consultationType || "Not specified"}
                    </p>
                    {selectedPatient.symptoms && (
                      <p className="text-sm">
                        <span className="font-medium block mb-1">
                          Symptoms:
                        </span>
                        <span className="text-gray-600">
                          {selectedPatient.symptoms}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Medical History */}
                <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaHistory className="mr-2 text-blue-600" />
                    Consultation History
                  </h4>

                  {loadingHistory ? (
                    <div className="flex justify-center py-4">
                      <FaSpinner
                        className="animate-spin text-blue-600"
                        size={24}
                      />
                    </div>
                  ) : patientHistory.length > 0 ? (
                    <div className="space-y-3">
                      {patientHistory.map((record, index) => (
                        <div
                          key={index}
                          className="bg-white p-3 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-800">
                                {new Date(
                                  record.appointmentDate,
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(
                                  record.appointmentDate,
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                            <span
                              className={`${getStatusBadge(record.requestStatus)} px-3 py-1 rounded-full text-xs`}
                            >
                              {record.requestStatus}
                            </span>
                          </div>
                          {record.symptoms && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Symptoms:</span>{" "}
                              {record.symptoms}
                            </p>
                          )}
                          {record.prescription && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <p className="text-sm font-medium text-blue-600 flex items-center">
                                <FaPrescriptionBottle className="mr-1" />
                                Prescription Available
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No consultation history available
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    // Navigate to chat or prescription
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <FaComments className="mr-2" />
                  Send Message
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    // Navigate to prescription
                  }}
                  className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center"
                >
                  <FaPrescriptionBottle className="mr-2" />
                  View Prescriptions
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon, bgColor, textColor }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 ${bgColor} rounded-lg ${textColor}`}>{icon}</div>
    </div>
  </div>
);

// Patient Card Component
const PatientCard = ({ patient, onView, formatDate, getStatusBadge }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <img
            src={patient.image || "https://via.placeholder.com/60"}
            alt={patient.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-lg">
              {patient.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Patient ID: #{patient._id?.slice(-8)}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-600 flex items-center">
            <FaEnvelope className="mr-2 text-gray-400" size={12} />
            {patient.email}
          </p>
          <p className="text-sm text-gray-600 flex items-center">
            <FaPhone className="mr-2 text-gray-400" size={12} />
            {patient.mobileNumber || "No phone"}
          </p>
          {patient.lastAppointment && (
            <p className="text-sm text-gray-600 flex items-center">
              <FaCalendarAlt className="mr-2 text-gray-400" size={12} />
              Last: {formatDate(patient.lastAppointment)}
            </p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span
              className={`${getStatusBadge(patient.appointmentStatus)} text-xs px-3 py-1 rounded-full`}
            >
              {patient.appointmentStatus || "No status"}
            </span>
            <button
              onClick={onView}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center"
            >
              <FaEye className="mr-1" size={12} />
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPatients;
