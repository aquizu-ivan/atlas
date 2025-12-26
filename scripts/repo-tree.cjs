const fs = require("node:fs");

const paths = ["apps/api", "apps/web", "docs", ".github/workflows"];
let missing = false;

for (const p of paths) {
  if (fs.existsSync(p)) {
    console.log(p);
  } else {
    console.log(`MISSING: ${p}`);
    missing = true;
  }
}

process.exit(missing ? 1 : 0);
