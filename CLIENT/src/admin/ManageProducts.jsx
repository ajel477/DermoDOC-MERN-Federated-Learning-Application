// pages/admin/ManageProducts.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaDownload,
  FaHeart,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaImage,
  FaStore,
  FaChevronLeft,
  FaChevronRight,
  FaEyeSlash,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaSave,
  FaCloudUploadAlt,
  FaTag,
  FaList,
  FaFacebook ,
  FaTwitter,
  FaSort ,
  FaStar,
  FaSpinner,
  FaCopy,
  FaShare,
  FaQrcode,
  FaWhatsapp ,
  FaHistory,
  FaChartLine,
  FaComments,
  FaReply,
  FaThumbsUp,
  FaThumbsDown,
  FaFlag,
  FaBan,
  FaCheck,
  FaUndo,
  FaRedo,
  FaPlusCircle,
  FaMinusCircle,
  FaInfoCircle,
  FaQuestionCircle,
  FaExclamationCircle,
  FaBell,
  FaEnvelope,
  FaPhone,
  FaMobile,
  FaTablet,
  FaLaptop,
  FaDesktop,
  FaServer,
  FaDatabase,
  FaCloud,
  FaGlobe,
  FaMapMarker,
  FaCalendar,
  FaClock,
  FaHourglass,
  FaHourglassHalf,
  FaHourglassEnd,
} from "react-icons/fa";
import { FcRefresh } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import axiosInstance from "../AuthenticationPages/axiosConfig";
import Sidebar from "../Sidebar";

