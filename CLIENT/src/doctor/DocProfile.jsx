// doctor/MyProfile.jsx
import React, { useState, useEffect } from "react";
import {
  FaUserMd,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaTransgender,
  FaCalendarAlt,
  FaHeartbeat,
  FaNotesMedical,
  FaEdit,
  FaCamera,
  FaSpinner,
  FaExclamationCircle,
  FaBell,
  FaCheckCircle,
  FaSave,
  FaTimes,
  FaStethoscope,
  FaHospital,
  FaPrescriptionBottle,
  FaClock,
  FaShieldAlt,
  FaRupeeSign,
  FaStar,
  FaBriefcase,
  FaGraduationCap,
  FaAward,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../AuthenticationPages/axiosConfig";
import Sidebar from "../Sidebar";

const MyDocProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    rating: 4.5
  });

  // Get doctor ID from localStorage/session
  const doctorData = JSON.parse(localStorage.getItem("UserData") || "{}").user;
  const doctorId = doctorData?._id;

  useEffect(() => {
    if (doctorId) {
      fetchProfileData();
      fetchDoctorStats();
    }
  }, [doctorId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Using the auth/me endpoint which returns the current user's profile
      const response = await axiosInstance.get(`auth/me`);
      setProfileData(response.data);
      setEditForm(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data");
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorStats = async () => {
    try {
      // Fetch appointments count
      const appointmentsRes = await axiosInstance.get(`/appointment/doctor/${doctorId}`);
      const appointments = appointmentsRes.data;
      
      // Fetch unique patients
      const uniquePatients = new Set(appointments.map(apt => apt.patientId?._id)).size;
      
      // Fetch completed appointments
      const completedAppointments = appointments.filter(apt => apt.requestStatus === "Completed").length;
      
      // Calculate total revenue (if payment data is available)
      let totalRevenue = 0;
      try {
        const paymentsRes = await axiosInstance.get(`/payment/doctor/${doctorId}`);
        totalRevenue = paymentsRes.data.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      } catch (err) {
        console.error("Error fetching payments:", err);
      }

      setStats({
        totalPatients: uniquePatients,
        totalAppointments: appointments.length,
        completedAppointments,
        totalRevenue,
        rating: 4.5 // This could come from a reviews endpoint
      });
    } catch (err) {
      console.error("Error fetching doctor stats:", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      
      // Add general fields
      if (editForm.name) formData.append("name", editForm.name);
      if (editForm.email) formData.append("email", editForm.email);
      if (editForm.mobileNumber) formData.append("mobileNumber", editForm.mobileNumber);
      if (editForm.address) formData.append("address", editForm.address);
      
      // Add professional fields
      if (editForm.specialization) formData.append("specialization", editForm.specialization);
      if (editForm.experience) formData.append("experience", editForm.experience);
      if (editForm.hospitalName) formData.append("hospitalName", editForm.hospitalName);
      if (editForm.consultationFee) formData.append("consultationFee", editForm.consultationFee);
      
      // Add image if changed
      if (profileImage) {
        formData.append("image", profileImage);
      }

      const response = await axiosInstance.patch("auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = response.data.user;
      setProfileData(updatedUser);
      setIsEditing(false);
      setImagePreview(null);
      setProfileImage(null);

      // Update localStorage
      const storedData = JSON.parse(localStorage.getItem("UserData") || "{}");
      storedData.user = { ...storedData.user, ...updatedUser };
      localStorage.setItem("UserData", JSON.stringify(storedData));

      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error(err.response?.data?.msg || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm(profileData);
    setIsEditing(false);
    setImagePreview(null);
    setProfileImage(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="DOCTOR" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profileData) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="DOCTOR" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error || "Failed to load profile"}</p>
            <button
              onClick={fetchProfileData}
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
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <FaBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src={profileData.image || "https://via.placeholder.com/40"}
                  alt={profileData.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Dr. {profileData.name}
                  </p>
                  <p className="text-xs text-gray-500">Doctor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="px-8 border-b flex space-x-6">
            {["personal", "professional", "account"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 capitalize font-medium text-sm border-b-2 transition ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab} Information
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalPatients}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                  <FaUserMd size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Appointments</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalAppointments}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                  <FaCalendarAlt size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">₹{stats.totalRevenue}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                  <FaRupeeSign size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.rating}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
                  <FaStar size={24} />
                </div>
              </div>
            </div>
          </div>

          {activeTab === "personal" && (
            <div className="max-w-4xl mx-auto">
              {/* Profile Header Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>
                <div className="px-6 pb-6">
                  <div className="flex flex-col md:flex-row md:items-end -mt-16">
                    {/* Profile Image */}
                    <div className="relative group">
                      <img
                        src={
                          imagePreview ||
                          profileData.image ||
                          "https://via.placeholder.com/120"
                        }
                        alt={profileData.name}
                        className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white"
                      />
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                          <FaCamera size={16} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Name and Edit Button */}
                    <div className="mt-4 md:mt-0 md:ml-6 flex-1 flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 ">
                          Dr. {profileData.name}
                        </h2>
                        <p className="text-gray-600">
                          {profileData.specialization} • {profileData.experience} years experience
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          Doctor ID: #{profileData._id?.slice(-8)}
                        </p>
                      </div>
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          <FaEdit className="mr-2" />
                          Edit Profile
                        </button>
                      ) : (
                        <div className="mt-4 md:mt-0 flex space-x-2">
                          <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
                          >
                            {saving ? (
                              <FaSpinner className="animate-spin mr-2" />
                            ) : (
                              <FaSave className="mr-2" />
                            )}
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                          >
                            <FaTimes className="mr-2" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FaUserMd className="mr-2 text-blue-600" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField
                    icon={<FaUserMd />}
                    label="Full Name"
                    value={editForm.name}
                    name="name"
                    isEditing={isEditing}
                    onChange={handleInputChange}
                  />

                  <InfoField
                    icon={<FaEnvelope />}
                    label="Email"
                    value={editForm.email}
                    name="email"
                    type="email"
                    isEditing={isEditing}
                    onChange={handleInputChange}
                  />

                  <InfoField
                    icon={<FaPhone />}
                    label="Mobile Number"
                    value={editForm.mobileNumber}
                    name="mobileNumber"
                    type="tel"
                    isEditing={isEditing}
                    onChange={handleInputChange}
                  />

                  <InfoField
                    icon={<FaMapMarkerAlt />}
                    label="Address"
                    value={editForm.address}
                    name="address"
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    type="textarea"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "professional" && (
            <div className="max-w-4xl mx-auto">
              {/* Professional Information Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FaStethoscope className="mr-2 text-blue-600" />
                  Professional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField
                    icon={<FaStethoscope />}
                    label="Specialization"
                    value={editForm.specialization}
                    name="specialization"
                    isEditing={isEditing}
                    onChange={handleInputChange}
                  />

                  <InfoField
                    icon={<FaBriefcase />}
                    label="Experience (years)"
                    value={editForm.experience}
                    name="experience"
                    type="number"
                    isEditing={isEditing}
                    onChange={handleInputChange}
                  />

                  <InfoField
                    icon={<FaHospital />}
                    label="Hospital Name"
                    value={editForm.hospitalName}
                    name="hospitalName"
                    isEditing={isEditing}
                    onChange={handleInputChange}
                  />

                  <InfoField
                    icon={<FaRupeeSign />}
                    label="Consultation Fee (₹)"
                    value={editForm.consultationFee}
                    name="consultationFee"
                    type="number"
                    isEditing={isEditing}
                    onChange={handleInputChange}
                  />

                  <div className="md:col-span-2">
                    <InfoField
                      icon={<FaMapMarkerAlt />}
                      label="Hospital Address"
                      value={editForm.address}
                      name="address"
                      isEditing={isEditing}
                      onChange={handleInputChange}
                      type="textarea"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Acceptance Status</p>
                      <p className="text-lg font-semibold text-gray-800 mt-1">
                        {profileData.isAccepted ? "Accepted" : "Pending"}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaCheckCircle className={profileData.isAccepted ? "text-green-600" : "text-yellow-600"} size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Completed Appointments</p>
                      <p className="text-lg font-semibold text-gray-800 mt-1">{stats.completedAppointments || 0}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaCalendarAlt className="text-green-600" size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Patient Satisfaction</p>
                      <p className="text-lg font-semibold text-gray-800 mt-1">{stats.rating} / 5.0</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaStar className="text-yellow-500" size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="max-w-4xl mx-auto">
              {/* Account Information Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FaShieldAlt className="mr-2 text-blue-600" />
                  Account Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Account Status</span>
                    <span className="flex items-center text-green-600 font-medium">
                      <FaCheckCircle className="mr-2" />
                      {profileData.accountStatus || "Active"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium">
                      {formatDate(profileData.accountCreatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Last Login</span>
                    <span className="font-medium">
                      {formatDate(profileData.lastLogin)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">
                      {formatDate(profileData.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Account ID</span>
                    <span className="font-medium text-sm bg-gray-200 px-3 py-1 rounded">
                      {profileData._id}
                    </span>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <FaCalendarAlt className="mx-auto text-blue-600 mb-2" size={24} />
                    <p className="text-2xl font-bold text-blue-700">
                      {new Date(profileData.accountCreatedAt || Date.now()).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-blue-600">Account Created</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <FaClock className="mx-auto text-green-600 mb-2" size={24} />
                    <p className="text-2xl font-bold text-green-700">
                      {Math.floor((new Date() - new Date(profileData.accountCreatedAt || Date.now())) / (1000 * 60 * 60 * 24))} days
                    </p>
                    <p className="text-sm text-green-600">Membership Duration</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <FaHeartbeat className="mx-auto text-purple-600 mb-2" size={24} />
                    <p className="text-2xl font-bold text-purple-700">
                      {profileData.experience || 0} years
                    </p>
                    <p className="text-sm text-purple-600">Experience</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Info Field Component
const InfoField = ({
  icon,
  label,
  value,
  name,
  type = "text",
  isEditing,
  onChange,
  options = [],
  capitalize = false,
}) => {
  const displayValue = (val) => {
    if (!val && val !== 0) return "Not provided";
    if (capitalize && typeof val === "string") {
      return val.charAt(0).toUpperCase() + val.slice(1);
    }
    return val;
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="text-gray-400 mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        {isEditing ? (
          type === "textarea" ? (
            <textarea
              name={name}
              value={value || ""}
              onChange={onChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              rows="3"
            />
          ) : type === "select" ? (
            <select
              name={name}
              value={value || ""}
              onChange={onChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 capitalize"
            >
              <option value="">Select {label}</option>
              {options.map((opt) => (
                <option key={opt} value={opt} className="capitalize">
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              name={name}
              value={value || ""}
              onChange={onChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          )
        ) : (
          <p className="font-medium text-gray-800">{displayValue(value)}</p>
        )}
      </div>
    </div>
  );
};

export default MyDocProfile;