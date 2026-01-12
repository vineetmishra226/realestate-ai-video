const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "../../config.json");

if (!fs.existsSync(CONFIG_PATH)) {
  throw new Error("config.json not found at project root");
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));

module.exports = config;
