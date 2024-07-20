// Define a class named ApiResponse
class ApiResponse {
    // Constructor method to initialize an instance of ApiResponse
    constructor(statusCode, data, message = "Success") {
        // Initialize properties based on constructor parameters
        this.statusCode = statusCode; // HTTP status code of the response
        this.data = data; // Data payload of the response
        this.message = message; // Optional message describing the response
        this.success = statusCode < 400; // Boolean indicating if the request was successful
    }
}

// Export the ApiResponse class for use in other parts of the application
export { ApiResponse };
