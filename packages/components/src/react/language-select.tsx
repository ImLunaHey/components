import * as stylex from "@stylexjs/stylex";
import { US, JP, FR, DE, GB, ES } from "country-flag-icons/react/3x2";
import { Select } from "./select";
const styles = stylex.create({ flag: { width: 20, height: 14, flexShrink: 0, borderRadius: 2 } });
const languages = [
  { value: "en-US", label: "English (US)", description: "English", Flag: US },
  { value: "en-GB", label: "English (UK)", description: "English", Flag: GB },
  { value: "ja", label: "Japanese", description: "日本語", Flag: JP },
  { value: "fr", label: "French", description: "Français", Flag: FR },
  { value: "de", label: "German", description: "Deutsch", Flag: DE },
  { value: "es", label: "Spanish", description: "Español", Flag: ES },
];
export function LanguageSelect({
  value,
  onValueChange,
  label = "Language",
}: {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
}) {
  return (
    <Select
      label={label}
      value={value}
      onValueChange={onValueChange}
      searchable
      options={languages.map(({ Flag, ...option }) => ({
        ...option,
        keywords: option.description,
        icon: <Flag aria-hidden="true" {...stylex.props(styles.flag)} />,
      }))}
    />
  );
}
