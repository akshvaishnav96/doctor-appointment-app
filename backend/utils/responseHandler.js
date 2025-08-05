/**
 * Sends a standardized success response.
 *
 * @param res - Express response object
 * @param payload - Data to send in the response (defaults to empty object)
 * @param statusCode - HTTP status code (defaults to 200)
 */
export const sendSuccess = (res, payload = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    status: true, // Indicates successful operation
    data: payload, // Actual data payload
  });
};

/**
 * Sends a standardized error response.
 *
 * @param res - Express response object
 * @param error - Error message string or error object
 * @param statusCode - HTTP status code (defaults to 500)
 */
export const sendError = (res, error, statusCode = 500) => {
  let errorMessage = "Internal Server Error";
  let errorDetails = undefined;

  // If error is a string, use it as the message
  if (typeof error === "string") {
    errorMessage = error;

    // If error is an object, extract message and optional details
  } else if (error && typeof error === "object") {
    errorMessage = error.message || errorMessage;
    errorDetails = error.details || undefined;
  }

  return res.status(statusCode).json({
    success: false, // Indicates failure
    error: errorMessage, // Human-readable message
    ...(errorDetails && {
      // Include 'details' only if present
      details: errorDetails,
    }),
  });
};
