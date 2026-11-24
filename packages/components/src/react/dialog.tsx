import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useId, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  dialog: {
    width: "min(520px, calc(100vw - 32px))",
    maxHeight: "calc(100dvh - 40px)",
    padding: 0,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: { default: colors.surface, "::backdrop": "#0009" },
    color: colors.text,
    boxShadow: "0 24px 80px #0008",
    fontFamily: "inherit",
  },
  header: {
    padding: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
  },
  title: { fontSize: 15, margin: 0 },
  body: { padding: 20, display: "grid", gap: 16 },
  footer: {
    padding: 16,
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.border,
  },
});
export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const outside = useRef(false);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    else if (!open && dialog?.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onCancel={() => onOpenChange(false)}
      onClose={() => onOpenChange(false)}
      onPointerDown={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        outside.current =
          e.target === e.currentTarget &&
          (e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom);
      }}
      onClick={() => {
        if (outside.current) onOpenChange(false);
        outside.current = false;
      }}
      {...stylex.props(styles.dialog)}
    >
      <header {...stylex.props(styles.header)}>
        <h2 id={id} {...stylex.props(styles.title)}>
          {title}
        </h2>
        <Button variant="ghost" aria-label="Close dialog" onClick={() => onOpenChange(false)}>
          <X size={16} />
        </Button>
      </header>
      <div {...stylex.props(styles.body)}>{children}</div>
      {footer && <footer {...stylex.props(styles.footer)}>{footer}</footer>}
    </dialog>
  );
}
