const fs = require("fs");
const path = require("path");

module.exports = function writePreview(listing) {
  const previewPath = path.join(__dirname, "../../preview/listing-preview.json");

  const preview = {
    title: listing.title,
    price: listing.price,
    address: listing.address,
    images: listing.images,
    script: listing.script
  };

  fs.writeFileSync(previewPath, JSON.stringify(preview, null, 2));
};
