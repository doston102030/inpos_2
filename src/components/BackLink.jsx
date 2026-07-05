import { ChevronLeft } from "lucide-react";

export default function BackLink({ t, onClick, label = "Sozlamalar" }) {
  return <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: t.accent, fontWeight: 600, fontSize: 13.5, cursor: "pointer", padding: 0, marginBottom: 12 }}>
    <ChevronLeft size={16} /> {label}
  </button>;
}
