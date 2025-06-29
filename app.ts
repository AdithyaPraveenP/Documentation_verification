

import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

// Importing errorHandler from utils
import {notFoundHandler} from "./utils/errorHandler"

const app = express();
dotenv.config();

// Validate required environment variables for the application
const requiredEnvVars = [
    "JWT_SECRET",           // Secret key for JSON Web Token authentication
    "RAZORPAY_KEY_ID",      // Razorpay API key for payment processing
    "RAZORPAY_KEY_SECRET",  // Razorpay secret for secure payment transactions
    "EMAIL_SERVICE",        // Email service provider 
    "EMAIL_USERNAME",       // Username for email service authentication
    "EMAIL_PASSWORD",       // Password for email service authentication 
    "EMAIL_FROM",           // Sender email address for notifications
    "BASE_URL",             // Base URL for the application
    "DATABASE_URL",         // Database connection string
]
// Identify any missing environment variables
const missingEnvVars = requiredEnvVars.filter ( 
    (varName) => !process.env[varName]
)

// Log Missing Environment Variables and exit if any are not set
if (missingEnvVars.length > 0)  {    
    const errorMessage = `Missing ENV Vars:\n${missingEnvVars.join('\n')}`;
    console.error(errorMessage);
    process.exit(1);
}

// Setup Default Port to Environment Variables or 3000
const PORT = process.env.PORT || 3000;

//  trust proxy setup for userIP distingushion
app.set('trust proxy', process.env.NODE_ENV  === 'production' ? 1 : false);

//Rate limit configuration for auth endpoints
const authLimiter = rateLimit (
    {
        windowMs: 15 * 60 * 1000, //15 minutes
        max: 20, //Limit each IP to 20 requests per windowMs
        message: "Too many request from this IP, please try again latter",
        skipSuccessfulRequests: true, // only count failed requests
    }
);

// Security Package
app.use(helmet());

// enable cross origin check
app.use(cors());

// enable json parsing
app.use(express.json());

// MIDDLEWARES

// 404 NotFound Handler
app.use(notFoundHandler);

// Error handler