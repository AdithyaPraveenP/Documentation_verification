import {Request, Response, NextFunction} from "express";
//Next Function - Request Response cycle next Middleware details


/**
 * Custom Error class for application-specific errors.
 * Extends native JavaScript Error to add HTTP status codes and operational flags.
 * 
 * Use this for all known, expected error cases in our application (e.g., validation failures, 
 * unauthorized access, etc.) to distinguish them from unexpected programmer errors.
 */

// CLASSES

// Custom Error class for application-specific errors.
export class AppError extends Error {
    statusCode: number;               // send status code
    isOperational: boolean;

    constructor (message: string, statusCode: number, isOperational: boolean = true) {
        super (message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);  //stack trace for where our error was thrown
    }
}

// Custom "Not Found " error for missing Resource it extends AppError
export class NotFoundError extends AppError {
    constructor (resource = "Resource") {   // Deafults to "Resources"
        super (`${resource} not  found`, 404); // sets message + 404 status
    }
}

// Custom error for validation failures (HTTP 400)
export class ValidationError extends AppError {
    details: any[]; // Stores validation error details

    constructor (errors: any[]) {
        super("Validation failed", 400); // Sets message + 400 status
        this.details = errors; // Attaches specific error details
    }
}


//FUNCTIONS

// Helper function to log Error
const errorResponse = (error: any, res : Response) =>   {
    // Log full error details only in development environment
    if (process.env.NODE_ENV === "development") {
        console.error(error);
    }
    // custom Response object for custom error log
    const response: any = {
        success: false,
        message: error.message || "Something went wrong",
    };

    // Add validation error details if applicable
    if (error instanceof ValidationError) {
        response.errors = error.details; //adding field speicifc custom error details into Response 
    }

    // Pass the custom response log if Development environment
    if (process.env.NODE_ENV === "development") {
        response.stack = error.stack;
        // Checking If its an AppError
        if (error instanceof AppError) {
            response.isOperational = error.isOperational; // Set isOperational Status
        }
    }
    // custom status code or Internal Server error as JSON
    res.status(error.stausCode || 500).json(response); 
}


//404 NotFound Error Handler Middleware (The Error Responder)
export const notFoundHandler = (req: Request, res: Response) => {
    errorResponse(new NotFoundError("Endpoint"), res);
};




