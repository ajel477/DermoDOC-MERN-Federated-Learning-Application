// patient/MyRequests.jsx
import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaHospital,
  FaRupeeSign,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaVideo,
  FaComments,
  FaMapMarkerAlt,
  FaBell,
  FaSearch,
  FaFilter,
  FaEye,
  FaDownload,
  FaFileInvoice,
  FaPrescriptionBottle,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../AuthenticationPages/axiosConfig";
import Sidebar from "../Sidebar";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [cancellingRequest, setCancellingRequest] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: "",
    doctorId: "",
  });
  const requestsPerPage = 5;

  // Get patient data from localStorage
  const patientData = JSON.parse(
    localStorage.getItem("UserData") || "{}",
  )?.user;
  console.log(patientData, "k");
  const patientId = patientData?._id;

  useEffect(() => {
    if (patientId) {
      fetchRequests();
    }
  }, [patientId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/appointment/patient/${patientId}`,
      );
      setRequests(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load appointment requests");
      toast.error("Failed to load appointment requests");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this appointment request?",
      )
    ) {
      return;
    }

    try {
      setCancellingRequest(true);

      // Use PATCH instead of DELETE for updating the request status
      await axiosInstance.patch(`/appointment/cancel/${requestId}`);

      toast.success("Appointment request cancelled successfully");

      // Refresh the list of requests after cancellation
      fetchRequests();
    } catch (err) {
      console.error("Error cancelling request:", err);
      toast.error(
        err.response?.data?.message || "Failed to cancel appointment",
      );
    } finally {
      setCancellingRequest(false);
    }
  };
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackData.doctorId || !patientId) {
      toast.error("Invalid data for feedback");
      return;
    }

    try {
      setFeedbackLoading(true);
      await axiosInstance.post("/feedback/add", {
        doctorId: feedbackData.doctorId,
        patientId: patientId,
        rating: feedbackData.rating,
        comment: feedbackData.comment,
      });

      toast.success("Feedback submitted successfully");
      setShowFeedbackModal(false);
      setFeedbackData({ rating: 5, comment: "", doctorId: "" });
    } catch (err) {
      console.error("Error submitting feedback:", err);
      toast.error(err.response?.data?.msg || "Failed to submit feedback");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleOpenFeedback = (doctorId) => {
    setFeedbackData({ ...feedbackData, doctorId: doctorId });
    setShowFeedbackModal(true);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // Filter requests based on search and status
  const filteredRequests = requests.filter((request) => {
    const doctorName = request.doctorId?.name?.toLowerCase() || "";
    const doctorSpecialization =
      request.doctorId?.specialization?.toLowerCase() || "";
    const hospitalName = request.doctorId?.hospitalName?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      doctorName.includes(searchLower) ||
      doctorSpecialization.includes(searchLower) ||
      hospitalName.includes(searchLower);

    const matchesStatus =
      statusFilter === "all" || request.requestStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort requests by date (newest first)
  const sortedRequests = [...filteredRequests].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  // Pagination
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = sortedRequests.slice(
    indexOfFirstRequest,
    indexOfLastRequest,
  );
  const totalPages = Math.ceil(sortedRequests.length / requestsPerPage);

  // Status counts
  const statusCounts = {
    all: requests.length,
    Pending: requests.filter((r) => r.requestStatus === "Pending").length,
    Accepted: requests.filter((r) => r.requestStatus === "Accepted").length,
    Rejected: requests.filter((r) => r.requestStatus === "Rejected").length,
    Completed: requests.filter((r) => r.requestStatus === "Completed").length,
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Accepted":
        return "bg-blue-100 text-blue-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaHourglassHalf className="text-yellow-600" />;
      case "Accepted":
        return <FaCheckCircle className="text-blue-600" />;
      case "Rejected":
        return <FaTimesCircle className="text-red-600" />;
      case "Completed":
        return <FaCheckCircle className="text-green-600" />;
      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="PATIENT" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your requests...</p>
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
              onClick={fetchRequests}
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
            <h1 className="text-2xl font-bold text-gray-800">
              My Appointment Requests
            </h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <FaBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <StatCard
              label="Total Requests"
              value={statusCounts.all}
              icon={<FaCalendarAlt />}
              bgColor="bg-blue-100"
              textColor="text-blue-600"
            />
            <StatCard
              label="Pending"
              value={statusCounts.Pending}
              icon={<FaHourglassHalf />}
              bgColor="bg-yellow-100"
              textColor="text-yellow-600"
            />
            <StatCard
              label="Accepted"
              value={statusCounts.Accepted}
              icon={<FaCheckCircle />}
              bgColor="bg-blue-100"
              textColor="text-blue-600"
            />
            <StatCard
              label="Completed"
              value={statusCounts.Completed}
              icon={<FaCheckCircle />}
              bgColor="bg-green-100"
              textColor="text-green-600"
            />
            <StatCard
              label="Rejected"
              value={statusCounts.Rejected}
              icon={<FaTimesCircle />}
              bgColor="bg-red-100"
              textColor="text-red-600"
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
                  placeholder="Search by doctor, specialization, hospital..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <FaFilter className="absolute left-3 top-3 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-end text-gray-600">
                <span>{filteredRequests.length} requests found</span>
              </div>
            </div>
          </div>

          {/* Requests List */}
          {filteredRequests.length > 0 ? (
            <>
              <div className="space-y-4">
                {currentRequests.map((request) => (
                  <RequestCard
                    key={request._id}
                    request={request}
                    onViewDetails={() => handleViewDetails(request)}
                    onCancel={() => handleCancelRequest(request._id)}
                    getStatusBadge={getStatusBadge}
                    getStatusIcon={getStatusIcon}
                    cancelling={cancellingRequest}
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
              <FaCalendarAlt className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No appointment requests found</p>
              <button
                onClick={() => (window.location.href = "/patient/find-doctors")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Book an Appointment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Appointment Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle size={20} />
                </button>
              </div>

              {/* Status Banner */}
              <div
                className={`${getStatusBadge(selectedRequest.requestStatus)} px-4 py-3 rounded-lg mb-4 flex items-center`}
              >
                {getStatusIcon(selectedRequest.requestStatus)}
                <span className="ml-2 font-medium">
                  Status: {selectedRequest.requestStatus}
                </span>
              </div>

              {/* Doctor Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FaUserMd className="mr-2 text-blue-600" />
                  Doctor Information
                </h3>
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      selectedRequest.doctorId?.image ||
                      "https://via.placeholder.com/80"
                    }
                    alt={selectedRequest.doctorId?.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-100"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      Dr. {selectedRequest.doctorId?.name}
                    </p>
                    <p className="text-sm text-blue-600">
                      {selectedRequest.doctorId?.specialization}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <FaHospital className="mr-1 text-gray-400" size={12} />
                      {selectedRequest.doctorId?.hospitalName}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <FaMapMarkerAlt
                        className="mr-1 text-gray-400"
                        size={12}
                      />
                      {selectedRequest.doctorId?.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-600" />
                  Appointment Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedRequest.appointmentDate && (
                    <>
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium">
                          {new Date(
                            selectedRequest.appointmentDate,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-medium">
                          {new Date(
                            selectedRequest.appointmentDate,
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Consultation Type</p>
                    <p className="font-medium flex items-center">
                      {selectedRequest.consultationType === "video" ? (
                        <>
                          <FaVideo className="mr-1 text-blue-600" size={12} />
                          Video Consultation
                        </>
                      ) : (
                        <>
                          <FaComments
                            className="mr-1 text-green-600"
                            size={12}
                          />
                          Chat Consultation
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Consultation Fee</p>
                    <p className="font-medium flex items-center">
                      <FaRupeeSign className="mr-1 text-gray-600" size={12} />
                      {selectedRequest.doctorId?.consultationFee}
                    </p>
                  </div>
                </div>
                {selectedRequest.symptoms && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Symptoms/Reason</p>
                    <p className="text-sm text-gray-700">
                      {selectedRequest.symptoms}
                    </p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Timeline</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Requested on</span>
                    <span className="font-medium">
                      {new Date(selectedRequest.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {selectedRequest.updatedAt !== selectedRequest.createdAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last updated</span>
                      <span className="font-medium">
                        {new Date(selectedRequest.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex space-x-3">
                {selectedRequest.requestStatus === "Pending" && (
                  <button
                    onClick={() => {
                      handleCancelRequest(selectedRequest._id);
                      setShowDetailsModal(false);
                    }}
                    disabled={cancellingRequest}
                    className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    Cancel Request
                  </button>
                )}
                {selectedRequest.requestStatus === "Accepted" && (
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Join Consultation
                  </button>
                )}
                {selectedRequest.requestStatus === "Completed" && (
                  <div className="flex flex-col space-y-2 flex-1">
                    <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                      <FaPrescriptionBottle className="inline mr-2" />
                      View Prescription
                    </button>
                    <button 
                      onClick={() => handleOpenFeedback(selectedRequest.doctorId._id)}
                      className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center justify-center font-semibold"
                    >
                      <FaStar className="mr-2" />
                      Give Feedback
                    </button>
                  </div>
                )}
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

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Doctor Feedback</h2>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                      className={`text-3xl transition-colors ${
                        star <= feedbackData.rating ? "text-yellow-400" : "text-gray-300 hover:text-gray-400"
                      }`}
                    >
                      <FaStar />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Comment</label>
                <textarea
                  rows="4"
                  value={feedbackData.comment}
                  onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Share your experience with the doctor..."
                  required
                ></textarea>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                  disabled={feedbackLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition"
                  disabled={feedbackLoading}
                >
                  {feedbackLoading && <FaSpinner className="animate-spin inline mr-2" />}
                  Submit Feedback
                </button>
              </div>
            </form>
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

// Request Card Component
const RequestCard = ({
  request,
  onViewDetails,
  onCancel,
  getStatusBadge,
  getStatusIcon,
  cancelling,
}) => {
  const doctor = request.doctorId;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Doctor Info */}
        <div className="flex items-start space-x-4 flex-1">
          <img
            src={doctor?.image || "https://via.placeholder.com/60"}
            alt={doctor?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                Dr. {doctor?.name}
              </h3>
              <span
                className={`${getStatusBadge(request.requestStatus)} text-xs px-3 py-1 rounded-full flex items-center ml-2`}
              >
                {getStatusIcon(request.requestStatus)}
                <span className="ml-1">{request.requestStatus}</span>
              </span>
            </div>
            <p className="text-sm text-blue-600">{doctor?.specialization}</p>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <FaHospital className="mr-1 text-gray-400" size={12} />
              {doctor?.hospitalName}
            </p>

            {/* Appointment Date if exists */}
            {request.appointmentDate && (
              <p className="text-sm text-gray-600 flex items-center mt-2">
                <FaCalendarAlt className="mr-1 text-gray-400" size={12} />
                {new Date(request.appointmentDate).toLocaleDateString()} at{" "}
                {new Date(request.appointmentDate).toLocaleTimeString()}
              </p>
            )}

            {/* Request Date */}
            <p className="text-xs text-gray-400 mt-1">
              Requested on: {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <button
            onClick={onViewDetails}
            className="px-4 py-2 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center"
          >
            <FaEye className="mr-1" />
            View Details
          </button>

          {request.requestStatus === "Pending" && (
            <button
              onClick={onCancel}
              disabled={cancelling}
              className="px-4 py-2 text-sm border border-red-600 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center"
            >
              {cancelling ? (
                <FaSpinner className="animate-spin mr-1" />
              ) : (
                <FaTimesCircle className="mr-1" />
              )}
              Cancel
            </button>
          )}

          {/* {request.requestStatus === "Accepted" && (
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <FaVideo className="mr-1" />
              Join
            </button>
          )} */}

          {request.requestStatus === "Completed" && (
            <div className="flex flex-col space-y-2">
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                <FaPrescriptionBottle className="mr-1 text-green-600" />
                Prescription
              </button>
              <button 
                onClick={() => handleOpenFeedback(request.doctorId._id)}
                className="px-4 py-2 text-sm bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 flex items-center justify-center font-semibold transition"
              >
                <FaStar className="mr-1" />
                Feedback
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Symptoms if exists */}
      {request.symptoms && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Symptoms:</span> {request.symptoms}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
