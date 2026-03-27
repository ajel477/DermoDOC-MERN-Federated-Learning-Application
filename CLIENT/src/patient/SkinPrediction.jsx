// patient/SkinPrediction.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FaCloudUploadAlt,
  FaCamera,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaHeartbeat,
  FaUserMd,
  FaCalendarAlt,
  FaDownload,
  FaShare,
  FaHistory,
  FaChartLine,
  FaBell,
  FaInfoCircle,
  FaTrash,
  FaRedo,
  FaFileImage,
  FaSearch,
  FaMicroscope,
  FaStethoscope,
  FaPrescriptionBottle,
  FaNotesMedical,
  FaSave,
  FaClock,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import axiosInstance from "../AuthenticationPages/axiosConfig";
import Sidebar from "../Sidebar";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

const SkinPrediction = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [analysisDetails, setAnalysisDetails] = useState(null);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  // Get patient data from localStorage
  const patientData = JSON.parse(localStorage.getItem("UserData") || "{}").user;
  const patientId = patientData?._id;

  // ML API endpoint
  const ML_API_URL = "http://127.0.0.1:5000/predict";

  // Backend API base URL
  const API_BASE_URL = "http://localhost:8000";

  // Disease information database (for educational purposes)
  const diseaseInfo = {
    "Actinic Keratosis": {
      description:
        "A rough, scaly patch on the skin that develops from years of sun exposure. It's considered precancerous.",
      symptoms: [
        "Rough, dry, scaly patches",
        "Flat or slightly raised",
        "Pink, red, or brown color",
        "Itching or burning",
      ],
      treatment: [
        "Cryotherapy (freezing)",
        "Topical medications",
        "Photodynamic therapy",
        "Laser therapy",
      ],
      riskFactors: [
        "Prolonged sun exposure",
        "Fair skin",
        "Weakened immune system",
        "Age over 40",
      ],
      prevention: [
        "Use sunscreen daily",
        "Wear protective clothing",
        "Avoid tanning beds",
        "Regular skin checks",
      ],
    },
    "Basal Cell Carcinoma": {
      description:
        "The most common type of skin cancer. It begins in the basal cells and typically develops on sun-exposed areas.",
      symptoms: [
        "Pearl-like bump",
        "Flat, flesh-colored lesion",
        "Sores that bleed or crust",
        "Scar-like area",
      ],
      treatment: [
        "Surgical excision",
        "Mohs surgery",
        "Radiation therapy",
        "Topical treatments",
      ],
      riskFactors: [
        "Chronic sun exposure",
        "Fair skin",
        "Radiation exposure",
        "Family history",
      ],
      prevention: [
        "Sun protection",
        "Regular skin exams",
        "Avoid tanning",
        "Monitor skin changes",
      ],
    },
    "Benign Keratosis": {
      description:
        "Non-cancerous skin growths that appear as waxy, scaly, slightly elevated growths.",
      symptoms: [
        "Waxy, stuck-on appearance",
        "Light tan to dark brown",
        "Round or oval shape",
        "Itching",
      ],
      treatment: [
        "No treatment needed",
        "Cryotherapy",
        "Curettage",
        "Laser removal",
      ],
      riskFactors: ["Aging", "Family history", "Sun exposure"],
      prevention: ["Not preventable", "Regular monitoring"],
    },
    Dermatofibroma: {
      description:
        "Common benign skin growth that often appears on the legs. They are firm to the touch.",
      symptoms: [
        "Small, firm bump",
        "Reddish-brown color",
        "Dimples when squeezed",
        "May itch",
      ],
      treatment: ["Usually no treatment", "Surgical removal", "Cryotherapy"],
      riskFactors: ["Minor injuries", "Insect bites", "Unknown causes"],
      prevention: ["Not preventable"],
    },
    Melanoma: {
      description:
        "The most serious type of skin cancer that develops in melanocytes. Early detection is crucial.",
      symptoms: [
        "Asymmetrical shape",
        "Irregular borders",
        "Multiple colors",
        "Large diameter",
        "Evolving changes",
      ],
      treatment: [
        "Surgical excision",
        "Immunotherapy",
        "Targeted therapy",
        "Chemotherapy",
      ],
      riskFactors: [
        "UV exposure",
        "Many moles",
        "Fair skin",
        "Family history",
        "Weakened immune system",
      ],
      prevention: [
        "Sun protection",
        "Regular skin checks",
        "Avoid tanning",
        "Monitor moles",
      ],
    },
    "Melanocytic Nevi": {
      description:
        "Common moles that are usually benign collections of pigment-producing cells.",
      symptoms: [
        "Round or oval shape",
        "Even color",
        "Flat or raised",
        "Stable appearance",
      ],
      treatment: ["No treatment needed", "Removal if suspicious"],
      riskFactors: ["Sun exposure", "Genetics", "Hormonal changes"],
      prevention: ["Sun protection", "Regular monitoring"],
    },
    "Vascular Lesions": {
      description:
        "Abnormal growths of blood vessels in the skin, including hemangiomas and angiomas.",
      symptoms: [
        "Red or purple color",
        "Flat or raised",
        "May bleed",
        "Warm to touch",
      ],
      treatment: ["Laser therapy", "Sclerotherapy", "Surgical removal"],
      riskFactors: ["Genetics", "Age", "Hormonal changes"],
      prevention: ["Not preventable"],
    },
  };

  // Fetch prediction history on component mount
  useEffect(() => {
    if (patientId) {
      fetchPredictionHistory();
    }
  }, [patientId]);

  // Fetch prediction history from backend
  const fetchPredictionHistory = async () => {
    try {
      setFetchingHistory(true);
      const response = await axiosInstance.get(
        `/prediction/history/${patientId}`,
      );

      // Transform the data to include full image URL
      const historyWithPreviews = response.data.map((item) => ({
        ...item,
        imageUrl: item.image ? `${API_BASE_URL}${item.image}` : null,
        // Map the fields to match the prediction object structure
        class_name: item.predictedDisease || item.class_name,
        confidence: item.confidence,
        timestamp: item.createdAt || item.timestamp,
      }));

      setPredictionHistory(historyWithPreviews);
    } catch (err) {
      console.error("Error fetching prediction history:", err);
      toast.error("Failed to load prediction history");
    } finally {
      setFetchingHistory(false);
    }
  };

  // Save prediction to backend
  const savePrediction = async (predictionData, imageFile) => {
    try {
      setSaving(true);

      // Create FormData for file upload
      const formData = new FormData();
      
      // Append the image file
      if (imageFile) {
        formData.append("image", imageFile);
      }
      
      // Create prediction details object
      const predictionDetails = {
        patientId: patientId,
        predictedDisease: predictionData.class_name,
        confidence: predictionData.confidence,
        timestamp: new Date().toISOString(),
      };
      
      // Append prediction details as JSON string
      formData.append("predictionDetails", JSON.stringify(predictionDetails));

      const response = await axiosInstance.post("/prediction/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Prediction saved to history");

      // Refresh history
      fetchPredictionHistory();

      return response.data;
    } catch (err) {
      console.error("Error saving prediction:", err);
      toast.error("Failed to save prediction to history");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetImage(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetImage = (file) => {
    // Check file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, WEBP)");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handlePredict = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(ML_API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        const predictionData = {
          ...response.data,
          timestamp: new Date().toISOString(),
          imageUrl: imagePreview,
        };
        setPrediction(predictionData);

        // Set analysis details
        const diseaseKey = extractDiseaseName(response.data.class_name);
        setAnalysisDetails(diseaseInfo[diseaseKey] || null);

        toast.success("Prediction completed successfully!");

        // Auto-save to history with the original image file
        await savePrediction(predictionData, selectedImage);
      }
    } catch (err) {
      console.error("Error making prediction:", err);
      setError("Failed to get prediction. Please try again.");
      toast.error(
        "Failed to get prediction. Please check if the ML server is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const extractDiseaseName = (className) => {
    // Extract main disease name from class string
    // Example: "4. Basal Cell Carcinoma (BCC) 3323" -> "Basal Cell Carcinoma"
    const match = className.match(/\d+\.\s*([^(]+)/);
    if (match) {
      return match[1].trim();
    }
    return className;
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setPrediction(null);
    setError(null);
    setAnalysisDetails(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadReport = () => {
    if (!prediction) return;

    const reportContent = `
SKIN DISEASE PREDICTION REPORT
===============================
Date: ${new Date(prediction.timestamp).toLocaleString()}
Patient: ${patientData?.name || "N/A"}
Patient ID: ${patientId || "N/A"}

PREDICTION RESULTS
------------------
Disease: ${prediction.class_name}
Confidence: ${(prediction.confidence * 100).toFixed(2)}%
Image: ${prediction.img_url}

DISEASE INFORMATION
-------------------
${analysisDetails?.description || "Information not available"}

RISK FACTORS
------------
${analysisDetails?.riskFactors?.map((f) => `• ${f}`).join("\n") || "N/A"}

SYMPTOMS
--------
${analysisDetails?.symptoms?.map((s) => `• ${s}`).join("\n") || "N/A"}

TREATMENT OPTIONS
-----------------
${analysisDetails?.treatment?.map((t) => `• ${t}`).join("\n") || "N/A"}

PREVENTION
----------
${analysisDetails?.prevention?.map((p) => `• ${p}`).join("\n") || "N/A"}

DISCLAIMER: This is an AI-powered screening tool and not a definitive diagnosis.
Please consult a dermatologist for proper medical advice.
    `;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `skin_prediction_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Report downloaded successfully");
  };

  const handleShare = async () => {
    if (navigator.share && prediction) {
      try {
        await navigator.share({
          title: "Skin Disease Prediction Result",
          text: `Prediction: ${prediction.class_name}\nConfidence: ${(prediction.confidence * 100).toFixed(2)}%`,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      navigator.clipboard.writeText(
        `Skin Disease Prediction: ${prediction?.class_name} with ${(prediction?.confidence * 100).toFixed(2)}% confidence`,
      );
      toast.info("Result copied to clipboard");
    }
  };

  const handleViewHistoryItem = (item) => {
    setPrediction(item);
    const diseaseKey = extractDiseaseName(item.class_name || item.predictedDisease);
    setAnalysisDetails(diseaseInfo[diseaseKey] || null);
    setImagePreview(item.imageUrl);
    setActiveTab("upload");
  };

  const handleDeleteHistoryItem = async (itemId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this prediction from history?",
      )
    ) {
      return;
    }

    try {
      // You'll need to add a delete endpoint on the backend
      // await axiosInstance.delete(`/prediction/${itemId}`);
      toast.success("Prediction deleted from history");
      fetchPredictionHistory();
    } catch (err) {
      console.error("Error deleting prediction:", err);
      toast.error("Failed to delete prediction");
    }
  };

  // Chart data for confidence
  const confidenceChartData = {
    labels: ["Confidence", "Uncertainty"],
    datasets: [
      {
        data: [
          prediction?.confidence * 100 || 0,
          100 - (prediction?.confidence * 100 || 0),
        ],
        backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(209, 213, 219, 0.8)"],
        borderWidth: 0,
      },
    ],
  };

  // Chart data for history trends
  const historyChartData = {
    labels: predictionHistory
      .slice(-7)
      .map((item) => new Date(item.timestamp || item.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: "Confidence %",
        data: predictionHistory.slice(-7).map((item) => item.confidence * 100),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="PATIENT" />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Skin Disease Prediction
            </h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <FaBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src={patientData?.image || "https://via.placeholder.com/40"}
                  alt={patientData?.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {patientData?.name}
                  </p>
                  <p className="text-xs text-gray-500">Patient</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-8 border-b flex space-x-6">
            <button
              onClick={() => setActiveTab("upload")}
              className={`py-3 px-1 font-medium text-sm border-b-2 transition ${
                activeTab === "upload"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaCloudUploadAlt className="inline mr-2" />
              Upload Image
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-3 px-1 font-medium text-sm border-b-2 transition ${
                activeTab === "history"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaHistory className="inline mr-2" />
              History ({predictionHistory.length})
            </button>
            <button
              onClick={() => setActiveTab("trends")}
              className={`py-3 px-1 font-medium text-sm border-b-2 transition ${
                activeTab === "trends"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaChartLine className="inline mr-2" />
              Trends
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`py-3 px-1 font-medium text-sm border-b-2 transition ${
                activeTab === "info"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaInfoCircle className="inline mr-2" />
              About
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {activeTab === "upload" && (
            <div className="max-w-4xl mx-auto">
              {/* Upload Area */}
              <div
                ref={dropAreaRef}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 mb-6 text-center transition ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : imagePreview
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-blue-400"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-96 mx-auto rounded-lg shadow-lg"
                    />
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center"
                      >
                        <FaRedo className="mr-2" />
                        Choose Another
                      </button>
                      <button
                        onClick={handlePredict}
                        disabled={loading || saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Analyzing...
                          </>
                        ) : saving ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaMicroscope className="mr-2" />
                            Analyze Image
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="cursor-pointer"
                  >
                    <FaCloudUploadAlt className="text-6xl text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports: JPEG, PNG, WEBP (Max 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                  <div className="flex items-center">
                    <FaExclamationCircle className="text-red-500 mr-3" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Prediction Results */}
              {prediction && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">
                          Analysis Complete
                        </h2>
                        <p className="text-green-100">
                          {new Date(prediction.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {saving && (
                        <div className="bg-green-500 rounded-lg px-3 py-1 flex items-center">
                          <FaSpinner className="animate-spin mr-2" />
                          <span className="text-sm">Saving...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Result Card */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Prediction Result
                        </h3>
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">
                            Detected Condition
                          </p>
                          <p className="text-xl font-bold text-gray-800">
                            {prediction.class_name}
                          </p>
                        </div>

                        {/* Confidence Gauge */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">
                            Confidence Level
                          </p>
                          <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                              <div>
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                                  {(prediction.confidence * 100).toFixed(2)}% Confident
                                </span>
                              </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                              <div
                                style={{ width: `${prediction.confidence * 100}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Image URL */}
                        {prediction.img_url && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600">
                              Image Reference
                            </p>
                            <p className="text-xs text-gray-500 break-all">
                              {prediction.img_url}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-3 mt-6">
                          <button
                            onClick={handleDownloadReport}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                          >
                            <FaDownload className="mr-2" />
                            Report
                          </button>
                          <button
                            onClick={handleShare}
                            className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center"
                          >
                            <FaShare className="mr-2" />
                            Share
                          </button>
                        </div>
                      </div>

                      {/* Confidence Chart */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Confidence Analysis
                        </h3>
                        <div className="w-48 mx-auto">
                          <Doughnut
                            data={confidenceChartData}
                            options={{
                              cutout: "70%",
                              plugins: {
                                legend: { display: false },
                              },
                            }}
                          />
                        </div>
                        <div className="text-center mt-4">
                          <p className="text-sm text-gray-600">
                            {prediction.confidence * 100 >= 90
                              ? "High Confidence"
                              : prediction.confidence * 100 >= 70
                                ? "Moderate Confidence"
                                : "Low Confidence - Please Consult Doctor"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Disease Information */}
                    {analysisDetails && (
                      <div className="mt-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          About {extractDiseaseName(prediction.class_name)}
                        </h3>

                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-gray-700">
                            {analysisDetails.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysisDetails.symptoms && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                                <FaHeartbeat className="text-red-500 mr-2" />
                                Common Symptoms
                              </h4>
                              <ul className="space-y-1">
                                {analysisDetails.symptoms.map(
                                  (symptom, idx) => (
                                    <li
                                      key={idx}
                                      className="text-sm text-gray-600 flex items-start"
                                    >
                                      <span className="text-red-500 mr-2">
                                        •
                                      </span>
                                      {symptom}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                          {analysisDetails.riskFactors && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                                <FaExclamationCircle className="text-yellow-500 mr-2" />
                                Risk Factors
                              </h4>
                              <ul className="space-y-1">
                                {analysisDetails.riskFactors.map(
                                  (risk, idx) => (
                                    <li
                                      key={idx}
                                      className="text-sm text-gray-600 flex items-start"
                                    >
                                      <span className="text-yellow-500 mr-2">
                                        •
                                      </span>
                                      {risk}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysisDetails.treatment && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                                <FaPrescriptionBottle className="text-green-500 mr-2" />
                                Treatment Options
                              </h4>
                              <ul className="space-y-1">
                                {analysisDetails.treatment.map(
                                  (treatment, idx) => (
                                    <li
                                      key={idx}
                                      className="text-sm text-gray-600 flex items-start"
                                    >
                                      <span className="text-green-500 mr-2">
                                        •
                                      </span>
                                      {treatment}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                          {analysisDetails.prevention && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                                <FaCheckCircle className="text-blue-500 mr-2" />
                                Prevention
                              </h4>
                              <ul className="space-y-1">
                                {analysisDetails.prevention.map((item, idx) => (
                                  <li
                                    key={idx}
                                    className="text-sm text-gray-600 flex items-start"
                                  >
                                    <span className="text-blue-500 mr-2">
                                      •
                                    </span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4">
                          <p className="text-sm text-yellow-800">
                            <FaInfoCircle className="inline mr-2" />
                            <strong>Disclaimer:</strong> This is an AI-powered
                            screening tool and not a definitive diagnosis.
                            Please consult a dermatologist for proper medical
                            advice and treatment.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Prediction History
              </h2>
              {fetchingHistory ? (
                <div className="text-center py-12">
                  <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading history...</p>
                </div>
              ) : predictionHistory.length > 0 ? (
                <div className="space-y-4">
                  {predictionHistory.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={
                            item.image || "https://via.placeholder.com/60"
                          }
                          alt="Prediction"
                          className="w-16 h-16 rounded-lg object-cover cursor-pointer"
                          onClick={() => handleViewHistoryItem(item)}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/60";
                          }}
                        />
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handleViewHistoryItem(item)}
                        >
                          <p className="font-semibold text-gray-800">
                            {item.predictedDisease || item.class_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Confidence: ${(item.confidence * 100).toFixed(2)}%
                          </p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <FaCalendarAlt className="mr-1" />
                            {new Date(
                              item.createdAt || item.timestamp,
                            ).toLocaleDateString()}
                            <FaClock className="ml-3 mr-1" />
                            {new Date(
                              item.createdAt || item.timestamp,
                            ).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-right">
                            {(item.confidence * 100).toFixed(2)}%
                          <button
                            onClick={() => handleDeleteHistoryItem(item._id)}
                            className="block mt-2 text-red-600 hover:text-red-800"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg">
                  <FaHistory className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No prediction history yet</p>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="mt-4 text-blue-600 hover:text-blue-700"
                  >
                    Upload an image to get started
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "trends" && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Analysis Trends
              </h2>
              {predictionHistory.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Confidence Trend Over Time
                  </h3>
                  <Line
                    data={historyChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            callback: (value) => `${value}%`,
                          },
                        },
                      },
                    }}
                  />
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-700">
                        {predictionHistory.length}
                      </p>
                      <p className="text-sm text-blue-600">Total Predictions</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-700">
                        {Math.max(
                          ...predictionHistory.map((p) => p.confidence * 100),
                        ).toFixed(1)}
                        %
                      </p>
                      <p className="text-sm text-green-600">
                        Highest Confidence
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-700">
                        {(
                            predictionHistory.reduce(
                              (acc, p) => acc + p.confidence * 100,
                              0,
                            ) / predictionHistory.length
                          ).toFixed(1)}%
                      </p>
                      <p className="text-sm text-purple-600">
                        Average Confidence
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg">
                  <FaChartLine className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No trend data available</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Complete more predictions to see trends
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "info" && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                About Skin Diseases
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(diseaseInfo).map(([name, info]) => (
                  <div
                    key={name}
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">{name}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {info.description}
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500">
                        Common Symptoms:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {info.symptoms?.slice(0, 2).map((symptom, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                          >
                            {symptom}
                          </span>
                        ))}
                        {info.symptoms?.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{info.symptoms.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkinPrediction;