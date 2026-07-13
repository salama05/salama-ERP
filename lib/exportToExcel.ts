/**
 * Reusable Excel export utility using SheetJS/xlsx
 * Can be used from any data table in the app
 */

import * as XLSX from 'xlsx';

export interface ExcelColumn {
  key: string;
  header: string;
  formatter?: (value: any) => string | number;
}

export interface ExportToExcelOptions {
  data: any[];
  columns: ExcelColumn[];
  filename: string;
  sheetName?: string;
}

/**
 * Export data to Excel file
 * @param options - Export options including data, columns, and filename
 */
export async function exportToExcel(options: ExportToExcelOptions): Promise<void> {
  const { data, columns, filename, sheetName = 'Sheet1' } = options;

  // Transform data to match column structure
  const transformedData = data.map((row) => {
    const newRow: Record<string, any> = {};
    columns.forEach((column) => {
      const value = row[column.key];
      newRow[column.header] = column.formatter ? column.formatter(value) : value;
    });
    return newRow;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(transformedData);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate filename with timestamp if not provided
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = filename.includes('.xlsx') ? filename : `${filename}_${timestamp}.xlsx`;

  // Write file
  XLSX.writeFile(workbook, finalFilename);
}

/**
 * Export data to Excel with custom formatting options
 */
export async function exportToExcelAdvanced(
  data: any[],
  columns: ExcelColumn[],
  filename: string,
  options?: {
    sheetName?: string;
    autoFilter?: boolean;
    headerStyle?: {
      bold?: boolean;
      bgColor?: string;
      fontColor?: string;
    };
  }
): Promise<void> {
  const { data: dataRows, columns: colDefs, filename: fname } = options || {};
  
  // Transform data
  const transformedData = data.map((row) => {
    const newRow: Record<string, any> = {};
    columns.forEach((column) => {
      const value = row[column.key];
      newRow[column.header] = column.formatter ? column.formatter(value) : value;
    });
    return newRow;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(transformedData);

  // Add auto filter if enabled
  if (options?.autoFilter) {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, options?.sheetName || 'Sheet1');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = filename.includes('.xlsx') ? filename : `${filename}_${timestamp}.xlsx`;

  // Write file
  XLSX.writeFile(workbook, finalFilename);
}
