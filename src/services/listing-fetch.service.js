const fs = require("fs");
const path = require("path");

/**
 * Temporary listing fetcher.
 * Later this will fetch from Trade Me / RealEstate websites.
 */
module.exports = async function fetchListing() {
  const filePath = path.join(__dirname, "../../data/sample-listing.json");

  if (!fs.existsSync(filePath)) {
    throw new Error("Sample listing file not found");
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
};
