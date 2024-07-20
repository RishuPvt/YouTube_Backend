// Define a custom error class `ApiError` that extends the built-in `Error` class
class ApiError extends Error {
    constructor(
        statusCode, // HTTP status code to be returned with the error
        message = "Something went wrong", // Optional error message (default: "Something went wrong")
        errors = [], // Optional array of detailed error messages or objects (default: empty array)
        stack = "" // Optional stack trace (default: empty string)
    ) {
        // Call the constructor of the parent class `Error` with the provided error message
        super(message);

        // Initialize custom properties of the error instance
        this.statusCode = statusCode; // HTTP status code of the error
        this.data = null; // Additional data related to the error (not used in this constructor)
        this.message = message; // Error message
        this.success = false; // Indicate the operation was not successful
        this.errors = errors; // Detailed error messages or objects

        // Capture stack trace if provided, otherwise use `Error.captureStackTrace`
        if (stack) {
            this.stack = stack; // Use the provided stack trace
        } else {
            Error.captureStackTrace(this, this.constructor); // Capture the stack trace for the current instance
        }
    }
}

// Export `ApiError` class for use in other parts of the application
export { ApiError };
