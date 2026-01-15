const express = require("express");
const path = require("path");
const cors = require("cors");

// Existing routes
const metaRoutes = require("./routes/meta.routes");
const inputRoutes = require("./routes/input.routes");
const renderRoutes = require("./routes/render.routes");

// Upload controller
const uploadImages = require("../src/api/upload-images");

const app = express();
const PORT = 4000;

// ✅ ENABLE CORS (THIS WAS MISSING)
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Parse JSON
app.use(express.json({ limit: "20mb" }));

// Serve frontend (legacy UI if any)
app.use(express.static(path.join(__dirname, "public")));

// Serve uploaded images
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// API routes
app.use("/api/meta", metaRoutes);
app.use("/api/input", inputRoutes);
app.use("/api/render", renderRoutes);

// Image upload API
app.post("/api/upload-images", uploadImages);

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 UI server running at http://localhost:${PORT}`);
});
