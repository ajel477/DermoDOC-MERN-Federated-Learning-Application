import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserMd,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaHospital,
  FaStethoscope,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaEye,
  FaSpinner,
} from "react-icons/fa";
import { FcRefresh } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import axiosInstance from "../AuthenticationPages/axiosConfig";

const PendingDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null); // doctor id being processed
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/pending-doctors");
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (error) {
      toast.error("Failed to load pending doctors");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (doctorId) => {
    setActionLoading(doctorId);
    try {
      const res = await axiosInstance.patch(`/admin/verify-doctor/${doctorId}`);
      if (res.data.success) {
        toast.success("Doctor verified! Approval email sent.");
        setDoctors((prev) => prev.filter((d) => d._id !== doctorId));
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Verification failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (doctorId) => {
    if (!window.confirm("Are you sure you want to reject and remove this doctor's registration?")) return;
    setActionLoading(doctorId);
    try {
      const res = await axiosInstance.delete(`/admin/reject-doctor/${doctorId}`);
      if (res.data.success) {
        toast.success("Doctor registration rejected.");
        setDoctors((prev) => prev.filter((d) => d._id !== doctorId));
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filtered = doctors.filter(
    (d) =>
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaUserMd className="text-blue-600" />
              Doctor Verification Panel
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {doctors.length} doctor{doctors.length !== 1 ? "s" : ""} awaiting approval
            </p>
          </div>
          <button
            onClick={fetchPendingDoctors}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <FcRefresh className="text-xl" />
          </button>
        </div>
      </header>

      <div className="p-8">
        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-3">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-700"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <FaSpinner className="animate-spin text-blue-500 text-3xl" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-24 text-center">
            <FaUserMd className="text-6xl text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-500">No Pending Doctor Registrations</p>
            <p className="text-sm text-gray-400 mt-1">All caught up! Come back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence>
              {filtered.map((doctor) => (
                <motion.div
                  key={doctor._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {doctor.image ? (
                        <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                      ) : (
                        <FaUserMd className="text-white text-2xl" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg leading-tight">Dr. {doctor.name}</h3>
                      <span className="text-xs bg-yellow-400 text-yellow-900 font-semibold px-2 py-0.5 rounded-full">
                        Pending Approval
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaStethoscope className="text-blue-400 flex-shrink-0" />
                      <span>{doctor.specialization}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaHospital className="text-blue-400 flex-shrink-0" />
                      <span>{doctor.hospitalName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaEnvelope className="text-blue-400 flex-shrink-0" />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaPhone className="text-blue-400 flex-shrink-0" />
                      <span>{doctor.mobileNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCalendarAlt className="text-blue-400 flex-shrink-0" />
                      <span>Registered: {formatDate(doctor.accountCreatedAt || doctor.createdAt)}</span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      onClick={() => { setSelectedDoctor(doctor); setShowModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <FaEye /> Details
                    </button>
                    <button
                      onClick={() => handleVerify(doctor._id)}
                      disabled={actionLoading === doctor._id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                    >
                      {actionLoading === doctor._id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheckCircle />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(doctor._id)}
                      disabled={actionLoading === doctor._id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-60"
                    >
                      <FaTimesCircle /> Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showModal && selectedDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {selectedDoctor.image ? (
                    <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-full h-full object-cover" />
                  ) : (
                    <FaUserMd className="text-white text-3xl" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Dr. {selectedDoctor.name}</h2>
                  <p className="text-blue-200 text-sm">{selectedDoctor.specialization}</p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-3 text-sm">
                {[
                  { label: "Email", value: selectedDoctor.email },
                  { label: "Mobile", value: selectedDoctor.mobileNumber },
                  { label: "Hospital", value: selectedDoctor.hospitalName },
                  { label: "Experience", value: `${selectedDoctor.experience} year(s)` },
                  { label: "Consultation Fee", value: `₹${selectedDoctor.consultationFee}` },
                  { label: "Address", value: selectedDoctor.address },
                  { label: "Registered On", value: formatDate(selectedDoctor.accountCreatedAt || selectedDoctor.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex">
                    <span className="w-36 font-semibold text-gray-500 flex-shrink-0">{label}</span>
                    <span className="text-gray-800">{value || "N/A"}</span>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => handleVerify(selectedDoctor._id)}
                  disabled={actionLoading === selectedDoctor._id}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {actionLoading === selectedDoctor._id ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  Approve Doctor
                </button>
                <button
                  onClick={() => handleReject(selectedDoctor._id)}
                  disabled={actionLoading === selectedDoctor._id}
                  className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold hover:bg-red-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <FaTimesCircle /> Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PendingDoctors;
