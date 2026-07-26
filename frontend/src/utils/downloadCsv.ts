/**
 * Triggers a browser download of tabular data as a CSV file.
 * Cells containing commas, quotes, or newlines are safely quoted/escaped.
 */
export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? '');
          if (/[",\n]/.test(value)) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
