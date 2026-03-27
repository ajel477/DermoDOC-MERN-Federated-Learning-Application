// pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaMobile,
  FaMapMarkerAlt,
  FaStore,
  FaFileInvoice,
  FaUniversity,
  FaCreditCard,
  FaSpinner,
  FaArrowLeft,
  FaShoppingBag,
  FaCheckCircle,
  FaTimesCircle,
  FaUpload,
  FaBuilding,
  FaIdCard,
  FaRegBuilding,
} from "react-icons/fa";
import {
  MdVerified,
  MdEmail,
  MdLock,
  MdPhone,
  MdLocationOn,
} from "react-icons/md";
import axiosInstance from "./axiosConfig";

const Register = () => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    // Common fields
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
    address: "",
    role: "USER", // USER or SELLER

    // Seller specific fields
    storeName: "",
    storeDescription: "",
    gstNumber: "",
    bankAccountHolder: "",
    bankAccountNumber: "",
    bankIfscCode: "",
    bankName: "",

    // Optional
    image: null,
  });

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
    minLength: false,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const strength = {
      score: 0,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      minLength: password.length >= 8,
    };

    strength.score = Object.values(strength).filter(Boolean).length - 1; // Subtract 1 for score itself
    setPasswordStrength(strength);
  };

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          image: file,
        }));
        setImagePreview(URL.createObjectURL(file));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Check password strength
      if (name === "password") {
        checkPasswordStrength(value);
      }
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate Form
  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number must be 10 digits";
    }

    if (!formData.address) {
      newErrors.address = "Address is required";
    }

    // Seller specific validations
    if (formData.role === "SELLER") {
      if (!formData.storeName) {
        newErrors.storeName = "Store name is required";
      }
      if (!formData.gstNumber) {
        newErrors.gstNumber = "GST number is required";
      } else if (
        !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
          formData.gstNumber,
        )
      ) {
        newErrors.gstNumber = "Invalid GST format";
      }
      if (!formData.bankAccountHolder) {
        newErrors.bankAccountHolder = "Account holder name is required";
      }
      if (!formData.bankAccountNumber) {
        newErrors.bankAccountNumber = "Account number is required";
      } else if (!/^\d{9,18}$/.test(formData.bankAccountNumber)) {
        newErrors.bankAccountNumber = "Invalid account number";
      }
      if (!formData.bankIfscCode) {
        newErrors.bankIfscCode = "IFSC code is required";
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankIfscCode)) {
        newErrors.bankIfscCode = "Invalid IFSC code";
      }
      if (!formData.bankName) {
        newErrors.bankName = "Bank name is required";
      }
    }

    if (!acceptedTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append all fields to FormData
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axiosInstance.post("/auth/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success(response.data.msg || "Registration successful!");

        // Clear form
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);

      // Handle specific errors
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Next Step
  const nextStep = () => {
    if (currentStep === 1) {
      // Validate basic info
      if (
        !formData.name ||
        !formData.email ||
        !formData.password 
      ) {
        toast.error("Please fill all required fields");
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  // Previous Step
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Password strength color
  const getStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0:
        return "bg-gray-200";
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      case 5:
        return "bg-green-600";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-400 via-white-500 to-white-600 py-8 px-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Main Container */}
      <div className="relative max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center text-white hover:text-yellow-100 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back to Home
        </button>

        {/* Registration Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <FaShoppingBag className="text-3xl" />
              </div>
              <span className="text-2xl font-bold">ShopEasy</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-yellow-100">
              Join ShopEasy and start your shopping journey
            </p>
          </div>

          {/* Role Selection */}
          <div className="p-6 border-b">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  setFormData((prev) => ({ ...prev, role: "USER" }))
                }
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.role === "USER"
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-gray-200 hover:border-yellow-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-3 rounded-full ${
                      formData.role === "USER"
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    <FaUser />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800">Customer</div>
                    <div className="text-sm text-gray-500">
                      Shop and earn rewards
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() =>
                  setFormData((prev) => ({ ...prev, role: "SELLER" }))
                }
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.role === "SELLER"
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-gray-200 hover:border-yellow-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-3 rounded-full ${
                      formData.role === "SELLER"
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    <FaStore />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800">Seller</div>
                    <div className="text-sm text-gray-500">
                      Start your business
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step ? <FaCheckCircle /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        currentStep > step ? "bg-yellow-500" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="p-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Basic Information
                </h3>

                {/* Profile Image Upload */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-3xl text-gray-400" />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-yellow-600 transition-colors">
                      <FaUpload className="text-white text-sm" />
                      <input
                        type="file"
                        name="image"
                        onChange={handleChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="text-sm text-gray-500">
                    Upload profile picture (optional)
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.name
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-yellow-200 focus:border-yellow-500"
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdEmail className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-yellow-200 focus:border-yellow-500"
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdLock className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.password
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-yellow-200 focus:border-yellow-500"
                      }`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${
                              i <= passwordStrength.score
                                ? getStrengthColor()
                                : "bg-gray-200"
                            }`}
                          ></div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          {passwordStrength.minLength ? (
                            <FaCheckCircle className="text-green-500" />
                          ) : (
                            <FaTimesCircle className="text-gray-300" />
                          )}
                          <span
                            className={
                              passwordStrength.minLength
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            Min 8 characters
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {passwordStrength.hasLower ? (
                            <FaCheckCircle className="text-green-500" />
                          ) : (
                            <FaTimesCircle className="text-gray-300" />
                          )}
                          <span
                            className={
                              passwordStrength.hasLower
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            Lowercase
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {passwordStrength.hasUpper ? (
                            <FaCheckCircle className="text-green-500" />
                          ) : (
                            <FaTimesCircle className="text-gray-300" />
                          )}
                          <span
                            className={
                              passwordStrength.hasUpper
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            Uppercase
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {passwordStrength.hasNumber ? (
                            <FaCheckCircle className="text-green-500" />
                          ) : (
                            <FaTimesCircle className="text-gray-300" />
                          )}
                          <span
                            className={
                              passwordStrength.hasNumber
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            Number
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {passwordStrength.hasSpecial ? (
                            <FaCheckCircle className="text-green-500" />
                          ) : (
                            <FaTimesCircle className="text-gray-300" />
                          )}
                          <span
                            className={
                              passwordStrength.hasSpecial
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            Special character
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdLock className="text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.confirmPassword
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-yellow-200 focus:border-yellow-500"
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Contact Information
                </h3>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.mobileNumber
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-yellow-200 focus:border-yellow-500"
                      }`}
                      placeholder="Enter 10-digit mobile number"
                      maxLength="10"
                    />
                  </div>
                  {errors.mobileNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                      <MdLocationOn className="text-gray-400" />
                    </div>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.address
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-yellow-200 focus:border-yellow-500"
                      }`}
                      placeholder="Enter your complete address"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Seller Information (Only for sellers) */}
            {currentStep === 3 && formData.role === "SELLER" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Seller Information
                </h3>

                {/* Store Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaStore className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.storeName
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-yellow-200 focus:border-yellow-500"
                      }`}
                      placeholder="Enter your store name"
                    />
                  </div>
                  {errors.storeName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.storeName}
                    </p>
                  )}
                </div>

                {/* Store Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Description
                  </label>
                  <textarea
                    name="storeDescription"
                    value={formData.storeDescription}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-yellow-500"
                    placeholder="Brief description of your store"
                  />
                </div>

                {/* GST Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaFileInvoice className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.gstNumber
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-yellow-200 focus:border-yellow-500"
                      }`}
                      placeholder="Enter GST number"
                    />
                  </div>
                  {errors.gstNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.gstNumber}
                    </p>
                  )}
                </div>

                {/* Bank Details */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-gray-700 mb-4">
                    Bank Account Details
                  </h4>

                  {/* Account Holder Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="bankAccountHolder"
                        value={formData.bankAccountHolder}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.bankAccountHolder
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:ring-yellow-200 focus:border-yellow-500"
                        }`}
                        placeholder="Name as per bank records"
                      />
                    </div>
                    {errors.bankAccountHolder && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.bankAccountHolder}
                      </p>
                    )}
                  </div>

                  {/* Account Number */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCreditCard className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="bankAccountNumber"
                        value={formData.bankAccountNumber}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.bankAccountNumber
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:ring-yellow-200 focus:border-yellow-500"
                        }`}
                        placeholder="Enter account number"
                      />
                    </div>
                    {errors.bankAccountNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.bankAccountNumber}
                      </p>
                    )}
                  </div>

                  {/* IFSC Code */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaIdCard className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="bankIfscCode"
                        value={formData.bankIfscCode}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.bankIfscCode
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:ring-yellow-200 focus:border-yellow-500"
                        }`}
                        placeholder="Enter IFSC code"
                        maxLength="11"
                      />
                    </div>
                    {errors.bankIfscCode && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.bankIfscCode}
                      </p>
                    )}
                  </div>

                  {/* Bank Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaRegBuilding className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.bankName
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:ring-yellow-200 focus:border-yellow-500"
                        }`}
                        placeholder="Enter bank name"
                      />
                    </div>
                    {errors.bankName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.bankName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="mt-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              )}
            </div>

            {/* Login Link */}
            <p className="text-center text-gray-600 mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-yellow-600 hover:text-yellow-700 font-semibold"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Register;
