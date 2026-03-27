// doctor/MyPayments.jsx
import React, { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaDownload,
  FaEye,
  FaPrint,
  FaCalendarAlt,
  FaUserMd,
  FaUserCircle,
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
  FaCreditCard,
  FaGooglePay,
  FaApplePay,
  FaPaypal,
  FaQrcode,
  FaChartLine,
  FaRupeeSign,
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaCalendarCheck,
  FaUsers,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../AuthenticationPages/axiosConfig";
import Sidebar from "../Sidebar";
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

const DoctorPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    thisMonthRevenue: 0,
    thisYearRevenue: 0,
    totalTransactions: 0,
    averagePerTransaction: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState({});

  const paymentsPerPage = 10;

  // Get doctor data from localStorage
  const doctorData = JSON.parse(localStorage.getItem("UserData") || "{}").user;
  const doctorId = doctorData?._id;

  useEffect(() => {
    if (doctorId) {
      fetchPayments();
      fetchPaymentStats();
    }
  }, [doctorId]);

  // Fetch all payments for the doctor
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/payment/doctor/${doctorId}`,
      );
      
      setPayments(response.data);
      calculatePaymentMethods(response.data);
      calculateMonthlyData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to load payments");
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment stats
  const fetchPaymentStats = async () => {
    try {
      const response = await axiosInstance.get(
        `/payment/stats/doctor/${doctorId}`,
      );
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching payment stats:", err);
    }
  };

  // Calculate payment methods distribution
  const calculatePaymentMethods = (paymentsData) => {
    const methods = {};
    paymentsData.forEach(payment => {
      const method = payment.paymentMethod || "Other";
      methods[method] = (methods[method] || 0) + 1;
    });
    setPaymentMethods(methods);
  };

  // Calculate monthly data for chart
  const calculateMonthlyData = (paymentsData) => {
    const monthly = {};
    paymentsData.forEach(payment => {
      const date = new Date(payment.createdAt);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      if (!monthly[monthYear]) {
        monthly[monthYear] = {
          total: 0,
          count: 0
        };
      }
      monthly[monthYear].total += payment.amount;
      monthly[monthYear].count += 1;
    });

    const sortedMonths = Object.keys(monthly).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA - dateB;
    });

    setMonthlyData(sortedMonths.map(month => ({
      month,
      total: monthly[month].total,
      count: monthly[month].count
    })));
  };

  // Fetch single payment details
  const fetchPaymentDetails = async (paymentId) => {
    try {
      const response = await axiosInstance.get(
        `/payment/details/${paymentId}`,
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching payment details:", err);
      toast.error("Failed to load payment details");
      return null;
    }
  };

  const handleViewDetails = async (payment) => {
    const details = await fetchPaymentDetails(payment._id);
    if (details) {
      setSelectedPayment(details);
      setShowDetailsModal(true);
    }
  };

  const handleDownloadInvoice = async (payment, format = "pdf") => {
    try {
      setDownloading(true);

      // You can implement invoice generation here
      const response = await axiosInstance.get(
        `/payment/invoice/${payment._id}?format=${format}`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `invoice_${payment._id}.${format}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Invoice downloaded successfully");
    } catch (err) {
      console.error("Error downloading invoice:", err);
      toast.error("Failed to download invoice");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintInvoice = (payment) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${payment.patientId?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .hospital-info { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; }
            .patient-info { margin-bottom: 30px; padding: 15px; background: #e8f4fd; border-radius: 8px; }
            .payment-info { margin-bottom: 30px; padding: 15px; background: #f0fdf4; border-radius: 8px; }
            .amount { font-size: 24px; font-weight: bold; color: #059669; }
            .footer { margin-top: 40px; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Payment Invoice</h1>
            <p>Invoice #: INV-${payment._id?.slice(-8)}</p>
            <p>Date: ${new Date(payment.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div class="hospital-info">
            <h2>${doctorData?.hospitalName || "Healthcare Center"}</h2>
            <p>${doctorData?.address || "Address"}</p>
            <p>Contact: ${doctorData?.mobileNumber || "N/A"}</p>
          </div>
          
          <div class="invoice-details">
            <h3>Invoice Details</h3>
            <div class="grid">
              <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
              <p><strong>Payment Status:</strong> ${payment.paymentStatus}</p>
              <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
              <p><strong>Transaction Date:</strong> ${new Date(payment.createdAt).toLocaleString()}</p>
            </div>
          </div>
          
          <div class="patient-info">
            <h3>Patient Information</h3>
            <p><strong>Name:</strong> ${payment.patientId?.name}</p>
            <p><strong>Email:</strong> ${payment.patientId?.email}</p>
            <p><strong>Contact:</strong> ${payment.patientId?.mobileNumber || "N/A"}</p>
          </div>
          
          <div class="payment-info">
            <h3>Payment Summary</h3>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p><strong>Consultation Fee</strong></p>
                <p>Dr. ${payment.doctorId?.name} - ${payment.doctorId?.specialization}</p>
              </div>
              <div class="amount">₹${payment.amount}</div>
            </div>
            <hr style="margin: 20px 0;">
            <div style="display: flex; justify-content: space-between;">
              <span><strong>Subtotal:</strong></span>
              <span>₹${payment.amount}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span><strong>Tax:</strong></span>
              <span>₹0</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; margin-top: 10px;">
              <span><strong>Total:</strong></span>
              <span class="amount">₹${payment.amount}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>This is a computer generated invoice</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Invoice
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
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

  // Filter payments based on search and date
  const filteredPayments = payments.filter((payment) => {
    const patientName = payment.patientId?.name?.toLowerCase() || "";
    const doctorName = payment.doctorId?.name?.toLowerCase() || "";
    const transactionId = payment.transactionId?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      patientName.includes(searchLower) ||
      doctorName.includes(searchLower) ||
      transactionId.includes(searchLower);

    let matchesDate = true;
    const paymentDate = new Date(payment.createdAt);
    const now = new Date();

    if (dateFilter === "week") {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      matchesDate = paymentDate >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      matchesDate = paymentDate >= monthAgo;
    } else if (dateFilter === "year") {
      const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      matchesDate = paymentDate >= yearAgo;
    }

    return matchesSearch && matchesDate;
  });

  // Sort payments by date (newest first)
  const sortedPayments = [...filteredPayments].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  // Pagination
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = sortedPayments.slice(
    indexOfFirstPayment,
    indexOfLastPayment,
  );
  const totalPages = Math.ceil(sortedPayments.length / paymentsPerPage);

  // Chart data for monthly earnings
  const earningsChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Monthly Earnings (₹)',
        data: monthlyData.map(d => d.total),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Chart data for payment methods
  const paymentMethodsChartData = {
    labels: Object.keys(paymentMethods),
    datasets: [
      {
        data: Object.values(paymentMethods),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
        borderWidth: 0
      }
    ]
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="DOCTOR" />
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
        <Sidebar role="DOCTOR" />
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
      <Sidebar role="DOCTOR" />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              My Payments
            </h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <FaBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src={doctorData?.image || "https://via.placeholder.com/40"}
                  alt={doctorData?.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Dr. {doctorData?.name}
                  </p>
                  <p className="text-xs text-gray-500">Doctor</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    ₹{stats.totalRevenue?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-4 bg-green-100 rounded-lg">
                  <FaRupeeSign className="text-green-600 text-2xl" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Lifetime earnings
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    ₹{stats.thisMonthRevenue?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-4 bg-blue-100 rounded-lg">
                  <FaCalendarAlt className="text-blue-600 text-2xl" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Earnings in {new Date().toLocaleString('default', { month: 'long' })}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    {stats.totalTransactions || payments.length}
                  </p>
                </div>
                <div className="p-4 bg-purple-100 rounded-lg">
                  <FaWallet className="text-purple-600 text-2xl" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Total payments received
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    ₹{stats.averagePerTransaction?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-4 bg-yellow-100 rounded-lg">
                  <FaChartLine className="text-yellow-600 text-2xl" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Per transaction
              </p>
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
                  placeholder="Search by patient, transaction ID..."
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
                <span>{filteredPayments.length} transactions found</span>
              </div>
            </div>
          </div>

          {/* Payments List */}
          {filteredPayments.length > 0 ? (
            <>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentPayments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={payment.patientId?.image || "https://via.placeholder.com/32"}
                              alt={payment.patientId?.name}
                              className="w-8 h-8 rounded-full mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {payment.patientId?.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {payment.patientId?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {payment.transactionId?.slice(-8)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {payment._id?.slice(-8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getPaymentIcon(payment.paymentMethod)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">
                              {payment.paymentMethod}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            ₹{payment.amount?.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            payment.paymentStatus === "Completed"
                              ? "bg-green-100 text-green-800"
                              : payment.paymentStatus === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {payment.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(payment)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="View Details"
                          >
                            <FaEye size={16} />
                          </button>
                        
                          <button
                            onClick={() => handlePrintInvoice(payment)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Print Invoice"
                          >
                            <FaPrint size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              <FaMoneyBillWave className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No payments found</p>
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
                  Payments will appear here after patients complete consultations
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Payment Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Payment Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 mb-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Payment Receipt
                    </h3>
                    <p className="text-green-100">
                      Transaction ID: {selectedPayment.transactionId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100">Amount</p>
                    <p className="text-3xl font-bold">
                      ₹{selectedPayment.amount?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaUserCircle className="mr-2 text-blue-600" />
                    Patient Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-600">Name:</span>{" "}
                      {selectedPayment.patientId?.name}
                    </p>
                    <p>
                      <span className="text-gray-600">Email:</span>{" "}
                      {selectedPayment.patientId?.email}
                    </p>
                    <p>
                      <span className="text-gray-600">Contact:</span>{" "}
                      {selectedPayment.patientId?.mobileNumber || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaCreditCard className="mr-2 text-blue-600" />
                    Payment Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-600">Method:</span>{" "}
                      <span className="capitalize">{selectedPayment.paymentMethod}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Status:</span>{" "}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedPayment.paymentStatus === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {selectedPayment.paymentStatus}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">Transaction ID:</span>{" "}
                      <span className="font-mono text-sm">{selectedPayment.transactionId}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Date:</span>{" "}
                      {new Date(selectedPayment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Appointment Details */}
                {selectedPayment.appointmentId && (
                  <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <FaCalendarCheck className="mr-2 text-blue-600" />
                      Appointment Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <p>
                        <span className="text-gray-600">Date:</span>{" "}
                        {new Date(selectedPayment.appointmentId.appointmentDate).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="text-gray-600">Time:</span>{" "}
                        {new Date(selectedPayment.appointmentId.appointmentDate).toLocaleTimeString()}
                      </p>
                      {selectedPayment.appointmentId.symptoms && (
                        <p className="md:col-span-2">
                          <span className="text-gray-600">Symptoms:</span>{" "}
                          {selectedPayment.appointmentId.symptoms}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Invoice Summary */}
                <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Invoice Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultation Fee</span>
                      <span className="font-medium">₹{selectedPayment.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">₹0</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg text-green-600">₹{selectedPayment.amount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                
                <button
                  onClick={() => handlePrintInvoice(selectedPayment)}
                  className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center"
                >
                  <FaPrint className="mr-2" />
                  Print Invoice
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

export default DoctorPayments;