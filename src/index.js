const fetchListing = require("./services/listing-fetch.service");
const mapListing = require("./domain/listing.mapper");
const { validateListing } = require("./domain/listing.schema");
const writePreview = require("./utils/preview-writer");

async function run() {
  const rawListing = await fetchListing();
  const listing = mapListing(rawListing);

  validateListing(listing);

  writePreview(listing);

  console.log("✅ Listing preview generated");
}

run().catch(console.error);
