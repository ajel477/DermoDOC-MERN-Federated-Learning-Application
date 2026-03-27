// patient/FindDoctors.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUserMd,
  FaStar,
  FaRupeeSign,
  FaHospital,
  FaBriefcase,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaClock,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationCircle,
  FaStethoscope,
  FaGraduationCap,
  FaHeartbeat,
  FaComments,
  FaVideo,
  FaBell,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../AuthenticationPages/axiosConfig";
import Sidebar from "../Sidebar"; // Import Sidebar

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const patientId = JSON.parse(localStorage.getItem("UserData")).user?._id;

  const [bookingData, setBookingData] = useState({
    patientId: patientId, // This should come from auth context
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    symptoms: "",
    consultationType: "video",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 6;

  // Get patient data from localStorage/session
  const patientData = JSON.parse(localStorage.getItem("UserData") || "{}").user;
  console.log(patientData);
  

  // Get unique specializations for filter
  const specializations = [
    "all",
    ...new Set(doctors.map((d) => d.specialization)),
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/doctor/`);
      setDoctors(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to load doctors");
      toast.error("Failed to load doctors list");
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingData({
      ...bookingData,
      doctorId: doctor._id,
      patientId: patientData?._id, // Use actual patient ID from local storage
    });
    setShowBookingDialog(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!bookingData.appointmentDate || !bookingData.appointmentTime) {
      toast.error("Please select appointment date and time");
      return;
    }

    setBookingLoading(true);

    try {
      // Combine date and time
      const appointmentDateTime = new Date(
        `${bookingData.appointmentDate}T${bookingData.appointmentTime}`,
      );

      const response = await axiosInstance.post(
        `/appointment/book`,
        {
          patientId: bookingData.patientId,
          doctorId: bookingData.doctorId,
          appointmentDate: appointmentDateTime.toISOString(),
          symptoms: bookingData.symptoms,
          consultationType: bookingData.consultationType,
          requestStatus: "Pending",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setBookedAppointment(response.data.appointment);
      setShowBookingDialog(false);
      setShowSuccessDialog(true);
      toast.success("Appointment request sent successfully!");

      // Reset form
      setBookingData({
        ...bookingData,
        appointmentDate: "",
        appointmentTime: "",
        symptoms: "",
        consultationType: "video",
      });
    } catch (err) {
      console.error("Error booking appointment:", err);
      toast.error(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCloseDialogs = () => {
    setShowBookingDialog(false);
    setShowSuccessDialog(false);
    setSelectedDoctor(null);
    setBookedAppointment(null);
  };

  // Filter doctors based on search and specialization
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.hospitalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization =
      selectedSpecialization === "all" ||
      doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  // Pagination
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor,
  );
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="PATIENT" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="PATIENT" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchDoctors}
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
      <Sidebar role="PATIENT" />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Find Doctors</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <FaBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {patientData.name || "Patient"}
                  </p>
                  <p className="text-xs text-gray-500">Patient</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, specialization, hospital..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Specialization Filter */}
              <div className="relative">
                <FaFilter className="absolute left-3 top-3 text-gray-400" />
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 appearance-none bg-white"
                >
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec === "all" ? "All Specializations" : spec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-end text-gray-600">
                <span>{filteredDoctors.length} doctors found</span>
              </div>
            </div>
          </div>

          {/* Doctors Grid */}
          {filteredDoctors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor._id}
                    doctor={doctor}
                    onBook={() => handleBookClick(doctor)}
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
              <FaUserMd className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                No doctors found matching your criteria
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Dialog */}
      {showBookingDialog && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Book Appointment
                </h2>
                <button
                  onClick={() => setShowBookingDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Doctor Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      selectedDoctor.image || "https://via.placeholder.com/50"
                    }
                    alt={selectedDoctor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Dr. {selectedDoctor.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedDoctor.specialization}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedDoctor.hospitalName}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-semibold text-blue-600">
                    ₹{selectedDoctor.consultationFee}
                  </span>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit}>
                {/* Date Selection */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaCalendarAlt className="inline mr-2" />
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.appointmentDate}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        appointmentDate: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Time Selection */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaClock className="inline mr-2" />
                    Appointment Time *
                  </label>
                  <input
                    type="time"
                    value={bookingData.appointmentTime}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        appointmentTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Consultation Type */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Consultation Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setBookingData({
                          ...bookingData,
                          consultationType: "video",
                        })
                      }
                      className={`p-3 border rounded-lg flex items-center justify-center space-x-2 ${
                        bookingData.consultationType === "video"
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <FaVideo />
                      <span>Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setBookingData({
                          ...bookingData,
                          consultationType: "chat",
                        })
                      }
                      className={`p-3 border rounded-lg flex items-center justify-center space-x-2 ${
                        bookingData.consultationType === "chat"
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <FaComments />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>

                {/* Symptoms */}
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaHeartbeat className="inline mr-2" />
                    Symptoms / Reason for Visit
                  </label>
                  <textarea
                    value={bookingData.symptoms}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        symptoms: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Please describe your symptoms or reason for consultation..."
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingDialog(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {bookingLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Booking...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && bookedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Request Sent Successfully!
              </h2>
              <p className="text-gray-600 mb-4">
                Your appointment request has been sent to Dr.{" "}
                {selectedDoctor?.name}
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm text-gray-600 mb-2">
                  Appointment Details:
                </p>
                <p className="text-sm">
                  <strong>Doctor:</strong> Dr. {selectedDoctor?.name}
                </p>
                <p className="text-sm">
                  <strong>Date:</strong>{" "}
                  {new Date(
                    bookedAppointment.appointmentDate,
                  ).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <strong>Time:</strong>{" "}
                  {new Date(
                    bookedAppointment.appointmentDate,
                  ).toLocaleTimeString()}
                </p>
                <p className="text-sm">
                  <strong>Status:</strong>
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                    Pending Approval
                  </span>
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCloseDialogs}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleCloseDialogs();
                    // Navigate to requests page or stay
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View My Requests
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Doctor Card Component
const DoctorCard = ({ doctor, onBook }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <img
            src={doctor.image || "https://via.placeholder.com/80"}
            alt={doctor.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-blue-100"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-lg">
              Dr. {doctor.name}
            </h3>
            <div className="flex items-center text-sm text-blue-600 mb-2">
              <FaStethoscope className="mr-1" size={12} />
              {doctor.specialization}
            </div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <FaHospital className="mr-1" />
              {doctor.hospitalName}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <FaBriefcase className="mr-1" />
              {doctor.experience} years experience
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <FaRupeeSign className="text-gray-400 mr-1" />
              <span className="font-semibold text-gray-800">
                ₹{doctor.consultationFee}
              </span>
              <span className="text-xs text-gray-500 ml-1">/consultation</span>
            </div>
            <div className="flex items-center text-yellow-500">
              <FaStar className="mr-1" />
              <span className="text-sm text-gray-600">4.5</span>
            </div>
          </div>

          <div className="flex items-center text-xs text-gray-500 mb-3">
            <FaMapMarkerAlt className="mr-1 flex-shrink-0" />
            <span className="truncate">{doctor.address}</span>
          </div>

          <button
            onClick={onBook}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindDoctors;
