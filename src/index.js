const Listing = require("./domain/listing.model");
const renderVideo = require("./pipelines/video.pipeline");
const paths = require("./config/paths.config");
const fs = require("fs");

async function run() {
  const images = fs
    .readdirSync(paths.assets.images)
    .map(f => `${paths.assets.images}/${f}`);

  const listing = new Listing({
    title: "Sample Listing",
    price: "$1,200,000",
    address: "Auckland",
    images,
    script: "Beautiful family home in prime location"
  });

  await renderVideo(listing);

  console.log("✅ Video created successfully");
}

run().catch(console.error);
