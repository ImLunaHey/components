export function mountFileAttachment(
  host: HTMLElement,
  options: { id: string; label?: string; maxBytes?: number },
): { native: HTMLInputElement; reset(): void };
