// pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaStore,
  FaBox,
  FaShoppingCart,
  FaStar,
  FaHeart,
  FaEye,
  FaUserClock,
  FaGift,
  FaChartLine,
  FaDownload,
} from "react-icons/fa";
import { FcRefresh } from "react-icons/fc";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axiosInstance from "../AuthenticationPages/axiosConfig";
import Sidebar from "../Sidebar";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State for dashboard data - from API only
  const [dashboardData, setDashboardData] = useState({
    stats: {
      users: 0,
      sellers: 0,
      admins: 0,
      products: 0,
      orders: 0,
      revenue: 0,
    },
    pending: {
      users: 0,
      sellers: 0,
      total: 0,
    },
    recentOrders: [],
    topSellers: [],
    recentUsers: [],
  });

  const [statsData, setStatsData] = useState({
    totals: {
      users: 0,
      sellers: 0,
      products: 0,
      orders: 0,
      revenue: 0,
    },
    periods: {
      daily: { orders: 0, revenue: 0 },
      weekly: { orders: 0, revenue: 0 },
      monthly: { orders: 0, revenue: 0 },
    },
    topProducts: [],
    topSellers: [],
  });

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("week");
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Fetch dashboard data from API only
  useEffect(() => {
    fetchDashboardData();
    fetchStatsData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get("/admin/dashboard");
      if (response.data.success) {
        setDashboardData(response.data.dashboard);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  const fetchStatsData = async () => {
    try {
      const response = await axiosInstance.get("/admin/stats");
      if (response.data.success) {
        setStatsData(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations with API data
  const getRevenueChartData = () => {
    // Use actual API data if available, otherwise show empty chart
    const hasData = statsData.periods.weekly.revenue > 0;
    
    return {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Revenue",
          data: hasData 
            ? [statsData.periods.weekly.revenue / 7, statsData.periods.weekly.revenue / 7, statsData.periods.weekly.revenue / 7, statsData.periods.weekly.revenue / 7, statsData.periods.weekly.revenue / 7, statsData.periods.weekly.revenue / 7, statsData.periods.weekly.revenue / 7]
            : [0, 0, 0, 0, 0, 0, 0],
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "#3B82F6",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const getOrdersChartData = () => {
    const hasData = statsData.periods.weekly.orders > 0;
    
    return {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Orders",
          data: hasData
            ? [statsData.periods.weekly.orders / 7, statsData.periods.weekly.orders / 7, statsData.periods.weekly.orders / 7, statsData.periods.weekly.orders / 7, statsData.periods.weekly.orders / 7, statsData.periods.weekly.orders / 7, statsData.periods.weekly.orders / 7]
            : [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: "rgba(16, 185, 129, 0.8)",
          borderRadius: 6,
        },
      ],
    };
  };

  const getCategoryChartData = () => {
    // Calculate category distribution from top products if available
    const categories = {};
    statsData.topProducts.forEach(product => {
      // Assuming product has category field - adjust based on your actual data structure
      const category = product.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });

    const categoryLabels = Object.keys(categories).length > 0 
      ? Object.keys(categories) 
      : ["No Data"];
    
    const categoryValues = Object.keys(categories).length > 0
      ? Object.values(categories)
      : [1];

    return {
      labels: categoryLabels,
      datasets: [
        {
          data: categoryValues,
          backgroundColor: [
            "#3B82F6",
            "#10B981",
            "#F59E0B",
            "#EF4444",
            "#8B5CF6",
          ],
          borderWidth: 0,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#F3F4F6",
        bodyColor: "#D1D5DB",
        padding: 12,
        borderColor: "#374151",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#E5E7EB",
          drawBorder: false,
        },
        ticks: {
          color: "#6B7280",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
        },
      },
    },
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
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    Promise.all([fetchDashboardData(), fetchStatsData()])
      .then(() => {
        toast.success("Dashboard refreshed");
      })
      .finally(() => setLoading(false));
  };

  // Handle export
  const handleExport = (format) => {
    setShowExportMenu(false);
    toast.success(`Exporting as ${format.toUpperCase()}...`);
    // Implement export logic here
  };

  // Stat Card Component
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
  }) => (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="text-white text-xl" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
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
            <p className="text-gray-600">Loading dashboard...</p>
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
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Welcome back, Admin •{" "}
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Date Range Selector */}
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
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
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <FaDownload />
                    <span>Export</span>
                  </button>

                  {showExportMenu && (
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
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Grid - Data from API */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={dashboardData.stats.users}
              icon={FaUsers}
              color="bg-blue-500"
              subtitle={`${dashboardData.pending.users} pending approvals`}
            />
            <StatCard
              title="Total Sellers"
              value={dashboardData.stats.sellers}
              icon={FaStore}
              color="bg-green-500"
              subtitle={`${dashboardData.pending.sellers} pending`}
            />
            <StatCard
              title="Total Products"
              value={dashboardData.stats.products}
              icon={FaBox}
              color="bg-amber-500"
            />
            <StatCard
              title="Total Orders"
              value={dashboardData.stats.orders}
              icon={FaShoppingCart}
              color="bg-purple-500"
            />
          </div>

          {/* Revenue and Orders Charts - Data from API */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Revenue Overview
                  </h2>
                  <p className="text-sm text-gray-500">Based on API data</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">
                    {formatCurrency(statsData.periods.weekly.revenue)}
                  </p>
                  <p className="text-xs text-gray-500">This week</p>
                </div>
              </div>
              <div className="h-64">
                <Line data={getRevenueChartData()} options={chartOptions} />
              </div>
            </div>

            {/* Orders Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Orders Overview
                  </h2>
                  <p className="text-sm text-gray-500">Based on API data</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">
                    {statsData.periods.weekly.orders}
                  </p>
                  <p className="text-xs text-gray-500">This week</p>
                </div>
              </div>
              <div className="h-64">
                <Bar data={getOrdersChartData()} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Category Distribution and Top Products - Data from API */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Category Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Category Distribution
              </h2>
              <div className="h-64">
                {statsData.topProducts.length > 0 ? (
                  <Pie
                    data={getCategoryChartData()}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: true,
                          position: "bottom",
                          labels: {
                            color: "#6B7280",
                            font: { size: 12 },
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400">No category data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Products - Data from API */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Top Products
                </h2>
                <button
                  onClick={() => navigate("/admin/products")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {statsData.topProducts.length > 0 ? (
                  statsData.topProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden">
                          {product.images && product.images[0] && (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/40x40?text=No+Image";
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            SKU: PRD{product._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">
                            {formatCurrency(product.price)}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <FaHeart className="text-rose-400 mr-1" size={10} />
                            {product.totalLikes || 0} likes
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            navigate(`/admin/products/${product._id}`)
                          }
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-4">No products available</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Users and Top Sellers - Data from API */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users - Data from API */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Recent Users
                  </h2>
                  <p className="text-sm text-gray-500">Latest registrations</p>
                </div>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {dashboardData.recentUsers.length > 0 ? (
                  dashboardData.recentUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUsers className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            user.accountStatus === "Approved"
                              ? "bg-green-100 text-green-700"
                              : user.accountStatus === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.accountStatus}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-4">No recent users</p>
                )}
              </div>
            </div>

            {/* Top Sellers - Data from API */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Top Sellers
                  </h2>
                  <p className="text-sm text-gray-500">
                    Best performing stores
                  </p>
                </div>
                <button
                  onClick={() => navigate("/admin/sellers")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {statsData.topSellers.length > 0 ? (
                  statsData.topSellers.map((seller) => (
                    <div
                      key={seller._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <FaStore className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {seller.storeName}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{seller.totalProducts || 0} products</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <FaStar className="text-amber-400 mr-1" size={10} />
                              {seller.rating || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          {formatCurrency(seller.totalEarnings || 0)}
                        </p>
                        <p className="text-xs text-gray-500">Total earnings</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-4">No sellers available</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/admin/users?status=pending")}
              className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-colors text-left group"
            >
              <FaUserClock className="text-yellow-600 text-2xl mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-800">Pending Approvals</p>
              <p className="text-sm text-yellow-600">
                {dashboardData.pending.total} users waiting
              </p>
            </button>

            <button
              onClick={() => navigate("/admin/products/add")}
              className="p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors text-left group"
            >
              <FaBox className="text-green-600 text-2xl mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-800">Add Product</p>
              <p className="text-sm text-green-600">Create new product</p>
            </button>

            <button
              onClick={() => navigate("/admin/coupons/create")}
              className="p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors text-left group"
            >
              <FaGift className="text-purple-600 text-2xl mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-800">Create Coupon</p>
              <p className="text-sm text-purple-600">New offer or discount</p>
            </button>

            <button
              onClick={() => navigate("/admin/reports/generate")}
              className="p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors text-left group"
            >
              <FaChartLine className="text-blue-600 text-2xl mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-800">Generate Report</p>
              <p className="text-sm text-blue-600">Export analytics</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;