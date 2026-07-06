const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/label-editor.html");
let c = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

// The previous patch accidentally replaced the static @media print .label block
// instead of the popup print template literal .label block.
// Fix 1: Restore static @media print .label to valid hardcoded values.
// Fix 2: Replace the correct (popup) .label block with dynamic values.

const replacements = [
  // Fix 1: Restore the static @media print .label (currently has broken literal ${} text)
  [
    `    width: \${_pt.labelWidth} !important;\n    height: \${_pt.labelHeight} !important;\n    box-sizing: border-box !important;\n    overflow: hidden !important;\n    page-break-inside: avoid !important;\n    break-inside: avoid !important;\n    outline: none !important;\n    position: static !important;\n    left: auto !important;\n    margin: 0 !important;\n    border: none !important;\n    border-radius: 0 !important;\n    box-shadow: none !important;\n    background-image: none !important;\n    -webkit-print-color-adjust: exact !important;\n    print-color-adjust: exact !important;`,
    `    width: 3.5in !important;\n    height: 2in !important;\n    box-sizing: border-box !important;\n    overflow: hidden !important;\n    page-break-inside: avoid !important;\n    break-inside: avoid !important;\n    outline: none !important;\n    position: static !important;\n    left: auto !important;\n    margin: 0 !important;\n    border: none !important;\n    border-radius: 0 !important;\n    box-shadow: none !important;\n    background-image: none !important;\n    -webkit-print-color-adjust: exact !important;\n    print-color-adjust: exact !important;`,
  ],

  // Fix 2: Make the popup print template literal .label dimensions dynamic
  [
    `    width: 3.5in !important;\n    height: 2in !important;\n    box-sizing: border-box !important;\n    overflow: hidden !important;\n    page-break-inside: avoid !important;\n    break-inside: avoid !important;\n    outline: none !important;\n    position: static !important;\n    left: auto !important;\n    margin: 0 !important;\n    border: none !important;\n    border-radius: 0 !important;\n    box-shadow: none !important;\n    -webkit-print-color-adjust: exact !important;\n    print-color-adjust: exact !important;`,
    `    width: \${_pt.labelWidth} !important;\n    height: \${_pt.labelHeight} !important;\n    box-sizing: border-box !important;\n    overflow: hidden !important;\n    page-break-inside: avoid !important;\n    break-inside: avoid !important;\n    outline: none !important;\n    position: static !important;\n    left: auto !important;\n    margin: 0 !important;\n    border: none !important;\n    border-radius: 0 !important;\n    box-shadow: none !important;\n    -webkit-print-color-adjust: exact !important;\n    print-color-adjust: exact !important;`,
  ],
];

let changed = 0;
for (const [from, to] of replacements) {
  if (!c.includes(from)) {
    console.error("NOT FOUND (first 120 chars):\n" + from.slice(0, 120).replace(/\n/g, "\\n"));
    process.exit(1);
  }
  c = c.replace(from, to);
  changed++;
}

c = c.replace(/\n/g, "\r\n");
fs.writeFileSync(filePath, c, "utf8");
console.log(`Done — ${changed} replacements applied.`);