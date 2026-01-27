const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function diffFrames(a, b, out) {
  const imgA = sharp(a);
  const imgB = sharp(b);

  const { data: dataA, info } = await imgA.raw().toBuffer({ resolveWithObject: true });
  const { data: dataB } = await imgB.raw().toBuffer();

  const diff = Buffer.alloc(dataA.length);

  let totalDiff = 0;

  for (let i = 0; i < dataA.length; i++) {
    const d = Math.abs(dataA[i] - dataB[i]);
    diff[i] = d;
    totalDiff += d;
  }

  await sharp(diff, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .normalize()
    .toFile(out);

  console.log("Total pixel diff:", totalDiff);
}

(async () => {
  const dir = path.join(
    __dirname,
    "..",
    "uploads",
    "projects",
    "demo",
    "videos",
    "frames"
  );

  const f1 = path.join(dir, "frame_00010.png");
  const f2 = path.join(dir, "frame_00011.png");
  const out = path.join(dir, "diff_10_11.png");

  await diffFrames(f1, f2, out);
})();
