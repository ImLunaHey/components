import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Button } from "./button";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  root: {
    minWidth: 0,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.raised,
  },
  head: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    fontSize: 12,
    color: colors.muted,
  },
  code: { margin: 0, padding: 16, paddingTop: 0, overflowX: "auto", fontSize: 12, lineHeight: 1.8 },
  status: { fontSize: 11, paddingInline: 10 },
});
export function CodeBlock({ code, label = "JSON" }: { code: string; label?: string }) {
  const [message, setMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setMessage("Copied");
    } catch {
      setMessage("Clipboard unavailable. Select the text to copy it.");
    }
  }
  return (
    <section aria-label={label} {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.head)}>
        <span>{label}</span>
        <Button size="small" onClick={copy} aria-label={"Copy " + label}>
          Copy
        </Button>
      </div>
      <pre tabIndex={0} {...stylex.props(styles.code)}>
        <code>{code}</code>
      </pre>
      <span role="status" {...stylex.props(styles.status)}>
        {message}
      </span>
    </section>
  );
}
