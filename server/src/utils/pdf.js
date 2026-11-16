import PDFDocument from 'pdfkit';
import { safeName } from './csv.js';

const BLUE = '#0f2a5c';

const ensureSpace = (doc, needed) => {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) doc.addPage();
};

export const startPdf = (res, filename, { landscape = false } = {}) => {
  const doc = new PDFDocument({
    size: 'A4',
    layout: landscape ? 'landscape' : 'portrait',
    margin: 40,
    bufferPages: true, // chhelle page numbers lakhva mate
  });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName(filename)}"`);
  doc.pipe(res);
  return doc;
};

export const pdfHeader = (doc, title, lines = []) => {
  doc.font('Helvetica-Bold').fontSize(16).fillColor(BLUE).text('Smart Student Management System');
  doc.moveDown(0.3);
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#000000').text(title);
  doc.font('Helvetica').fontSize(9).fillColor('#555555');
  lines.forEach((line) => doc.text(line));
  doc.moveDown(0.5);

  const y = doc.y;
  doc
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .lineWidth(1)
    .strokeColor('#c7d2e5')
    .stroke();
  doc.moveDown(0.6);
  doc.fillColor('#000000');
};

export const pdfSection = (doc, text) => {
  ensureSpace(doc, 80);
  doc.moveDown(0.6);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(BLUE).text(text);
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(9).fillColor('#000000');
};

export const pdfKeyValues = (doc, pairs) => {
  pairs.forEach(([key, value]) => {
    ensureSpace(doc, 16);
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text(`${key}: `, { continued: true });
    doc.font('Helvetica').text(String(value ?? '-'));
  });
};

// columns: [{ label, w (relative width), align }], rows: [[cell, cell, ...]]
export const pdfTable = (doc, columns, rows) => {
  const left = doc.page.margins.left;
  const available = doc.page.width - left - doc.page.margins.right;
  const totalWeight = columns.reduce((sum, c) => sum + c.w, 0);
  const widths = columns.map((c) => (c.w / totalWeight) * available);
  const rowHeight = 20;
  let y = doc.y;

  const drawRow = (cells, header = false, zebra = false) => {
    // Page puro thay to navu page + table header fari
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
      drawRow(columns.map((c) => c.label), true);
    }

    if (header) doc.rect(left, y, available, rowHeight).fill(BLUE);
    else if (zebra) doc.rect(left, y, available, rowHeight).fill('#f1f5fb');

    doc.font(header ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5).fillColor(header ? '#ffffff' : '#000000');

    let x = left;
    cells.forEach((cell, i) => {
      doc.text(String(cell ?? ''), x + 4, y + 6, {
        width: widths[i] - 8,
        height: rowHeight - 8,
        ellipsis: true,
        align: columns[i].align || 'left',
      });
      x += widths[i];
    });

    doc
      .moveTo(left, y + rowHeight)
      .lineTo(left + available, y + rowHeight)
      .lineWidth(0.5)
      .strokeColor('#dde4f0')
      .stroke();

    y += rowHeight;
  };

  drawRow(columns.map((c) => c.label), true);

  if (rows.length === 0) {
    doc.font('Helvetica-Oblique').fontSize(9).fillColor('#777777').text('No data available', left + 4, y + 6);
    y += rowHeight;
  } else {
    rows.forEach((row, i) => drawRow(row, false, i % 2 === 1));
  }

  doc.x = left;
  doc.y = y + 6;
  doc.font('Helvetica').fontSize(9).fillColor('#000000');
};

// Darek page par footer (page number) lakhi ne PDF puru kare
export const finishPdf = (doc) => {
  const range = doc.bufferedPageRange();
  const stamp = new Date().toLocaleString('en-IN');

  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    const originalBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0; // nahi to footer navo blank page banavse
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#888888')
      .text(
        `Generated on ${stamp}  |  Page ${i + 1} of ${range.count}`,
        doc.page.margins.left,
        doc.page.height - 28,
        {
          width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
          align: 'center',
        }
      );
    doc.page.margins.bottom = originalBottom;
  }
  doc.end();
};