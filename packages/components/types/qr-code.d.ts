export interface QRMatrix {
  modules: { size: number; data: Uint8Array };
}
export function qrPayload(options: {
  kind: "text" | "url" | "wifi";
  text?: string;
  ssid?: string;
  password?: string;
  security?: "WPA" | "nopass";
}): string;
export function makeQR(payload: string, correction?: "L" | "M" | "Q" | "H"): QRMatrix;
export function qrSvg(qr: QRMatrix): string;
export function paintQR(canvas: HTMLCanvasElement, qr: QRMatrix, width: number): HTMLCanvasElement;
