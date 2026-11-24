import { useState, type ReactNode } from "react";
import { Theme } from "@imlunahey/components/theme";
import { AppShell } from "@imlunahey/components/app-shell";
import {
  LayoutGrid,
  Image,
  CreditCard,
  List,
  Activity,
  MessageSquare,
  Settings,
  KeyRound,
  Table,
  Upload,
} from "lucide-react";
const icons = {
  Board: LayoutGrid,
  Discussion: MessageSquare,
  Media: Image,
  Import: Upload,
  Billing: CreditCard,
  Sharing: Settings,
  "API keys": KeyRound,
  Monitoring: Activity,
  Overview: Activity,
  Components: LayoutGrid,
  Forms: List,
  Data: Table,
  Interactions: Settings,
  Sets: Table,
};
export function Frame({
  name,
  view,
  items,
  children,
  actions,
}: {
  name: string;
  view: string;
  items: { id: string; label: string }[];
  children: ReactNode;
  actions?: ReactNode;
}) {
  const [mode, setMode] = useState<"light" | "dark">(
    () =>
      (localStorage.getItem("luna-theme") as "light" | "dark") ||
      (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"),
  );
  const active = items.find((item) => item.id === view) ?? items[0]!;
  return (
    <Theme mode={mode}>
      <AppShell
        name={name}
        title={active.label}
        description="Interactive demo · changes stay in this browser"
        items={items.map((item) => {
          const Icon = icons[item.label as keyof typeof icons] ?? List;
          return { href: "/" + item.id, label: item.label, icon: <Icon size={15} /> };
        })}
        active={"/" + active.id}
        mode={mode}
        onModeChange={(next) => {
          setMode(next);
          localStorage.setItem("luna-theme", next);
        }}
        actions={actions}
      >
        {children}
      </AppShell>
    </Theme>
  );
}
