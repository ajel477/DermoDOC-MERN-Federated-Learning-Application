// pages/admin/Coupons.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGift,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaSort,
  FaDownload,
  FaPrint,
  FaCopy,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle,
  FaPercent,
  FaRupeeSign,
  FaTag,
  FaCalendarAlt,
  FaUsers,
  FaBox,
  FaStore,
  FaUser,
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaEllipsisV,
  FaToggleOn,
  FaToggleOff,
  FaFileExport,
  FaRedoAlt,
} from "react-icons/fa";
import { MdLocalOffer, MdDiscount, MdVerified } from "react-icons/md";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axiosInstance from "../AuthenticationPages/axiosConfig";
import Sidebar from "../Sidebar";

const Coupons = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("coupons");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State for coupons data
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    used: 0,
    percentageType: 0,
    fixedType: 0,
  });

  // Fetch coupons from API
  useEffect(() => {
    fetchCoupons();
  }, [currentPage, sortBy, sortOrder, filterStatus, filterType]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(filterType !== "all" && { type: filterType }),
        sort: sortOrder === "desc" ? `-${sortBy}` : sortBy,
      };

      const response = await axiosInstance.get("/admin/coupons", { params });

      if (response.data.success) {
        setCoupons(response.data.coupons);
        setTotalPages(response.data.pagination?.pages || 1);
        calculateStats(response.data.coupons);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (couponsData) => {
    const stats = {
      total: couponsData.length,
      active: couponsData.filter(
        (c) => c.status === "active" && new Date(c.endDate) > new Date(),
      ).length,
      expired: couponsData.filter(
        (c) => c.status === "expired" || new Date(c.endDate) < new Date(),
      ).length,
      used: couponsData.filter((c) => c.status === "used").length,
      percentageType: couponsData.filter((c) => c.type === "percentage").length,
      fixedType: couponsData.filter((c) => c.type === "fixed").length,
    };
    setStats(stats);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchCoupons();
  };

  // Handle delete coupon
  const handleDelete = async () => {
    if (!selectedCoupon) return;

    try {
      const response = await axiosInstance.delete(
        `/admin/coupons/${selectedCoupon._id}`,
      );

      if (response.data.success) {
        toast.success("Coupon deleted successfully");
        setShowDeleteModal(false);
        setSelectedCoupon(null);
        fetchCoupons();
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon");
    }
  };

  // Handle toggle coupon status
  const handleToggleStatus = async (coupon) => {
    try {
      const newStatus = coupon.status === "active" ? "disabled" : "active";

      const response = await axiosInstance.put(`/admin/coupons/${coupon._id}`, {
        status: newStatus,
      });

      if (response.data.success) {
        toast.success(
          `Coupon ${newStatus === "active" ? "activated" : "disabled"} successfully`,
        );
        fetchCoupons();
      }
    } catch (error) {
      console.error("Error toggling coupon status:", error);
      toast.error("Failed to update coupon status");
    }
  };

  // Handle copy coupon code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied to clipboard");
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchCoupons();
    toast.success("Coupons refreshed");
  };

  // Handle export
  const handleExport = (format) => {
    toast.success(`Exporting as ${format.toUpperCase()}...`);
    // Implement export logic here
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

  // Get status badge
  const getStatusBadge = (coupon) => {
    const now = new Date();
    const endDate = new Date(coupon.endDate);

    if (coupon.status === "used") {
      return {
        label: "Used",
        className: "bg-gray-100 text-gray-700",
        icon: <FaCheckCircle className="mr-1" size={12} />,
      };
    } else if (coupon.status === "expired" || endDate < now) {
      return {
        label: "Expired",
        className: "bg-red-100 text-red-700",
        icon: <FaTimesCircle className="mr-1" size={12} />,
      };
    } else if (coupon.status === "active" && endDate >= now) {
      return {
        label: "Active",
        className: "bg-green-100 text-green-700",
        icon: <FaCheckCircle className="mr-1" size={12} />,
      };
    } else {
      return {
        label: "Disabled",
        className: "bg-gray-100 text-gray-700",
        icon: <FaTimesCircle className="mr-1" size={12} />,
      };
    }
  };

  // Get type badge
  const getTypeBadge = (type) => {
    switch (type) {
      case "percentage":
        return {
          label: "Percentage",
          className: "bg-blue-100 text-blue-700",
          icon: <FaPercent className="mr-1" size={12} />,
        };
      case "fixed":
        return {
          label: "Fixed Amount",
          className: "bg-purple-100 text-purple-700",
          icon: <FaRupeeSign className="mr-1" size={12} />,
        };
      default:
        return {
          label: type,
          className: "bg-gray-100 text-gray-700",
          icon: <FaTag className="mr-1" size={12} />,
        };
    }
  };

  // Filtered coupons based on search
  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCoupons = filteredCoupons.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  if (loading && coupons.length === 0) {
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
            <p className="text-gray-600">Loading coupons...</p>
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
                <h1 className="text-2xl font-bold text-gray-800">
                  Manage Coupons
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Create and manage discount coupons for your store
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <FaRedoAlt className="text-lg" />
                </button>

                {/* Export Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <FaFileExport />
                    <span>Export</span>
                  </button>

                  {showFilterMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        onClick={() => handleExport("pdf")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Export as PDF
                      </button>
                      <button
                        onClick={() => handleExport("excel")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Export as Excel
                      </button>
                      <button
                        onClick={() => handleExport("csv")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Export as CSV
                      </button>
                    </div>
                  )}
                </div>

                {/* Create Coupon Button */}
                <button
                  onClick={() => navigate("/admin/coupons/create")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FaPlus />
                  <span>Create Coupon</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Coupons</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {stats.total}
                  </h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaGift className="text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Active</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {stats.active}
                  </h3>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaCheckCircle className="text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Expired</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {stats.expired}
                  </h3>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <FaClock className="text-red-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Used</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {stats.used}
                  </h3>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <FaCheckCircle className="text-gray-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Percentage</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {stats.percentageType}
                  </h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FaPercent className="text-purple-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fixed</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {stats.fixedType}
                  </h3>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <FaRupeeSign className="text-amber-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search coupons by code, title, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </form>

              {/* Filters */}
              <div className="flex items-center space-x-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="used">Used</option>
                  <option value="disabled">Disabled</option>
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>

                <button
                  onClick={() => {
                    setFilterStatus("all");
                    setFilterType("all");
                    setSearchTerm("");
                  }}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Coupons Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("code")}
                        className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        Code
                        {sortBy === "code" && (
                          <FaSort
                            className={`ml-1 ${sortOrder === "asc" ? "rotate-180" : ""}`}
                            size={12}
                          />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("title")}
                        className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        Title
                        {sortBy === "title" && (
                          <FaSort
                            className={`ml-1 ${sortOrder === "asc" ? "rotate-180" : ""}`}
                            size={12}
                          />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("type")}
                        className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        Type
                        {sortBy === "type" && (
                          <FaSort
                            className={`ml-1 ${sortOrder === "asc" ? "rotate-180" : ""}`}
                            size={12}
                          />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("value")}
                        className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        Value
                        {sortBy === "value" && (
                          <FaSort
                            className={`ml-1 ${sortOrder === "asc" ? "rotate-180" : ""}`}
                            size={12}
                          />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("startDate")}
                        className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        Valid Period
                        {sortBy === "startDate" && (
                          <FaSort
                            className={`ml-1 ${sortOrder === "asc" ? "rotate-180" : ""}`}
                            size={12}
                          />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("usageLimit")}
                        className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        Usage
                        {sortBy === "usageLimit" && (
                          <FaSort
                            className={`ml-1 ${sortOrder === "asc" ? "rotate-180" : ""}`}
                            size={12}
                          />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("status")}
                        className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        Status
                        {sortBy === "status" && (
                          <FaSort
                            className={`ml-1 ${sortOrder === "asc" ? "rotate-180" : ""}`}
                            size={12}
                          />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("assignedTo")}
                        className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        Assigned To
                        {sortBy === "assignedTo" && (
                          <FaSort
                            className={`ml-1 ${sortOrder === "asc" ? "rotate-180" : ""}`}
                            size={12}
                          />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentCoupons.length > 0 ? (
                    currentCoupons.map((coupon) => {
                      const status = getStatusBadge(coupon);
                      const type = getTypeBadge(coupon.type);
                      return (
                        <tr
                          key={coupon._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm font-medium text-gray-900">
                                {coupon.code}
                              </span>
                              <button
                                onClick={() => handleCopyCode(coupon.code)}
                                className="text-gray-400 hover:text-blue-600"
                                title="Copy code"
                              >
                                <FaCopy size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {coupon.title}
                              </p>
                              {coupon.description && (
                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                  {coupon.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${type.className}`}
                            >
                              {type.icon}
                              {type.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {coupon.type === "percentage" ? (
                              <span className="font-semibold text-gray-900">
                                {coupon.value}%
                              </span>
                            ) : (
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(coupon.value)}
                              </span>
                            )}
                            {coupon.minPurchase > 0 && (
                              <p className="text-xs text-gray-500">
                                Min: {formatCurrency(coupon.minPurchase)}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-gray-900">
                                {formatDate(coupon.startDate)}
                              </p>
                              <p className="text-xs text-gray-500">
                                to {formatDate(coupon.endDate)}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-gray-900">
                                {coupon.usedCount || 0} /{" "}
                                {coupon.usageLimit || "∞"}
                              </p>
                              {coupon.usageLimit && (
                                <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                                  <div
                                    className="h-1 bg-blue-600 rounded-full"
                                    style={{
                                      width: `${((coupon.usedCount || 0) / coupon.usageLimit) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${status.className}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {coupon.assignedTo ? (
                              <div className="flex items-center space-x-2">
                                {coupon.assignedTo.role === "USER" ? (
                                  <FaUser className="text-blue-500" size={12} />
                                ) : coupon.assignedTo.role === "SELLER" ? (
                                  <FaStore
                                    className="text-green-500"
                                    size={12}
                                  />
                                ) : (
                                  <FaUsers
                                    className="text-purple-500"
                                    size={12}
                                  />
                                )}
                                <span className="text-sm text-gray-900">
                                  {coupon.assignedTo.name ||
                                    coupon.assignedTo.email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">
                                All Users
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedCoupon(coupon);
                                  setShowViewModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <FaEye size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  navigate(`/admin/coupons/edit/${coupon._id}`)
                                }
                                className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <FaEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(coupon)}
                                className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title={
                                  coupon.status === "active"
                                    ? "Disable"
                                    : "Activate"
                                }
                              >
                                {coupon.status === "active" ? (
                                  <FaToggleOn
                                    size={16}
                                    className="text-green-500"
                                  />
                                ) : (
                                  <FaToggleOff
                                    size={16}
                                    className="text-gray-400"
                                  />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCoupon(coupon);
                                  setShowDeleteModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <FaTrash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FaGift className="text-5xl text-gray-300 mb-3" />
                          <p className="text-gray-500 mb-2">No coupons found</p>
                          <p className="text-sm text-gray-400 mb-4">
                            {searchTerm ||
                            filterStatus !== "all" ||
                            filterType !== "all"
                              ? "Try adjusting your filters"
                              : "Create your first coupon to get started"}
                          </p>
                          {!searchTerm &&
                            filterStatus === "all" &&
                            filterType === "all" && (
                              <button
                                onClick={() =>
                                  navigate("/admin/coupons/create")
                                }
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                              >
                                <FaPlus />
                                <span>Create Coupon</span>
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
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, filteredCoupons.length)} of{" "}
                  {filteredCoupons.length} coupons
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaArrowLeft size={14} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
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
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl max-w-md w-full mx-4 p-6"
          >
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Delete Coupon
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete coupon "{selectedCoupon.code}"?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Coupon Modal */}
      {showViewModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full mx-4"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  Coupon Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimesCircle className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Coupon Code</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-mono text-lg font-bold text-gray-900">
                      {selectedCoupon.code}
                    </p>
                    <button
                      onClick={() => handleCopyCode(selectedCoupon.code)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <FaCopy size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusBadge(selectedCoupon).className}`}
                  >
                    {getStatusBadge(selectedCoupon).icon}
                    {getStatusBadge(selectedCoupon).label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Title</p>
                  <p className="font-medium text-gray-900">
                    {selectedCoupon.title}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Type</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getTypeBadge(selectedCoupon.type).className}`}
                  >
                    {getTypeBadge(selectedCoupon.type).icon}
                    {getTypeBadge(selectedCoupon.type).label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Value</p>
                  <p className="font-medium text-gray-900">
                    {selectedCoupon.type === "percentage"
                      ? `${selectedCoupon.value}%`
                      : formatCurrency(selectedCoupon.value)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Min Purchase</p>
                  <p className="font-medium text-gray-900">
                    {selectedCoupon.minPurchase
                      ? formatCurrency(selectedCoupon.minPurchase)
                      : "No minimum"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Max Discount</p>
                  <p className="font-medium text-gray-900">
                    {selectedCoupon.maxDiscount
                      ? formatCurrency(selectedCoupon.maxDiscount)
                      : "No limit"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Usage</p>
                  <p className="font-medium text-gray-900">
                    {selectedCoupon.usedCount || 0} /{" "}
                    {selectedCoupon.usageLimit || "∞"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valid From</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedCoupon.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valid Until</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedCoupon.endDate)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-900">
                    {selectedCoupon.description || "No description provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Assigned To</p>
                  {selectedCoupon.assignedTo ? (
                    <div className="flex items-center space-x-2">
                      {selectedCoupon.assignedTo.role === "USER" ? (
                        <FaUser className="text-blue-500" />
                      ) : selectedCoupon.assignedTo.role === "SELLER" ? (
                        <FaStore className="text-green-500" />
                      ) : (
                        <FaUsers className="text-purple-500" />
                      )}
                      <span className="font-medium text-gray-900">
                        {selectedCoupon.assignedTo.name ||
                          selectedCoupon.assignedTo.email}
                      </span>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-900">All Users</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Product</p>
                  {selectedCoupon.product ? (
                    <div className="flex items-center space-x-2">
                      <FaBox className="text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {selectedCoupon.product.name}
                      </span>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-900">All Products</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created At</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedCoupon.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedCoupon.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  navigate(`/admin/coupons/edit/${selectedCoupon._id}`);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Coupon
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
