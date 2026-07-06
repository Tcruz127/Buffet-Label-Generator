const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/label-editor.html");
let c = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const from = "  zoom:.92;";
const to   = "  zoom:.80;";

if (!c.includes(from)) { console.error("NOT FOUND"); process.exit(1); }
c = c.replace(from, to);

c = c.replace(/\n/g, "\r\n");
fs.writeFileSync(filePath, c, "utf8");
console.log("Done.");