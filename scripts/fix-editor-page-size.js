const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/label-editor.html");
let c = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

// 1. Fix 8371 entry in EDITOR_PRINT_TEMPLATES: zero margins, add pageWidth/pageHeight
const oldTemplate = `  "8371": { columns: 1, rows: 1, labelWidth: "3.5in", labelHeight: "2in", columnGap: "0",
            printColumnGap: "0in", marginTop: "4.5in", marginSide: "2.5in",
            gridWidth: "3.5in", gridHeight: "2in", evenLabelOffset: "" },`;

const newTemplate = `  "8371": { columns: 1, rows: 1, labelWidth: "3.5in", labelHeight: "2in", columnGap: "0",
            printColumnGap: "0in", marginTop: "0", marginSide: "0",
            pageWidth: "3.5in", pageHeight: "2in",
            gridWidth: "3.5in", gridHeight: "2in", evenLabelOffset: "" },`;

if (!c.includes(oldTemplate)) { console.error("NOT FOUND: 8371 template"); process.exit(1); }
c = c.replace(oldTemplate, newTemplate);

// 2. Add default pageWidth/pageHeight to 5870 and 5164 entries
const old5870 = `  "5870": { columns: 2, rows: 5, labelWidth: "3.5in", labelHeight: "2in", columnGap: "0.2in",
            printColumnGap: "0in", marginTop: "0.5in", marginSide: "0.5in",
            gridWidth: "7in", gridHeight: "10in", evenLabelOffset: "-0.05in" },`;

const new5870 = `  "5870": { columns: 2, rows: 5, labelWidth: "3.5in", labelHeight: "2in", columnGap: "0.2in",
            printColumnGap: "0in", marginTop: "0.5in", marginSide: "0.5in",
            pageWidth: "8.5in", pageHeight: "11in",
            gridWidth: "7in", gridHeight: "10in", evenLabelOffset: "-0.05in" },`;

if (!c.includes(old5870)) { console.error("NOT FOUND: 5870 template"); process.exit(1); }
c = c.replace(old5870, new5870);

const old5164 = `  "5164": { columns: 2, rows: 3, labelWidth: "4in", labelHeight: "3.333in", columnGap: "0",
            printColumnGap: "0in", marginTop: "0.5in", marginSide: "0.25in",
            gridWidth: "8in", gridHeight: "10in", evenLabelOffset: "" },`;

const new5164 = `  "5164": { columns: 2, rows: 3, labelWidth: "4in", labelHeight: "3.333in", columnGap: "0",
            printColumnGap: "0in", marginTop: "0.5in", marginSide: "0.25in",
            pageWidth: "8.5in", pageHeight: "11in",
            gridWidth: "8in", gridHeight: "10in", evenLabelOffset: "" },`;

if (!c.includes(old5164)) { console.error("NOT FOUND: 5164 template"); process.exit(1); }
c = c.replace(old5164, new5164);

// 3. Make popup @page size dynamic
const oldPage = `<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title>Print Buffet Labels</title>\n<style>\n  @page {\n    size: Letter portrait;\n    margin: 0;\n  }`;
const newPage = `<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title>Print Buffet Labels</title>\n<style>\n  @page {\n    size: \${_pt.pageWidth || "8.5in"} \${_pt.pageHeight || "11in"};\n    margin: 0;\n  }`;

if (!c.includes(oldPage)) { console.error("NOT FOUND: @page"); process.exit(1); }
c = c.replace(oldPage, newPage);

// 4. Make .sheet-preview dimensions dynamic
const oldSheetPreview = `    width: 8.5in !important;\n    height: 11in !important;\n    margin: 0 !important;\n    padding: \${_pt.marginTop} \${_pt.marginSide} !important;`;
const newSheetPreview = `    width: \${_pt.pageWidth || "8.5in"} !important;\n    height: \${_pt.pageHeight || "11in"} !important;\n    margin: 0 !important;\n    padding: \${_pt.marginTop} \${_pt.marginSide} !important;`;

if (!c.includes(oldSheetPreview)) { console.error("NOT FOUND: .sheet-preview dimensions"); process.exit(1); }
c = c.replace(oldSheetPreview, newSheetPreview);

c = c.replace(/\n/g, "\r\n");
fs.writeFileSync(filePath, c, "utf8");
console.log("Done — all replacements applied.");