// Define asyncHandler function that takes a requestHandler function as an argument
  const asyncHandler = (requestHandler) => {
    // Return a new function that accepts req, res, and next parameters
    return (req, res, next) => {
        // Resolve the promise returned by requestHandler and handle any errors
        Promise.resolve(requestHandler(req, res, next)).catch((err) => 
            next(err)
    );
    };
}; 


// Export asyncHandler for use in other parts of the application
export { asyncHandler };





// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}

    /* const asyncHandler = (fn) => async (req, res, next) => {
        try {
            await fn(req, res, next); // Execute the asynchronous function `fn` with `req`, `res`, and `next`
        } catch (error) {
            res.status(err.code || 500).json({ // Set HTTP status code based on `err.code` or default to 500
                success: false,
                message: err.message // Send a JSON response with `success: false` and the error message (`err.message`)
            });
        }
    };
     */