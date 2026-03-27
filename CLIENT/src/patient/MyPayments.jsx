// patient/MyPayments.jsx
import React, { useState, useEffect } from "react";
import {
  FaRupeeSign,
  FaCreditCard,
  FaCalendarAlt,
  FaUserMd,
  FaHospital,
  FaFileInvoice,
  FaDownload,
  FaEye,
  FaSpinner,
  FaExclamationCircle,
  FaSearch,
  FaFilter,
  FaBell,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaPrint,
  FaWallet,
  FaMoneyBillWave,
  FaChartLine,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../AuthenticationPages/axiosConfig";
import Sidebar from "../Sidebar";

const MyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const paymentsPerPage = 10;

  // Get patient data from localStorage
  const patientData = JSON.parse(localStorage.getItem("UserData") || "{}").user;
  const patientId =  patientData._id// This should come from auth context

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/payment/patient/${patientId}`);
      setPayments(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to load payment history");
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  // Get payment status badge color
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
      case "paid":
        return "bg-green-100 text-green-700";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
      case "cancelled":
      case "refunded":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get payment status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
      case "paid":
        return <FaCheckCircle className="text-green-600" />;
      case "pending":
      case "processing":
        return <FaClock className="text-yellow-600" />;
      case "failed":
      case "cancelled":
      case "refunded":
        return <FaTimesCircle className="text-red-600" />;
      default:
        return null;
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "card":
      case "credit card":
      case "debit card":
        return <FaCreditCard className="text-blue-600" />;
      case "cash":
        return <FaMoneyBillWave className="text-green-600" />;
      case "wallet":
        return <FaWallet className="text-purple-600" />;
      default:
        return <FaCreditCard className="text-gray-600" />;
    }
  };

  // Filter payments based on search and status
  const filteredPayments = payments.filter((payment) => {
    const doctorName = payment.doctorId?.name?.toLowerCase() || "";
    const doctorSpecialization =
      payment.doctorId?.specialization?.toLowerCase() || "";
    const paymentId = payment._id?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      doctorName.includes(searchLower) ||
      doctorSpecialization.includes(searchLower) ||
      paymentId.includes(searchLower);

    const matchesStatus =
      statusFilter === "all" ||
      payment.paymentStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Sort payments by date (newest first)
  const sortedPayments = [...filteredPayments].sort(
    (a, b) =>
      new Date(b.createdAt || b.paymentDate) -
      new Date(a.createdAt || a.paymentDate),
  );

  // Pagination
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = sortedPayments.slice(
    indexOfFirstPayment,
    indexOfLastPayment,
  );
  const totalPages = Math.ceil(sortedPayments.length / paymentsPerPage);

  // Calculate totals
  const totalSpent = payments.reduce(
    (sum, p) =>
      p.paymentStatus?.toLowerCase() === "completed"
        ? sum + (p.amount || 0)
        : sum,
    0,
  );

  const pendingAmount = payments.reduce(
    (sum, p) =>
      p.paymentStatus?.toLowerCase() === "pending"
        ? sum + (p.amount || 0)
        : sum,
    0,
  );

  const successfulCount = payments.filter(
    (p) => p.paymentStatus?.toLowerCase() === "completed",
  ).length;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="PATIENT" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading payment history...</p>
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
              onClick={fetchPayments}
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
            <h1 className="text-2xl font-bold text-gray-800">My Payments</h1>
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                  <FaRupeeSign size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Amount</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {formatCurrency(pendingAmount)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
                  <FaClock size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Successful Payments</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {successfulCount}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                  <FaCheckCircle size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {payments.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                  <FaFileInvoice size={24} />
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
                  placeholder="Search by doctor, specialization, or payment ID..."
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
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-end text-gray-600">
                <span>{filteredPayments.length} transactions found</span>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          {filteredPayments.length > 0 ? (
            <>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentPayments.map((payment) => (
                        <tr key={payment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <FaCalendarAlt
                                className="mr-2 text-gray-400"
                                size={12}
                              />
                              {formatDate(
                                payment.createdAt || payment.paymentDate,
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                             
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  Dr. {payment.doctorId?.name || "Unknown"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {payment.doctorId?.specialization || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono text-gray-600">
                              #{payment._id?.slice(-8)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-600">
                              {getPaymentMethodIcon(payment.paymentMethod)}
                              <span className="ml-2">
                                {payment.paymentMethod || "Card"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full flex items-center w-fit ${getStatusBadge(payment.paymentStatus)}`}
                            >
                              {getStatusIcon(payment.paymentStatus)}
                              <span className="ml-1">
                                {payment.paymentStatus || "Unknown"}
                              </span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowInvoiceModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 mx-1"
                              title="View Invoice"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-800 mx-1"
                              title="Download Invoice"
                            >
                              <FaDownload size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
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
              <FaWallet className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No payment transactions found</p>
              {searchTerm || statusFilter !== "all" ? (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              ) : (
                <p className="text-sm text-gray-400 mt-2">
                  Your payment history will appear here after consultations
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Payment Invoice
                </h2>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle size={20} />
                </button>
              </div>

              {/* Invoice Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 mb-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">INVOICE</h3>
                    <p className="text-blue-100">
                      Invoice #{selectedPayment._id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100">Date</p>
                    <p className="font-semibold">
                      {formatDate(
                        selectedPayment.createdAt ||
                          selectedPayment.paymentDate,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Doctor & Patient Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Doctor Details
                  </h4>
                  <p className="text-sm text-gray-600">
                    Dr. {selectedPayment.doctorId?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedPayment.doctorId?.specialization}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedPayment.doctorId?.hospitalName}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Patient Details
                  </h4>
                  <p className="text-sm text-gray-600">{patientData.name}</p>
                  <p className="text-sm text-gray-600">{patientData.email}</p>
                  <p className="text-sm text-gray-600">
                    {patientData.mobileNumber}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Payment Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono">{selectedPayment._id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">
                      {formatCurrency(selectedPayment.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span>{selectedPayment.paymentMethod || "Card"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedPayment.paymentStatus)}`}
                    >
                      {selectedPayment.paymentStatus}
                    </span>
                  </div>
                  {selectedPayment.transactionId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono">
                        {selectedPayment.transactionId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                  <FaPrint className="mr-2" />
                  Print
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                  <FaDownload className="mr-2" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPayments;
