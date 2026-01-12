const fs = require("fs");
const path = require("path");
const readline = require("readline");

const PREVIEW_PATH = path.join(__dirname, "../../preview/listing-preview.json");

function loadPreview() {
  if (!fs.existsSync(PREVIEW_PATH)) {
    throw new Error("listing-preview.json not found. Run index.js first.");
  }
  return JSON.parse(fs.readFileSync(PREVIEW_PATH, "utf-8"));
}

function savePreview(data) {
  fs.writeFileSync(PREVIEW_PATH, JSON.stringify(data, null, 2));
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve =>
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    })
  );
}

async function runEditor() {
  const listing = loadPreview();

  console.log("\n🟢 CURRENT SCRIPT:");
  console.log(listing.script);

  const newScript = await prompt("\nEnter new script (leave empty to keep current): ");
  if (newScript.trim()) {
    listing.script = newScript.trim();
  }

  console.log("\n🖼 CURRENT IMAGES:");
  listing.images.forEach((img, index) => {
    console.log(`${index + 1}. ${img}`);
  });

  const removeInput = await prompt(
    "\nEnter image numbers to REMOVE (comma separated, or empty to skip): "
  );

  if (removeInput.trim()) {
    const removeIndexes = removeInput
      .split(",")
      .map(i => parseInt(i.trim(), 10) - 1)
      .filter(i => i >= 0 && i < listing.images.length);

    listing.images = listing.images.filter((_, idx) => !removeIndexes.includes(idx));
  }

  console.log("\n🔁 REORDER IMAGES");
  console.log("Enter new order (example: 2,1,3) or leave empty:");

  const reorderInput = await prompt("> ");

  if (reorderInput.trim()) {
    const order = reorderInput
      .split(",")
      .map(i => parseInt(i.trim(), 10) - 1);

    if (order.length === listing.images.length) {
      const reordered = [];
      for (const i of order) {
        if (listing.images[i]) reordered.push(listing.images[i]);
      }
      if (reordered.length === listing.images.length) {
        listing.images = reordered;
      }
    }
  }

  savePreview(listing);
  console.log("\n✅ Preview updated successfully");
}

runEditor().catch(err => {
  console.error("❌ Error:", err.message);
});
