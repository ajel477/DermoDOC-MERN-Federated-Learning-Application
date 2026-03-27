// pages/admin/ManageUsers.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaSort,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaDownload,
  FaPrint,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaShieldAlt,
  FaUserCog,
  FaUser,
  FaStore,
  FaShoppingBag,
  FaStar,
  FaHeart,
} from "react-icons/fa";
import { FcRefresh } from "react-icons/fc";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axiosInstance from "../AuthenticationPages/axiosConfig";
import Sidebar from "../Sidebar";

const ManageUsers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State for users data
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("USER"); // USER, SELLER, ADMIN
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, Approved, Pending, Suspended, Rejected
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  // Stats from dashboard API
  const [dashboardStats, setDashboardStats] = useState({
    users: 0,
    sellers: 0,
    pending: { users: 0, sellers: 0, total: 0 },
  });

  // Fetch users based on role and filters
  useEffect(() => {
    fetchUsers();
    fetchDashboardStats();
  }, [selectedRole, statusFilter, currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      let params = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      switch (selectedRole) {
        case "USER":
          endpoint = "/admin/users?role=USER";
          break;
        case "SELLER":
          endpoint = "/admin/users?role=SELLER";
          break;
        case "ADMIN":
          endpoint = "/admin/users?role=ADMIN";
          break;
        default:
          endpoint = "/admin/users";
      }

      const response = await axiosInstance.get(endpoint, { params });

      if (response.data.success) {
        if (selectedRole === "USER") {
          setUsers(response.data.users);
          setTotalPages(response.data.pagination?.pages || 1);
          setTotalUsers(
            response.data.pagination?.total || response.data.users.length,
          );
        } else if (selectedRole === "SELLER") {
          setSellers(response.data.users);
          setTotalPages(response.data.pagination?.pages || 1);
          setTotalUsers(
            response.data.pagination?.total || response.data.users.length,
          );
        } else {
          // For ADMIN or all users
          setUsers(response.data.users.filter((u) => u.role === "USER"));
          setSellers(response.data.users.filter((u) => u.role === "SELLER"));
          setTotalPages(response.data.pagination?.pages || 1);
          setTotalUsers(
            response.data.pagination?.total || response.data.users.length,
          );
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axiosInstance.get("/admin/dashboard");
      if (response.data.success) {
        setDashboardStats({
          users: response.data.dashboard.stats.users,
          sellers: response.data.dashboard.stats.sellers,
          pending: response.data.dashboard.pending,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  // Handle user status update
  const handleStatusUpdate = async (userId, role, newStatus) => {
    setStatusUpdateLoading(true);
    try {
      const response = await axiosInstance.patch(
        `/admin/users/${role}/${userId}/status`,
        { status: newStatus },
      );

      if (response.data.success) {
        toast.success(`User ${newStatus} successfully`);
        fetchUsers(); // Refresh the list
        fetchDashboardStats(); // Refresh stats
        setShowUserModal(false);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update user status",
      );
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Handle user delete
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await axiosInstance.delete(
        `/admin/users/${userToDelete.role}/${userToDelete.id}`,
      );

      if (response.data.success) {
        toast.success("User deleted successfully");
        fetchUsers(); // Refresh the list
        fetchDashboardStats(); // Refresh stats
        setShowDeleteModal(false);
        setUserToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        setCurrentPage(1);
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle refresh
  const handleRefresh = () => {
    fetchUsers();
    fetchDashboardStats();
    toast.success("Data refreshed");
  };

  // Handle export
  const handleExport = (format) => {
    toast.success(`Exporting as ${format.toUpperCase()}...`);
    // Implement export logic here
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Suspended":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "Warn":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <FaCheckCircle className="text-green-500" />;
      case "Pending":
        return <FaClock className="text-yellow-500" />;
      case "Suspended":
        return <FaExclamationTriangle className="text-orange-500" />;
      case "Rejected":
        return <FaTimesCircle className="text-red-500" />;
      case "Warn":
        return <FaExclamationTriangle className="text-purple-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
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

  // Get current display data
  const currentData = selectedRole === "SELLER" ? sellers : users;

  if (loading && currentPage === 1) {
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
            <p className="text-gray-600">Loading users...</p>
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
                  Manage Users
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  View and manage all users, sellers, and administrators
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Role Selector */}
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="USER">Customers</option>
                  <option value="SELLER">Sellers</option>
                  <option value="ADMIN">Admins</option>
                </select>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <FcRefresh className="text-lg" />
                </button>

                {/* Export Button */}
                <button
                  onClick={() => handleExport("excel")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FaDownload />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Users
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {dashboardStats.users}
                  </h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FaUsers className="text-blue-600 text-xl" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Sellers
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {dashboardStats.sellers}
                  </h3>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <FaStore className="text-green-600 text-xl" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Pending Users
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {dashboardStats.pending.users}
                  </h3>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <FaUserClock className="text-yellow-600 text-xl" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Pending Sellers
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {dashboardStats.pending.sellers}
                  </h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FaStore className="text-purple-600 text-xl" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Search ${selectedRole === "SELLER" ? "sellers" : "users"}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
                <option value="Rejected">Rejected</option>
                <option value="Warn">Warned</option>
              </select>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <FaFilter />
                <span>More Filters</span>
              </button>

              {/* Results Count */}
              <div className="text-sm text-gray-500 ml-auto">
                Showing {currentData.length} of {totalUsers}{" "}
                {selectedRole === "SELLER" ? "sellers" : "users"}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Date
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>All Time</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verified Only
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-600">
                        Show verified only
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentData.length > 0 ? (
                    currentData.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                              {user.image ? (
                                <img
                                  src={user.image}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/40x40?text=User";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                                  {selectedRole === "SELLER" ? (
                                    <FaStore className="text-blue-600" />
                                  ) : (
                                    <FaUser className="text-blue-600" />
                                  )}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {user.name || user.storeName}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {user._id.slice(-8)}
                              </p>
                              {selectedRole === "SELLER" && (
                                <p className="text-xs text-green-600 mt-1">
                                  <FaStar className="inline mr-1 text-amber-400" />
                                  {user.rating || 0} • {user.totalProducts || 0}{" "}
                                  products
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600 flex items-center">
                              <FaEnvelope
                                className="mr-2 text-gray-400"
                                size={12}
                              />
                              {user.email}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <FaPhone
                                className="mr-2 text-gray-400"
                                size={12}
                              />
                              {user.mobileNumber || "N/A"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {selectedRole === "SELLER"
                              ? "Seller"
                              : selectedRole === "ADMIN"
                                ? "Admin"
                                : "Customer"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(user.accountStatus)}
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(user.accountStatus)}`}
                            >
                              {user.accountStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {formatDate(
                              user.accountCreatedAt || user.createdAt,
                            )}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {user.lastLogin
                              ? formatDate(user.lastLogin)
                              : "Never"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FaUsers className="text-5xl text-gray-300 mb-4" />
                          <p className="text-gray-500 mb-2">
                            No {selectedRole === "SELLER" ? "sellers" : "users"}{" "}
                            found
                          </p>
                          <p className="text-sm text-gray-400">
                            Try adjusting your filters or search term
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft size={14} />
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  User Details
                </h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimesCircle className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* User Info */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden">
                  {selectedUser.image ? (
                    <img
                      src={selectedUser.image}
                      alt={selectedUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                      {selectedRole === "SELLER" ? (
                        <FaStore className="text-blue-600 text-2xl" />
                      ) : (
                        <FaUser className="text-blue-600 text-2xl" />
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedUser.name || selectedUser.storeName}
                  </h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(selectedUser.accountStatus)}`}
                    >
                      {selectedUser.accountStatus}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {selectedRole === "SELLER"
                        ? "Seller"
                        : selectedRole === "ADMIN"
                          ? "Admin"
                          : "Customer"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="font-medium text-gray-800">
                    {selectedUser.mobileNumber || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="font-medium text-gray-800">
                    {selectedUser.address || "N/A"}
                  </p>
                </div>
              </div>

              {/* Account Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Account Created</p>
                  <p className="font-medium text-gray-800">
                    {formatDate(
                      selectedUser.accountCreatedAt || selectedUser.createdAt,
                    )}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Last Login</p>
                  <p className="font-medium text-gray-800">
                    {selectedUser.lastLogin
                      ? formatDate(selectedUser.lastLogin)
                      : "Never"}
                  </p>
                </div>
              </div>

              {/* Seller Specific Info */}
              {selectedRole === "SELLER" && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Seller Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Store Name</p>
                      <p className="font-medium text-gray-800">
                        {selectedUser.storeName}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">GST Number</p>
                      <p className="font-medium text-gray-800">
                        {selectedUser.gstNumber || "N/A"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">
                        Total Products
                      </p>
                      <p className="font-medium text-gray-800">
                        {selectedUser.totalProducts || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">
                        Total Earnings
                      </p>
                      <p className="font-medium text-gray-800">
                        ₹{selectedUser.totalEarnings?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Admin Actions
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      handleStatusUpdate(
                        selectedUser._id,
                        selectedRole,
                        "Approved",
                      )
                    }
                    disabled={
                      selectedUser.accountStatus === "Approved" ||
                      statusUpdateLoading
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <FaUserCheck />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() =>
                      handleStatusUpdate(
                        selectedUser._id,
                        selectedRole,
                        "Suspended",
                      )
                    }
                    disabled={
                      selectedUser.accountStatus === "Suspended" ||
                      statusUpdateLoading
                    }
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <FaUserTimes />
                    <span>Suspend</span>
                  </button>
                  <button
                    onClick={() =>
                      handleStatusUpdate(
                        selectedUser._id,
                        selectedRole,
                        "Rejected",
                      )
                    }
                    disabled={
                      selectedUser.accountStatus === "Rejected" ||
                      statusUpdateLoading
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <FaTimesCircle />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Delete User?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{userToDelete.name}</span>? This
                action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
