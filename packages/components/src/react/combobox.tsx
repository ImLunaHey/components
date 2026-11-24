import { Select, type SelectProps } from "./select";
export function Combobox(props: Omit<SelectProps, "searchable">) {
  return <Select {...props} searchable />;
}
