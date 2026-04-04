export function isoDaysAgo(days: number) {
  const now = new Date();
  now.setDate(now.getDate() - days);
  return now.toISOString();
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function ageInDays(value: string) {
  const created = new Date(value).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - created) / (1000 * 60 * 60 * 24)));
}

export function downloadCsv(filename: string, lines: string[]) {
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}