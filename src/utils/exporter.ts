import ExcelJS from "exceljs";

export function convertToCSV(data: any[]): string {
  if (!data || !data.length) return "";
  const header = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((val) => {
        if (val instanceof Date) return `"${val.toISOString()}"`;
        if (typeof val === "string") return `"${val.replace(/"/g, '""')}"`;
        if (val === null || val === undefined) return "";
        return val;
      })
      .join(","),
  );
  return [header, ...rows].join("\n");
}

function formatHeader(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

interface ExcelOptions {
  title?: string;
  subtitles?: string[];
  currencyKeys?: string[];
}

export async function convertToExcel(data: any[], options: ExcelOptions = {}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const subtitles = options.subtitles || [];
  const headerRowIndex = 4 + subtitles.length;

  const worksheet = workbook.addWorksheet("Report", {
    views: [{ state: "frozen", ySplit: headerRowIndex, xSplit: 0 }], // Freeze up to header row
  });

  if (!data || !data.length) {
    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  // 1. Add Report Title
  const title = options.title || "Data Report";
  const keys = Object.keys(data[0]);
  const numCols = keys.length;
  
  worksheet.mergeCells(1, 1, 1, numCols);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF111827" } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(1).height = 30;

  // 2. Add Export Date
  worksheet.mergeCells(2, 1, 2, numCols);
  const dateCell = worksheet.getCell(2, 1);
  dateCell.value = `Generated on: ${new Date().toLocaleString("id-ID")}`;
  dateCell.font = { name: "Arial", size: 10, italic: true, color: { argb: "FF6B7280" } };
  dateCell.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(2).height = 20;

  // 3. Add Subtitles
  subtitles.forEach((subtitle, index) => {
    const rowIdx = 3 + index;
    worksheet.mergeCells(rowIdx, 1, rowIdx, numCols);
    const cell = worksheet.getCell(rowIdx, 1);
    cell.value = subtitle;
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF374151" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getRow(rowIdx).height = 20;
  });

  // Empty row for spacing
  const spacingRowIndex = 3 + subtitles.length;
  worksheet.getRow(spacingRowIndex).height = 10;

  // 4. Configure Columns (Header Row)
  worksheet.columns = keys.map((key) => ({
    key,
  }));
  
  const headerRow = worksheet.getRow(headerRowIndex);
  keys.forEach((key, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = formatHeader(key);
  });

  headerRow.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2563EB" }, // Nice Blue
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 30; // Increased height for better readability

  const currencyKeys = options.currencyKeys || [];
  const totals: Record<string, number> = {};
  currencyKeys.forEach(k => totals[k] = 0);

  // 5. Add Data
  data.forEach((rowObj, index) => {
    // Determine row number for data
    const rowNumber = index + headerRowIndex + 1;
    const row = worksheet.getRow(rowNumber);
    
    keys.forEach((key, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      const val = rowObj[key];
      cell.value = val;

      // Collect totals
      if (typeof val === "number" && currencyKeys.includes(key)) {
        totals[key] += val;
      }
    });

    // Zebra striping
    const isEven = index % 2 === 0;
    row.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: isEven ? "FFFFFFFF" : "FFF9FAFB" } // Pure White or Lighter Gray
    };
    row.font = { name: "Arial", size: 10, color: { argb: "FF374151" } };
    row.alignment = { vertical: "middle", indent: 1 }; // indent gives horizontal left-padding
    row.height = 22; // Comfortable breathing room for data rows
  });

  // 6. Add Total Row if there are currency keys
  if (currencyKeys.length > 0 && data.length > 0) {
    const totalRowNumber = data.length + headerRowIndex + 1;
    const totalRow = worksheet.getRow(totalRowNumber);
    
    const firstCell = totalRow.getCell(1);
    firstCell.value = "TOTAL";
    firstCell.alignment = { horizontal: "center", vertical: "middle" };

    keys.forEach((key, colIndex) => {
      if (currencyKeys.includes(key)) {
        totalRow.getCell(colIndex + 1).value = totals[key];
      }
    });

    totalRow.font = { name: "Arial", size: 11, bold: true, color: { argb: "FF111827" } };
    totalRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E7EB" }, // A distinct solid gray for total
    };
    totalRow.height = 30; // Higher padding for total
  }

  // 7. Setup Styling & Auto-Width for all cells
  
  worksheet.columns.forEach((column, index) => {
    const key = keys[index];
    const isCurrency = currencyKeys.includes(key);
    let maxLength = 0;

    // Evaluate Header length
    const headerValue = formatHeader(key);
    if (headerValue.length > maxLength) {
      maxLength = headerValue.length;
    }

    column.eachCell!({ includeEmpty: true }, (cell, rowNumber) => {
      // Apply borders starting from header row
      if (rowNumber >= headerRowIndex) {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE5E7EB" } },
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } },
        };
      }

      if (rowNumber > headerRowIndex) {
        // Data formatting
        if (cell.value instanceof Date) {
          cell.numFmt = "dd/mm/yyyy hh:mm";
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (typeof cell.value === "number") {
          if (isCurrency) {
            cell.numFmt = '_-"Rp"* #,##0_-;-"Rp"* #,##0_-;_-"Rp"* "-"_-;_-@_-';
          } else {
            cell.numFmt = "#,##0";
            cell.alignment = { horizontal: "center", vertical: "middle" };
          }
        }

        // Evaluate Data length
        if (cell.value) {
            // Limit max evaluation to keep wide cells from getting absurdly long.
            const valStr = cell.value.toString();
            if (valStr.length > maxLength && valStr.length <= 40) {
                maxLength = valStr.length;
            } else if (valStr.length > 40) {
                maxLength = 40; // Cap width slightly higher
            }
        }
      }
    });

    column.width = maxLength + 8; // Extra padding multiplier for wider margins
  });

  return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
}
