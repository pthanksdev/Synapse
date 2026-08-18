export function globalErrorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const rawMessage = err.message || "Internal server error";

  console.error(`[Error] ${req.method} ${req.url} >> ${rawMessage}`, err.stack);

  // Do not expose raw internal system error stack/variable names to users on 500 errors
  const userMessage = statusCode === 500
    ? (process.env.NODE_ENV === "development" ? rawMessage : "Something went wrong on the server. Please try again.")
    : rawMessage;

  res.status(statusCode).json({
    success: false,
    message: userMessage,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}
