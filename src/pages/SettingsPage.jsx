import { Globe, Moon, Sun, ChevronRight, UserCog, FileBarChart, MessageSquare } from "lucide-react";
import { cardStyle } from "../lib/styles";
import { PageHead, Switch } from "../components";

const LANGUAGE_LABEL = { uz: "O'zbekcha", ru: "Ruscha", en: "Inglizcha" };

export default function SettingsPage({ t, mode, language, onToggleDark, allowed = [], goTo }) {
  const groups = [
    { title: "Umumiy", rows: [{ icon: Globe, color: "accent", label: "Til", value: LANGUAGE_LABEL[language] || language }, { icon: mode === "dark" ? Moon : Sun, color: "purple", label: "Qorong'i rejim", toggle: mode === "dark", onToggle: onToggleDark }] },
    {
      title: "Boshqarish", rows: [
        allowed.includes("staff") && { icon: UserCog, color: "accent", label: "Xodimlar", chev: true, onClick: () => goTo("staff") },
        allowed.includes("sms") && { icon: MessageSquare, color: "purple", label: "SMS Markaz", chev: true, onClick: () => goTo("sms") },
        allowed.includes("reports") && { icon: FileBarChart, color: "warn", label: "Hisobotlar", chev: true, onClick: () => goTo("reports") },
      ].filter(Boolean),
    },
  ].filter((g) => g.rows.length);
  return <div>
    <PageHead t={t} title="Sozlamalar" />
    <div className="ar-grid-2" style={{ marginTop: 14 }}>{groups.map((g) => <div key={g.title}>
      <div style={{ color: t.muted, fontSize: 12.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", margin: "0 0 8px 4px" }}>{g.title}</div>
      <div className="ar-card" style={{ ...cardStyle(t), padding: 0, overflow: "hidden" }}>{g.rows.map((r, i) => <div key={r.label} onClick={r.onClick} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 16px", borderTop: i ? `1px solid ${t.border}` : "none", cursor: r.onClick ? "pointer" : "default" }}><span style={{ width: 32, height: 32, borderRadius: 9, background: t[r.color + "Soft"], color: t[r.color], display: "grid", placeItems: "center", flex: "none" }}><r.icon size={17} /></span><span style={{ flex: 1, color: t.text, fontSize: 14, fontWeight: 500 }}>{r.label}</span>{r.value && <span style={{ color: t.muted, fontSize: 13.5 }}>{r.value}</span>}{r.toggle !== undefined && <Switch on={r.toggle} onChange={r.onToggle} t={t} />}{r.chev && <ChevronRight size={18} style={{ color: t.muted }} />}</div>)}</div>
    </div>)}</div>
  </div>;
}
