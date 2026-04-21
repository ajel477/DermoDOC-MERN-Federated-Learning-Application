import express from "express";
import cors from "cors";
import compression from "compression";
import config from "./config";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { TokenInfo } from "./types";
import cookieParser from "cookie-parser";
import {
  FOLDER_PATH,
  blueText,
  greenText,
  redLogger,
  redText,
} from "./constants";
import { memberAuthHandler } from "./middlewares/AuthHandler";
import ErrorHandler from "./middlewares/ErrorHandler";
import mongoose from "mongoose";
import CONFIG from "./config";
import { paginationChecker } from "./middlewares/PaginationChecker";
import { Admin } from "./models";
import { hash } from "bcrypt";

const publicFolderPath = path.join(process.cwd(), FOLDER_PATH.PUBLIC); // process.cwd() -> gets the current working directory (BACKEND) and connects it to the public folder. now the currnet directory will be D:\Major Project demo\DermoDoc\CODE\BACKEND\public. 
const uploadFolderPath = path.join(publicFolderPath, FOLDER_PATH.UPLOADS); //takes the newly created publicFolderPath and appends the path for an uploads directory at the end. and now this creates a nested path.   ie D:\Major Project demo\DermoDoc\CODE\BACKEND\public\uploads 
console.log(blueText, "🚀 Application Starting...", blueText);
// 📁 Public Folder Creation
if (!fs.existsSync(publicFolderPath)) {
  fs.mkdirSync(publicFolderPath);
  console.log(blueText, "📁 Public Folder Created", blueText);
} else {
  console.log(blueText, "📁 Public Folder Exists", blueText);
}

if (!fs.existsSync(uploadFolderPath)) {
  fs.mkdirSync(uploadFolderPath);
  console.log(blueText, "📁 Uploads Folder Created", blueText);
} else {
  console.log(blueText, "📁 Uploads Folder Exists", blueText);
}

// This makes your application robust—when you clone this project to a new computer, it automatically creates the required folders on startup so file uploads don't crash the server. 
// Your application uses MongoDB to store data. Databases are incredibly fast and efficient at storing text and structured data (like names, emails, and passwords). However, they are terribly slow and expensive when you try to stuff heavy files into them (like a 5MB high-resolution skin image or a multi-page PDF). The Solution: You save the physical heavy file to the server's hard drive (public/uploads), and you just save a tiny, lightweight text string (the URL link) into the MongoDB database.
//f a patient uploads a photo of a skin condition, that prediction isn't just a one-time event. The application keeps a "Patient History". If the file wasn't stored on your server, there would be no way to show the doctor the image of the patient's skin next week when the doctor reviews the case. By storing it in the backend and linking it via your /static route, both the patient and the doctor can bring up the exact photo at any time.
//Q) y local storage to store images ? y not imagekit or cloud service ?
//A)You are 100% correct. Using a cloud storage service like ImageKit, Cloudinary, or AWS S3 is actually the industry standard and best practice for production web applications, especially for handling heavy images and files. However, no, a cloud service is NOT currently configured in this project.
// When building a prototype or a major project demo, it is much easier and faster to just use local folder storage (public/uploads) via Multer. You don't have to create third-party accounts, set up API keys, or manage cloud storage buckets.
//Cost: Local storage on your own computer is free while you are coding.
//No Network Latency: Uploading to localhost is instant for testing, whereas an upload to ImageKit would depend on your internet speed.

// In a nutshell, 
//The folder creation code in your index.ts exists to automatically set up the "local storage buckets" (the public and uploads folders) so your application can successfully handle, store, and serve image and document data right on your own computer without crashing.
//It is the quick, free, and efficient way to handle file uploads while you're building and testing your "Major Project Demo"!

const corsConfig = {  //good practice for development environment
  credentials: true,
  origin: [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:5173/",
    "http://localhost:5173",

  ],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};

//! 🚀 Create an instance of express
const app = express();

