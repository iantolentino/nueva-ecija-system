export function formData(body) {
  if (typeof body === 'string' || Buffer.isBuffer(body)) {
    return Object.fromEntries(new URLSearchParams(String(body)));
  }
  return body && typeof body === 'object' ? body : {};
}

export function values(data, name) {
  const value = data[name];
  return Array.isArray(value) ? value.map(String) : value == null ? [] : [String(value)];
}

export function parseCsv(text) {
  const lines = String(text).replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const parseLine = (line) => {
    const cells = []; let cell = ''; let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char === '"' && line[index + 1] === '"' && quoted) { cell += '"'; index += 1; }
      else if (char === '"') quoted = !quoted;
      else if (char === ',' && !quoted) { cells.push(cell.trim()); cell = ''; }
      else cell += char;
    }
    cells.push(cell.trim());
    return cells;
  };
  const headers = parseLine(lines.shift()).map((header) => header.toLowerCase());
  return lines.map((line) => Object.fromEntries(headers.map((header, index) => [header, parseLine(line)[index] || ''])));
}

export function multipartCsv(req) {
  const contentType = req.headers['content-type'] || '';
  const boundary = contentType.match(/boundary=([^;]+)/i)?.[1];
  if (!boundary || !(typeof req.body === 'string' || Buffer.isBuffer(req.body))) return null;
  for (const part of String(req.body).split(`--${boundary}`)) {
    if (/name="file"/i.test(part)) return part.split(/\r?\n\r?\n/).slice(1).join('\n\n').replace(/\r?\n--?$/, '').trim();
  }
  return null;
}
