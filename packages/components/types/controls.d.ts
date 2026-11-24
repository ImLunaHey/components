import type { Table } from "@tanstack/table-core";
import type { PickerHandle } from "./select.js";
export function $(id: string): HTMLElement | null;
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
  cls?: string,
): HTMLElementTagNameMap[K];
export function button(
  text: string,
  fn: (event: MouseEvent) => void,
  cls?: string,
): HTMLButtonElement;
export function input(label: string, value?: string, type?: string): HTMLInputElement;
export function field(text: string, input: HTMLElement): HTMLLabelElement;
export function picker(
  host: HTMLElement,
  label: string,
  values: (string | [string, string])[],
  value: string,
  onchange?: (value: string) => void,
): PickerHandle & { native: HTMLSelectElement };
export function message(id: string, text: string, error?: boolean): void;
export function copy(text: string, status: string): Promise<void>;
export function download(text: string | Blob, name: string, type?: string): () => void;
export interface TableColumn<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  sortable?: boolean;
  render?: (row: T) => Node | string | number | null;
}
export function table<T>(
  host: HTMLElement,
  rows: T[],
  columns: TableColumn<T>[],
  label: string,
  options?: { sortable?: boolean },
): Table<T>;
export function dialog(
  id: string,
  title: string,
): { dialog: HTMLDialogElement; body: HTMLDivElement };
