// doctor/ConsultationRequests.jsx
import React, { useState, useEffect } from 'react';
import {
  FaClipboardList,
  FaUserMd,
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaComments,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaSpinner,
  FaExclamationCircle,
  FaBell,
  FaSearch,
  FaFilter,
  FaEye,
  FaCheck,
  FaTimes,
  FaStethoscope,
  FaHospital,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaNotesMedical,
  FaHeartbeat,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaPrescriptionBottle,
  FaUserCircle,
  FaTransgender,
  FaBirthdayCake,
  FaCalendarCheck,
  FaFilePrescription
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../AuthenticationPages/axiosConfig';
import Sidebar from '../Sidebar';

const ConsultationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    medicines: '',
    notes: '',
    followUpDate: ''
  });
  
  const requestsPerPage = 5;

  // Get doctor data from localStorage
  const doctorData = JSON.parse(localStorage.getItem("UserData") || "{}").user;
  const doctorId = doctorData?._id;

  useEffect(() => {
    if (doctorId) {
      fetchRequests();
    }
  }, [doctorId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/appointment/doctor/${doctorId}`);
      setRequests(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load consultation requests');
      toast.error('Failed to load consultation requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      setProcessingId(requestId);
      
      const updateData = {
        requestStatus: status
      };

      const response = await axiosInstance.patch(
        `/appointment/status/${requestId}`,
        updateData
      );

      // Update the request in the list
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === requestId ? { ...req, requestStatus: status } : req
        )
      );

      toast.success(`Appointment ${status.toLowerCase()} successfully`);
      
      // If there's a selected request, update it too
      if (selectedRequest?._id === requestId) {
        setSelectedRequest(prev => ({ ...prev, requestStatus: status }));
      }
    } catch (err) {
      console.error('Error updating request:', err);
      toast.error('Failed to update request status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    
    if (!prescriptionData.medicines.trim()) {
      toast.error('Please add medicines');
      return;
    }

    try {
      setProcessingId(selectedRequest._id);
      
      const prescriptionPayload = {
        appointmentId: selectedRequest._id,
        patientId: selectedRequest.patientId?._id || selectedRequest.patientId,
        doctorId: doctorId,
        medicines: prescriptionData.medicines,
        notes: prescriptionData.notes,
        followUpDate: prescriptionData.followUpDate || null
      };

      const response = await axiosInstance.post('/medicine/add', prescriptionPayload);
      
      toast.success('Prescription added successfully');
      setShowPrescriptionModal(false);
      setPrescriptionData({ medicines: '', notes: '', followUpDate: '' });
      
      // Optionally update the request status to completed
      if (selectedRequest.requestStatus !== 'Completed') {
        await handleStatusUpdate(selectedRequest._id, 'Completed');
      }
      
    } catch (err) {
      console.error('Error adding prescription:', err);
      toast.error('Failed to add prescription');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleOpenPrescription = (request) => {
    setSelectedRequest(request);
    setShowPrescriptionModal(true);
  };

  // Filter requests based on search and status
  const filteredRequests = requests.filter(request => {
    const patientName = request.patientId?.name?.toLowerCase() || '';
    const patientEmail = request.patientId?.email?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = patientName.includes(searchLower) ||
                         patientEmail.includes(searchLower);

    const matchesStatus = statusFilter === 'all' || request.requestStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort requests by date (newest first)
  const sortedRequests = [...filteredRequests].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Pagination
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = sortedRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(sortedRequests.length / requestsPerPage);

  // Status counts
  const statusCounts = {
    all: requests.length,
    Pending: requests.filter(r => r.requestStatus === 'Pending').length,
    Accepted: requests.filter(r => r.requestStatus === 'Accepted').length,
    Rejected: requests.filter(r => r.requestStatus === 'Rejected').length,
    Completed: requests.filter(r => r.requestStatus === 'Completed').length
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Accepted':
        return 'bg-blue-100 text-blue-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending':
        return <FaHourglassHalf className="text-yellow-600" />;
      case 'Accepted':
        return <FaCheckCircle className="text-blue-600" />;
      case 'Rejected':
        return <FaTimesCircle className="text-red-600" />;
      case 'Completed':
        return <FaCheckCircle className="text-green-600" />;
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="DOCTOR" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading consultation requests...</p>
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
      <Sidebar role="DOCTOR" />
      
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Consultation Requests</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <StatCard
              label="Total Requests"
              value={statusCounts.all}
              icon={<FaClipboardList />}
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
                  placeholder="Search by patient name or email..."
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
                    onAccept={() => handleStatusUpdate(request._id, 'Accepted')}
                    onReject={() => handleStatusUpdate(request._id, 'Rejected')}
                    onAddPrescription={() => handleOpenPrescription(request)}
                    processingId={processingId}
                    getStatusBadge={getStatusBadge}
                    getStatusIcon={getStatusIcon}
                    formatDate={formatDate}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
              <FaClipboardList className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No consultation requests found</p>
              {searchTerm || statusFilter !== 'all' ? (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              ) : (
                <p className="text-sm text-gray-400 mt-2">
                  New requests will appear here when patients book appointments
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Appointment Details</h2>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle size={20} />
                </button>
              </div>

              {/* Status Banner */}
              <div className={`${getStatusBadge(selectedRequest.requestStatus)} px-4 py-3 rounded-lg mb-4 flex items-center`}>
                {getStatusIcon(selectedRequest.requestStatus)}
                <span className="ml-2 font-medium">
                  Status: {selectedRequest.requestStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaUserCircle className="mr-2 text-blue-600" />
                    Patient Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <img 
                        src={selectedRequest.patientId?.image || 'https://via.placeholder.com/50'}
                        alt={selectedRequest.patientId?.name}
                        className="w-12 h-12 rounded-full object-cover mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{selectedRequest.patientId?.name}</p>
                        <p className="text-sm text-gray-600">Patient</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm flex items-center">
                        <FaEnvelope className="mr-2 text-gray-400" size={12} />
                        {selectedRequest.patientId?.email || 'Not provided'}
                      </p>
                      <p className="text-sm flex items-center">
                        <FaPhone className="mr-2 text-gray-400" size={12} />
                        {selectedRequest.patientId?.mobileNumber || 'Not provided'}
                      </p>
                      <p className="text-sm flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" size={12} />
                        {selectedRequest.patientId?.address || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaCalendarCheck className="mr-2 text-blue-600" />
                    Appointment Details
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-400" size={12} />
                      <span className="font-medium mr-2">Date:</span>
                      {selectedRequest.appointmentDate ? 
                        new Date(selectedRequest.appointmentDate).toLocaleDateString() : 
                        'Not scheduled'}
                    </p>
                    <p className="text-sm flex items-center">
                      <FaClock className="mr-2 text-gray-400" size={12} />
                      <span className="font-medium mr-2">Time:</span>
                      {selectedRequest.appointmentDate ? 
                        new Date(selectedRequest.appointmentDate).toLocaleTimeString() : 
                        'Not scheduled'}
                    </p>
                    <p className="text-sm flex items-center">
                      {selectedRequest.consultationType === 'video' ? 
                        <FaVideo className="mr-2 text-blue-400" size={12} /> : 
                        <FaComments className="mr-2 text-green-400" size={12} />
                      }
                      <span className="font-medium mr-2">Type:</span>
                      {selectedRequest.consultationType || 'Not specified'}
                    </p>
                    <p className="text-sm flex items-start">
                      <FaHeartbeat className="mr-2 text-gray-400 mt-1" size={12} />
                      <span className="font-medium mr-2">Symptoms:</span>
                      <span className="flex-1">{selectedRequest.symptoms || 'No symptoms provided'}</span>
                    </p>
                  </div>
                </div>

                {/* Request Timeline */}
                <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
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
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                {selectedRequest.requestStatus === 'Pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedRequest._id, 'Accepted');
                        setShowDetailsModal(false);
                      }}
                      disabled={processingId === selectedRequest._id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                    >
                      {processingId === selectedRequest._id ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaCheck className="mr-2" />
                      )}
                      Accept Request
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedRequest._id, 'Rejected');
                        setShowDetailsModal(false);
                      }}
                      disabled={processingId === selectedRequest._id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                    >
                      {processingId === selectedRequest._id ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaTimes className="mr-2" />
                      )}
                      Reject Request
                    </button>
                  </>
                )}
                {selectedRequest.requestStatus === 'Accepted' && (
                  <button
                    onClick={() => {
                      handleOpenPrescription(selectedRequest);
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <FaPrescriptionBottle className="mr-2" />
                    Add Prescription
                  </button>
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

      {/* Prescription Modal */}
      {showPrescriptionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add Prescription</h2>
                <button 
                  onClick={() => setShowPrescriptionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle size={20} />
                </button>
              </div>

              {/* Patient Info Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={selectedRequest.patientId?.image || 'https://via.placeholder.com/40'}
                    alt={selectedRequest.patientId?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{selectedRequest.patientId?.name}</p>
                    <p className="text-sm text-gray-600">Patient</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddPrescription}>
                {/* Medicines */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaPrescriptionBottle className="inline mr-2 text-blue-600" />
                    Prescribed Medicines *
                  </label>
                  <textarea
                    value={prescriptionData.medicines}
                    onChange={(e) => setPrescriptionData({...prescriptionData, medicines: e.target.value})}
                    rows="5"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter medicines with dosage, frequency, and duration&#10;Example:&#10;- Amoxicillin 500mg - Twice daily for 7 days&#10;- Paracetamol 650mg - As needed for fever&#10;- Vitamin C supplements - Once daily"
                    required
                  />
                </div>

                {/* Additional Notes */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaNotesMedical className="inline mr-2 text-blue-600" />
                    Additional Notes / Instructions
                  </label>
                  <textarea
                    value={prescriptionData.notes}
                    onChange={(e) => setPrescriptionData({...prescriptionData, notes: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Add any special instructions, diet recommendations, or precautions..."
                  />
                </div>

                {/* Follow-up Date */}
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaCalendarAlt className="inline mr-2 text-blue-600" />
                    Follow-up Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={prescriptionData.followUpDate}
                    onChange={(e) => setPrescriptionData({...prescriptionData, followUpDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingId === selectedRequest._id}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {processingId === selectedRequest._id ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaFilePrescription className="mr-2" />
                        Save Prescription
                      </>
                    )}
                  </button>
                </div>
              </form>
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
      <div className={`p-3 ${bgColor} rounded-lg ${textColor}`}>
        {icon}
      </div>
    </div>
  </div>
);

// Request Card Component
const RequestCard = ({ 
  request, 
  onViewDetails, 
  onAccept, 
  onReject, 
  onAddPrescription,
  processingId,
  getStatusBadge,
  getStatusIcon,
  formatDate 
}) => {
  const patient = request.patientId;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Patient Info */}
        <div className="flex items-start space-x-4 flex-1">
          <img 
            src={patient?.image || 'https://via.placeholder.com/60'}
            alt={patient?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
          />
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="font-semibold text-gray-800">{patient?.name}</h3>
              <span className={`${getStatusBadge(request.requestStatus)} text-xs px-3 py-1 rounded-full flex items-center`}>
                {getStatusIcon(request.requestStatus)}
                <span className="ml-1">{request.requestStatus}</span>
              </span>
            </div>
            
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <FaEnvelope className="mr-1 text-gray-400" size={12} />
              {patient?.email}
            </p>
            
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <FaPhone className="mr-1 text-gray-400" size={12} />
              {patient?.mobileNumber || 'No phone'}
            </p>
            
            {/* Appointment Date */}
            {request.appointmentDate && (
              <p className="text-sm text-blue-600 flex items-center mt-2">
                <FaCalendarAlt className="mr-1" size={12} />
                {formatDate(request.appointmentDate)}
              </p>
            )}
            
            {/* Request Date */}
            <p className="text-xs text-gray-400 mt-1">
              Requested: {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 mt-4 lg:mt-0">
          <button
            onClick={onViewDetails}
            className="px-4 py-2 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center"
          >
            <FaEye className="mr-1" />
            View
          </button>
          
          {request.requestStatus === 'Pending' && (
            <>
              <button
                onClick={onAccept}
                disabled={processingId === request._id}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {processingId === request._id ? (
                  <FaSpinner className="animate-spin mr-1" />
                ) : (
                  <FaCheck className="mr-1" />
                )}
                Accept
              </button>
              <button
                onClick={onReject}
                disabled={processingId === request._id}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {processingId === request._id ? (
                  <FaSpinner className="animate-spin mr-1" />
                ) : (
                  <FaTimes className="mr-1" />
                )}
                Reject
              </button>
            </>
          )}
          
          {request.requestStatus === 'Accepted' && (
            <button
              onClick={onAddPrescription}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FaPrescriptionBottle className="mr-1" />
              Add Prescription
            </button>
          )}
        </div>
      </div>

      {/* Symptoms */}
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

export default ConsultationRequests;