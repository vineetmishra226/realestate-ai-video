const ffmpeg = require("fluent-ffmpeg");
const paths = require("../config/paths.config");

ffmpeg.setFfmpegPath(paths.ffmpeg.bin);
ffmpeg.setFfprobePath(paths.ffmpeg.probe);

module.exports = ffmpeg;
