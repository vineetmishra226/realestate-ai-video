/**
 * Maps raw listing data into domain listing model
 * This file MUST explicitly pass through all allowed fields
 */
module.exports = function mapListing(raw) {
  return {
    title: raw.title || "",
    price: raw.price || "",
    address: raw.address || "",
    images: Array.isArray(raw.images) ? raw.images : [],
    script: raw.script || ""
  };
};
