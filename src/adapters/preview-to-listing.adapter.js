const Listing = require("../domain/listing.model");

/**
 * Converts preview JSON into a Listing domain object
 */
module.exports = function previewToListingAdapter(preview) {
  return new Listing({
    title: preview.title,
    price: preview.price,
    address: preview.address,
    images: preview.images || [],
    script: preview.script || ""
  });
};
