// pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebookF,
  FaTwitter,
  FaShoppingBag,
  FaSpinner,
  FaArrowLeft,
  FaShieldAlt,
  FaUser,
  FaStore,
  FaUserCog,
  FaBox,
  FaGift,
  FaTruck,
  FaHeadphones,
} from "react-icons/fa";
import { MdVerifiedUser, MdSecurity, MdEmail, MdLock } from "react-icons/md";
import { useAuth } from "./AuthProvider";
import axiosInstance from "./axiosConfig";

const Login = () => {
  const { loginuser } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "PATIENT",
  });

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Roles Configuration
  const roles = [
    {
      value: "PATIENT",
      label: "Patient",
      icon: <FaUser className="text-xl" />,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
      description: "Book appointments, get consultations",
    },
    {
      value: "DOCTOR",
      label: "Doctor",
      icon: <FaStore className="text-xl" />,
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-600",
      description: "Manage appointments and patients",
    },
    {
      value: "ADMIN",
      label: "Admin",
      icon: <FaUserCog className="text-xl" />,
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-600",
      description: "Manage platform and approve doctors",
    },
  ];

  // Get role styles
  const getRoleStyles = (role) => {
    const roleConfig = roles.find((r) => r.value === role) || roles[0];
    return {
      bg: roleConfig.bgColor,
      border: roleConfig.borderColor,
      text: roleConfig.textColor,
      icon: roleConfig.icon,
    };
  };

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle Role Selection
  const handleRoleSelect = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  // Validate Form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/auth/login", formData);

      if (response.data.success) {
        loginuser(response.data);

        toast.success(response.data.msg || "Logged in successfully!");

        // Store token if remember me is checked
        if (rememberMe) {
          localStorage.setItem("role", formData.role);
        } else {
          sessionStorage.setItem("token", response.data.token);
        }

        // Store user data
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role", formData.role);
        console.log(formData.role);

        // Redirect based on role
        setTimeout(() => {
          switch (formData.role) {
            case "ADMIN":
              navigate("/admin");
              break;
            case "DOCTOR":
              navigate("/doctor");
              break;
            case "PATIENT":
              navigate("/patient");
              break;
            default:
              navigate("/");
          }
        }, 1500);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);

      // Handle specific errors
      if (error.response?.status === 403) {
        if (error.response.data.message.includes("pending")) {
          toast.info(
            "Your account is pending approval. Please wait for admin verification.",
          );
        } else if (error.response.data.message.includes("suspended")) {
          toast.error(
            "Your account has been suspended. Please contact support.",
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Submit
  const handleOtpSubmit = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/verify-2fa", {
        email: formData.email,
        otp: otpValue,
      });

      if (response.data.success) {
        toast.success("2FA Verified Successfully!");
        setShowTwoFactor(false);
        handleLogin(new Event("submit"));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  // Check for saved credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedRole = localStorage.getItem("savedRole");
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        role: savedRole || "PATIENT",
      }));
      setRememberMe(true);
    }
  }, []);

  const currentRoleStyle = getRoleStyles(formData.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from- via-white-500 to-white-600 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full opacity-5 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-fadeIn">
        <div className="grid md:grid-cols-2 min-h-[600px]">
          {/* Left Side - Branding */}
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-8 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-8">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <FaShoppingBag className="text-3xl" />
                </div>
                <span className="text-2xl font-bold">PromoPalace</span>
              </div>

              <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
              <p className="text-yellow-100 mb-8 text-lg">
                Choose your role and login to continue your shopping journey.
              </p>

              {/* Role Cards */}
              <div className="space-y-3 mb-8">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleSelect(role.value)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
                      formData.role === role.value
                        ? "bg-white text-yellow-600 shadow-lg transform scale-105"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        formData.role === role.value
                          ? "bg-yellow-100"
                          : "bg-white/20"
                      }`}
                    >
                      {role.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{role.label}</div>
                      <div
                        className={`text-sm ${
                          formData.role === role.value
                            ? "text-yellow-600"
                            : "text-yellow-100"
                        }`}
                      >
                        {role.description}
                      </div>
                    </div>
                    {formData.role === role.value && (
                      <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <FaTruck className="text-2xl mx-auto mb-1" />
                  <div className="text-sm">Free Shipping</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <FaShieldAlt className="text-2xl mx-auto mb-1" />
                  <div className="text-sm">Secure Payment</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <FaGift className="text-2xl mx-auto mb-1" />
                  <div className="text-sm">Special Offers</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <FaHeadphones className="text-2xl mx-auto mb-1" />
                  <div className="text-sm">24/7 Support</div>
                </div>
              </div>
            </div>

            <div className="text-sm text-yellow-200">
              © 2024 PromoPalace. All rights reserved.
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-8">
            {!showTwoFactor ? (
              <>
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Sign In as{" "}
                    <span className={currentRoleStyle.text}>
                      {roles.find((r) => r.value === formData.role)?.label}
                    </span>
                  </h2>
                  <p className="text-gray-600">
                    Enter your credentials to access your account
                  </p>
                </div>

                {/* Role Indicator */}
                <div
                  className={`${currentRoleStyle.bg} ${currentRoleStyle.border} border rounded-lg p-3 mb-6 flex items-center space-x-3`}
                >
                  <div className={`${currentRoleStyle.text}`}>
                    {currentRoleStyle.icon}
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Logged in as</div>
                    <div className={`font-semibold ${currentRoleStyle.text}`}>
                      {roles.find((r) => r.value === formData.role)?.label}
                    </div>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MdEmail
                          className={`${errors.email ? "text-red-400" : "text-gray-400"}`}
                        />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          errors.email
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:ring-yellow-200 focus:border-yellow-500"
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MdLock
                          className={`${errors.password ? "text-red-400" : "text-gray-400"}`}
                        />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          errors.password
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:ring-yellow-200 focus:border-yellow-500"
                        }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>

                  {/* Social Login */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <FaGoogle className="text-red-500" />
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <FaFacebookF className="text-blue-600" />
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <FaTwitter className="text-blue-400" />
                    </button>
                  </div>

                  {/* Register Link */}
                  <p className="text-center text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-yellow-600 hover:text-yellow-700 font-semibold"
                    >
                      Register
                    </Link>
                  </p>
                </form>
              </>
            ) : (
              /* 2FA Verification */
              <div className="space-y-6">
                <button
                  onClick={() => setShowTwoFactor(false)}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <FaArrowLeft className="mr-2" /> Back
                </button>

                <div className="text-center">
                  <div className="inline-flex p-4 bg-yellow-100 rounded-full mb-4">
                    <MdSecurity className="text-4xl text-yellow-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Two-Factor Authentication
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                {/* OTP Input */}
                <div className="flex justify-center space-x-2 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      maxLength="1"
                    />
                  ))}
                </div>

                <button
                  onClick={handleOtpSubmit}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-yellow-600 to-yellow-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify & Login</span>
                  )}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Didn't receive code?{" "}
                  <button className="text-yellow-600 hover:text-yellow-700 font-medium">
                    Resend
                  </button>
                </p>
              </div>
            )}
          </div>
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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;
