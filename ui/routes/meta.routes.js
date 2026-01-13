const express = require("express");
const router = express.Router();

const { PROFILES, PRESETS } = require("../../src/video/video-pipeline");

router.get("/", (_, res) => {
  res.json({
    profiles: Object.keys(PROFILES).map((key) => ({
      id: key,
      label: PROFILES[key].label || key
    })),
    presets: Object.keys(PRESETS).map((key) => ({
      id: key,
      label: PRESETS[key].label || key
    }))
  });
});

module.exports = router;
