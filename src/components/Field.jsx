export default function Field({ t, label, children }) {
  return <label style={{ display: "block", marginBottom: 13 }}><span style={{ fontSize: 12.5, color: t.muted, fontWeight: 600, display: "block", marginBottom: 6 }}>{label}</span>{children}</label>;
}
