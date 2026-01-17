const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(
  process.cwd(),
  "data",
  "render-jobs.sqlite"
);

require("fs").mkdirSync(path.dirname(dbPath), {
  recursive: true,
});

const db = new Database(dbPath);

module.exports = db;
