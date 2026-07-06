const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/label-editor.html");
let c = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const replacements = [
  [
    `"5870": { columns: 2, rows: 5, labelWidth: "3.5in", labelHeight: "2in", columnGap: "0.1in",`,
    `"5870": { columns: 2, rows: 5, labelWidth: "3.5in", labelHeight: "2in", columnGap: "0.3in",`,
  ],
  [
    `  column-gap:.1in;\n  row-gap:0;\n  justify-content:center;`,
    `  column-gap:.3in;\n  row-gap:0;\n  justify-content:center;`,
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