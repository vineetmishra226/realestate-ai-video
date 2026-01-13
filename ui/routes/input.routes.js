const express = require("express");
const router = express.Router();

const sessionState = require("../state/session.state");

// Choose input method
router.post("/method", (req, res) => {
  const { method } = req.body;

  if (!["url", "manual"].includes(method)) {
    return res.status(400).json({ error: "Invalid input method" });
  }

  sessionState.set("inputMethod", method);
  res.json({ ok: true });
});

// Submit listing URL
router.post("/url", (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL required" });
  }

  sessionState.set("listingUrl", url);
  res.json({ ok: true });
});

// Submit manual data (stub for now)
router.post("/manual", (req, res) => {
  const { details, images } = req.body;

  sessionState.set("manualDetails", details || {});
  sessionState.set("manualImages", images || []);

  res.json({ ok: true });
});

module.exports = router;
