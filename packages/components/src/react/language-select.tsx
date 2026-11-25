import * as stylex from "@stylexjs/stylex";
import { US, JP, FR, DE, GB, ES, NL, KR, CN } from "country-flag-icons/react/3x2";
import { Select } from "./select";
const styles = stylex.create({ flag: { width: 20, height: 14, flexShrink: 0, borderRadius: 2 } });
const languages = [
  { value: "en", label: "English", description: "English", Flag: US },
  { value: "nl", label: "Dutch", description: "Nederlands", Flag: NL },
  { value: "ko", label: "Korean", description: "한국어", Flag: KR },
  { value: "zh-Hans", label: "Chinese (Simplified)", description: "简体中文", Flag: CN },
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
  includeAll = false,
  availableLanguages,
}: {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  includeAll?: boolean;
  availableLanguages?: readonly string[];
}) {
  return (
    <Select
      label={label}
      value={value}
      onValueChange={onValueChange}
      searchable
      options={[
        ...(includeAll ? [{ value: "", label: "All languages" }] : []),
        ...(availableLanguages
          ? availableLanguages.map(
              (value) =>
                languages.find((item) => item.value === value) ?? {
                  value,
                  label: new Intl.DisplayNames(["en"], { type: "language" }).of(value) ?? value,
                  description: value,
                  Flag: null,
                },
            )
          : languages.slice(4)
        ).map(({ Flag, ...option }) => ({
          ...option,
          keywords: option.description,
          icon: Flag ? <Flag aria-hidden="true" {...stylex.props(styles.flag)} /> : undefined,
        })),
      ]}
    />
  );
}
