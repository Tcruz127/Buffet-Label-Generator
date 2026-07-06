const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/label-editor.html");
let c = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

// The 5870 columnGap was "0.5in" which caused applyGridStyles to inject
// column-gap:0.5in!important into the screen display, creating a large visible gap.
// Avery 5870 has no gap between columns (3.5in+3.5in=7in exactly).
// Fix: set columnGap to "0" so the editor display matches the physical sheet.

// Also fix the static CSS column-gap for consistency (though !important overrides it anyway)

const replacements = [
  // 1. Fix EDITOR_PRINT_TEMPLATES 5870 columnGap
  [
    `"5870": { columns: 2, rows: 5, labelWidth: "3.5in", labelHeight: "2in", columnGap: "0.5in",`,
    `"5870": { columns: 2, rows: 5, labelWidth: "3.5in", labelHeight: "2in", columnGap: "0",`,
  ],
  // 2. Fix static CSS column-gap to match
  [
    `  column-gap:.5in;\n  row-gap:0;\n  justify-content:center;`,
    `  column-gap:0;\n  row-gap:0;\n  justify-content:center;`,
  ],
];

let changed = 0;
for (const [from, to] of replacements) {
  if (!c.includes(from)) {
    console.error("NOT FOUND:\n" + from);
    process.exit(1);
  }
  c = c.replace(from, to);
  changed++;
}

c = c.replace(/\n/g, "\r\n");
fs.writeFileSync(filePath, c, "utf8");
console.log(`Done — ${changed} replacements applied.`);