app.use(morgan("dev")); //! 📝 Log HTTP or HTTPS requests

app.use(cors(corsConfig)); //! 📝 Enable Cross-Origin Resource Sharing (CORS)

app.use(express.json()); //! 📝 Parse JSON bodies

app.use(cookieParser()); //! 📝 Parse Cookie headers

app.use(compression()); //! 📝 Compress HTTP or HTTPS responses

app.use("/static", express.static(publicFolderPath)); //! 📝 Serve Static Files,  Serving Files to the Frontend

/**
 * ? 🌐 Global Declaration
 */
declare global {
  namespace Express {
    interface Request {
      user: TokenInfo;
      prevObject: any;
    }
  }
}

// 🔄 Immediately Invoked Function Expression (IIFE) for async initialization
(async () => {
  try {
    // 📦 Database Initialization
    console.log(blueText, "📦  Database Initialization Started", blueText);
    // connecting to database
    await mongoose.connect(CONFIG.DB_URL, {
      maxPoolSize: CONFIG.DB_POOL_SIZE,
    });
    const admin = await Admin.findOne({ email: "admin@gmail.com" });
    if (!admin) {
      await Admin.create({
        name: "Admin",
        email: "admin@gmail.com",
        isApproved: "true",
        password: await hash("admin123", CONFIG.SALT_ROUNDS),
      });
      console.log(greenText, "📦  Admin User Created", greenText);
    }
    console.log(greenText, "📦  Database Initialization Completed", greenText);
    console.log(greenText, `📦  Connected To Database `, greenText);
    // 🌐 Server Initialization
    console.log(
      blueText,
      ` Starting the server on port ${config.PORT}...`,
      blueText
    );
    try {
      app.listen(config.PORT, () => {
        console.log(
          greenText,
          `🎧 Server is listening on port: ${config.PORT} 🚀`,
          greenText
        );
      });
    } catch (error) {
      console.log(
        redText,
        "🚨 Error in server initialization \n",
        JSON.stringify(error).replace(/,|{|}|and/g, "\n"),
        redText
      );
    }
  } catch (error: any) {
    // console.log("🚨 Error in server initialization", error);
    console.log(
      redText,
      "🚨 Error in server initialization \n",
      error?.message || JSON.stringify(error).replace(/,|{|}|and/g, "\n"),
      redText
    );
    console.log(redText, "Full Error Details:", error, redText);
    // 🛑 restart by executing rs in cmd
    redLogger("🛑 Application Stopped due to error in server initialization");
    process.exit(1);
  }
})();

/**
 * ! This is the Health check of the application
 */
app.get("/", (_, res) => {
  res.json({
    status: "OK",
    health: "✅ Good",
    message: `Welcome to the API of ${config.APP_NAME}`,
  });
});

app.use(paginationChecker); //! 🚨 Pagniation Middleware
app.use(memberAuthHandler); //! 🚨 Auth Middleware

app.use("/api/auth", require("./controllers/user").default);
app.use("/api/doctor", require("./controllers/doctor.controller").default);
app.use("/api/patient", require("./controllers/patient.controller").default);
app.use("/api/appointment", require("./controllers/appointment.controller").default);
app.use("/api/consultation", require("./controllers/consultation.controller").default);
app.use("/api/medicine", require("./controllers/medicine.controller").default);
app.use("/api/prediction", require("./controllers/prediction.controller").default);
app.use("/api/payment", require("./controllers/payment.controller").default);
app.use("/api/feedback", require("./controllers/feedback.controller").default);
app.use("/api/patient/stats", require("./controllers/patient.stats.routes").default);
app.use("/api/doctor/stats", require("./controllers/doctor.stats.routes").default);
app.use("/api/admin", require("./controllers/admin.controller").default);




app.use("*", (_, res) => {
  res.status(404).json({
    status: "Not Found",
    health: "❌ Bad",
    msg: `Route Not Found`,
  });
});

//! 🚨 Error Middleware came here and the response is given back
app.use(ErrorHandler);







