type ExcelCellValue = string | number | null;

export type ExcelColumn = {
  key: string;
  header: string;
  width?: number;
};

export type ExcelRow = Record<string, ExcelCellValue>;

export async function saveRowsAsExcel(filename: string, sheetName: string, columns: ExcelColumn[], rows: ExcelRow[], totals?: ExcelRow) {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName.slice(0, 31));

  worksheet.columns = columns.map((column) => ({
    key: column.key,
    header: column.header,
    width: column.width ?? Math.max(12, column.header.length + 4),
  }));

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FF0F172A' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  rows.forEach((row) => worksheet.addRow(row));

  if (totals) {
    const totalRow = worksheet.addRow(totals);
    totalRow.font = { bold: true };
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  }

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
      cell.alignment = { vertical: 'middle' };
    });
  });

  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
