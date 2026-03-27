// patient/MyPrescriptions.jsx
import React, { useState, useEffect } from "react";
import {
  FaPrescriptionBottle,
  FaDownload,
  FaEye,
  FaPrint,
  FaShare,
  FaCalendarAlt,
  FaUserMd,
  FaHospital,
  FaFilePdf,
  FaFileImage,
  FaFileAlt,
  FaSpinner,
  FaExclamationCircle,
  FaSearch,
  FaFilter,
  FaBell,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaPills,
  FaNotesMedical,
  FaStethoscope,
  FaHeartbeat,
  FaWeight,
  FaRuler,
  FaTemperatureHigh,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCreditCard,
  FaMoneyBillWave,
  FaQrcode,
  FaGooglePay,
  FaApplePay,
  FaPaypal,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../AuthenticationPages/axiosConfig";
import Sidebar from "../Sidebar";

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    thisYear: 0,
    uniqueDoctors: 0,
    withFollowUp: 0
  });

  const prescriptionsPerPage = 5;

  // Get patient data from localStorage
  const patientData = JSON.parse(localStorage.getItem("UserData") || "{}").user;
  const patientId = patientData?._id;

  useEffect(() => {
    if (patientId) {
      fetchPrescriptions();
      fetchStats();
    }
  }, [patientId]);

  // Fetch all prescriptions for the patient
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/medicine/patient/${patientId}`,
      );
      
      setPrescriptions(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError("Failed to load prescriptions");
      toast.error("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  // Fetch prescription stats
  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get(
        `/medicine/stats/patient/${patientId}`,
      );
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Fetch payment details for appointment
  const fetchPaymentDetails = async (appointmentId) => {
    try {
      const response = await axiosInstance.get(
        `/payment/appointment/${appointmentId}`,
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching payment details:", err);
      return null;
    }
  };

  // Make payment for appointment
  const handleMakePayment = async (paymentData) => {
    try {
      setProcessingPayment(true);
      
      const response = await axiosInstance.post("/payment/pay", paymentData);
      
      toast.success("Payment successful!");
      setShowPaymentModal(false);
      
      // Refresh payment details
      if (selectedPrescription?.appointmentId) {
        const updatedPayment = await fetchPaymentDetails(selectedPrescription.appointmentId);
        setPaymentDetails(updatedPayment);
      }
      
      return response.data;
    } catch (err) {
      console.error("Error making payment:", err);
      toast.error(err.response?.data?.msg || "Payment failed");
      return null;
    } finally {
      setProcessingPayment(false);
    }
  };

  // Fetch single prescription details
  const fetchPrescriptionDetails = async (prescriptionId) => {
    try {
      const response = await axiosInstance.get(
        `/medicine/details/${prescriptionId}`,
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching prescription details:", err);
      toast.error("Failed to load prescription details");
      return null;
    }
  };

  const handleViewDetails = async (prescription) => {
    const details = await fetchPrescriptionDetails(prescription._id);
    if (details) {
      setSelectedPrescription(details);
      
      // Fetch payment details if appointment exists
      if (details.appointmentId) {
        const payment = await fetchPaymentDetails(details.appointmentId);
        setPaymentDetails(payment);
      }
      
      setShowDetailsModal(true);
    }
  };

  const handleViewPayment = () => {
    setShowDetailsModal(false);
    setShowPaymentModal(true);
  };

  const handleProceedToPayment = () => {
    setShowDetailsModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const paymentData = {
      appointmentId: selectedPrescription?.appointmentId,
      patientId: patientId,
      doctorId: selectedPrescription?.doctorId?._id,
      amount: selectedPrescription?.doctorId?.consultationFee || 500,
      paymentMethod: formData.get("paymentMethod"),
      paymentStatus: "Completed",
      transactionId: "TXN" + Date.now(),
      cardLast4: formData.get("cardLast4") || null,
      upiId: formData.get("upiId") || null
    };

    await handleMakePayment(paymentData);
  };

  const handleDownload = async (prescription, format = "pdf") => {
    try {
      setDownloading(true);

      const response = await axiosInstance.get(
        `/prescription/download/${prescription._id}?format=${format}`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `prescription_${prescription._id}.${format}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Prescription downloaded successfully");
    } catch (err) {
      console.error("Error downloading prescription:", err);
      toast.error("Failed to download prescription");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = (prescription) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - Dr. ${prescription.doctorId?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .doctor-info { margin-bottom: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; }
            .patient-info { margin-bottom: 30px; padding: 15px; background: #e8f4fd; border-radius: 8px; }
            .payment-info { margin-bottom: 30px; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981; }
            .prescription { margin-bottom: 30px; }
            .medicine-item { padding: 10px; border-bottom: 1px solid #ddd; }
            .diagnosis { background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .lab-tests { background: #fef3e2; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .footer { margin-top: 40px; text-align: right; border-top: 1px solid #ddd; padding-top: 20px; }
            .signature { font-family: 'Brush Script MT', cursive; font-size: 24px; }
            .payment-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Medical Prescription</h1>
            <p>Date: ${new Date(prescription.createdAt).toLocaleDateString()}</p>
            <p>Prescription ID: #${prescription._id?.slice(-8)}</p>
          </div>
          
          <div class="doctor-info">
            <h2>Dr. ${prescription.doctorId?.name}</h2>
            <p><strong>Specialization:</strong> ${prescription.doctorId?.specialization}</p>
            <p><strong>Hospital:</strong> ${prescription.doctorId?.hospitalName}</p>
            <p><strong>Address:</strong> ${prescription.doctorId?.address || "N/A"}</p>
            <p><strong>Contact:</strong> ${prescription.doctorId?.mobileNumber || "N/A"}</p>
          </div>
          
          <div class="patient-info">
            <h3>Patient: ${patientData?.name}</h3>
            <p>Email: ${patientData?.email} | Phone: ${patientData?.mobileNumber || "N/A"}</p>
          </div>

          ${paymentDetails ? `
            <div class="payment-info">
              <h3>Payment Information</h3>
              <div class="payment-grid">
                <p><strong>Amount Paid:</strong> ₹${paymentDetails.amount}</p>
                <p><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</p>
                <p><strong>Status:</strong> ${paymentDetails.paymentStatus}</p>
                <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
              </div>
            </div>
          ` : ""}
          
          ${prescription.diagnosis ? `
            <div class="diagnosis">
              <h3>Diagnosis:</h3>
              <p>${prescription.diagnosis}</p>
            </div>
          ` : ""}
          
          <div class="prescription">
            <h3>Prescribed Medicines:</h3>
            ${prescription.medicines
              ?.split("\n")
              .map((med) => `<div class="medicine-item">${med}</div>`)
              .join("") || "<p>No medicines listed</p>"}
          </div>
          
          ${prescription.labTests ? `
            <div class="lab-tests">
              <h3>Recommended Lab Tests:</h3>
              <p>${prescription.labTests}</p>
            </div>
          ` : ""}
          
          ${
            prescription.notes
              ? `
            <div class="notes">
              <h3>Additional Notes:</h3>
              <p>${prescription.notes}</p>
            </div>
          `
              : ""
          }
          
          ${
            prescription.followUpDate
              ? `
            <div class="follow-up">
              <h3>Follow-up Date:</h3>
              <p>${new Date(prescription.followUpDate).toLocaleDateString()}</p>
            </div>
          `
              : ""
          }
          
          <div class="footer">
            <p>Doctor's Signature</p>
            <div class="signature">Dr. ${prescription.doctorId?.name}</div>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Prescription
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleShare = async (prescription) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Prescription from Dr. ${prescription.doctorId?.name}`,
          text: `Prescription dated ${new Date(prescription.createdAt).toLocaleDateString()}`,
          url: window.location.href,
        });
        toast.success("Shared successfully");
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      navigator.clipboard.writeText(
        `Prescription from Dr. ${prescription.doctorId?.name} dated ${new Date(prescription.createdAt).toLocaleDateString()}`,
      );
      toast.info("Prescription details copied to clipboard");
    }
  };

  // Get payment method icon
  const getPaymentIcon = (method) => {
    switch(method?.toLowerCase()) {
      case "credit card":
      case "debit card":
        return <FaCreditCard className="text-blue-600" />;
      case "upi":
      case "google pay":
      case "phonepe":
        return <FaGooglePay className="text-green-600" />;
      case "paypal":
        return <FaPaypal className="text-blue-800" />;
      case "apple pay":
        return <FaApplePay className="text-gray-800" />;
      case "cash":
        return <FaMoneyBillWave className="text-green-600" />;
      default:
        return <FaQrcode className="text-purple-600" />;
    }
  };

  // Filter prescriptions based on search and date
  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const doctorName = prescription.doctorId?.name?.toLowerCase() || "";
    const doctorSpecialization =
      prescription.doctorId?.specialization?.toLowerCase() || "";
    const medicines = prescription.medicines?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      doctorName.includes(searchLower) ||
      doctorSpecialization.includes(searchLower) ||
      medicines.includes(searchLower);

    let matchesDate = true;
    const prescriptionDate = new Date(prescription.createdAt);
    const now = new Date();

    if (dateFilter === "week") {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      matchesDate = prescriptionDate >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      matchesDate = prescriptionDate >= monthAgo;
    } else if (dateFilter === "year") {
      const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      matchesDate = prescriptionDate >= yearAgo;
    }

    return matchesSearch && matchesDate;
  });

  // Sort prescriptions by date (newest first)
  const sortedPrescriptions = [...filteredPrescriptions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  // Pagination
  const indexOfLastPrescription = currentPage * prescriptionsPerPage;
  const indexOfFirstPrescription = indexOfLastPrescription - prescriptionsPerPage;
  const currentPrescriptions = sortedPrescriptions.slice(
    indexOfFirstPrescription,
    indexOfLastPrescription,
  );
  const totalPages = Math.ceil(sortedPrescriptions.length / prescriptionsPerPage);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="PATIENT" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your prescriptions...</p>
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
              onClick={fetchPrescriptions}
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
              My Prescriptions
            </h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <FaBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src={patientData?.image || "https://via.placeholder.com/40"}
                  alt={patientData?.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {patientData?.name}
                  </p>
                  <p className="text-xs text-gray-500">Patient</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Prescriptions</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stats.total || prescriptions.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                  <FaPrescriptionBottle size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stats.thisMonth}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                  <FaCalendarAlt size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Doctors</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stats.uniqueDoctors}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                  <FaUserMd size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">With Follow-up</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stats.withFollowUp}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
                  <FaClock size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by doctor, specialization, medicine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Date Filter */}
              <div className="relative">
                <FaFilter className="absolute left-3 top-3 text-gray-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-end text-gray-600">
                <span>{filteredPrescriptions.length} prescriptions found</span>
              </div>
            </div>
          </div>

          {/* Prescriptions List */}
          {filteredPrescriptions.length > 0 ? (
            <>
              <div className="space-y-4">
                {currentPrescriptions.map((prescription) => (
                  <PrescriptionCard
                    key={prescription._id}
                    prescription={prescription}
                    onView={() => handleViewDetails(prescription)}
                    onDownload={() => handleDownload(prescription)}
                    onPrint={() => handlePrint(prescription)}
                    onShare={() => handleShare(prescription)}
                    downloading={downloading}
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
              <FaPrescriptionBottle className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No prescriptions found</p>
              {searchTerm || dateFilter !== "all" ? (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setDateFilter("all");
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              ) : (
                <p className="text-sm text-gray-400 mt-2">
                  Your prescriptions will appear here after doctor consultations
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Prescription Details Modal */}
      {showDetailsModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Prescription Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Prescription Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 mb-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Medical Prescription
                    </h3>
                    <p className="text-blue-100">
                      Prescription ID: #{selectedPrescription._id?.slice(-8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100">Date</p>
                    <p className="font-semibold">
                      {new Date(
                        selectedPrescription.createdAt,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Doctor Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaUserMd className="mr-2 text-blue-600" />
                    Doctor Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-600">Name:</span> Dr.{" "}
                      {selectedPrescription.doctorId?.name}
                    </p>
                    <p>
                      <span className="text-gray-600">Specialization:</span>{" "}
                      {selectedPrescription.doctorId?.specialization}
                    </p>
                    <p>
                      <span className="text-gray-600">Hospital:</span>{" "}
                      {selectedPrescription.doctorId?.hospitalName}
                    </p>
                    <p>
                      <span className="text-gray-600">Address:</span>{" "}
                      {selectedPrescription.doctorId?.address || "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-600">Contact:</span>{" "}
                      {selectedPrescription.doctorId?.mobileNumber || "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-600">Email:</span>{" "}
                      {selectedPrescription.doctorId?.email || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaUserCircle className="mr-2 text-blue-600" />
                    Patient Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-600">Name:</span>{" "}
                      {selectedPrescription.patientId?.name || patientData?.name}
                    </p>
                    <p>
                      <span className="text-gray-600">Email:</span>{" "}
                      {selectedPrescription.patientId?.email || patientData?.email}
                    </p>
                    <p>
                      <span className="text-gray-600">Contact:</span>{" "}
                      {selectedPrescription.patientId?.mobileNumber || patientData?.mobileNumber || "N/A"}
                    </p>
                    {selectedPrescription.patientId?.age && (
                      <p>
                        <span className="text-gray-600">Age:</span>{" "}
                        {selectedPrescription.patientId.age}
                      </p>
                    )}
                    {selectedPrescription.patientId?.gender && (
                      <p>
                        <span className="text-gray-600">Gender:</span>{" "}
                        {selectedPrescription.patientId.gender}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                {paymentDetails ? (
                  <div className="md:col-span-2 bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        {getPaymentIcon(paymentDetails.paymentMethod)}
                        <span className="ml-2">Payment Information</span>
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        paymentDetails.paymentStatus === "Completed" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {paymentDetails.paymentStatus}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Amount Paid</p>
                        <p className="font-semibold text-gray-800">₹{paymentDetails.amount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Payment Method</p>
                        <p className="font-semibold text-gray-800 capitalize">{paymentDetails.paymentMethod}</p>
                        {paymentDetails.cardLast4 && (
                          <p className="text-xs text-gray-500">•••• {paymentDetails.cardLast4}</p>
                        )}
                        {paymentDetails.upiId && (
                          <p className="text-xs text-gray-500">{paymentDetails.upiId}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Transaction ID</p>
                        <p className="font-semibold text-gray-800 text-sm">{paymentDetails.transactionId}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(paymentDetails.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleViewPayment}
                      className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                    >
                      <FaEye className="mr-1" size={12} />
                      View Complete Payment Details
                    </button>
                  </div>
                ) : (
                  <div className="md:col-span-2 bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800">Payment Required</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Please complete the payment to access this prescription
                        </p>
                      </div>
                      <button
                        onClick={handleProceedToPayment}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center"
                      >
                        <FaCreditCard className="mr-2" />
                        Pay Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Diagnosis */}
                {selectedPrescription.diagnosis && (
                  <div className="md:col-span-2 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Diagnosis</h4>
                    <p className="text-gray-700">{selectedPrescription.diagnosis}</p>
                  </div>
                )}

                {/* Prescribed Medicines */}
                <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaPills className="mr-2 text-blue-600" />
                    Prescribed Medicines
                  </h4>
                  <div className="bg-white rounded-lg p-4">
                    {selectedPrescription.medicines
                      ?.split("\n")
                      .map((medicine, index) => (
                        <div
                          key={index}
                          className="py-2 border-b last:border-b-0"
                        >
                          <p className="text-gray-800">{medicine}</p>
                        </div>
                      )) || <p className="text-gray-500">No medicines listed</p>}
                  </div>
                </div>

                {/* Lab Tests */}
                {selectedPrescription.labTests && (
                  <div className="md:col-span-2 bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Recommended Lab Tests</h4>
                    <p className="text-gray-700 whitespace-pre-line">{selectedPrescription.labTests}</p>
                  </div>
                )}

                {/* Additional Notes */}
                {selectedPrescription.notes && (
                  <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <FaNotesMedical className="mr-2 text-blue-600" />
                      Additional Notes
                    </h4>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-line">
                        {selectedPrescription.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Follow-up Date */}
                {selectedPrescription.followUpDate && (
                  <div className="md:col-span-2 bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-600" />
                      Follow-up Date
                    </h4>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-800">
                        {new Date(
                          selectedPrescription.followUpDate,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                {paymentDetails && (
                  <button
                    onClick={() => handleDownload(selectedPrescription)}
                    disabled={downloading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {downloading ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaDownload className="mr-2" />
                    )}
                    Download PDF
                  </button>
                )}
                <button
                  onClick={() => handlePrint(selectedPrescription)}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center"
                >
                  <FaPrint className="mr-2" />
                  Print
                </button>
                <button
                  onClick={() => handleShare(selectedPrescription)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <FaShare className="mr-2" />
                  Share
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Make Payment</h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setShowDetailsModal(true);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Payment Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Consultation Fee</p>
                    <p className="text-2xl font-bold text-gray-800">
                      ₹{selectedPrescription.doctorId?.consultationFee || 500}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Dr. {selectedPrescription.doctorId?.name}</p>
                    <p className="text-xs text-gray-500">{selectedPrescription.doctorId?.specialization}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit}>
                {/* Payment Method */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="border rounded-lg p-3 flex items-center space-x-2 cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="paymentMethod" value="Credit Card" defaultChecked className="text-blue-600" />
                      <FaCreditCard className="text-blue-600" />
                      <span className="text-sm">Card</span>
                    </label>
                    <label className="border rounded-lg p-3 flex items-center space-x-2 cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="paymentMethod" value="UPI" className="text-blue-600" />
                      <FaGooglePay className="text-green-600" />
                      <span className="text-sm">UPI</span>
                    </label>
                  </div>
                </div>

                {/* Card Details (conditional) */}
                <div className="mb-4" id="cardDetails">
                  <input
                    type="text"
                    name="cardLast4"
                    placeholder="Last 4 digits of card"
                    maxLength="4"
                    pattern="[0-9]{4}"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* UPI ID (conditional) */}
                <div className="mb-4 hidden" id="upiDetails">
                  <input
                    type="text"
                    name="upiId"
                    placeholder="UPI ID (e.g., name@okhdfcbank)"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setShowDetailsModal(true);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingPayment}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {processingPayment ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="mr-2" />
                        Pay Now
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

// Prescription Card Component
const PrescriptionCard = ({
  prescription,
  onView,
  onPrint,
  onShare,
}) => {
  const doctor = prescription.doctorId;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Left Section - Doctor Info */}
        <div className="flex items-start space-x-4 flex-1">
          <img
            src={doctor?.image || "https://via.placeholder.com/60"}
            alt={doctor?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Dr. {doctor?.name}</h3>
            <p className="text-sm text-blue-600">{doctor?.specialization}</p>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <FaHospital className="mr-1 text-gray-400" size={12} />
              {doctor?.hospitalName}
            </p>

            {/* Prescription Date */}
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <FaCalendarAlt className="mr-1" />
              {new Date(prescription.createdAt).toLocaleDateString()}
              <FaClock className="ml-3 mr-1" />
              {new Date(prescription.createdAt).toLocaleTimeString()}
            </div>

            {/* Diagnosis Preview */}
            {prescription.diagnosis && (
              <p className="text-xs text-blue-600 mt-1">
                <span className="font-medium">Diagnosis:</span> {prescription.diagnosis.substring(0, 50)}
                {prescription.diagnosis.length > 50 && "..."}
              </p>
            )}
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <button
            onClick={onView}
            className="px-4 py-2 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center"
          >
            <FaEye className="mr-1" />
            View
          </button>
         
          <button
            onClick={onPrint}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Print"
          >
            <FaPrint size={16} />
          </button>
          <button
            onClick={onShare}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Share"
          >
            <FaShare size={16} />
          </button>
        </div>
      </div>

      {/* Medicines Preview */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Medicines:</span>{" "}
          {prescription.medicines?.split("\n").slice(0, 2).join(" • ")}
          {prescription.medicines?.split("\n").length > 2 && " ..."}
        </p>
        {prescription.notes && (
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Notes:</span>{" "}
            {prescription.notes.substring(0, 100)}
            {prescription.notes.length > 100 && "..."}
          </p>
        )}
        {prescription.followUpDate && (
          <p className="text-sm text-blue-600 mt-2">
            <FaCalendarAlt className="inline mr-1" />
            Follow-up:{" "}
            {new Date(prescription.followUpDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default MyPrescriptions;