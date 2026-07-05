import { ChevronRight } from "lucide-react";
import { cardStyle } from "../lib/styles";

export default function DataTable({ t, cols, rows, empty }) {
  return <div className="ar-card ar-tablewrap" style={{ ...cardStyle(t), padding: 0, overflow: "hidden", marginTop: 14, position: "relative" }}>
    <div className="ar-tablescroll" style={{ overflowX: "auto" }}>
      <table className="ar-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 480 }}>
        <thead><tr style={{ color: t.muted, fontSize: 12, textAlign: "left" }}>{cols.map((c) => <th key={c.label} style={{ padding: "12px 20px", fontWeight: 600, borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={cols.length} style={{ padding: 30, textAlign: "center", color: t.muted }}>{empty || "Hozircha bo'sh"}</td></tr>}
          {rows.map((r, i) => <tr key={i} className="ar-row">{cols.map((c) => <td key={c.label} style={{ padding: "12px 20px", borderBottom: `1px solid ${t.border}`, color: t.text2, whiteSpace: "nowrap" }}>{c.render ? c.render(r) : r[c.key]}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
    <div className="ar-tablehint" style={{ color: t.muted }}><ChevronRight size={13} /> suring</div>
  </div>;
}
