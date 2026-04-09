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

export async function convertToExcel(data: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data", {
    views: [{ state: "frozen", ySplit: 1 }], // Freeze header
  });

  if (!data || !data.length) {
    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  const keys = Object.keys(data[0]);
  worksheet.columns = keys.map((key) => ({
    header: formatHeader(key),
    key,
    width: 20,
  }));

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF374151" }, // Dark gray background
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  worksheet.addRows(data);

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFD1D5DB" } },
        left: { style: "thin", color: { argb: "FFD1D5DB" } },
        bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
        right: { style: "thin", color: { argb: "FFD1D5DB" } },
      };

      if (rowNumber > 1) {
        if (cell.value instanceof Date) {
          cell.numFmt = "yyyy-mm-dd hh:mm";
          cell.alignment = { horizontal: "center" };
        } else if (typeof cell.value === "number") {
          cell.numFmt = "#,##0";
        }
      }
    });

    if (rowNumber > 1) {
      row.font = { color: { argb: "FF111827" } };
    }
  });

  // Adjust width based on header length
  worksheet.columns.forEach((column) => {
    if (column.header && column.header.length > 20) {
      column.width = column.header.length + 5;
    }
  });

  return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
}