const ManageProducts = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State for products data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    seller: "",
    status: "",
    minPrice: "",
    maxPrice: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showReviewsDialog, setShowReviewsDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showColumnDialog, setShowColumnDialog] = useState(false);

  // Current product for dialogs
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productHistory, setProductHistory] = useState([]);
  const [productReviews, setProductReviews] = useState([]);
  const [productAnalytics, setProductAnalytics] = useState({});

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    subCategory: "",
    brand: "",
    stock: "",
    images: [],
    specifications: {},
    tags: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [tagInput, setTagInput] = useState("");

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSellers();
  }, [pagination.page, sortConfig]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort:
          sortConfig.direction === "desc"
            ? `-${sortConfig.key}`
            : sortConfig.key,
      };

      // Add filters to params
      if (filters.category) params.category = filters.category;
      if (filters.seller) params.seller = filters.seller;
      if (filters.status === "active") params.isActive = true;
      if (filters.status === "inactive") params.isActive = false;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (searchQuery) params.search = searchQuery;

      const response = await axiosInstance.get("/admin/products", { params });

      if (response.data.success) {
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/admin/products?limit=100");
      if (response.data.success) {
        const uniqueCategories = [
          ...new Set(response.data.products.map((p) => p.category)),
        ];
        setCategories(uniqueCategories.filter(Boolean));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await axiosInstance.get(
        "/admin/users?role=SELLER&limit=100",
      );
      if (response.data.success) {
        setSellers(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  const fetchProductHistory = async (productId) => {
    try {
      const response = await axiosInstance.get(`/admin/products/${productId}/history`);
      setProductHistory(response.data.history || []);
    } catch (error) {
      console.error("Error fetching product history:", error);
    }
  };

  const fetchProductReviews = async (productId) => {
    try {
      const response = await axiosInstance.get(`/admin/products/${productId}/reviews`);
      setProductReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Error fetching product reviews:", error);
    }
  };

  const fetchProductAnalytics = async (productId) => {
    try {
      const response = await axiosInstance.get(`/admin/products/${productId}/analytics`);
      setProductAnalytics(response.data.analytics || {});
    } catch (error) {
      console.error("Error fetching product analytics:", error);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchProducts();
  };

  // Handle filter apply
  const applyFilters = () => {
    setPagination({ ...pagination, page: 1 });
    setShowFilters(false);
    fetchProducts();
    toast.success("Filters applied");
  };

  // Handle filter reset
  const resetFilters = () => {
    setFilters({
      category: "",
      seller: "",
      status: "",
      minPrice: "",
      maxPrice: "",
    });
    setSearchQuery("");
    setPagination({ ...pagination, page: 1 });
    setTimeout(() => fetchProducts(), 100);
    toast.success("Filters reset");
  };

  // Handle sort
  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "desc"
        ? "asc"
        : "desc";
    setSortConfig({ key, direction });
  };

  // Handle product toggle status
  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const response = await axiosInstance.patch(
        `/admin/products/${productId}/toggle`,
      );

      if (response.data.success) {
        setProducts(
          products.map((p) =>
            p._id === productId ? { ...p, isActive: !currentStatus } : p,
          ),
        );
        toast.success(
          `Product ${!currentStatus ? "activated" : "deactivated"}`,
        );
      }
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast.error("Failed to update product status");
    }
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const response = await axiosInstance.delete(
        `/admin/products/${productToDelete}`,
      );

      if (response.data.success) {
        setProducts(products.filter((p) => p._id !== productToDelete));
        toast.success("Product deleted successfully");
        setShowDeleteDialog(false);
        setProductToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error("No products selected");
      return;
    }

    try {
      for (const id of selectedProducts) {
        await axiosInstance.delete(`/admin/products/${id}`);
      }

      setProducts(products.filter((p) => !selectedProducts.includes(p._id)));
      setSelectedProducts([]);
      setShowBulkDeleteDialog(false);
      toast.success(`${selectedProducts.length} products deleted`);
    } catch (error) {
      console.error("Error bulk deleting:", error);
      toast.error("Failed to delete some products");
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p._id));
    }
  };

  // Handle select product
  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (product) => {
    if (!product.isActive) {
      return {
        label: "Inactive",
        color: "bg-gray-100 text-gray-700",
        icon: <FaEyeSlash className="mr-1" size={12} />,
      };
    }
    if (product.stock === 0) {
      return {
        label: "Out of Stock",
        color: "bg-red-100 text-red-700",
        icon: <FaTimesCircle className="mr-1" size={12} />,
      };
    }
    if (product.stock < 10) {
      return {
        label: "Low Stock",
        color: "bg-yellow-100 text-yellow-700",
        icon: <FaExclamationTriangle className="mr-1" size={12} />,
      };
    }
    return {
      label: "Active",
      color: "bg-green-100 text-green-700",
      icon: <FaCheckCircle className="mr-1" size={12} />,
    };
  };

  // ========== DIALOG FUNCTIONS ==========

  // Open add dialog
  const openAddDialog = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      discountPrice: "",
      category: "",
      subCategory: "",
      brand: "",
      stock: "",
      images: [],
      specifications: {},
      tags: [],
    });
    setImageFiles([]);
    setImagePreviews([]);
    setFormErrors({});
    setSpecKey("");
    setSpecValue("");
    setTagInput("");
    setShowAddDialog(true);
  };

  // Open edit dialog
  const openEditDialog = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      discountPrice: product.discountPrice || "",
      category: product.category || "",
      subCategory: product.subCategory || "",
      brand: product.brand || "",
      stock: product.stock || "",
      images: product.images || [],
      specifications: product.specifications || {},
      tags: product.tags || [],
    });
    
    const previews = product.images?.map(img => img.url) || [];
    setImagePreviews(previews);
    setImageFiles([]);
    setFormErrors({});
    setSpecKey("");
    setSpecValue("");
    setTagInput("");
    setShowEditDialog(true);
  };

  // Open view dialog
  const openViewDialog = (product) => {
    setCurrentProduct(product);
    setShowViewDialog(true);
  };

  // Open delete dialog
  const openDeleteDialog = (productId) => {
    setProductToDelete(productId);
    setShowDeleteDialog(true);
  };

  // Open bulk delete dialog
  const openBulkDeleteDialog = () => {
    if (selectedProducts.length === 0) {
      toast.error("No products selected");
      return;
    }
    setShowBulkDeleteDialog(true);
  };

  // Open status dialog
  const openStatusDialog = (product) => {
    setCurrentProduct(product);
    setShowStatusDialog(true);
  };

  // Open share dialog
  const openShareDialog = (product) => {
    setCurrentProduct(product);
    setShowShareDialog(true);
  };

  // Open history dialog
  const openHistoryDialog = (product) => {
    setCurrentProduct(product);
    fetchProductHistory(product._id);
    setShowHistoryDialog(true);
  };

  // Open reviews dialog
  const openReviewsDialog = (product) => {
    setCurrentProduct(product);
    fetchProductReviews(product._id);
    setShowReviewsDialog(true);
  };

  // Open analytics dialog
  const openAnalyticsDialog = (product) => {
    setCurrentProduct(product);
    fetchProductAnalytics(product._id);
    setShowAnalyticsDialog(true);
  };

  // Open QR dialog
  const openQrDialog = (product) => {
    setCurrentProduct(product);
    setShowQrDialog(true);
  };

  // Open copy dialog
  const openCopyDialog = (product) => {
    setCurrentProduct(product);
    setShowCopyDialog(true);
  };

  // Open export dialog
  const openExportDialog = () => {
    setShowExportDialog(true);
  };

  // Open import dialog
  const openImportDialog = () => {
    setShowImportDialog(true);
  };

  // Open filter dialog
  const openFilterDialog = () => {
    setShowFilterDialog(true);
  };

  // Open sort dialog
  const openSortDialog = () => {
    setShowSortDialog(true);
  };

  // Open column dialog
  const openColumnDialog = () => {
    setShowColumnDialog(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setImageFiles([...imageFiles, ...files]);
  };

  // Remove image
  const removeImage = (index) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    if (imageFiles.length > 0) {
      const newFiles = [...imageFiles];
      newFiles.splice(index, 1);
      setImageFiles(newFiles);
    }
  };

  // Set primary image
  const setPrimaryImage = (index) => {
    if (showEditDialog && imageFiles.length === 0) {
      const updatedImages = formData.images.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }));
      setFormData({ ...formData, images: updatedImages });
    }
    toast.success(`Image ${index + 1} set as primary`);
  };

  // Add specification
  const addSpecification = () => {
    if (!specKey.trim() || !specValue.trim()) {
      toast.error("Both key and value are required");
      return;
    }

    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [specKey]: specValue
      }
    });
    setSpecKey("");
    setSpecValue("");
  };

  // Remove specification
  const removeSpecification = (key) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData({ ...formData, specifications: newSpecs });
  };

  // Add tag
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    if (!formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
    }
    setTagInput("");
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.price) errors.price = "Price is required";
    if (formData.price && isNaN(formData.price)) errors.price = "Price must be a number";
    if (!formData.category) errors.category = "Category is required";
    if (!formData.stock) errors.stock = "Stock is required";
    if (formData.stock && isNaN(formData.stock)) errors.stock = "Stock must be a number";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setUploading(true);

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      if (formData.discountPrice) formDataToSend.append("discountPrice", formData.discountPrice);
      formDataToSend.append("category", formData.category);
      if (formData.subCategory) formDataToSend.append("subCategory", formData.subCategory);
      if (formData.brand) formDataToSend.append("brand", formData.brand);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("specifications", JSON.stringify(formData.specifications));
      formDataToSend.append("tags", formData.tags.join(","));

      imageFiles.forEach(file => {
        formDataToSend.append("images", file);
      });

      let response;
      if (showAddDialog) {
        response = await axiosInstance.post("/admin/products", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else if (showEditDialog) {
        response = await axiosInstance.put(`/admin/products/${currentProduct._id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      if (response.data.success) {
        toast.success(response.data.message);
        setShowAddDialog(false);
        setShowEditDialog(false);
        fetchProducts();
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setUploading(false);
    }
  };

  // Handle export
  const handleExport = (format) => {
    setShowExportDialog(false);
    toast.success(`Exporting as ${format.toUpperCase()}...`);
  };

  // Handle import
  const handleImport = (file) => {
    setShowImportDialog(false);
    toast.success("Import started...");
  };

  // Handle copy
  const handleCopy = (type) => {
    setShowCopyDialog(false);
    toast.success(`Copied to clipboard`);
  };

  // Handle share
  const handleShare = (platform) => {
    setShowShareDialog(false);
    toast.success(`Shared on ${platform}`);
  };

  // Handle filter preset
  const handleFilterPreset = (preset) => {
    setShowFilterDialog(false);
    toast.success(`Filter applied: ${preset}`);
  };

  // Handle sort preset
  const handleSortPreset = (preset) => {
    setShowSortDialog(false);
    toast.success(`Sort applied: ${preset}`);
  };

  // Handle column preset
  const handleColumnPreset = (preset) => {
    setShowColumnDialog(false);
    toast.success(`Columns updated`);
  };

  if (loading && products.length === 0) {
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
            <p className="text-gray-600">Loading products...</p>
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
                  Manage Products
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Total {pagination.total} products • Page {pagination.page} of{" "}
                  {pagination.pages}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {/* Quick Action Buttons */}

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                <button
                  onClick={fetchProducts}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <FcRefresh className="text-lg" />
                </button>

               

                {/* Bulk Delete Button */}
                {selectedProducts.length > 0 && (
                  <button
                    onClick={openBulkDeleteDialog}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <FaTrash />
                    <span>Delete ({selectedProducts.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 min-w-[300px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products by name, category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </form>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <FaFilter />
                <span>Filters</span>
                {(filters.category ||
                  filters.seller ||
                  filters.status ||
                  filters.minPrice ||
                  filters.maxPrice) && (
                  <span className="ml-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>

              {/* Reset Filters */}
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>

              {/* Sort Dropdown */}
              <select
                onChange={(e) => handleSort(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Newest First</option>
                <option value="-createdAt">Oldest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="-name">Name: Z to A</option>
                <option value="totalLikes">Most Liked</option>
              </select>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        setFilters({ ...filters, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Seller
                    </label>
                    <select
                      value={filters.seller}
                      onChange={(e) =>
                        setFilters({ ...filters, seller: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Sellers</option>
                      {sellers.map((seller) => (
                        <option key={seller._id} value={seller._id}>
                          {seller.storeName || seller.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Min Price (₹)
                    </label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, minPrice: e.target.value })
                      }
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Max Price (₹)
                    </label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, maxPrice: e.target.value })
                      }
                      placeholder="100000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4 space-x-3">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedProducts.length === products.length &&
                          products.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Likes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.length > 0 ? (
                    products.map((product) => {
                      const status = getStatusBadge(product);
                      return (
                        <tr
                          key={product._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product._id)}
                              onChange={() => handleSelectProduct(product._id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                {product.images && product.images[0] ? (
                                  <img
                                    src={product.images[0].url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src =
                                        "https://via.placeholder.com/48x48?text=No+Image";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FaImage className="text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID: {product._id.slice(-8)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                              {product.category || "Uncategorized"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <FaStore className="text-gray-400" size={12} />
                              <span className="text-sm text-gray-600">
                                {product.seller?.storeName ||
                                  product.seller?.name ||
                                  "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {formatCurrency(
                                  product.discountPrice || product.price,
                                )}
                              </p>
                              {product.discountPrice && (
                                <p className="text-xs text-gray-400 line-through">
                                  {formatCurrency(product.price)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-sm ${
                                product.stock === 0
                                  ? "text-red-600"
                                  : product.stock < 10
                                    ? "text-yellow-600"
                                    : "text-green-600"
                              }`}
                            >
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1">
                              <FaHeart className="text-rose-400" size={12} />
                              <span className="text-sm text-gray-600">
                                {product.totalLikes || 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${status.color}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(product.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => openViewDialog(product)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => openEditDialog(product)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => openCopyDialog(product)}
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Copy"
                              >
                                <FaCopy />
                              </button>
                              <button
                                onClick={() => openShareDialog(product)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Share"
                              >
                                <FaShare />
                              </button>
                              <button
                                onClick={() => openHistoryDialog(product)}
                                className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="History"
                              >
                                <FaHistory />
                              </button>
                              <button
                                onClick={() => openStatusDialog(product)}
                                className={`p-2 rounded-lg transition-colors ${
                                  product.isActive
                                    ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                                    : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                                }`}
                                title={
                                  product.isActive ? "Deactivate" : "Activate"
                                }
                              >
                                {product.isActive ? (
                                  <FaToggleOn size={18} />
                                ) : (
                                  <FaToggleOff size={18} />
                                )}
                              </button>
                              <button
                                onClick={() => openDeleteDialog(product._id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FaBox className="text-5xl text-gray-300 mb-4" />
                          <p className="text-gray-500 mb-2">
                            No products found
                          </p>
                          <button
                            onClick={openAddDialog}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Add your first product
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total,
                    )}{" "}
                    of {pagination.total} products
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          page: pagination.page - 1,
                        })
                      }
                      disabled={pagination.page === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft size={14} />
                    </button>
                    {[...Array(Math.min(5, pagination.pages))].map((_, idx) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = idx + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = idx + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + idx;
                      } else {
                        pageNum = pagination.page - 2 + idx;
                      }
                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            setPagination({ ...pagination, page: pageNum })
                          }
                          className={`w-8 h-8 rounded-lg transition-colors ${
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
                        setPagination({
                          ...pagination,
                          page: pagination.page + 1,
                        })
                      }
                      disabled={pagination.page === pagination.pages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== ALL DIALOGS ========== */}

      {/* Add Product Dialog */}
      <AnimatePresence>
        {showAddDialog && (
          <ProductFormDialog
            mode="add"
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
            categories={categories}
            imagePreviews={imagePreviews}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
            setPrimaryImage={setPrimaryImage}
            specifications={formData.specifications}
            specKey={specKey}
            setSpecKey={setSpecKey}
            specValue={specValue}
            setSpecValue={setSpecValue}
            addSpecification={addSpecification}
            removeSpecification={removeSpecification}
            tags={formData.tags}
            tagInput={tagInput}
            setTagInput={setTagInput}
            addTag={addTag}
            removeTag={removeTag}
            uploading={uploading}
            handleSubmit={handleSubmit}
            onClose={() => setShowAddDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Edit Product Dialog */}
      <AnimatePresence>
        {showEditDialog && currentProduct && (
          <ProductFormDialog
            mode="edit"
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
            categories={categories}
            imagePreviews={imagePreviews}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
            setPrimaryImage={setPrimaryImage}
            specifications={formData.specifications}
            specKey={specKey}
            setSpecKey={setSpecKey}
            specValue={specValue}
            setSpecValue={setSpecValue}
            addSpecification={addSpecification}
            removeSpecification={removeSpecification}
            tags={formData.tags}
            tagInput={tagInput}
            setTagInput={setTagInput}
            addTag={addTag}
            removeTag={removeTag}
            uploading={uploading}
            handleSubmit={handleSubmit}
            onClose={() => setShowEditDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* View Product Dialog */}
      <AnimatePresence>
        {showViewDialog && currentProduct && (
          <ViewProductDialog
            product={currentProduct}
            onClose={() => setShowViewDialog(false)}
            onEdit={() => {
              setShowViewDialog(false);
              openEditDialog(currentProduct);
            }}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
        )}
      </AnimatePresence>

      {/* Delete Product Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <DeleteDialog
            title="Delete Product"
            message="Are you sure you want to delete this product? This action cannot be undone."
            onConfirm={handleDeleteProduct}
            onCancel={() => {
              setShowDeleteDialog(false);
              setProductToDelete(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Bulk Delete Dialog */}
      <AnimatePresence>
        {showBulkDeleteDialog && (
          <DeleteDialog
            title="Delete Multiple Products"
            message={`Are you sure you want to delete ${selectedProducts.length} selected products? This action cannot be undone.`}
            onConfirm={handleBulkDelete}
            onCancel={() => setShowBulkDeleteDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Status Change Dialog */}
      <AnimatePresence>
        {showStatusDialog && currentProduct && (
          <StatusDialog
            product={currentProduct}
            onConfirm={() => {
              toggleProductStatus(currentProduct._id, currentProduct.isActive);
              setShowStatusDialog(false);
            }}
            onCancel={() => setShowStatusDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Share Product Dialog */}
      <AnimatePresence>
        {showShareDialog && currentProduct && (
          <ShareDialog
            product={currentProduct}
            onShare={handleShare}
            onClose={() => setShowShareDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Copy Product Dialog */}
      <AnimatePresence>
        {showCopyDialog && currentProduct && (
          <CopyDialog
            product={currentProduct}
            onCopy={handleCopy}
            onClose={() => setShowCopyDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* QR Code Dialog */}
      <AnimatePresence>
        {showQrDialog && currentProduct && (
          <QrDialog
            product={currentProduct}
            onClose={() => setShowQrDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Product History Dialog */}
      <AnimatePresence>
        {showHistoryDialog && currentProduct && (
          <HistoryDialog
            product={currentProduct}
            history={productHistory}
            formatDate={formatDate}
            onClose={() => setShowHistoryDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Product Reviews Dialog */}
      <AnimatePresence>
        {showReviewsDialog && currentProduct && (
          <ReviewsDialog
            product={currentProduct}
            reviews={productReviews}
            formatDate={formatDate}
            onClose={() => setShowReviewsDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Product Analytics Dialog */}
      <AnimatePresence>
        {showAnalyticsDialog && currentProduct && (
          <AnalyticsDialog
            product={currentProduct}
            analytics={productAnalytics}
            formatCurrency={formatCurrency}
            onClose={() => setShowAnalyticsDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Export Dialog */}
      <AnimatePresence>
        {showExportDialog && (
          <ExportDialog
            onExport={handleExport}
            onClose={() => setShowExportDialog(false)}
          />
        )}
      </AnimatePresence>


      {/* Filter Preset Dialog */}
      <AnimatePresence>
        {showFilterDialog && (
          <FilterDialog
            onApply={handleFilterPreset}
            onClose={() => setShowFilterDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Sort Preset Dialog */}
      <AnimatePresence>
        {showSortDialog && (
          <SortDialog
            onApply={handleSortPreset}
            onClose={() => setShowSortDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Column Customization Dialog */}
      <AnimatePresence>
        {showColumnDialog && (
          <ColumnDialog
            onApply={handleColumnPreset}
            onClose={() => setShowColumnDialog(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ========== DIALOG COMPONENTS ==========

// Product Form Dialog Component
const ProductFormDialog = ({
  mode,
  formData,
  formErrors,
  handleInputChange,
  categories,
  imagePreviews,
  handleImageUpload,
  removeImage,
  setPrimaryImage,
  specifications,
  specKey,
  setSpecKey,
  specValue,
  setSpecValue,
  addSpecification,
  removeSpecification,
  tags,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
  uploading,
  handleSubmit,
  onClose,
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
    >
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          {mode === "add" ? "Add New Product" : "Edit Product"}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaTimes />
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter product name"
              />
              {formErrors.name && (
                <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter product description"
              />
              {formErrors.description && (
                <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {formErrors.category && (
                <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub Category
                </label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Smartphones"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Apple"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
                {formErrors.price && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.stock ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0"
                />
                {formErrors.stock && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.stock}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price (₹)
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Images */}
            <div>
              <h3 className="font-semibold text-gray-700 border-b pb-2 mb-3">
                Product Images
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setPrimaryImage(index)}
                        className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        title="Set as primary"
                      >
                        <FaStar size={12} />
                      </button>
                      <button
                        onClick={() => removeImage(index)}
                        className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                        title="Remove"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                    {index === 0 && (
                      <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
                <label className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <FaCloudUploadAlt className="text-gray-400 text-2xl mb-1" />
                  <span className="text-xs text-gray-500">Upload</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Upload up to 5 images. First image will be primary.
              </p>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="font-semibold text-gray-700 border-b pb-2 mb-3">
                Specifications
              </h3>
              <div className="space-y-2 mb-3">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div>
                      <span className="text-xs font-medium text-gray-600">{key}:</span>
                      <span className="text-xs text-gray-800 ml-2">{value}</span>
                    </div>
                    <button
                      onClick={() => removeSpecification(key)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  placeholder="Key (e.g. Color)"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                  placeholder="Value (e.g. Black)"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addSpecification}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-semibold text-gray-700 border-b pb-2 mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-700 hover:text-blue-900"
                    >
                      <FaTimes size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FaSave />
              <span>{mode === "add" ? "Add Product" : "Save Changes"}</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  </div>
);

// View Product Dialog Component
const ViewProductDialog = ({ product, onClose, onEdit, formatCurrency, formatDate, getStatusBadge }) => {
  const status = getStatusBadge(product);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Images */}
            <div>
              <div className="mb-4">
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaImage className="text-5xl text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                    >
                      <img
                        src={img.url}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-gray-800">{product.name}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500">ID: {product._id}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-2">
                  <p className="text-3xl font-bold text-gray-800">
                    {formatCurrency(product.discountPrice || product.price)}
                  </p>
                  {product.discountPrice && (
                    <p className="text-lg text-gray-400 line-through">
                      {formatCurrency(product.price)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="font-medium text-gray-800">{product.category}</p>
                  {product.subCategory && (
                    <p className="text-xs text-gray-400">{product.subCategory}</p>
                  )}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Brand</p>
                  <p className="font-medium text-gray-800">{product.brand || "N/A"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Stock</p>
                  <p className="font-medium text-gray-800">{product.stock} units</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Total Likes</p>
                  <div className="flex items-center">
                    <FaHeart className="text-rose-500 mr-1" />
                    <p className="font-medium text-gray-800">{product.totalLikes || 0}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Specifications</h4>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-lg">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-xs text-gray-500">{key}:</span>
                        <span className="text-xs font-medium text-gray-800 ml-1">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Seller Information</h4>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FaStore className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {product.seller?.storeName || product.seller?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.seller?.email || "No email"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <FaCalendar className="text-gray-400 mr-2" size={14} />
                    <span className="text-gray-600">Created: {formatDate(product.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaClock className="text-gray-400 mr-2" size={14} />
                    <span className="text-gray-600">Last Updated: {formatDate(product.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={onEdit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Delete Dialog Component
const DeleteDialog = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
    >
      <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
        <FaExclamationTriangle className="text-red-600 text-xl" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
        {title}
      </h3>
      <p className="text-gray-500 text-center mb-6">
        {message}
      </p>
      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </motion.div>
  </div>
);

// Status Dialog Component
const StatusDialog = ({ product, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
    >
      <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mx-auto mb-4">
        {product.isActive ? (
          <FaEyeSlash className="text-amber-600 text-xl" />
        ) : (
          <FaEye className="text-amber-600 text-xl" />
        )}
      </div>
      <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
        {product.isActive ? "Deactivate Product" : "Activate Product"}
      </h3>
      <p className="text-gray-500 text-center mb-6">
        Are you sure you want to {product.isActive ? "deactivate" : "activate"} "{product.name}"?
      </p>
      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 px-4 py-2 ${
            product.isActive
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-green-600 hover:bg-green-700"
          } text-white rounded-lg transition-colors`}
        >
          {product.isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </motion.div>
  </div>
);

// Share Dialog Component
const ShareDialog = ({ product, onShare, onClose }) => {
  const shareUrl = `${window.location.origin}/products/${product._id}`;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Share Product</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <FaTimes />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Share "{product.name}"</p>
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 text-sm bg-transparent border-none focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast.success("Link copied!");
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <FaCopy />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => onShare("Facebook")}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex flex-col items-center"
            >
              <FaFacebook />
              <span className="text-xs mt-1">Facebook</span>
            </button>
            <button
              onClick={() => onShare("Twitter")}
              className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex flex-col items-center"
            >
              <FaTwitter />
              <span className="text-xs mt-1">Twitter</span>
            </button>
            <button
              onClick={() => onShare("WhatsApp")}
              className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex flex-col items-center"
            >
              <FaWhatsapp />
              <span className="text-xs mt-1">WhatsApp</span>
            </button>
            <button
              onClick={() => onShare("Email")}
              className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex flex-col items-center"
            >
              <FaEnvelope />
              <span className="text-xs mt-1">Email</span>
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Copy Dialog Component
const CopyDialog = ({ product, onCopy, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-xl shadow-xl max-w-md w-full"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Copy Product</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <FaTimes />
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Create a copy of "{product.name}" with the following options:
        </p>

        <div className="space-y-3 mb-6">
          <label className="flex items-center space-x-2">
            <input type="checkbox" defaultChecked className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">Copy images</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" defaultChecked className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">Copy specifications</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" defaultChecked className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">Copy tags</span>
          </label>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onCopy("all")}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Copy Product
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

// History Dialog Component
const HistoryDialog = ({ product, history, formatDate, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
    >
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Product History</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <FaTimes />
        </button>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <p className="font-medium text-gray-800">{product.name}</p>
          <p className="text-sm text-gray-500">ID: {product._id}</p>
        </div>

        <div className="space-y-4">
          {history.length > 0 ? (
            history.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {item.action === "created" && <FaPlus className="text-blue-600" />}
                  {item.action === "updated" && <FaEdit className="text-green-600" />}
                  {item.action === "status_changed" && <FaToggleOn className="text-amber-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{item.description}</p>
                  <p className="text-xs text-gray-500">{formatDate(item.timestamp)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No history available</p>
          )}
        </div>
      </div>
    </motion.div>
  </div>
);

// Reviews Dialog Component
const ReviewsDialog = ({ product, reviews, formatDate, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
    >
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Product Reviews</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <FaTimes />
        </button>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <p className="font-medium text-gray-800">{product.name}</p>
          <div className="flex items-center mt-1">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar key={star} />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">4.5 (24 reviews)</span>
          </div>
        </div>

        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <FaUser className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{review.userName}</p>
                      <div className="flex text-yellow-400 text-xs">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar key={star} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No reviews yet</p>
          )}
        </div>
      </div>
    </motion.div>
  </div>
);

// Analytics Dialog Component
const AnalyticsDialog = ({ product, analytics, formatCurrency, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
    >
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Product Analytics</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <FaTimes />
        </button>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <p className="font-medium text-gray-800">{product.name}</p>
          <p className="text-sm text-gray-500">ID: {product._id}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 mb-1">Total Views</p>
            <p className="text-2xl font-bold text-blue-800">{analytics.views || 0}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 mb-1">Total Sales</p>
            <p className="text-2xl font-bold text-green-800">{analytics.sales || 0}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-600 mb-1">Revenue</p>
            <p className="text-2xl font-bold text-amber-800">
              {formatCurrency(analytics.revenue || 0)}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-600 mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold text-purple-800">{analytics.conversionRate || "0%"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Performance Metrics</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Add to Cart Rate</span>
                <span className="font-medium text-gray-800">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Purchase Rate</span>
                <span className="font-medium text-gray-800">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "45%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Return Rate</span>
                <span className="font-medium text-gray-800">5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: "5%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

// Export Dialog Component
const ExportDialog = ({ onExport, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-xl shadow-xl max-w-md w-full"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Export Products</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <FaTimes />
          </button>
        </div>

        <p className="text-gray-600 mb-4">Choose export format:</p>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => onExport("csv")}
            className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center space-x-3"
          >
            <FaFileExcel className="text-green-600 text-xl" />
            <div>
              <p className="font-medium text-gray-800">CSV Format</p>
              <p className="text-xs text-gray-500">Comma separated values</p>
            </div>
          </button>
          <button
            onClick={() => onExport("excel")}
            className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center space-x-3"
          >
            <FaFileExcel className="text-green-600 text-xl" />
            <div>
              <p className="font-medium text-gray-800">Excel Format</p>
              <p className="text-xs text-gray-500">Microsoft Excel (.xlsx)</p>
            </div>
          </button>
          <button
            onClick={() => onExport("pdf")}
            className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center space-x-3"
          >
            <FaFilePdf className="text-red-600 text-xl" />
            <div>
              <p className="font-medium text-gray-800">PDF Format</p>
              <p className="text-xs text-gray-500">Portable Document Format</p>
            </div>
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

// Import Dialog Component
const ImportDialog = ({ onImport, onClose }) => {
  const [file, setFile] = useState(null);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Import Products</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <FaTimes />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FaUpload className="text-3xl text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                {file ? file.name : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-gray-400">
                Supported formats: CSV, Excel
              </p>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Browse Files
              </label>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onImport(file)}
              disabled={!file}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Import
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Filter Dialog Component
const FilterDialog = ({ onApply, onClose }) => {
  const [presetName, setPresetName] = useState("");
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Save Filter Preset</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <FaTimes />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preset Name
            </label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="e.g. Active Products"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onApply(presetName)}
              disabled={!presetName}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Save Preset
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Sort Dialog Component
const SortDialog = ({ onApply, onClose }) => {
  const [presetName, setPresetName] = useState("");
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Save Sort Preset</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <FaTimes />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preset Name
            </label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="e.g. Price Low to High"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onApply(presetName)}
              disabled={!presetName}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Save Preset
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Column Dialog Component
const ColumnDialog = ({ onApply, onClose }) => {
  const [presetName, setPresetName] = useState("");
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Customize Columns</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <FaTimes />
            </button>
          </div>

          <div className="space-y-3 mb-6">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span className="text-sm text-gray-700">Product</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span className="text-sm text-gray-700">Category</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span className="text-sm text-gray-700">Seller</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span className="text-sm text-gray-700">Price</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span className="text-sm text-gray-700">Stock</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span className="text-sm text-gray-700">Likes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span className="text-sm text-gray-700">Status</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span className="text-sm text-gray-700">Created</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span className="text-sm text-gray-700">Actions</span>
            </label>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preset Name (Optional)
            </label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="e.g. Default View"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onApply(presetName)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageProducts;