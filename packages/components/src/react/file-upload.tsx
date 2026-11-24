import * as stylex from "@stylexjs/stylex";
import { useRef, useState, useEffect, useId } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "./button";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  root: { display: "grid", gap: 10 },
  zone: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    padding: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.raised,
  },
  copy: { flex: 1, minWidth: 120 },
  muted: { fontSize: 11, color: colors.muted },
  preview: { display: "flex", alignItems: "center", gap: 10 },
  image: { width: 48, height: 48, objectFit: "cover", borderRadius: 5 },
  error: { color: colors.danger, fontSize: 12 },
  hidden: { display: "none" },
});
export function FileUpload({
  label = "Attach file",
  accept,
  maxBytes = 5 * 1024 * 1024,
  onFilesChange,
  multiple = false,
}: {
  label?: string;
  accept?: string;
  maxBytes?: number;
  onFilesChange?: (files: File[]) => void;
  multiple?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const id = useId();
  useEffect(() => {
    const urls: Record<string, string> = {};
    files.forEach((file, index) => {
      if (file.type.startsWith("image/")) urls[String(index)] = URL.createObjectURL(file);
    });
    setPreviews(urls);
    return () => Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
  }, [files]);
  function update(next: File[]) {
    setError("");
    if (next.some((file) => file.size > maxBytes)) {
      setError(`Each file must be under ${maxBytes / 1024 / 1024} MB.`);
      return;
    }
    setFiles(multiple ? next : next.slice(0, 1));
    onFilesChange?.(multiple ? next : next.slice(0, 1));
  }
  return (
    <div {...stylex.props(styles.root)}>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          update([...e.dataTransfer.files]);
        }}
        {...stylex.props(styles.zone)}
      >
        <Upload size={20} />
        <div {...stylex.props(styles.copy)}>
          <strong>{label}</strong>
          <div {...stylex.props(styles.muted)}>
            Drop a file or choose from your device · up to {maxBytes / 1024 / 1024} MB
          </div>
        </div>
        <input
          ref={input}
          id={id}
          type="file"
          aria-label={label}
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            update([...(e.target.files ?? [])]);
            e.target.value = "";
          }}
          {...stylex.props(styles.hidden)}
        />
        <Button onClick={() => input.current?.click()}>Choose file{multiple ? "s" : ""}</Button>
      </div>
      {files.map((file, index) => (
        <div key={file.name + "-" + index} {...stylex.props(styles.preview)}>
          {previews[String(index)] ? (
            <img
              src={previews[String(index)]}
              alt={"Preview of " + file.name}
              {...stylex.props(styles.image)}
            />
          ) : (
            <File size={24} />
          )}
          <span {...stylex.props(styles.copy)}>
            {file.name}
            <small {...stylex.props(styles.muted)}> · {(file.size / 1024).toFixed(1)} KB</small>
          </span>
          <Button
            size="small"
            aria-label={"Remove " + file.name}
            onClick={() => update(files.filter((_, i) => i !== index))}
          >
            <X size={14} />
          </Button>
        </div>
      ))}
      {error && (
        <p role="alert" {...stylex.props(styles.error)}>
          {error}
        </p>
      )}
    </div>
  );
}
