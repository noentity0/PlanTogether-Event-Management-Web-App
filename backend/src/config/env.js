const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: Number(process.env.PORT || 8001),
  mongoUrl: process.env.MONGO_URL || "mongodb://localhost:27017",
  dbName: process.env.DB_NAME || "plantogether_db",
  jwtSecretKey: process.env.JWT_SECRET_KEY || "change-me-in-production",
  jwtAlgorithm: process.env.JWT_ALGORITHM || "HS256",
  jwtExpireMinutes: Number(process.env.JWT_EXPIRE_MINUTES || 1440),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};
