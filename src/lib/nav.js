import {
  LayoutDashboard, ShoppingCart, Boxes, ArrowDownToLine,
  ArrowUpFromLine, BookText,
  LineChart as LineChartIcon, Settings,
} from "lucide-react";

export const NAV = [
  { id: "dashboard", label: "Boshqaruv", icon: LayoutDashboard },
  { id: "pos", label: "POS / Savdo", icon: ShoppingCart },
  { id: "stock", label: "Ombor", icon: Boxes },
  { id: "inflow", label: "Kirim", icon: ArrowDownToLine },
  { id: "outflow", label: "Chiqim", icon: ArrowUpFromLine },
  { id: "debt", label: "Qarz Daftari", icon: BookText },
  { id: "analytics", label: "Analitika", icon: LineChartIcon },
  { id: "settings", label: "Sozlamalar", icon: Settings },
];

// "staff", "reports", "sms" endi yon menyuda yo'q — Sozlamalar sahifasi ichidan ochiladi.
// "Mahsulotlar" endi alohida menyu emas — "Kirim" sahifasi ichida tab sifatida.
// Backendda faqat 2 ta rol bor: SUPER_ADMIN va CASHIER.
export const ROLE_PERMS = {
  "Super Admin": [...NAV.map((n) => n.id).filter((id) => id !== "pos"), "staff", "reports", "sms"],
  "Kassir": ["pos", "debt"],
};

export const homeFor = (role) => (ROLE_PERMS[role].includes("dashboard") ? "dashboard" : "pos");
export const roleToneOf = (role) => ({ "Super Admin": "purple", Kassir: "success" }[role]);
