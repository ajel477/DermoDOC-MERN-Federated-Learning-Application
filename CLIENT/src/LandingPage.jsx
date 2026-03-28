import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUserMd,
  FaUser,
  FaStethoscope,
  FaCalendarCheck,
  FaVideo,
  FaPills,
  FaStar,
  FaHeart,
  FaShieldAlt,
  FaMobile,
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaFacebook,
  FaTwitter,
  FaMapMarkerAlt,
  FaPhone,
  FaRegClock,
  FaChevronRight,
  FaArrowRight,
  FaRegComments,
  FaRegCreditCard,
  FaRegCheckCircle,
  FaRegHospital,
  FaEye,
  FaEyeSlash,
  FaIdCard,
  FaBriefcase,
  FaRupeeSign,
  FaBuilding,
  FaCamera,
  FaUserGraduate,
  FaStarOfLife,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaTimesCircle,
  FaRegEnvelope,
  FaRegUser,
  FaRegAddressCard,
  FaGraduationCap,
  FaRegMoneyBillAlt,
  FaRegBuilding,
  FaRegIdCard,
} from "react-icons/fa";
import axiosInstance from "./AuthenticationPages/axiosConfig";
import { useAuth } from "./AuthenticationPages/AuthProvider";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const { loginuser } = useAuth();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [userType, setUserType] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [apiMessage, setApiMessage] = useState({ type: "", text: "" });
  const [emailAvailability, setEmailAvailability] = useState({
    checking: false,
    available: null,
  });
  const [mobileAvailability, setMobileAvailability] = useState({
    checking: false,
    available: null,
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    role: "PATIENT",
    rememberMe: false,
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    mobileNumber: "",
    role: "PATIENT",
    // Doctor specific fields
    consultationFee: "",
    specialization: "",
    experience: "",
    hospitalName: "",
    licenseNumber: "",
    qualifications: "",
    availableFrom: "",
    availableTo: "",
    about: "",
  });

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      upperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength);
    return checks;
  };

  // Password strength color and text
  const getPasswordStrengthInfo = () => {
    const strengths = ["Weak", "Fair", "Good", "Strong"];
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-green-500",
    ];
    return {
      text: strengths[passwordStrength - 1] || "Very Weak",
      color: colors[passwordStrength - 1] || "bg-gray-200",
      width: `${(passwordStrength / 4) * 100}%`,
    };
  };

  // Check email availability
  const checkEmailAvailability = async (email) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;

    setEmailAvailability({ checking: true, available: null });
    try {
      const response = await axiosInstance.get(`/auth/check-email`, {
        params: { email },
      });
      setEmailAvailability({
        checking: false,
        available: response.data.available,
      });
    } catch (error) {
      console.error("Email check error:", error);
      setEmailAvailability({ checking: false, available: null });
    }
  };

  // Check mobile availability
  const checkMobileAvailability = async (mobile) => {
    if (!mobile || !/^\d{10}$/.test(mobile)) return;

    setMobileAvailability({ checking: true, available: null });
    try {
      const response = await axios.get(`/auth/check-mobile`, {
        params: { mobileNumber: mobile },
      });
      setMobileAvailability({
        checking: false,
        available: response.data.available,
      });
    } catch (error) {
      console.error("Mobile check error:", error);
      setMobileAvailability({ checking: false, available: null });
    }
  };

  // Debounce email check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (registerData.email) {
        checkEmailAvailability(registerData.email);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [registerData.email]);

  // Debounce mobile check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (registerData.mobileNumber) {
        checkMobileAvailability(registerData.mobileNumber);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [registerData.mobileNumber]);

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData({
      ...loginData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (loginErrors[name]) {
      setLoginErrors({ ...loginErrors, [name]: "" });
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value,
    });

    if (name === "password") {
      checkPasswordStrength(value);
    }

    if (registerErrors[name]) {
      setRegisterErrors({ ...registerErrors, [name]: "" });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setApiMessage({
          type: "error",
          text: "Image size should be less than 5MB",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        setApiMessage({ type: "error", text: "Please upload an image file" });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateLoginForm = () => {
    const errors = {};
    if (!loginData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      errors.email = "Please enter a valid email";
    }
    if (!loginData.password) {
      errors.password = "Password is required";
    }
    return errors;
  };

  const validateRegisterForm = () => {
    const errors = {};
    const passwordChecks = checkPasswordStrength(registerData.password);

    if (!registerData.name) {
      errors.name = "Full name is required";
    } else if (registerData.name.length < 3) {
      errors.name = "Name must be at least 3 characters";
    }

    if (!registerData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      errors.email = "Please enter a valid email";
    } else if (emailAvailability.available === false) {
      errors.email = "Email is already registered";
    }

    if (!registerData.password) {
      errors.password = "Password is required";
    } else {
      if (!passwordChecks.length) {
        errors.password = "Password must be at least 8 characters";
      } else if (!passwordChecks.upperLower) {
        errors.password =
          "Password must contain both uppercase and lowercase letters";
      } else if (!passwordChecks.number) {
        errors.password = "Password must contain at least one number";
      } else if (!passwordChecks.special) {
        errors.password =
          "Password must contain at least one special character";
      }
    }

    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!registerData.mobileNumber) {
      errors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(registerData.mobileNumber)) {
      errors.mobileNumber = "Mobile number must be 10 digits";
    } else if (mobileAvailability.available === false) {
      errors.mobileNumber = "Mobile number is already registered";
    }

    if (!registerData.address) {
      errors.address = "Address is required";
    }

    if (userType === "doctor") {
      if (!registerData.specialization) {
        errors.specialization = "Specialization is required";
      }
      if (!registerData.experience) {
        errors.experience = "Experience is required";
      } else if (registerData.experience < 0 || registerData.experience > 50) {
        errors.experience = "Please enter valid experience (0-50 years)";
      }
      if (!registerData.consultationFee) {
        errors.consultationFee = "Consultation fee is required";
      } else if (registerData.consultationFee < 0) {
        errors.consultationFee = "Fee cannot be negative";
      }
      if (!registerData.hospitalName) {
        errors.hospitalName = "Hospital/Clinic name is required";
      }
      if (!registerData.licenseNumber) {
        errors.licenseNumber = "Medical license number is required";
      }
      if (!registerData.qualifications) {
        errors.qualifications = "Qualifications are required";
      }
    }

    if (!acceptTerms) {
      errors.terms = "You must accept the terms and conditions";
    }

    return errors;
  };

  const navigate = useNavigate();
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errors = validateLoginForm();
    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

    setIsLoading(true);

    // Show loading toast
    const loadingToast = toast.loading("Logging in...");

    try {
      const response = await axiosInstance.post(`/auth/login`, {
        email: loginData.email,
        password: loginData.password,
        role: loginData.role,
      });

      // Update loading toast to success
      toast.update(loadingToast, {
        render: "Login successful! Redirecting...",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      // Login user in context
      loginuser(response.data);

      // Store token if login successful
      if (response.status === 200) {
    
          const role = response.data.user.role;
          console.log(role)

          // Navigate based on role
          if (role === "DOCTOR") {
            navigate("/doctor-dashboard", { replace: true });
          } else if (role === "PATIENT") {
            navigate("/patient-dashboard", { replace: true });
          } else if (role === "ADMIN") {
            navigate("/admin", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
      }
    } catch (error) {
      console.error("Login error:", error);

      // Update loading toast to error
      toast.update(loadingToast, {
        render:
          error.response?.data?.message ||
          error.response?.data?.msg ||
          "Login failed. Please check your credentials.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });

      setApiMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          error.response?.data?.msg ||
          "Login failed. Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const errors = validateRegisterForm();
    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    setIsLoading(true);
    setApiMessage({ type: "", text: "" });

    try {
      const formData = new FormData();

      // Append all fields
      Object.keys(registerData).forEach((key) => {
        if (registerData[key]) {
          formData.append(key, registerData[key]);
        }
      });

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await axiosInstance.post(`/auth/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response);

      setApiMessage({
        type: "success",
        text: "Registration successful! Please check your email to verify.",
      });

      // Clear form after successful registration
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegisterData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          address: "",
          mobileNumber: "",
          role: "PATIENT",
          consultationFee: "",
          specialization: "",
          experience: "",
          hospitalName: "",
          licenseNumber: "",
          qualifications: "",
          availableFrom: "",
          availableTo: "",
          about: "",
        });
        setSelectedImage(null);
        setImagePreview(null);
        setAcceptTerms(false);
        setApiMessage({ type: "", text: "" });

        // Show login modal
        setShowLoginModal(true);
      }, 3000);
    } catch (error) {
      console.error("Registration error:", error);
      setApiMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          error.response?.data?.msg ||
          "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced Login Modal - Compact Version
  const renderLoginModal = () => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-auto transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Welcome Back</h2>
          <button
            onClick={() => setShowLoginModal(false)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimesCircle size={20} />
          </button>
        </div>

        {/* Role Toggle - Compact */}
        <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
          <button
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm transition-all ${
              userType === "patient"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => {
              setUserType("patient");
              setLoginData({ ...loginData, role: "PATIENT" });
            }}
          >
            <FaUser size={14} /> <span>Patient</span>
          </button>
          <button
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm transition-all ${
              userType === "doctor"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => {
              setUserType("doctor");
              setLoginData({ ...loginData, role: "DOCTOR" });
            }}
          >
            <FaUserMd size={14} /> <span>Doctor</span>
          </button>
          <button
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm transition-all ${
              userType === "admin"
                ? "bg-white shadow-sm text-purple-600"
                : "text-gray-600"
            }`}
            onClick={() => {
              setUserType("admin");
              setLoginData({ ...loginData, role: "ADMIN" });
            }}
          >
            <FaShieldAlt size={14} /> <span>Admin</span>
          </button>
        </div>

        {/* API Message - Compact */}
        {apiMessage.text && (
          <div
            className={`mb-3 p-2 rounded-lg text-sm flex items-center ${
              apiMessage.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {apiMessage.type === "success" ? (
              <FaCheckCircle className="mr-2 flex-shrink-0" size={14} />
            ) : (
              <FaExclamationCircle className="mr-2 flex-shrink-0" size={14} />
            )}
            <span className="truncate">{apiMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit}>
          {/* Email Field - Compact */}
          <div className="mb-3">
            <label className="block text-gray-700 mb-1 text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <FaEnvelope
                className="absolute left-3 top-2.5 text-gray-400"
                size={14}
              />
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-blue-500 transition ${
                  loginErrors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={
                  userType === "doctor"
                    ? "doctor@hospital.com"
                    : "patient@email.com"
                }
              />
            </div>
            {loginErrors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <FaExclamationCircle className="mr-1" size={10} />{" "}
                {loginErrors.email}
              </p>
            )}
          </div>

          {/* Password Field - Compact */}
          <div className="mb-3">
            <label className="block text-gray-700 mb-1 text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <FaLock
                className="absolute left-3 top-2.5 text-gray-400"
                size={14}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                className={`w-full pl-9 pr-9 py-2 text-sm border rounded-lg focus:outline-none focus:border-blue-500 transition ${
                  loginErrors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {loginErrors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <FaExclamationCircle className="mr-1" size={10} />{" "}
                {loginErrors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password - Compact */}
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={loginData.rememberMe}
                onChange={handleLoginChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                size={14}
              />
              <span className="ml-2 text-xs text-gray-600">Remember me</span>
            </label>
           
          </div>

          {/* Submit Button - Compact */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" size={14} /> Logging
                in...
              </>
            ) : (
              "Login"
            )}
          </button>

          {/* Social Login - Compact */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                className="flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                <FaGoogle className="text-red-500" size={16} />
              </button>
              <button
                type="button"
                className="flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                <FaFacebook className="text-blue-600" size={16} />
              </button>
              <button
                type="button"
                className="flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                <FaTwitter className="text-blue-400" size={16} />
              </button>
            </div>
          </div>

          {/* Register Link - Compact */}
          <div className="text-center mt-4">
            <span className="text-xs text-gray-600">
              Don't have an account?{" "}
            </span>
            <button
              type="button"
              onClick={() => {
                setShowLoginModal(false);
                setShowRegisterModal(true);
              }}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Register here
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Enhanced Register Modal - Compact Version
  const renderRegisterModal = () => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-5 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-gray-800">
            Create Your Account
          </h2>
          <button
            onClick={() => setShowRegisterModal(false)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimesCircle size={20} />
          </button>
        </div>

        {/* Progress Steps - Compact */}
        <div className="flex items-center justify-between mb-4 px-2">
          {[
            "Basic",
            "Contact",
            userType === "doctor" ? "Professional" : "Finish",
          ].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  index < 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              {index < 2 && <div className="w-12 h-0.5 bg-blue-200 mx-1"></div>}
            </div>
          ))}
        </div>

        {/* Role Toggle - Compact */}
        <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
          <button
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm transition-all ${
              userType === "patient"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => handleUserTypeChange("patient")}
          >
            <FaUser size={14} /> <span>Patient</span>
          </button>
          <button
            className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm transition-all ${
              userType === "doctor"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => handleUserTypeChange("doctor")}
          >
            <FaUserMd size={14} /> <span>Doctor</span>
          </button>
        </div>

        {/* API Message - Compact */}
        {apiMessage.text && (
          <div
            className={`mb-3 p-2 rounded-lg text-sm flex items-center ${
              apiMessage.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {apiMessage.type === "success" ? (
              <FaCheckCircle className="mr-2 flex-shrink-0" size={14} />
            ) : (
              <FaExclamationCircle className="mr-2 flex-shrink-0" size={14} />
            )}
            <span className="truncate">{apiMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Profile Image Upload - Compact */}
            <div className="md:col-span-2 flex justify-center mb-2">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-blue-100">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-2xl text-gray-400" />
                  )}
                </div>
                <label
                  htmlFor="image-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition"
                >
                  <FaCamera size={12} />
                </label>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Name Field - Compact */}
            <div className="mb-2">
              <label className="block text-gray-700 mb-1 text-xs font-medium">
                <FaRegUser className="inline mr-1" size={10} /> Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-blue-500 transition ${
                  registerErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={
                  userType === "doctor" ? "Dr. Arjun Reddy" : "John Doe"
                }
              />
              {registerErrors.name && (
                <p className="text-red-500 text-xs mt-0.5">
                  {registerErrors.name}
                </p>
              )}
            </div>

            {/* Email Field - Compact */}
            <div className="mb-2">
              <label className="block text-gray-700 mb-1 text-xs font-medium">
                <FaEnvelope className="inline mr-1" size={10} /> Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-blue-500 transition pr-7 ${
                    registerErrors.email
                      ? "border-red-500"
                      : emailAvailability.available === true
                        ? "border-green-500"
                        : "border-gray-300"
                  }`}
                  placeholder="email@example.com"
                />
                {emailAvailability.checking && (
                  <FaSpinner
                    className="absolute right-2 top-2 text-gray-400 animate-spin"
                    size={12}
                  />
                )}
                {!emailAvailability.checking &&
                  emailAvailability.available === true && (
                    <FaCheckCircle
                      className="absolute right-2 top-2 text-green-500"
                      size={12}
                    />
                  )}
                {!emailAvailability.checking &&
                  emailAvailability.available === false && (
                    <FaExclamationCircle
                      className="absolute right-2 top-2 text-red-500"
                      size={12}
                    />
                  )}
              </div>
              {registerErrors.email && (
                <p className="text-red-500 text-xs mt-0.5">
                  {registerErrors.email}
                </p>
              )}
            </div>

            {/* Password Field - Compact */}
            <div className="mb-2">
              <label className="block text-gray-700 mb-1 text-xs font-medium">
                <FaLock className="inline mr-1" size={10} /> Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-blue-500 transition pr-7 ${
                    registerErrors.password
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Password@123!"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <FaEyeSlash size={12} />
                  ) : (
                    <FaEye size={12} />
                  )}
                </button>
              </div>
              {registerData.password && (
                <div className="mt-1">
                  <div className="flex space-x-0.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength
                            ? getPasswordStrengthInfo().color
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      passwordStrength < 2
                        ? "text-red-500"
                        : passwordStrength < 3
                          ? "text-orange-500"
                          : "text-green-500"
                    }`}
                  >
                    {getPasswordStrengthInfo().text}
                  </p>
                </div>
              )}
              {registerErrors.password && (
                <p className="text-red-500 text-xs mt-0.5">
                  {registerErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password - Compact */}
            <div className="mb-2">
              <label className="block text-gray-700 mb-1 text-xs font-medium">
                <FaLock className="inline mr-1" size={10} /> Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-blue-500 transition pr-7 ${
                    registerErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={12} />
                  ) : (
                    <FaEye size={12} />
                  )}
                </button>
              </div>
              {registerErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-0.5">
                  {registerErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Mobile Number - Compact */}
            <div className="mb-2">
              <label className="block text-gray-700 mb-1 text-xs font-medium">
                <FaMobile className="inline mr-1" size={10} /> Mobile *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="mobileNumber"
                  value={registerData.mobileNumber}
                  onChange={handleRegisterChange}
                  className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-blue-500 transition pr-7 ${
                    registerErrors.mobileNumber
                      ? "border-red-500"
                      : mobileAvailability.available === true
                        ? "border-green-500"
                        : "border-gray-300"
                  }`}
                  placeholder="9876543210"
                  maxLength="10"
                />
                {mobileAvailability.checking && (
                  <FaSpinner
                    className="absolute right-2 top-2 text-gray-400 animate-spin"
                    size={12}
                  />
                )}
                {!mobileAvailability.checking &&
                  mobileAvailability.available === true && (
                    <FaCheckCircle
                      className="absolute right-2 top-2 text-green-500"
                      size={12}
                    />
                  )}
                {!mobileAvailability.checking &&
                  mobileAvailability.available === false && (
                    <FaExclamationCircle
                      className="absolute right-2 top-2 text-red-500"
                      size={12}
                    />
                  )}
              </div>
              {registerErrors.mobileNumber && (
                <p className="text-red-500 text-xs mt-0.5">
                  {registerErrors.mobileNumber}
                </p>
              )}
            </div>

            {/* Address - Compact */}
            <div className="md:col-span-2 mb-2">
              <label className="block text-gray-700 mb-1 text-xs font-medium">
                <FaMapMarkerAlt className="inline mr-1" size={10} /> Address *
              </label>
              <textarea
                name="address"
                value={registerData.address}
                onChange={handleRegisterChange}
                rows="1"
                className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-blue-500 transition ${
                  registerErrors.address ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your full address"
              />
              {registerErrors.address && (
                <p className="text-red-500 text-xs mt-0.5">
                  {registerErrors.address}
                </p>
              )}
            </div>

            {/* Doctor Specific Fields - Compact */}
            {userType === "doctor" && (
              <>
                <div className="mb-2">
                  <label className="block text-gray-700 mb-1 text-xs font-medium">
                    Specialization *
                  </label>
                  <select
                    name="specialization"
                    value={registerData.specialization}
                    onChange={handleRegisterChange}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Pediatric Dermatology">Pediatric</option>
                    <option value="Cosmetic Dermatology">Cosmetic</option>
                  </select>
                </div>

                <div className="mb-2">
                  <label className="block text-gray-700 mb-1 text-xs font-medium">
                    Experience (years) *
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={registerData.experience}
                    onChange={handleRegisterChange}
                    min="0"
                    max="50"
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="8"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-gray-700 mb-1 text-xs font-medium">
                    Consultation Fee (₹) *
                  </label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={registerData.consultationFee}
                    onChange={handleRegisterChange}
                    min="0"
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="1500"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-gray-700 mb-1 text-xs font-medium">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={registerData.hospitalName}
                    onChange={handleRegisterChange}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Hospital name"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-gray-700 mb-1 text-xs font-medium">
                    License Number *
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={registerData.licenseNumber}
                    onChange={handleRegisterChange}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="License #"
                  />
                </div>

                <div className="md:col-span-2 mb-2">
                  <label className="block text-gray-700 mb-1 text-xs font-medium">
                    Qualifications *
                  </label>
                  <input
                    type="text"
                    name="qualifications"
                    value={registerData.qualifications}
                    onChange={handleRegisterChange}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="MBBS, MD Dermatology"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-gray-700 mb-1 text-xs font-medium">
                    Available From
                  </label>
                  <input
                    type="time"
                    name="availableFrom"
                    value={registerData.availableFrom}
                    onChange={handleRegisterChange}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-gray-700 mb-1 text-xs font-medium">
                    Available To
                  </label>
                  <input
                    type="time"
                    name="availableTo"
                    value={registerData.availableTo}
                    onChange={handleRegisterChange}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2 mb-2">
                  <label className="block text-gray-700 mb-1 text-xs font-medium">
                    About / Bio
                  </label>
                  <textarea
                    name="about"
                    value={registerData.about}
                    onChange={handleRegisterChange}
                    rows="2"
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Brief about yourself..."
                  />
                </div>
              </>
            )}
          </div>

          {/* Terms and Conditions - Compact */}
          <div className="mt-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                size={12}
              />
              <span className="ml-2 text-xs text-gray-600">
                I agree to the{" "}
                <button type="button" className="text-blue-600 hover:underline">
                  Terms
                </button>{" "}
                and{" "}
                <button type="button" className="text-blue-600 hover:underline">
                  Privacy
                </button>
              </span>
            </label>
            {registerErrors.terms && (
              <p className="text-red-500 text-xs mt-1">
                {registerErrors.terms}
              </p>
            )}
          </div>

          {/* Submit Button - Compact */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm mt-3 flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" size={14} />{" "}
                Creating...
              </>
            ) : (
              `Create ${userType === "doctor" ? "Doctor" : "Patient"} Account`
            )}
          </button>

          {/* Login Link - Compact */}
          <div className="text-center mt-3">
            <span className="text-xs text-gray-600">
              Already have an account?{" "}
            </span>
            <button
              type="button"
              onClick={() => {
                setShowRegisterModal(false);
                setShowLoginModal(true);
              }}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Login here
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setRegisterData({
      ...registerData,
      role: type === "patient" ? "PATIENT" : "DOCTOR",
    });
  };

  // Skin conditions from dataset
  const skinConditions = [
    "Eczema",
    "Melanoma",
    "Atopic Dermatitis",
    "Basal Cell Carcinoma",
    "Melanocytic Nevi",
    "Benign Keratosis",
    "Psoriasis",
    "Lichen Planus",
    "Seborrheic Keratoses",
    "Tinea Ringworm",
    "Candidiasis",
    "Warts Molluscum",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <FaUserMd className="text-3xl text-blue-600" />
              <span className="text-2xl font-bold text-gray-800">DermAID</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                AI-Powered
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#home"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Home
              </a>
              <a
                href="#features"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Features
              </a>
              <a
                href="#conditions"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Conditions
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Contact
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center"
              >
                <FaLock className="mr-2" /> Login
              </button>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <FaUser className="mr-2" /> Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="container mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
              Your Skin Health
              <span className="text-blue-600 block">Our Priority</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AI-powered skin disease detection & expert dermatologist
              consultation. Get accurate diagnosis and treatment from the
              comfort of your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center text-lg"
              >
                Get Started <FaArrowRight className="ml-2" />
              </button>
              <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center justify-center text-lg">
                <FaVideo className="mr-2" /> Demo Consultation
              </button>
            </div>
            <div className="flex items-center justify-center lg:justify-start mt-8 space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white"
                  ></div>
                ))}
              </div>
              <p className="text-gray-600">
                <span className="font-bold">10,000+</span> Happy Patients
              </p>
            </div>
          </div>
          <div className="flex-1">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              alt="Dermatology Consultation"
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Comprehensive Dermatology Care
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Everything you need for complete skin health management in one
            platform
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Patient Features */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <FaStethoscope className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Patients</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" /> Skin
                  Disease Prediction
                </li>
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" /> Find
                  Specialized Doctors
                </li>
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" /> Book
                  Appointments
                </li>
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" /> Video
                  Consultation
                </li>
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" /> Medicine
                  Management
                </li>
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" /> Feedback
                  & Ratings
                </li>
              </ul>
            </div>

            {/* Doctor Features */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <FaUserMd className="text-3xl text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Doctors</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" /> Manage
                  Appointments
                </li>
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" />{" "}
                  Accept/Reject Requests
                </li>
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" /> Track
                  Payments
                </li>
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" /> Remote
                  Consultation
                </li>
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" /> Prescribe
                  Medicine
                </li>
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" /> View
                  Patient Feedback
                </li>
              </ul>
            </div>

            {/* AI Detection */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <FaHeart className="text-3xl text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Skin Detection</h3>
              <p className="text-gray-600 mb-4">
                Advanced ML model trained on 10,000+ images to detect various
                skin conditions
              </p>
              <div className="flex flex-wrap gap-2">
                {skinConditions.slice(0, 6).map((condition, idx) => (
                  <span
                    key={idx}
                    className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>

            {/* Secure Platform */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="bg-orange-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                <FaShieldAlt className="text-3xl text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Platform</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" />{" "}
                  End-to-End Encryption
                </li>
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" /> Secure
                  Payments
                </li>
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" /> Private
                  Consultations
                </li>
                <li className="flex items-center">
                  <FaRegCheckCircle className="text-green-500 mr-2" /> Data
                  Protection
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Conditions Section */}
      <section id="conditions" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Skin Conditions We Detect
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12">
            Our AI model can identify 12+ different skin conditions with high
            accuracy
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {skinConditions.map((condition, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-800">{condition}</span>
                  <FaChevronRight className="text-blue-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: FaUser,
                title: "Register",
                desc: "Create your account as patient or doctor",
              },
              {
                icon: FaStethoscope,
                title: "AI Detection",
                desc: "Upload photos for AI analysis",
              },
              {
                icon: FaCalendarCheck,
                title: "Consult",
                desc: "Book and consult with specialists",
              },
              {
                icon: FaPills,
                title: "Treatment",
                desc: "Get prescriptions and medicines",
              },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="text-3xl text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      {showLoginModal && renderLoginModal()}
      {showRegisterModal && renderRegisterModal()}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DermAID. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
