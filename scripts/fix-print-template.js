const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/label-editor.html");
let c = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const replacements = [
  // 1. Expand EDITOR_PRINT_TEMPLATES with print-specific fields
  [
    `const EDITOR_PRINT_TEMPLATES = {
  "5870": { columns: 2, rows: 5, labelWidth: "3.5in", labelHeight: "2in",     columnGap: "0.5in" },
  "5164": { columns: 2, rows: 3, labelWidth: "4in",   labelHeight: "3.333in", columnGap: "0" },
};`,
    `const EDITOR_PRINT_TEMPLATES = {
  "5870": { columns: 2, rows: 5, labelWidth: "3.5in", labelHeight: "2in", columnGap: "0.5in",
            printColumnGap: "0in", marginTop: "0.5in", marginSide: "0.5in",
            gridWidth: "7in", gridHeight: "10in", evenLabelOffset: "-0.05in" },
  "5164": { columns: 2, rows: 3, labelWidth: "4in", labelHeight: "3.333in", columnGap: "0",
            printColumnGap: "0in", marginTop: "0.5in", marginSide: "0.25in",
            gridWidth: "8in", gridHeight: "10in", evenLabelOffset: "" },
};`,
  ],

  // 2. Inject _pt variable before the printHtml template literal
  [
    `  const printHtml = \``,
    `  const _pt = EDITOR_PRINT_TEMPLATES[printTemplateId] || EDITOR_PRINT_TEMPLATES["5870"];\n  const printHtml = \``,
  ],

  // 3. .sheet-preview padding → dynamic marginTop + marginSide
  [
    `    padding: 0.5in !important;
    box-sizing: border-box !important;
    background: white !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    overflow: hidden !important;
    page-break-after: always !important;`,
    `    padding: \${_pt.marginTop} \${_pt.marginSide} !important;
    box-sizing: border-box !important;
    background: white !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    overflow: hidden !important;
    page-break-after: always !important;`,
  ],

  // 4. .labels grid dimensions → dynamic
  [
    `    grid-template-columns: repeat(2, 3.5in) !important;
    grid-template-rows: repeat(5, 2in) !important;
    column-gap: 0in !important;
    row-gap: 0 !important;
    width: 7in !important;
    height: 10in !important;`,
    `    grid-template-columns: repeat(\${_pt.columns}, \${_pt.labelWidth}) !important;
    grid-template-rows: repeat(\${_pt.rows}, \${_pt.labelHeight}) !important;
    column-gap: \${_pt.printColumnGap} !important;
    row-gap: 0 !important;
    width: \${_pt.gridWidth} !important;
    height: \${_pt.gridHeight} !important;`,
  ],

  // 5. .label dimensions → dynamic
  [
    `    width: 3.5in !important;
    height: 2in !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    page-break-inside: avoid !important;`,
    `    width: \${_pt.labelWidth} !important;
    height: \${_pt.labelHeight} !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    page-break-inside: avoid !important;`,
  ],

  // 6. .label:nth-child(even) alignment offset → conditional
  [
    `  .label:nth-child(even) {
    position: relative !important;
    left: -0.05in !important;
  }`,
    `  \${_pt.evenLabelOffset ? ".label:nth-child(even) { position: relative !important; left: " + _pt.evenLabelOffset + " !important; }" : ""}`,
  ],
];

let changed = 0;
for (const [from, to] of replacements) {
  if (!c.includes(from)) {
    console.error("NOT FOUND:\n" + from.slice(0, 120));
    process.exit(1);
  }
  c = c.replace(from, to);
  changed++;
}

c = c.replace(/\n/g, "\r\n");
fs.writeFileSync(filePath, c, "utf8");
console.log(`Done — ${changed} replacements applied.`);