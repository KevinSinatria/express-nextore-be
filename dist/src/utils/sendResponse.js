/**
 * Sends a standardized JSON response format for API endpoints.
 *
 * @param res - The Express Response object
 * @param status - The HTTP status code to send (e.g., 200, 201)
 * @param message - A descriptive message representing the response
 * @param data - Optional data payload to include in the response
 * @param meta - Optional metadata to include (e.g., pagination details)
 * @returns The Express response with the provided status and formatted JSON body
 */
const sendResponse = (res, status, message, data, meta) => {
    return res.status(status).json({
        success: true,
        message,
        data,
        meta,
    });
};
export default sendResponse;
//# sourceMappingURL=sendResponse.js.map