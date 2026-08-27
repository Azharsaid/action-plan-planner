import ExcelJS from "exceljs";

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile("/home/ubuntu/webdev-static-assets/AP27.xlsx");
const data = workbook.getWorksheet("Data");
const key = workbook.getWorksheet("Key");
const headers = Array.from({ length: 20 }, (_, index) => data.getCell(2, index + 1).value);

if (!data || !key) throw new Error("Expected Data and Key worksheets were not found.");
if (headers.length !== 20 || headers[0] !== "Serial" || headers[11] !== "Total Cost") throw new Error("Data sheet headers do not match AP27.");
if (data.getCell("L1").formula !== "SUBTOTAL(9,L3:L175)") throw new Error("AP27 total-cost formula has changed.");
if (key.getCell("A1").value !== "Type of activity" || key.getCell("C1").value !== "Product Group") throw new Error("Key sheet structure does not match AP27.");

console.log("AP27 template check passed: 20 Data headers, Data/Key sheets, and L1 subtotal formula are intact.");
