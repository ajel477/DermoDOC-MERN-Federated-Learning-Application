// patient/ConsultationChat.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FaPaperPlane,
  FaVideo,
  FaPhone,
  FaUserMd,
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

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Get patient data from localStorage
  const patientData = JSON.parse(localStorage.getItem("UserData") || "{}").user;
  const patientId = patientData?._id;

  useEffect(() => {
    if (patientId) {
      fetchAcceptedAppointments();
    }
  }, [patientId]);

  useEffect(() => {
    if (selectedAppointment) {
      fetchMessages(selectedAppointment._id);
      fetchConsultationDetails(selectedAppointment._id);
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
        `/appointment/patient/${patientId}`,
      );
      // Filter for accepted appointments
      const accepted = response.data.filter(
        (apt) => apt.requestStatus === "Accepted",
      );
      setAppointments(accepted);

      // Auto-select first appointment if available
      if (accepted.length > 0) {
        setSelectedAppointment(accepted[0]);
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

  // Function to determine if message is from current patient
  const isMessageFromPatient = (message) => {
    return message.messagedBy === "patient";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && !uploadingFile) return;
    if (!selectedAppointment) return;

    try {
      setSendingMessage(true);

      const messageData = {
        appointmentId: selectedAppointment._id,
        doctorId: selectedAppointment.doctorId._id,
        patientId: patientId,
        message: newMessage.trim(),
        messagedBy: "patient",
        consultationType: "Chat",
        read: false
      };

      const response = await axiosInstance.post(
        "/consultation/message",
        messageData,
      );

      // Add the new message to the list
      setMessages((prev) => [...prev, response.data.message || response.data]);
      setNewMessage("");

      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("appointmentId", selectedAppointment._id);
    formData.append("doctorId", selectedAppointment.doctorId._id);
    formData.append("patientId", patientId);
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
        <Sidebar role="PATIENT" />
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
        <Sidebar role="PATIENT" />
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
      <Sidebar role="PATIENT" />

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
              Consultation Chat
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
                            appointment.doctorId?.image ||
                            "https://via.placeholder.com/40"
                          }
                          alt={appointment.doctorId?.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            Dr. {appointment.doctorId?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {appointment.doctorId?.specialization}
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
                  <button
                    onClick={() =>
                      (window.location.href = "/patient/find-doctors")
                    }
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Book an Appointment
                  </button>
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
                      selectedAppointment.doctorId?.image ||
                      "https://via.placeholder.com/40"
                    }
                    alt={selectedAppointment.doctorId?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Dr. {selectedAppointment.doctorId?.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedAppointment.doctorId?.specialization}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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
                              const isFromPatient = isMessageFromPatient(message);
                              
                              return (
                                <div
                                  key={message._id || index}
                                  className={`flex ${isFromPatient ? "justify-end" : "justify-start"} mb-3`}
                                >
                                  {!isFromPatient && (
                                    <img
                                      src={
                                        selectedAppointment.doctorId?.image ||
                                        "https://via.placeholder.com/32"
                                      }
                                      alt="Doctor"
                                      className="w-8 h-8 rounded-full mr-2 self-end"
                                    />
                                  )}
                                  <div
                                    className={`max-w-[70%] ${
                                      isFromPatient ? "order-1" : "order-2"
                                    }`}
                                  >
                                    <div
                                      className={`p-3 rounded-lg ${
                                        isFromPatient
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
                                        isFromPatient ? "text-right" : "text-left"
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
                          Start the conversation with the doctor
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
                          Consultation Details
                        </h3>
                        <button
                          onClick={() => setShowDetails(false)}
                          className="p-1 hover:bg-gray-100 rounded-lg lg:hidden"
                        >
                          <FaChevronRight />
                        </button>
                      </div>

                      {/* Doctor Info */}
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-blue-600 mb-1">Doctor</p>
                        <p className="font-medium text-gray-800">
                          Dr. {selectedAppointment.doctorId?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedAppointment.doctorId?.specialization}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedAppointment.doctorId?.hospitalName}
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
                            messages.filter((m) => isMessageFromPatient(m))
                              .length
                          }
                        </p>
                        <p className="text-sm text-gray-700">
                          Doctor's Messages:{" "}
                          {
                            messages.filter((m) => !isMessageFromPatient(m))
                              .length
                          }
                        </p>
                      </div>
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
    </div>
  );
};

export default ConsultationChat;