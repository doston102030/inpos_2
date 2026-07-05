import { Plus } from "lucide-react";
import { primaryBtn } from "../lib/styles";

export default function PageHead({ t, title, count, action, onAction }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 10, flexWrap: "wrap" }}>
    <div style={{ fontWeight: 700, fontSize: 17, color: t.text, letterSpacing: "-.01em" }}>{title}{count != null && <span style={{ color: t.muted, fontWeight: 500 }}> · {count}</span>}</div>
    {action && <button onClick={onAction} className="ar-btn-primary" style={{ ...primaryBtn(t), width: "auto", padding: "9px 16px", fontSize: 13.5 }}><Plus size={16} /> {action}</button>}
  </div>;
}
