export const notFound = (req, res, next) => {
  return res.status(404).json({ success: false, message: "Ruta no encontrada" });
};

export const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";
  res.status(status).json({ success: false, message });
};

