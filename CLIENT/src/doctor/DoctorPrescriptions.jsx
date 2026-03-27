// doctor/Prescriptions.jsx
import React, { useState, useEffect } from "react";
import {
  FaPrescriptionBottle,
  FaDownload,
  FaEye,
  FaPrint,
  FaShare,
  FaCalendarAlt,
  FaUserMd,
  FaUserCircle,
  FaHospital,
  FaFilePdf,
  FaFileImage,
  FaFileAlt,
  FaSpinner,
  FaExclamationCircle,
  FaSearch,
  FaFilter,
  FaBell,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaPills,
  FaNotesMedical,
  FaStethoscope,
  FaHeartbeat,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaEdit,
  FaPlus,
  FaTrash,
  FaSave,
  FaTimes as FaTimesIcon,
  FaCheck,
  FaHourglassHalf,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../AuthenticationPages/axiosConfig";
import Sidebar from "../Sidebar";

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [completingAppointment, setCompletingAppointment] = useState(false);

  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: "",
    appointmentId: "",
    medicines: "",
    notes: "",
    followUpDate: "",
    diagnosis: "",
    labTests: "",
  });

  const prescriptionsPerPage = 5;

  // Get doctor data from localStorage
  const doctorData = JSON.parse(localStorage.getItem("UserData") || "{}").user;
  const doctorId = doctorData?._id;

  useEffect(() => {
    if (doctorId) {
      fetchPrescriptions();
      fetchPatients();
      fetchAppointments();
    }
  }, [doctorId]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/medicine/doctor/${doctorId}`,
      );
      setPrescriptions(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError("Failed to load prescriptions");
      toast.error("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axiosInstance.get(
        `/appointment/doctor/${doctorId}`,
      );
      // Extract unique patients
      const uniquePatients = [];
      const patientMap = new Map();

      response.data.forEach((appointment) => {
        const patient = appointment.patientId;
        if (patient && patient._id && !patientMap.has(patient._id)) {
          patientMap.set(patient._id, patient);
          uniquePatients.push(patient);
        }
      });

      setPatients(uniquePatients);
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axiosInstance.get(
        `/appointment/doctor/${doctorId}`,
      );
      // Filter accepted appointments (not completed yet)
      const acceptedAppointments = response.data.filter(
        (apt) => apt.requestStatus === "Accepted",
      );
      setAppointments(acceptedAppointments);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      setCompletingAppointment(true);
      
      const response = await axiosInstance.patch(
        `/appointment/status/${appointmentId}`,
        { requestStatus: "Completed" }
      );

      toast.success("Appointment marked as completed");
      setShowCompleteModal(false);
      
      // Refresh appointments list
      fetchAppointments();
      
      return response.data;
    } catch (err) {
      console.error("Error completing appointment:", err);
      toast.error("Failed to complete appointment");
      return null;
    } finally {
      setCompletingAppointment(false);
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();

    if (!prescriptionForm.patientId) {
      toast.error("Please select a patient");
      return;
    }

    if (!prescriptionForm.medicines.trim()) {
      toast.error("Please add medicines");
      return;
    }

    try {
      setLoading(true);

      const prescriptionPayload = {
        doctorId: doctorId,
        patientId: prescriptionForm.patientId,
        appointmentId: prescriptionForm.appointmentId || undefined,
        medicines: prescriptionForm.medicines,
        notes: prescriptionForm.notes,
        followUpDate: prescriptionForm.followUpDate || null,
        diagnosis: prescriptionForm.diagnosis,
        labTests: prescriptionForm.labTests,
      };

      const response = await axiosInstance.post(
        "/medicine/add",
        prescriptionPayload,
      );

      toast.success("Prescription created successfully");
      
      // If this prescription is linked to an appointment, mark it as completed
      if (prescriptionForm.appointmentId) {
        await handleCompleteAppointment(prescriptionForm.appointmentId);
      }
      
      setShowCreateModal(false);
      resetForm();
      fetchPrescriptions();
    } catch (err) {
      console.error("Error creating prescription:", err);
      toast.error(
        err.response?.data?.message || "Failed to create prescription",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrescription = async (e) => {
    e.preventDefault();

    if (!selectedPrescription) return;

    try {
      setLoading(true);

      const updatePayload = {
        medicines: prescriptionForm.medicines,
        notes: prescriptionForm.notes,
        followUpDate: prescriptionForm.followUpDate || null,
        diagnosis: prescriptionForm.diagnosis,
        labTests: prescriptionForm.labTests,
      };

      const response = await axiosInstance.put(
        `/medicine/${selectedPrescription._id}`,
        updatePayload,
      );

      toast.success("Prescription updated successfully");
      setShowEditModal(false);
      resetForm();
      fetchPrescriptions();
    } catch (err) {
      console.error("Error updating prescription:", err);
      toast.error(
        err.response?.data?.message || "Failed to update prescription",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/medicine/${prescriptionId}`);
      toast.success("Prescription deleted successfully");
      fetchPrescriptions();
      if (selectedPrescription?._id === prescriptionId) {
        setShowDetailsModal(false);
      }
    } catch (err) {
      console.error("Error deleting prescription:", err);
      toast.error("Failed to delete prescription");
    }
  };

  const handleDownload = async (prescription, format = "pdf") => {
    try {
      setDownloading(true);

      const response = await axiosInstance.get(
        `/prescription/download/${prescription._id}?format=${format}`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `prescription_${prescription._id}.${format}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Prescription downloaded successfully");
    } catch (err) {
      console.error("Error downloading prescription:", err);
      toast.error("Failed to download prescription");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = (prescription) => {
    const patient = prescription.patientId;
    const doctor = prescription.doctorId;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - ${patient?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .doctor-info { margin-bottom: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; }
            .prescription { margin-bottom: 30px; }
            .medicine-item { padding: 10px; border-bottom: 1px solid #ddd; }
            .footer { margin-top: 40px; text-align: right; border-top: 1px solid #ddd; padding-top: 20px; }
            .signature { font-family: 'Brush Script MT', cursive; font-size: 24px; }
            .diagnosis { background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .lab-tests { background: #fef3e2; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Medical Prescription</h1>
            <p>Date: ${new Date(prescription.createdAt).toLocaleDateString()}</p>
            <p>Prescription ID: #${prescription._id?.slice(-8)}</p>
          </div>
          
          <div class="doctor-info">
            <h2>Dr. ${doctor?.name}</h2>
            <p><strong>Specialization:</strong> ${doctor?.specialization}</p>
            <p><strong>Hospital:</strong> ${doctor?.hospitalName}</p>
            <p><strong>Address:</strong> ${doctor?.address}</p>
            <p><strong>Contact:</strong> ${doctor?.mobileNumber}</p>
          </div>
          
          <div class="patient-info" style="margin-bottom: 20px;">
            <h3>Patient: ${patient?.name}</h3>
            <p>Age: ${patient?.age || "N/A"} | Gender: ${patient?.gender || "N/A"}</p>
          </div>
          
          ${
            prescription.diagnosis
              ? `
            <div class="diagnosis">
              <h3>Diagnosis:</h3>
              <p>${prescription.diagnosis}</p>
            </div>
          `
              : ""
          }
          
          <div class="prescription">
            <h3>Prescribed Medicines:</h3>
            ${prescription.medicines
              .split("\n")
              .map((med) => `<div class="medicine-item">${med}</div>`)
              .join("")}
          </div>
          
          ${
            prescription.labTests
              ? `
            <div class="lab-tests">
              <h3>Recommended Lab Tests:</h3>
              <p>${prescription.labTests}</p>
            </div>
          `
              : ""
          }
          
          ${
            prescription.notes
              ? `
            <div class="notes" style="margin: 20px 0;">
              <h3>Additional Notes:</h3>
              <p>${prescription.notes}</p>
            </div>
          `
              : ""
          }
          
          ${
            prescription.followUpDate
              ? `
            <div class="follow-up" style="margin: 20px 0;">
              <h3>Follow-up Date:</h3>
              <p>${new Date(prescription.followUpDate).toLocaleDateString()}</p>
            </div>
          `
              : ""
          }
          
          <div class="footer">
            <p>Doctor's Signature</p>
            <div class="signature">Dr. ${doctor?.name}</div>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Prescription
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleShare = async (prescription) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Prescription for ${prescription.patientId?.name}`,
          text: `Prescription dated ${new Date(prescription.createdAt).toLocaleDateString()}`,
          url: window.location.href,
        });
        toast.success("Shared successfully");
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      navigator.clipboard.writeText(
        `Prescription for ${prescription.patientId?.name} dated ${new Date(prescription.createdAt).toLocaleDateString()}`,
      );
      toast.info("Prescription details copied to clipboard");
    }
  };

  const resetForm = () => {
    setPrescriptionForm({
      patientId: "",
      appointmentId: "",
      medicines: "",
      notes: "",
      followUpDate: "",
      diagnosis: "",
      labTests: "",
    });
    setSelectedPatient(null);
    setSelectedAppointment(null);
  };

  const openEditModal = (prescription) => {
    setSelectedPrescription(prescription);
    setPrescriptionForm({
      patientId: prescription.patientId?._id || prescription.patientId,
      appointmentId: prescription.appointmentId || "",
      medicines: prescription.medicines,
      notes: prescription.notes || "",
      followUpDate: prescription.followUpDate
        ? prescription.followUpDate.split("T")[0]
        : "",
      diagnosis: prescription.diagnosis || "",
      labTests: prescription.labTests || "",
    });
    setShowEditModal(true);
  };

  const openCompleteModal = (appointment) => {
    setSelectedAppointment(appointment);
    setPrescriptionForm({
      ...prescriptionForm,
      patientId: appointment.patientId?._id || appointment.patientId,
      appointmentId: appointment._id,
    });
    setShowCompleteModal(true);
  };

  // Filter prescriptions based on search and date
  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const patientName = prescription.patientId?.name?.toLowerCase() || "";
    const patientEmail = prescription.patientId?.email?.toLowerCase() || "";
    const medicines = prescription.medicines?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      patientName.includes(searchLower) ||
      patientEmail.includes(searchLower) ||
      medicines.includes(searchLower);

    // Date filtering
    let matchesDate = true;
    const prescriptionDate = new Date(prescription.createdAt);
    const now = new Date();

    if (dateFilter === "week") {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      matchesDate = prescriptionDate >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      matchesDate = prescriptionDate >= monthAgo;
    } else if (dateFilter === "year") {
      const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      matchesDate = prescriptionDate >= yearAgo;
    }

    return matchesSearch && matchesDate;
  });

  // Sort prescriptions by date (newest first)
  const sortedPrescriptions = [...filteredPrescriptions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  // Pagination
  const indexOfLastPrescription = currentPage * prescriptionsPerPage;
  const indexOfFirstPrescription =
    indexOfLastPrescription - prescriptionsPerPage;
  const currentPrescriptions = sortedPrescriptions.slice(
    indexOfFirstPrescription,
    indexOfLastPrescription,
  );
  const totalPages = Math.ceil(
    sortedPrescriptions.length / prescriptionsPerPage,
  );

  // Get file icon based on format
  const getFileIcon = (format) => {
    switch (format) {
      case "pdf":
        return <FaFilePdf className="text-red-500" />;
      case "image":
        return <FaFileImage className="text-green-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Accepted':
        return 'bg-blue-100 text-blue-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Loading state
  if (loading && prescriptions.length === 0) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="DOCTOR" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading prescriptions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="DOCTOR" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchPrescriptions}
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
            <h1 className="text-2xl font-bold text-gray-800">
              Prescriptions & Consultations
            </h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <FaBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src={doctorData?.image || "https://via.placeholder.com/40"}
                  alt={doctorData?.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Dr. {doctorData?.name}
                  </p>
                  <p className="text-xs text-gray-500">Doctor</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Prescriptions</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {prescriptions.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                  <FaPrescriptionBottle size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {
                      prescriptions.filter((p) => {
                        const date = new Date(p.createdAt);
                        const now = new Date();
                        return (
                          date.getMonth() === now.getMonth() &&
                          date.getFullYear() === now.getFullYear()
                        );
                      }).length
                    }
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                  <FaCalendarAlt size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Patients</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {new Set(prescriptions.map((p) => p.patientId?._id)).size}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                  <FaUserCircle size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Consultations</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {appointments.length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
                  <FaHourglassHalf size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Pending Consultations Section */}
          {appointments.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Pending Consultations to Complete
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment._id}
                    className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-400"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <img
                          src={appointment.patientId?.image || "https://via.placeholder.com/32"}
                          alt={appointment.patientId?.name}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {appointment.patientId?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                        Pending
                      </span>
                    </div>
                    <button
                      onClick={() => openCompleteModal(appointment)}
                      className="w-full mt-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center justify-center"
                    >
                      <FaCheck className="mr-1" size={12} />
                      Complete & Add Prescription
                    </button>
                  </div>
                ))}
                {appointments.length > 3 && (
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                    <p className="text-gray-600 text-sm">
                      +{appointments.length - 3} more pending consultations
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by patient, medicine..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Date Filter */}
                <div className="relative">
                  <FaFilter className="absolute left-3 top-3 text-gray-400" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>

              {/* Create Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <FaPlus className="mr-2" />
                New Prescription
              </button>
            </div>
          </div>

          {/* Prescriptions List */}
          {filteredPrescriptions.length > 0 ? (
            <>
              <div className="space-y-4">
                {currentPrescriptions.map((prescription) => (
                  <PrescriptionCard
                    key={prescription._id}
                    prescription={prescription}
                    onView={() => {
                      setSelectedPrescription(prescription);
                      setShowDetailsModal(true);
                    }}
                    onEdit={() => openEditModal(prescription)}
                    onDelete={() => handleDeletePrescription(prescription._id)}
                    onDownload={() => handleDownload(prescription)}
                    onPrint={() => handlePrint(prescription)}
                    onShare={() => handleShare(prescription)}
                    downloading={downloading}
                    formatDate={formatDate}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 border rounded-lg ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-50"
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
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <FaPrescriptionBottle className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No prescriptions found</p>
              {searchTerm || dateFilter !== "all" ? (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setDateFilter("all");
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              ) : (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Your First Prescription
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Prescription Details Modal */}
      {showDetailsModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Prescription Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Prescription Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 mb-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Medical Prescription
                    </h3>
                    <p className="text-blue-100">
                      Prescription ID: #{selectedPrescription._id?.slice(-8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100">Date</p>
                    <p className="font-semibold">
                      {new Date(
                        selectedPrescription.createdAt,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaUserCircle className="mr-2 text-blue-600" />
                    Patient Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-600">Name:</span>{" "}
                      {selectedPrescription.patientId?.name}
                    </p>
                    <p>
                      <span className="text-gray-600">Email:</span>{" "}
                      {selectedPrescription.patientId?.email}
                    </p>
                    <p>
                      <span className="text-gray-600">Phone:</span>{" "}
                      {selectedPrescription.patientId?.mobileNumber || "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-600">Age:</span>{" "}
                      {selectedPrescription.patientId?.age || "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-600">Gender:</span>{" "}
                      {selectedPrescription.patientId?.gender || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Doctor Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaUserMd className="mr-2 text-blue-600" />
                    Doctor Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-600">Name:</span> Dr.{" "}
                      {selectedPrescription.doctorId?.name}
                    </p>
                    <p>
                      <span className="text-gray-600">Specialization:</span>{" "}
                      {selectedPrescription.doctorId?.specialization}
                    </p>
                    <p>
                      <span className="text-gray-600">Hospital:</span>{" "}
                      {selectedPrescription.doctorId?.hospitalName}
                    </p>
                    <p>
                      <span className="text-gray-600">Contact:</span>{" "}
                      {selectedPrescription.doctorId?.mobileNumber}
                    </p>
                  </div>
                </div>

                {/* Diagnosis */}
                {selectedPrescription.diagnosis && (
                  <div className="md:col-span-2 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Diagnosis
                    </h4>
                    <p className="text-gray-700">
                      {selectedPrescription.diagnosis}
                    </p>
                  </div>
                )}

                {/* Prescribed Medicines */}
                <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaPills className="mr-2 text-blue-600" />
                    Prescribed Medicines
                  </h4>
                  <div className="bg-white rounded-lg p-4">
                    {selectedPrescription.medicines
                      .split("\n")
                      .map((medicine, index) => (
                        <div
                          key={index}
                          className="py-2 border-b last:border-b-0"
                        >
                          <p className="text-gray-800">{medicine}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Lab Tests */}
                {selectedPrescription.labTests && (
                  <div className="md:col-span-2 bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Recommended Lab Tests
                    </h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedPrescription.labTests}
                    </p>
                  </div>
                )}

                {/* Additional Notes */}
                {selectedPrescription.notes && (
                  <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <FaNotesMedical className="mr-2 text-blue-600" />
                      Additional Notes
                    </h4>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-line">
                        {selectedPrescription.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Follow-up Date */}
                {selectedPrescription.followUpDate && (
                  <div className="md:col-span-2 bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-600" />
                      Follow-up Date
                    </h4>
                    <p className="text-gray-800">
                      {new Date(
                        selectedPrescription.followUpDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => handleDownload(selectedPrescription)}
                  disabled={downloading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {downloading ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaDownload className="mr-2" />
                  )}
                  Download
                </button>
                <button
                  onClick={() => handlePrint(selectedPrescription)}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center"
                >
                  <FaPrint className="mr-2" />
                  Print
                </button>
              
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Prescription Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Create New Prescription
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleCreatePrescription}>
                {/* Patient Selection */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaUserCircle className="inline mr-2 text-blue-600" />
                    Select Patient *
                  </label>
                  <select
                    value={prescriptionForm.patientId}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        patientId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Choose a patient</option>
                    {patients.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name} - {patient.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Appointment Selection (Optional) */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaCalendarAlt className="inline mr-2 text-blue-600" />
                    Link to Appointment (Optional)
                  </label>
                  <select
                    value={prescriptionForm.appointmentId}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        appointmentId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">No appointment link</option>
                    {appointments
                      .filter(
                        (apt) =>
                          apt.patientId?._id === prescriptionForm.patientId,
                      )
                      .map((apt) => (
                        <option key={apt._id} value={apt._id}>
                          {new Date(apt.appointmentDate).toLocaleDateString()} -{" "}
                          {apt.consultationType}
                        </option>
                      ))}
                  </select>
                  {prescriptionForm.appointmentId && (
                    <p className="text-xs text-green-600 mt-1">
                      This appointment will be marked as completed after saving
                    </p>
                  )}
                </div>

                {/* Diagnosis */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaStethoscope className="inline mr-2 text-blue-600" />
                    Diagnosis
                  </label>
                  <textarea
                    value={prescriptionForm.diagnosis}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        diagnosis: e.target.value,
                      })
                    }
                    rows="2"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter diagnosis..."
                  />
                </div>

                {/* Medicines */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaPrescriptionBottle className="inline mr-2 text-blue-600" />
                    Prescribed Medicines *
                  </label>
                  <textarea
                    value={prescriptionForm.medicines}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        medicines: e.target.value,
                      })
                    }
                    rows="5"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter medicines with dosage, frequency, and duration&#10;Example:&#10;- Amoxicillin 500mg - Twice daily for 7 days&#10;- Paracetamol 650mg - As needed for fever"
                    required
                  />
                </div>

                {/* Lab Tests */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaHeartbeat className="inline mr-2 text-blue-600" />
                    Recommended Lab Tests
                  </label>
                  <textarea
                    value={prescriptionForm.labTests}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        labTests: e.target.value,
                      })
                    }
                    rows="2"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter any recommended lab tests..."
                  />
                </div>

                {/* Additional Notes */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaNotesMedical className="inline mr-2 text-blue-600" />
                    Additional Notes / Instructions
                  </label>
                  <textarea
                    value={prescriptionForm.notes}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        notes: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Add any special instructions, diet recommendations, or precautions..."
                  />
                </div>

                {/* Follow-up Date */}
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaCalendarAlt className="inline mr-2 text-blue-600" />
                    Follow-up Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={prescriptionForm.followUpDate}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        followUpDate: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        Create Prescription
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Prescription Modal */}
      {showEditModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Edit Prescription
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Patient:</span>{" "}
                  {selectedPrescription.patientId?.name}
                </p>
              </div>

              <form onSubmit={handleUpdatePrescription}>
                {/* Diagnosis */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaStethoscope className="inline mr-2 text-blue-600" />
                    Diagnosis
                  </label>
                  <textarea
                    value={prescriptionForm.diagnosis}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        diagnosis: e.target.value,
                      })
                    }
                    rows="2"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter diagnosis..."
                  />
                </div>

                {/* Medicines */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaPrescriptionBottle className="inline mr-2 text-blue-600" />
                    Prescribed Medicines *
                  </label>
                  <textarea
                    value={prescriptionForm.medicines}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        medicines: e.target.value,
                      })
                    }
                    rows="5"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Lab Tests */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaHeartbeat className="inline mr-2 text-blue-600" />
                    Recommended Lab Tests
                  </label>
                  <textarea
                    value={prescriptionForm.labTests}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        labTests: e.target.value,
                      })
                    }
                    rows="2"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Additional Notes */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaNotesMedical className="inline mr-2 text-blue-600" />
                    Additional Notes / Instructions
                  </label>
                  <textarea
                    value={prescriptionForm.notes}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        notes: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Follow-up Date */}
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaCalendarAlt className="inline mr-2 text-blue-600" />
                    Follow-up Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={prescriptionForm.followUpDate}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        followUpDate: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        Update Prescription
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Complete Appointment Modal */}
      {showCompleteModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Complete Consultation
                </h2>
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="text-green-600 text-3xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Mark Consultation as Complete?
                </h3>
                <p className="text-sm text-gray-600">
                  Patient: {selectedAppointment.patientId?.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(selectedAppointment.appointmentDate).toLocaleString()}
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <FaClock className="inline mr-1" />
                  You'll be able to add a prescription after completing the consultation.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    setShowCreateModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Prescription
                </button>
                <button
                  onClick={() => {
                    handleCompleteAppointment(selectedAppointment._id);
                    setShowCompleteModal(false);
                  }}
                  disabled={completingAppointment}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {completingAppointment ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaCheck className="mr-2" />
                  )}
                  Complete Only
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Prescription Card Component
const PrescriptionCard = ({
  prescription,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onPrint,
  onShare,
  downloading,
  formatDate,
}) => {
  const patient = prescription.patientId;
  const hasFollowUp = prescription.followUpDate;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Left Section - Patient Info */}
        <div className="flex items-start space-x-4 flex-1">
          <img
            src={patient?.image || "https://via.placeholder.com/60"}
            alt={patient?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{patient?.name}</h3>
            <p className="text-sm text-gray-600">{patient?.email}</p>

            {/* Prescription Date */}
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <FaCalendarAlt className="mr-1" />
              {formatDate(prescription.createdAt)}
              {hasFollowUp && (
                <>
                  <FaClock className="ml-3 mr-1 text-green-600" />
                  <span className="text-green-600">
                    Follow-up: {formatDate(prescription.followUpDate)}
                  </span>
                </>
              )}
            </div>

            {/* Medicines Preview */}
            <div className="mt-2">
              <p className="text-sm text-gray-600 line-clamp-1">
                <span className="font-medium">Medicines:</span>{" "}
                {prescription.medicines.split("\n").slice(0, 1).join(" • ")}
                {prescription.medicines.split("\n").length > 1 && " ..."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <button
            onClick={onView}
            className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center"
          >
            <FaEye className="mr-1" size={12} />
            View
          </button>
          <button
            onClick={onPrint}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Print"
          >
            <FaPrint size={14} />
          </button>
         
        </div>
      </div>
    </div>
  );
};

export default DoctorPrescriptions;