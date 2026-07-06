const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/label-editor.html");
let c = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const replacements = [
  [
    '"Total labels: " + totalLabels + " • Total sheets: " + Math.ceil(totalLabels / 10);',
    '"Total labels: " + totalLabels + " • Total sheets: " + Math.ceil(totalLabels / labelsPerSheet);',
  ],
  [
    "const totalSheets = Math.ceil(totalLabels / 10);",
    "const totalSheets = Math.ceil(totalLabels / labelsPerSheet);",
  ],
  [
    "for(let offset = 1; offset <= 10; offset++){",
    "for(let offset = 1; offset <= labelsPerSheet; offset++){",
  ],
  [
    "const i = sheetIndex * 10 + offset;",
    "const i = sheetIndex * labelsPerSheet + offset;",
  ],
];

let changed = 0;
for (const [from, to] of replacements) {
  if (!c.includes(from)) {
    console.error("NOT FOUND:", from);
    process.exit(1);
  }
  c = c.replace(from, to);
  changed++;
}

c = c.replace(/\n/g, "\r\n");
fs.writeFileSync(filePath, c, "utf8");
console.log(`Done — ${changed} replacements applied.`);