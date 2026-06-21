const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;

  let message = err.message || "Internal Server Error";

  // Invalid Mongo ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource id";
  }

  // Duplicate key error
  if (err.code === 11000) {
    statusCode = 400;

    const field = Object.keys(err.keyValue)[0];

    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;

    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  res.status(statusCode).json({
    success: false,
    message,

    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorHandler;
