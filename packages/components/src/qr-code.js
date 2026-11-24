import QRCode from "qrcode";

export function qrPayload({ kind, text, ssid, password, security }) {
  if (kind === "wifi") {
    if (!ssid?.trim()) throw new Error("Enter a network name.");
    if (security !== "nopass" && !password)
      throw new Error("Enter the Wi-Fi password.");
    const escape = (value) => value.replace(/[\\;,:\"]/g, "\\$&");
    return `WIFI:T:${security === "nopass" ? "nopass" : "WPA"};S:${escape(ssid)};${security === "nopass" ? "" : `P:${escape(password)};`};`;
  }
  if (!text?.trim())
    throw new Error(kind === "url" ? "Enter a URL." : "Enter some text.");
  if (kind === "url") {
    try {
      if (!["https:", "http:"].includes(new URL(text.trim()).protocol))
        throw new Error();
    } catch {
      throw new Error("Enter a complete http:// or https:// URL.");
    }
    return text.trim();
  }
  return text;
}

// Both exports use the same matrix, an opaque white background and a four-module quiet zone.
export function makeQR(payload, correction = "M") {
  try {
    return QRCode.create(payload, { errorCorrectionLevel: correction });
  } catch {
    throw new Error(
      "This content is too long for a QR code. Shorten it or lower error correction.",
    );
  }
}
export function qrSvg(qr) {
  const { size, data } = qr.modules,
    extent = size + 8;
  let path = "";
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      if (data[y * size + x]) path += `M${x + 4} ${y + 4}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${extent} ${extent}" width="${extent * 8}" height="${extent * 8}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path fill="#000" d="${path}"/></svg>`;
}
export function paintQR(canvas, qr, width) {
  const { size, data } = qr.modules,
    scale = Math.floor(width / (size + 8));
  if (scale < 1) throw new Error("Choose a larger PNG size.");
  canvas.width = canvas.height = width;
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error(
      "PNG export is unavailable in this browser. Download SVG instead.",
    );
  const offset = Math.floor((width - size * scale) / 2);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, width);
  context.fillStyle = "#000";
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      if (data[y * size + x])
        context.fillRect(offset + x * scale, offset + y * scale, scale, scale);
  return canvas;
}
