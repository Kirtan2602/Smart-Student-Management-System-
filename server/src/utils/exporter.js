import { sendCsv } from './csv.js';
import { startPdf, pdfHeader, pdfTable, finishPdf } from './pdf.js';

// Ek j table ne CSV ke PDF ma moklo
export const sendTable = (
  res,
  { format, filename, title, lines = [], columns, rows, landscape = false }
) => {
  if (format === 'csv') {
    return sendCsv(res, `${filename}.csv`, columns.map((c) => c.label), rows);
  }

  const doc = startPdf(res, `${filename}.pdf`, { landscape });
  pdfHeader(doc, title, lines);
  pdfTable(doc, columns, rows);
  return finishPdf(doc);
};