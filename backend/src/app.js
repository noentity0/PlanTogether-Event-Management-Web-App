const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const { frontendUrl } = require("./config/env");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");

const app = express();

app.use(
  cors({
    origin: [frontendUrl, "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "PlanTogether backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

app.use(errorHandler);

module.exports = app;
