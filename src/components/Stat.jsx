import { cardStyle } from "../lib/styles";

export default function Stat({ t, label, val, tone, icon: Ic, onClick, active }) {
  return <div
    className="ar-card"
    onClick={onClick}
    style={{ ...cardStyle(t), display: "flex", alignItems: "center", gap: 14, padding: 16, cursor: onClick ? "pointer" : "default", border: `1px solid ${active ? t[tone] : t.border}` }}
  >
    <span style={{ width: 42, height: 42, borderRadius: 12, background: t[tone + "Soft"], color: t[tone], display: "grid", placeItems: "center" }}><Ic size={19} /></span>
    <div><div style={{ fontWeight: 700, fontSize: 21, color: t.text, lineHeight: 1.1, letterSpacing: "-.02em" }}>{val}</div><div style={{ color: t.muted, fontSize: 12.5, marginTop: 2 }}>{label}</div></div>
  </div>;
}
