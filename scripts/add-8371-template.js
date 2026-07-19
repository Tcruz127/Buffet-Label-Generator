const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/label-editor.html");
let c = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const from = `  "5164": { columns: 2, rows: 3, labelWidth: "4in", labelHeight: "3.333in", columnGap: "0",
            printColumnGap: "0in", marginTop: "0.5in", marginSide: "0.25in",
            gridWidth: "8in", gridHeight: "10in", evenLabelOffset: "" },
};`;

const to = `  "5164": { columns: 2, rows: 3, labelWidth: "4in", labelHeight: "3.333in", columnGap: "0",
            printColumnGap: "0in", marginTop: "0.5in", marginSide: "0.25in",
            gridWidth: "8in", gridHeight: "10in", evenLabelOffset: "" },
  "8371": { columns: 2, rows: 5, labelWidth: "3.5in", labelHeight: "2in", columnGap: "0.2in",
            printColumnGap: "0in", marginTop: "0.5in", marginSide: "0.75in",
            gridWidth: "7in", gridHeight: "10in", evenLabelOffset: "-0.05in" },
};`;

if (!c.includes(from)) { console.error("NOT FOUND"); process.exit(1); }
c = c.replace(from, to);

c = c.replace(/\n/g, "\r\n");
fs.writeFileSync(filePath, c, "utf8");
console.log("Done.");