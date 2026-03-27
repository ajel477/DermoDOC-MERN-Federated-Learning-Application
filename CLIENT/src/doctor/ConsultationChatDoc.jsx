// doctor/ConsultationChat.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FaPaperPlane,
  FaVideo,
  FaPhone,
  FaTimesCircle,
  FaCalendarAlt,
  FaClock,
  FaSpinner,
  FaExclamationCircle,
  FaFile,
  FaPaperclip,
  FaBell,
  FaArrowLeft,
  FaDownload,
  FaStethoscope,
  FaInfoCircle,
  FaChevronRight,
  FaChevronLeft,
  FaImage,
  FaFilePdf,
  FaFileAlt,
  FaComments,
  FaUserCircle,
  FaPrescriptionBottle,
  FaNotesMedical,
  FaCheckCircle,
  FaHourglassHalf
} from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../AuthenticationPages/axiosConfig";
import Sidebar from "../Sidebar";

const ConsultationChat = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showAppointmentList, setShowAppointmentList] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [consultationDetails, setConsultationDetails] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [appointmentDetailsCache, setAppointmentDetailsCache] = useState({}); // Store fetched appointment details
  const [prescriptionData, setPrescriptionData] = useState({
    medicines: "",
    notes: "",
    followUpDate: ""
  });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fetchedAppointmentsRef = useRef(new Set()); // Track which appointments have been fetched

  // Get doctor data from localStorage
  const doctorData = JSON.parse(localStorage.getItem("UserData") || "{}").user;
  const doctorId = doctorData?._id;

  useEffect(() => {
    if (doctorId) {
      fetchAcceptedAppointments();
    }
  }, [doctorId]);

  useEffect(() => {
    if (selectedAppointment) {
      // Log patient ID for debugging
      const patientIdValue = typeof selectedAppointment.patientId === 'string' 
        ? selectedAppointment.patientId 
        : selectedAppointment.patientId?._id;
      
      console.log("=== CONSULTATION CHAT OPENED ===");
      console.log("Appointment ID:", selectedAppointment._id);
      console.log("Patient ID:", patientIdValue || selectedAppointment.patientId);
      console.log("Full Patient Data:", selectedAppointment.patientId);
      console.log("==================================");
      
      fetchMessages(selectedAppointment._id);
      fetchConsultationDetails(selectedAppointment._id);
      
      // Ensure patientId is populated - fetch appointment details if missing
      // Only fetch if we haven't already fetched this appointment and it's missing patientId
      if (
        !fetchedAppointmentsRef.current.has(selectedAppointment._id) &&
        (!selectedAppointment.patientId || typeof selectedAppointment.patientId === 'string')
      ) {
        fetchedAppointmentsRef.current.add(selectedAppointment._id);
        fetchAppointmentDetails(selectedAppointment._id);
      }
      
      // Set up real-time polling for messages (every 10 seconds)
      const interval = setInterval(() => {
        fetchMessages(selectedAppointment._id, true);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedAppointment]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchAcceptedAppointments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/appointment/doctor/${doctorId}`,
      );
      // Filter for accepted appointments
      const accepted = response.data.filter(
        (apt) => apt.requestStatus === "Accepted",
      );

      setAppointments(accepted);

      // Auto-select first appointment if available
      if (accepted.length > 0) {
        const firstAppointment = accepted[0];
        setSelectedAppointment(firstAppointment);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load consultations");
      toast.error("Failed to load consultations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (appointmentId, silent = false) => {
    try {
      if (!silent) setSendingMessage(true);
      const response = await axiosInstance.get(
        `/consultation/${appointmentId}`,
      );
      setMessages(response.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
      if (!silent) toast.error("Failed to load messages");
    } finally {
      if (!silent) setSendingMessage(false);
    }
  };

  const fetchConsultationDetails = async (appointmentId) => {
    try {
      const response = await axiosInstance.get(
        `/consultation/${appointmentId}`,
      );
      if (response.data && response.data.length > 0) {
        const consultation = response.data[0];
        setConsultationDetails({
          notes: consultation.notes || null,
          prescription: consultation.prescription || null,
        });
      }
    } catch (err) {
      console.error("Error fetching consultation details:", err);
    }
  };

  const fetchAppointmentDetails = async (appointmentId) => {
    try {
      const response = await axiosInstance.get(
        `/appointment/${appointmentId}`,
      );
      // Store in cache instead of updating selectedAppointment to avoid infinite loops
      if (response.data) {
        console.log("✓ Backend appointment details fetched:");
        console.log("  ID:", response.data._id);
        console.log("  Patient ID:", response.data.patientId);
        console.log("  Full response:", response.data);
        
        setAppointmentDetailsCache(prev => ({
          ...prev,
          [appointmentId]: response.data
        }));
      }
    } catch (err) {
      console.error("✗ Error fetching appointment details:", err);
    }
  };

  // Function to determine if message is from doctor (current user)
  const isMessageFromDoctor = (message) => {
    return message.messagedBy === "doctor";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && !uploadingFile) return;
    if (!selectedAppointment) {
      toast.error("No appointment selected");
      return;
    }

    try {
      setSendingMessage(true);

      // Extract patientId - handle different data structures
      let patientId = null;
      
      if (typeof selectedAppointment.patientId === 'string') {
        patientId = selectedAppointment.patientId;
      } else if (selectedAppointment.patientId && typeof selectedAppointment.patientId === 'object') {
        patientId = selectedAppointment.patientId._id;
      }

      // If patientId is still missing, try to get it from the cached details
      if (!patientId && appointmentDetailsCache[selectedAppointment._id]) {
        const cachedDetails = appointmentDetailsCache[selectedAppointment._id];
        if (typeof cachedDetails.patientId === 'string') {
          patientId = cachedDetails.patientId;
        } else if (cachedDetails.patientId && typeof cachedDetails.patientId === 'object') {
          patientId = cachedDetails.patientId._id;
        }
      }

      // If patientId is still missing, try to get it from existing messages
      if (!patientId && messages.length > 0) {
        const msg = messages.find(m => m.patientId);
        if (msg) {
          patientId = typeof msg.patientId === 'string' ? msg.patientId : msg.patientId._id;
        }
      }

      // Log attempts to find patientId
      console.log("📤 ATTEMPTING TO SEND MESSAGE:");
      console.log("  doctorId:", doctorId);
      console.log("  patientId (from appointment):", selectedAppointment.patientId);
      console.log("  patientId (extracted):", patientId);
      console.log("  appointmentId:", selectedAppointment._id);
      console.log("  appointmentDetailsCache:", appointmentDetailsCache[selectedAppointment._id]);

      // Validate required fields
      if (!doctorId) {
        toast.error("Doctor ID not found. Please log in again.");
        setSendingMessage(false);
        return;
      }
      
      if (!patientId) {
        toast.error("Patient ID not found. Please select an appointment again.");
        setSendingMessage(false);
        return;
      }
      
      if (!selectedAppointment._id) {
        toast.error("Appointment ID not found.");
        setSendingMessage(false);
        return;
      }

      const messageData = {
        appointmentId: selectedAppointment._id,
        doctorId: doctorId,
        patientId: patientId,
        message: newMessage.trim(),
        messagedBy: "doctor",
        consultationType: "Chat",
        read: false
      };

      console.log("📤 Sending message with data:", messageData);

      const response = await axiosInstance.post(
        "/consultation/message",
        messageData,
      );

      console.log("✓ Message sent successfully! Response:", response.data);

      // Add the new message to the list
      setMessages((prev) => [...prev, response.data.message || response.data]);
      setNewMessage("");

      scrollToBottom();
    } catch (err) {
      console.error("✗ Error sending message:", err);
      console.error("  Error details:", err.response?.data || err.message);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    // Handle patientId which could be an object or a string
    let patientId = typeof selectedAppointment.patientId === 'string' 
      ? selectedAppointment.patientId 
      : selectedAppointment.patientId?._id;

    // If missing, check cache
    if (!patientId && appointmentDetailsCache[selectedAppointment._id]) {
      const cached = appointmentDetailsCache[selectedAppointment._id];
      patientId = typeof cached.patientId === 'string' ? cached.patientId : cached.patientId?._id;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("appointmentId", selectedAppointment._id);
    formData.append("doctorId", doctorId);
    formData.append("patientId", patientId);
    formData.append("messagedBy", "doctor");
    formData.append("consultationType", "Chat");

    try {
      setUploadingFile(true);
      const response = await axiosInstance.post(
        "/consultation/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setMessages((prev) => [...prev, response.data.message || response.data]);
      toast.success("File uploaded successfully");
    } catch (err) {
      console.error("Error uploading file:", err);
      toast.error(err.response?.data?.message || "Failed to upload file");
    } finally {
      setUploadingFile(false);
      fileInputRef.current.value = "";
    }
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    
    if (!prescriptionData.medicines.trim()) {
      toast.error("Please add medicines");
      return;
    }

    try {
      setSendingMessage(true);
      
      // Handle patientId which could be an object or a string
      let patientId = typeof selectedAppointment.patientId === 'string' 
        ? selectedAppointment.patientId 
        : selectedAppointment.patientId?._id;

      // If missing, check cache
      if (!patientId && appointmentDetailsCache[selectedAppointment._id]) {
        const cached = appointmentDetailsCache[selectedAppointment._id];
        patientId = typeof cached.patientId === 'string' ? cached.patientId : cached.patientId?._id;
      }

      const prescriptionPayload = {
        appointmentId: selectedAppointment._id,
        patientId: patientId,
        doctorId: doctorId,
        medicines: prescriptionData.medicines,
        notes: prescriptionData.notes,
        followUpDate: prescriptionData.followUpDate || null
      };

      const response = await axiosInstance.post('/medicine/add', prescriptionPayload);
      
      toast.success("Prescription added successfully");
      setShowPrescriptionModal(false);
      setPrescriptionData({ medicines: "", notes: "", followUpDate: "" });
      
      // Send a message about prescription
      const messageData = {
        appointmentId: selectedAppointment._id,
        doctorId: doctorId,
        patientId: patientId,
        message: "📋 I've added a prescription for you. Please check it in the prescriptions section.",
        messagedBy: "doctor",
        consultationType: "Chat",
        read: false
      };
      
      const messageResponse = await axiosInstance.post("/consultation/message", messageData);
      setMessages((prev) => [...prev, messageResponse.data.message || messageResponse.data]);
      
    } catch (err) {
      console.error("Error adding prescription:", err);
      toast.error("Failed to add prescription");
    } finally {
      setSendingMessage(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach((message) => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split(".").pop()?.toLowerCase();
    if (extension === "pdf") return <FaFilePdf className="text-red-500" />;
    if (["jpg", "jpeg", "png", "gif"].includes(extension))
      return <FaImage className="text-green-500" />;
    return <FaFileAlt className="text-blue-500" />;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="DOCTOR" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading consultations...</p>
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
              onClick={fetchAcceptedAppointments}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="DOCTOR" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
          <div className="flex items-center">
            {!showAppointmentList && (
              <button
                onClick={() => setShowAppointmentList(true)}
                className="mr-3 p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              >
                <FaChevronLeft />
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-800">
              Patient Consultations
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <FaBell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2">
             
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Appointment List Sidebar */}
          <div
            className={`${
              showAppointmentList ? "block" : "hidden lg:block"
            } w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto`}
          >
            <div className="p-4">
              <h2 className="font-semibold text-gray-700 mb-3">
                Active Consultations
              </h2>

              {appointments.length > 0 ? (
                <div className="space-y-2">
                  {appointments.map((appointment) => (
                    <button
                      key={appointment._id}
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowAppointmentList(false);
                        setShowDetails(false);
                      }}
                      className={`w-full p-3 rounded-lg text-left transition ${
                        selectedAppointment?._id === appointment._id
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            appointment.patientId?.image ||
                            "https://via.placeholder.com/40"
                          }
                          alt={appointment.patientId?.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {appointment.patientId?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {appointment.patientId?.email}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            {new Date(
                              appointment.createdAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaStethoscope className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    No active consultations
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Appointments will appear here when patients book
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedAppointment ? (
            <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-white px-4 py-3 border-b flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowAppointmentList(true)}
                    className="p-1 hover:bg-gray-100 rounded-lg lg:hidden"
                  >
                    <FaArrowLeft size={16} />
                  </button>
                  <img
                    src={
                      selectedAppointment.patientId?.image ||
                      "https://via.placeholder.com/40"
                    }
                    alt={selectedAppointment.patientId?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {selectedAppointment.patientId?.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Patient • {selectedAppointment.patientId?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPrescriptionModal(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                    title="Add Prescription"
                  >
                    <FaPrescriptionBottle size={18} />
                  </button>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  >
                    <FaInfoCircle size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                  >
                    {Object.keys(messageGroups).length > 0 ? (
                      Object.entries(messageGroups).map(
                        ([date, dateMessages]) => (
                          <div key={date}>
                            <div className="flex justify-center mb-4">
                              <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                {date}
                              </span>
                            </div>
                            {dateMessages.map((message, index) => {
                              const fromDoctor = isMessageFromDoctor(message);
                              
                              return (
                                <div
                                  key={message._id || index}
                                  className={`flex ${fromDoctor ? "justify-end" : "justify-start"} mb-3`}
                                >
                                  {!fromDoctor && (
                                    <img
                                      src={
                                        selectedAppointment.patientId?.image ||
                                        "https://via.placeholder.com/32"
                                      }
                                      alt="Patient"
                                      className="w-8 h-8 rounded-full mr-2 self-end"
                                    />
                                  )}
                                  <div
                                    className={`max-w-[70%] ${
                                      fromDoctor ? "order-2" : "order-1"
                                    }`}
                                  >
                                    <div
                                      className={`p-3 rounded-lg ${
                                        fromDoctor
                                          ? "bg-blue-600 text-white rounded-br-none"
                                          : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                                      }`}
                                    >
                                      <p className="text-sm whitespace-pre-wrap break-words">
                                        {message.message}
                                      </p>
                                    </div>
                                    <p
                                      className={`text-xs text-gray-500 mt-1 ${
                                        fromDoctor ? "text-right" : "text-left"
                                      }`}
                                    >
                                      {formatTime(message.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ),
                      )
                    ) : (
                      <div className="text-center py-8">
                        <FaComments className="text-4xl text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Start the conversation with the patient
                        </p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="bg-white px-4 py-3 border-t">
                    <form
                      onSubmit={handleSendMessage}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploadingFile}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 disabled:opacity-50"
                      >
                        {uploadingFile ? (
                          <FaSpinner className="animate-spin" size={18} />
                        ) : (
                          <FaPaperclip size={18} />
                        )}
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={
                          !newMessage.trim() || sendingMessage || uploadingFile
                        }
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingMessage ? (
                          <FaSpinner className="animate-spin" size={18} />
                        ) : (
                          <FaPaperPlane size={18} />
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Consultation Details Sidebar */}
                {showDetails && (
                  <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">
                          Patient Details
                        </h3>
                        <button
                          onClick={() => setShowDetails(false)}
                          className="p-1 hover:bg-gray-100 rounded-lg lg:hidden"
                        >
                          <FaChevronRight />
                        </button>
                      </div>

                      {/* Patient Info */}
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-blue-600 mb-1">Patient</p>
                        <p className="font-medium text-gray-800">
                          {selectedAppointment.patientId?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedAppointment.patientId?.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedAppointment.patientId?.mobileNumber}
                        </p>
                      </div>

                      {/* Appointment Info */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-gray-500 mb-2">
                          Appointment Details
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <FaCalendarAlt
                              className="text-gray-400 mr-2"
                              size={12}
                            />
                            <span>
                              {new Date(
                                selectedAppointment.appointmentDate,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <FaClock className="text-gray-400 mr-2" size={12} />
                            <span>
                              {new Date(
                                selectedAppointment.appointmentDate,
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <FaHourglassHalf className="text-gray-400 mr-2" size={12} />
                            <span className="capitalize">
                              {selectedAppointment.consultationType || "Video"} Consultation
                            </span>
                          </div>
                          {selectedAppointment.symptoms && (
                            <div className="text-sm">
                              <span className="font-medium">Symptoms:</span>
                              <p className="text-gray-600 mt-1">
                                {selectedAppointment.symptoms}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Message Stats */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-2">
                          Conversation Stats
                        </p>
                        <p className="text-sm text-gray-700">
                          Total Messages: {messages.length}
                        </p>
                        <p className="text-sm text-gray-700">
                          Your Messages:{" "}
                          {
                            messages.filter((m) => m.messagedBy === "doctor")
                              .length
                          }
                        </p>
                        <p className="text-sm text-gray-700">
                          Patient's Messages:{" "}
                          {
                            messages.filter((m) => m.messagedBy === "patient")
                              .length
                          }
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <button
                        onClick={() => setShowPrescriptionModal(true)}
                        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                      >
                        <FaPrescriptionBottle className="mr-2" />
                        Add Prescription
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <FaComments className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Select a consultation to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add Prescription</h2>
                <button 
                  onClick={() => setShowPrescriptionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle size={20} />
                </button>
              </div>

              {/* Patient Info Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={selectedAppointment.patientId?.image || 'https://via.placeholder.com/40'}
                    alt={selectedAppointment.patientId?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{selectedAppointment.patientId?.name}</p>
                    <p className="text-sm text-gray-600">{selectedAppointment.patientId?.email}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddPrescription}>
                {/* Medicines */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaPrescriptionBottle className="inline mr-2 text-blue-600" />
                    Prescribed Medicines *
                  </label>
                  <textarea
                    value={prescriptionData.medicines}
                    onChange={(e) => setPrescriptionData({...prescriptionData, medicines: e.target.value})}
                    rows="5"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter medicines with dosage, frequency, and duration&#10;Example:&#10;- Amoxicillin 500mg - Twice daily for 7 days&#10;- Paracetamol 650mg - As needed for fever&#10;- Vitamin C supplements - Once daily"
                    required
                  />
                </div>

                {/* Additional Notes */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    <FaNotesMedical className="inline mr-2 text-blue-600" />
                    Additional Notes / Instructions
                  </label>
                  <textarea
                    value={prescriptionData.notes}
                    onChange={(e) => setPrescriptionData({...prescriptionData, notes: e.target.value})}
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
                    value={prescriptionData.followUpDate}
                    onChange={(e) => setPrescriptionData({...prescriptionData, followUpDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingMessage}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {sendingMessage ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="mr-2" />
                        Save Prescription
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationChat;