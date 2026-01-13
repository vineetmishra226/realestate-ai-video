const express = require("express");
const router = express.Router();

const renderService = require("../services/render.service");

router.post("/", async (req, res) => {
  try {
    const { profile, preset } = req.body;

    const result = await renderService.render({
      profile,
      preset
    });

    res.json({ ok: true, output: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
