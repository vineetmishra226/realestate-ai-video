const config = require("../config");

function getVideoResolution() {
  const format = config.video.format;
  const formats = config.video.formats;

  if (!formats[format]) {
    throw new Error(`Unsupported video format: ${format}`);
  }

  return formats[format];
}

module.exports = {
  getVideoResolution
};
