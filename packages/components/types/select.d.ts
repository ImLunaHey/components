export interface PickerOption {
  value: string;
  label: string;
  description?: string;
  tone?: string;
  keywords?: string;
  disabled?: boolean;
}
export interface PickerHandle {
  open(): void;
  close(): void;
  destroy(): void;
  sync(): void;
  trigger: HTMLButtonElement | HTMLInputElement;
}
export interface SelectOptions {
  searchable?: boolean;
  describe?: Record<string, string>;
  tones?: Record<string, string>;
  keywords?: Record<string, string>;
  renderOption?: (option: PickerOption) => Node;
  renderPrefix?: (option: PickerOption) => Node;
}
export function mountSelect(native: HTMLSelectElement, options?: SelectOptions): PickerHandle;
export function mountCombobox(input: HTMLInputElement, items: PickerOption[]): PickerHandle;
