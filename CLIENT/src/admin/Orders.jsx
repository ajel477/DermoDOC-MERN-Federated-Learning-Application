// pages/admin/Orders.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaEye,
  FaSearch,
  FaFilter,
  FaDownload,
  FaPrint,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTruck,
  FaBox,
  FaRupeeSign,
  FaUser,
  FaStore,
  FaCalendarAlt,
  FaSortAmountDown,
  FaSortAmountUp,
  FaEllipsisV,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCreditCard,
  FaWallet,
  FaMoneyBillWave,
  FaStar,
  FaHeart,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { FcRefresh } from "react-icons/fc";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axiosInstance from "../AuthenticationPages/axiosConfig";
import Sidebar from "../Sidebar";

const Orders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State for orders data
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    dateFrom: "",
    dateTo: "",
    search: "",
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    field: "createdAt",
    order: "desc",
  });

  // Show filters state
  const [showFilters, setShowFilters] = useState(false);

  // Status options
  const orderStatuses = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800" },
    { value: "processing", label: "Processing", color: "bg-purple-100 text-purple-800" },
    { value: "shipped", label: "Shipped", color: "bg-indigo-100 text-indigo-800" },
    { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
    { value: "returned", label: "Returned", color: "bg-orange-100 text-orange-800" },
  ];

  const paymentStatuses = [
    { value: "", label: "All Payments" },
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
    { value: "failed", label: "Failed", color: "bg-red-100 text-red-800" },
    { value: "refunded", label: "Refunded", color: "bg-purple-100 text-purple-800" },
  ];

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, [pagination.page, filters, sortConfig]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: sortConfig.order === "desc" ? `-${sortConfig.field}` : sortConfig.field,
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        ...(filters.dateFrom && { from: filters.dateFrom }),
        ...(filters.dateTo && { to: filters.dateTo }),
        ...(filters.search && { search: filters.search }),
      };

      const response = await axiosInstance.get("/admin/orders", { params });

      if (response.data.success) {
        setOrders(response.data.orders || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data.summary?.totalOrders || 0,
          pages: Math.ceil((response.data.summary?.totalOrders || 0) / prev.limit),
        }));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: "",
      paymentStatus: "",
      dateFrom: "",
      dateTo: "",
      search: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    toast.success("Filters cleared");
  };

  // Handle sort
  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === "desc" ? "asc" : "desc",
    }));
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchOrders();
    toast.success("Orders refreshed");
  };

  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Handle update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await axiosInstance.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        comment: `Status updated to ${newStatus} by admin`,
      });

      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders(); // Refresh the list
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  // Handle export
  const handleExport = (format) => {
    toast.success(`Exporting as ${format.toUpperCase()}...`);
    // Implement export logic here
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  // Get status badge
  const getStatusBadge = (status, type = "order") => {
    const statusList = type === "order" ? orderStatuses : paymentStatuses;
    const statusObj = statusList.find((s) => s.value === status);
    return statusObj ? (
      <span className={`px-2 py-1 text-xs rounded-full ${statusObj.color}`}>
        {statusObj.label}
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
        {status || "Unknown"}
      </span>
    );
  };

  // Get payment method icon
  const getPaymentIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "card":
        return <FaCreditCard className="text-blue-500" />;
      case "upi":
        return <FaWallet className="text-green-500" />;
      case "cod":
        return <FaMoneyBillWave className="text-amber-500" />;
      case "netbanking":
        return <FaCreditCard className="text-purple-500" />;
      default:
        return <FaCreditCard className="text-gray-400" />;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
                <p className="text-sm text-gray-500 mt-1">
                  View and manage all customer orders
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search orders..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-colors ${
                    showFilters
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Toggle Filters"
                >
                  <FaFilter />
                </button>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <FcRefresh className="text-lg" />
                </button>

                {/* Export Button */}
                <div className="relative">
                  <button
                    onClick={() => document.getElementById("export-menu").classList.toggle("hidden")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <FaDownload />
                    <span>Export</span>
                  </button>

                  <div
                    id="export-menu"
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 hidden"
                  >
                    <button
                      onClick={() => handleExport("pdf")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <FaFilePdf className="text-red-500" />
                      <span>Export as PDF</span>
                    </button>
                    <button
                      onClick={() => handleExport("excel")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <FaFileExcel className="text-green-500" />
                      <span>Export as Excel</span>
                    </button>
                    <button
                      onClick={() => handleExport("csv")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <FaFileCsv className="text-blue-500" />
                      <span>Export as CSV</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Order Status
                    </label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Status Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Payment Status
                    </label>
                    <select
                      name="paymentStatus"
                      value={filters.paymentStatus}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date From Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Date From
                    </label>
                    <input
                      type="date"
                      name="dateFrom"
                      value={filters.dateFrom}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Date To Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Date To
                    </label>
                    <input
                      type="date"
                      name="dateTo"
                      value={filters.dateTo}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </header>

        {/* Orders Content */}
        <div className="p-8">
          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("total")}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Amount</span>
                        {sortConfig.field === "total" &&
                          (sortConfig.order === "desc" ? (
                            <FaSortAmountDown className="text-xs" />
                          ) : (
                            <FaSortAmountUp className="text-xs" />
                          ))}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("createdAt")}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Date</span>
                        {sortConfig.field === "createdAt" &&
                          (sortConfig.order === "desc" ? (
                            <FaSortAmountDown className="text-xs" />
                          ) : (
                            <FaSortAmountUp className="text-xs" />
                          ))}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <FaShoppingCart className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              #{order.orderNumber || order._id.slice(-8)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaUser className="text-blue-600 text-xs" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {order.user?.name || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.user?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(order.total)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(order.orderStatus, "order")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getPaymentIcon(order.paymentMethod)}
                            {getStatusBadge(order.paymentStatus, "payment")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <FaCalendarAlt className="text-xs" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <div className="relative">
                              <button
                                onClick={() => {
                                  const menu = document.getElementById(`menu-${order._id}`);
                                  menu?.classList.toggle("hidden");
                                }}
                                className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <FaEllipsisV />
                              </button>
                              <div
                                id={`menu-${order._id}`}
                                className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 hidden"
                              >
                                <button
                                  onClick={() => handleUpdateStatus(order._id, "confirmed")}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  Mark as Confirmed
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(order._id, "processing")}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  Mark as Processing
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(order._id, "shipped")}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  Mark as Shipped
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(order._id, "delivered")}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  Mark as Delivered
                                </button>
                                <div className="border-t my-1"></div>
                                <button
                                  onClick={() => handleUpdateStatus(order._id, "cancelled")}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  Cancel Order
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FaShoppingCart className="text-5xl text-gray-300 mb-3" />
                          <p className="text-gray-500 mb-2">No orders found</p>
                          <p className="text-sm text-gray-400">
                            {filters.status || filters.paymentStatus || filters.search
                              ? "Try clearing your filters"
                              : "Orders will appear here"}
                          </p>
                          {(filters.status || filters.paymentStatus || filters.search) && (
                            <button
                              onClick={clearFilters}
                              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Clear Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} orders
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                    }
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaArrowLeft className="text-sm" />
                  </button>
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={i}
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page: pageNum }))
                        }
                        className={`w-8 h-8 rounded-lg text-sm ${
                          pagination.page === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                    }
                    disabled={pagination.page === pagination.pages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaArrowRight className="text-sm" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Order Details
                </h2>
                <p className="text-sm text-gray-500">
                  Order #{selectedOrder.orderNumber || selectedOrder._id}
                </p>
              </div>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Order Status Bar */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <FaShoppingCart className="text-blue-600" />
                    <span className="text-sm text-gray-600">Order Status:</span>
                    {getStatusBadge(selectedOrder.orderStatus, "order")}
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaCreditCard className="text-green-600" />
                    <span className="text-sm text-gray-600">Payment:</span>
                    {getStatusBadge(selectedOrder.paymentStatus, "payment")}
                  </div>
                </div>
                <select
                  onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                  value={selectedOrder.orderStatus}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {orderStatuses.filter(s => s.value).map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                    <FaUser className="text-blue-600" />
                    <span>Customer Information</span>
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-800">
                        {selectedOrder.user?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800 flex items-center space-x-1">
                        <FaEnvelope className="text-gray-400 text-xs" />
                        <span>{selectedOrder.user?.email || "N/A"}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-800 flex items-center space-x-1">
                        <FaPhone className="text-gray-400 text-xs" />
                        <span>{selectedOrder.shippingAddress?.phone || "N/A"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <h3 className="font-semibold text-gray-800 flex items-center space-x-2 mt-4">
                    <FaMapMarkerAlt className="text-red-600" />
                    <span>Shipping Address</span>
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800">
                      {selectedOrder.shippingAddress?.street}
                    </p>
                    <p className="text-gray-800">
                      {selectedOrder.shippingAddress?.city},{" "}
                      {selectedOrder.shippingAddress?.state} -{" "}
                      {selectedOrder.shippingAddress?.zipCode}
                    </p>
                    <p className="text-gray-800">
                      {selectedOrder.shippingAddress?.country}
                    </p>
                  </div>

                  {/* Payment Information */}
                  <h3 className="font-semibold text-gray-800 flex items-center space-x-2 mt-4">
                    <FaCreditCard className="text-green-600" />
                    <span>Payment Information</span>
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Method</span>
                      <span className="font-medium text-gray-800 flex items-center space-x-1">
                        {getPaymentIcon(selectedOrder.paymentMethod)}
                        <span>{selectedOrder.paymentMethod || "N/A"}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Transaction ID</span>
                      <span className="font-medium text-gray-800">
                        {selectedOrder.paymentDetails?.transactionId || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Paid At</span>
                      <span className="font-medium text-gray-800">
                        {formatDate(selectedOrder.paymentDetails?.paidAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center space-x-2 mb-4">
                    <FaBox className="text-amber-600" />
                    <span>Order Items</span>
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                            {item.product?.images?.[0]?.url ? (
                              <img
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FaBox className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.product?.name || "Product"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Quantity: {item.quantity} × {formatCurrency(item.price)}
                            </p>
                            {item.seller && (
                              <p className="text-xs text-gray-500 flex items-center space-x-1">
                                <FaStore className="text-green-600" />
                                <span>{item.seller.storeName || "Seller"}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="font-semibold text-gray-800">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Order Summary</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium text-gray-800">
                          {formatCurrency(selectedOrder.subtotal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Shipping</span>
                        <span className="font-medium text-gray-800">
                          {formatCurrency(selectedOrder.shippingCharge || 0)}
                        </span>
                      </div>
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Discount</span>
                          <span className="font-medium text-green-600">
                            -{formatCurrency(selectedOrder.discountAmount)}
                          </span>
                        </div>
                      )}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700">Total</span>
                          <span className="text-xl font-bold text-gray-800">
                            {formatCurrency(selectedOrder.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status History */}
                  {selectedOrder.statusHistory?.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Status History</h4>
                      <div className="space-y-2">
                        {selectedOrder.statusHistory.map((history, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                          >
                            <div className="flex items-center space-x-2">
                              {history.status === "delivered" ? (
                                <FaCheckCircle className="text-green-500" />
                              ) : history.status === "cancelled" ? (
                                <FaTimesCircle className="text-red-500" />
                              ) : (
                                <FaClock className="text-amber-500" />
                              )}
                              <span className="text-gray-800">{history.status}</span>
                            </div>
                            <span className="text-gray-500">
                              {formatDate(history.updatedAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowOrderDetails(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowOrderDetails(false);
                  // Navigate to print or export
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaPrint />
                <span>Print Invoice</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Orders;