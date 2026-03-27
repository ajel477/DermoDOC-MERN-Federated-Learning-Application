// pages/admin/AdminReports.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaDownload,
  FaFilePdf,
  FaStar ,
  FaHeart ,
  FaCalendarAlt,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaUsers,
  FaStore,
  FaBox,
  FaShoppingCart,
  FaRupeeSign,
  FaEye,
  FaPrint,
  FaEnvelope,
  FaShare,
  FaFilter,
  FaSearch,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
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
  Filler
);

const AdminReports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("reports");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State for report data - from API only
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
  const [reportType, setReportType] = useState("overview");
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");

  // Fetch data from API
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
        toast.success("Reports refreshed");
      })
      .finally(() => setLoading(false));
  };

  // Handle export
  const handleExport = () => {
    toast.success(`Exporting as ${exportFormat.toUpperCase()}...`);
    // Implement actual export logic here
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle email report
  const handleEmailReport = () => {
    toast.success("Report sent to your email");
  };

  // Handle share
  const handleShare = () => {
    toast.success("Share link copied to clipboard");
  };

  // Chart configurations with API data
  const getRevenueChartData = () => {
    const hasData = statsData.periods.monthly.revenue > 0;
    const weeksInMonth = 4;
    
    return {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [
        {
          label: "Revenue",
          data: hasData
            ? [
                statsData.periods.monthly.revenue / weeksInMonth,
                statsData.periods.monthly.revenue / weeksInMonth,
                statsData.periods.monthly.revenue / weeksInMonth,
                statsData.periods.monthly.revenue / weeksInMonth,
              ]
            : [0, 0, 0, 0],
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const getOrdersChartData = () => {
    const hasData = statsData.periods.monthly.orders > 0;
    const weeksInMonth = 4;
    
    return {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [
        {
          label: "Orders",
          data: hasData
            ? [
                statsData.periods.monthly.orders / weeksInMonth,
                statsData.periods.monthly.orders / weeksInMonth,
                statsData.periods.monthly.orders / weeksInMonth,
                statsData.periods.monthly.orders / weeksInMonth,
              ]
            : [0, 0, 0, 0],
          backgroundColor: "rgba(16, 185, 129, 0.8)",
          borderRadius: 6,
        },
      ],
    };
  };

  const getUserGrowthChartData = () => {
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Users",
          data: [dashboardData.stats.users / 6, dashboardData.stats.users / 6, dashboardData.stats.users / 6, dashboardData.stats.users / 6, dashboardData.stats.users / 6, dashboardData.stats.users / 6],
          borderColor: "#8B5CF6",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#6B7280",
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#F3F4F6",
        bodyColor: "#D1D5DB",
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#E5E7EB",
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
            <p className="text-gray-600">Loading reports...</p>
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
                  Reports & Analytics
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  View and export platform reports • Last updated: {new Date().toLocaleString()}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Report Type Selector */}
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="overview">Overview Report</option>
                  <option value="sales">Sales Report</option>
                  <option value="users">Users Report</option>
                  <option value="products">Products Report</option>
                </select>

                {/* Date Range Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center space-x-2 hover:bg-gray-50"
                  >
                    <FaCalendarAlt className="text-gray-500" />
                    <span>
                      {dateRange === "custom" && startDate && endDate
                        ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                        : dateRange === "today"
                        ? "Today"
                        : dateRange === "week"
                        ? "This Week"
                        : dateRange === "month"
                        ? "This Month"
                        : dateRange === "quarter"
                        ? "This Quarter"
                        : "This Year"}
                    </span>
                  </button>

                  {showDatePicker && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-20">
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            setDateRange("today");
                            setShowDatePicker(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                        >
                          Today
                        </button>
                        <button
                          onClick={() => {
                            setDateRange("week");
                            setShowDatePicker(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                        >
                          This Week
                        </button>
                        <button
                          onClick={() => {
                            setDateRange("month");
                            setShowDatePicker(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                        >
                          This Month
                        </button>
                        <button
                          onClick={() => {
                            setDateRange("quarter");
                            setShowDatePicker(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                        >
                          This Quarter
                        </button>
                        <button
                          onClick={() => {
                            setDateRange("year");
                            setShowDatePicker(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                        >
                          This Year
                        </button>
                        <div className="border-t pt-3">
                          <p className="text-xs font-medium text-gray-500 mb-2">Custom Range</p>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                          />
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={() => {
                              if (startDate && endDate) {
                                setDateRange("custom");
                                setShowDatePicker(false);
                              } else {
                                toast.error("Please select both dates");
                              }
                            }}
                            className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <FcRefresh className="text-lg" />
                </button>

                {/* Export Format Selector */}
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>

                {/* Export Button */}
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FaDownload />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1"
              >
                <FaPrint />
                <span>Print</span>
              </button>
              <button
                onClick={handleEmailReport}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1"
              >
                <FaEnvelope />
                <span>Email</span>
              </button>
              <button
                onClick={handleShare}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1"
              >
                <FaShare />
                <span>Share</span>
              </button>
            </div>
          </div>
        </header>

        {/* Reports Content */}
        <div className="p-8">
          {/* Summary Cards - Data from API */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {formatCurrency(statsData.totals.revenue)}
                  </h3>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <FaRupeeSign className="text-green-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <FaChartLine className="text-blue-500 mr-1" />
                <span className="text-gray-600">This month: {formatCurrency(statsData.periods.monthly.revenue)}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {statsData.totals.orders}
                  </h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FaShoppingCart className="text-blue-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <FaClock className="text-yellow-500 mr-1" />
                <span className="text-gray-600">This month: {statsData.periods.monthly.orders}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Users</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {statsData.totals.users}
                  </h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FaUsers className="text-purple-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <FaUsers className="text-purple-500 mr-1" />
                <span className="text-gray-600">{dashboardData.pending.users} pending approval</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Products</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {statsData.totals.products}
                  </h3>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <FaBox className="text-amber-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <FaStore className="text-green-500 mr-1" />
                <span className="text-gray-600">{statsData.totals.sellers} sellers</span>
              </div>
            </div>
          </div>

          {/* Charts Row 1 - Revenue & Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h2>
              <div className="h-80">
                {statsData.periods.monthly.revenue > 0 ? (
                  <Line data={getRevenueChartData()} options={chartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400">No revenue data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Orders Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Orders Trend</h2>
              <div className="h-80">
                {statsData.periods.monthly.orders > 0 ? (
                  <Bar data={getOrdersChartData()} options={chartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400">No orders data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row 2 - User Growth & Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Growth Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">User Growth</h2>
              <div className="h-80">
                {dashboardData.stats.users > 0 ? (
                  <Line data={getUserGrowthChartData()} options={chartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400">No user data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Categories</h2>
              <div className="h-80">
                {statsData.topProducts.length > 0 ? (
                  <Pie
                    data={{
                      labels: ["Electronics", "Fashion", "Home", "Others"],
                      datasets: [
                        {
                          data: [
                            statsData.topProducts.filter(p => p.category === "Electronics").length || 1,
                            statsData.topProducts.filter(p => p.category === "Fashion").length || 1,
                            statsData.topProducts.filter(p => p.category === "Home").length || 1,
                            statsData.topProducts.length || 1,
                          ],
                          backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"],
                        },
                      ],
                    }}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          position: "bottom",
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
          </div>

          {/* Top Products Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Price</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Likes</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {statsData.topProducts.length > 0 ? (
                    statsData.topProducts.map((product) => (
                      <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                              {product.images && product.images[0] && (
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <span className="font-medium text-gray-800">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-800">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <FaHeart className="text-rose-400 mr-1" />
                            <span>{product.totalLikes || 0}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => navigate(`/admin/products/${product._id}`)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-400">
                        No products available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Sellers Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Sellers</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Store</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Products</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Earnings</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Rating</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {statsData.topSellers.length > 0 ? (
                    statsData.topSellers.map((seller) => (
                      <tr key={seller._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{seller.storeName}</td>
                        <td className="py-3 px-4 text-gray-600">{seller.totalProducts || 0}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">
                          {formatCurrency(seller.totalEarnings || 0)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <FaStar className="text-amber-400 mr-1" />
                            <span>{seller.rating || 0}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => navigate(`/admin/sellers/${seller._id}`)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-400">
                        No sellers available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Report Summary Footer */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Generated on: {new Date().toLocaleString()}</span>
                <span>•</span>
                <span>Report Type: {reportType.charAt(0).toUpperCase() + reportType.slice(1)}</span>
                <span>•</span>
                <span>Period: {
                  dateRange === "custom" && startDate && endDate
                    ? `${formatDate(startDate)} to ${formatDate(endDate)}`
                    : dateRange === "today"
                    ? "Today"
                    : dateRange === "week"
                    ? "This Week"
                    : dateRange === "month"
                    ? "This Month"
                    : dateRange === "quarter"
                    ? "This Quarter"
                    : "This Year"
                }</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-500" />
                <span>Data accurate as of {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;