const express = require("express");
const path = require("path");

const metaRoutes = require("./routes/meta.routes");
const inputRoutes = require("./routes/input.routes");
const renderRoutes = require("./routes/render.routes");

const app = express();
const PORT = 3000;

// Fast JSON parsing
app.use(express.json({ limit: "20mb" }));

// API routes
app.use("/api/meta", metaRoutes);
app.use("/api/input", inputRoutes);
app.use("/api/render", renderRoutes);

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 UI server running at http://localhost:${PORT}`);
});
