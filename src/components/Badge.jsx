export default function Badge({ tone = "muted", children, t }) {
  const map = { success: [t.successSoft, t.success], danger: [t.dangerSoft, t.danger], warn: [t.warnSoft, t.warn], accent: [t.accentSoft, t.accent], pink: [t.pinkSoft, t.pink], purple: [t.purpleSoft, t.purple], muted: [t.inset, t.muted] };
  const [bg, fg] = map[tone] || map.muted;
  return <span style={{ background: bg, color: fg, fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>{children}</span>;
}
