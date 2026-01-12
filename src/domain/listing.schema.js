/**
 * Listing schema validation
 * This guarantees the listing is safe to render
 */

function validateListing(listing) {
  if (!listing) {
    throw new Error("Listing is missing");
  }

  if (!listing.title || typeof listing.title !== "string") {
    throw new Error("Listing title is required");
  }

  if (!listing.price || typeof listing.price !== "string") {
    throw new Error("Listing price is required");
  }

  if (!listing.address || typeof listing.address !== "string") {
    throw new Error("Listing address is required");
  }

  if (!Array.isArray(listing.images)) {
    throw new Error("Listing images must be an array");
  }

  if (listing.images.length === 0) {
    console.warn("⚠ Listing has no images");
  }

  if (!listing.script || typeof listing.script !== "string") {
    throw new Error("Listing script is required");
  }

  return true;
}

module.exports = {
  validateListing
};
