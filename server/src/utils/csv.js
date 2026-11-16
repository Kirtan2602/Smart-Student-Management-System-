// Download file nu naam safe banave (khali letters, numbers, - _ .)
export const safeName = (name) => String(name).replace(/[^a-zA-Z0-9_.-]/g, '_');

const escapeCell = (value) => {
  if (value === null || value === undefined) return '';
  let text = String(value);

  // CSV injection: Excel "=SUM(...)" jevu text ne formula samji le. Text ne safe banavo.
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;

  if (/[",\r\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
};

// \uFEFF = Excel ma Gujarati/special akshar barabar dekhay ae mate
export const toCsv = (headers, rows) =>
  '\uFEFF' + [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');

export const sendCsv = (res, filename, headers, rows) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName(filename)}"`);
  res.send(toCsv(headers, rows));
};