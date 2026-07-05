import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { Crown, Lock, Receipt } from "lucide-react";
import { useStore } from "../lib/StoreContext";
import { cardStyle, inputS } from "../lib/styles";
import { TINTS } from "../lib/mockData";
import { getTrend, getReportsByUser, roleFromApi } from "../lib/api";
import { som } from "../lib/format";
import { PageHead, Badge } from "../components";

const dayKey = (date) => date.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" });
const PERIODS = [
  { id: "kun", label: "Bugun" },
  { id: "hafta", label: "Hafta" },
  { id: "oy", label: "Oy" },
];
const iso = (d) => d.toISOString().slice(0, 10);

export default function Analytics({ t }) {
  const { products, sales } = useStore();
  const [period, setPeriod] = useState("hafta");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [trend, setTrend] = useState([]);
  const [byUser, setByUser] = useState([]);
  const [byUserError, setByUserError] = useState(null);

  const customActive = !!(from && to);
  const range = customActive ? { f: from, tt: to } : (() => {
    const now = new Date();
    const days = period === "kun" ? 0 : period === "oy" ? 29 : 6;
    const start = new Date(now); start.setDate(now.getDate() - days);
    return { f: iso(start), tt: iso(now) };
  })();

  useEffect(() => {
    let cancelled = false;
    getTrend(range.f, range.tt)
      .then((d) => {
        if (cancelled) return;
        const profitByDay = {};
        sales.forEach((s) => { if (!s.createdAt) return; const k = dayKey(new Date(s.createdAt)); profitByDay[k] = (profitByDay[k] || 0) + (s.profit || 0); });
        setTrend(d.map((x) => ({ ...x, p: +((profitByDay[x.d] || 0) / 1e6).toFixed(2) })));
      })
      .catch(() => { if (!cancelled) setTrend([]); });
    getReportsByUser(range.f, range.tt)
      .then((r) => { if (!cancelled) { setByUser(r.sort((a, b) => b.totalRevenue - a.totalRevenue)); setByUserError(null); } })
      .catch((e) => { if (!cancelled) { setByUser([]); setByUserError(e.message); } });
    return () => { cancelled = true; };
  }, [sales, range.f, range.tt]);
  const stockData = products.map((p) => ({ name: p.name, v: p.stock })).sort((a, b) => b.v - a.v).slice(0, 6);
  const periodLabel = customActive ? `${from} – ${to}` : period === "kun" ? "Bugun" : period === "oy" ? "So'nggi 30 kun" : "So'nggi 7 kun";
  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <PageHead t={t} title="Analitika" />
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 4, background: t.inset, borderRadius: 11, padding: 3 }}>
        {PERIODS.map((p) => <button key={p.id} onClick={() => { setPeriod(p.id); setFrom(""); setTo(""); }} style={{ padding: "7px 13px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12.5, fontFamily: "inherit", fontWeight: !customActive && period === p.id ? 600 : 500, background: !customActive && period === p.id ? t.card : "transparent", color: !customActive && period === p.id ? t.accent : t.muted, boxShadow: !customActive && period === p.id ? t.shadow : "none" }}>{p.label}</button>)}
      </div>
      <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ ...inputS(t), width: 132, padding: "8px 10px", fontSize: 12.5 }} />
      <span style={{ color: t.muted, fontSize: 12.5 }}>–</span>
      <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ ...inputS(t), width: 132, padding: "8px 10px", fontSize: 12.5 }} />
      {customActive && <button onClick={() => { setFrom(""); setTo(""); }} style={{ padding: "8px 12px", borderRadius: 9, border: `1px solid ${t.border}`, background: "transparent", color: t.muted, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Bekor qilish</button>}
    </div>
    <div className="ar-grid-main">
      <div className="ar-card" style={cardStyle(t)}><div style={{ fontWeight: 600, color: t.text, fontSize: 15, marginBottom: 6 }}>Savdo &amp; Foyda</div><div style={{ color: t.muted, fontSize: 12.5, marginBottom: 8 }}>{periodLabel} · mln so'm</div>
        <ResponsiveContainer width="100%" height={240}><AreaChart data={trend} margin={{ top: 10, right: 6, left: -22, bottom: 0 }}><defs><linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={t.accent} stopOpacity={0.22} /><stop offset="100%" stopColor={t.accent} stopOpacity={0} /></linearGradient><linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={t.success} stopOpacity={0.22} /><stop offset="100%" stopColor={t.success} stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 6" stroke={t.border} vertical={false} /><XAxis dataKey="d" tick={{ fill: t.muted, fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: t.muted, fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, color: t.text }} /><Area type="monotone" dataKey="v" name="Savdo" stroke={t.accent} strokeWidth={2.5} fill="url(#gv)" /><Area type="monotone" dataKey="p" name="Foyda" stroke={t.success} strokeWidth={2.5} fill="url(#gp)" /></AreaChart></ResponsiveContainer>
      </div>
      <div className="ar-card" style={cardStyle(t)}><div style={{ fontWeight: 600, color: t.text, fontSize: 15, marginBottom: 6 }}>Top mahsulotlar</div><div style={{ color: t.muted, fontSize: 12.5, marginBottom: 8 }}>Ombor qoldig'i</div>
        <ResponsiveContainer width="100%" height={240}><BarChart data={stockData} margin={{ top: 10, right: 6, left: -22, bottom: 0 }}><CartesianGrid strokeDasharray="3 6" stroke={t.border} vertical={false} /><XAxis dataKey="name" tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: t.muted, fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, color: t.text }} cursor={{ fill: t.inset }} /><Bar dataKey="v" radius={[8, 8, 0, 0]}>{stockData.map((b, i) => <Cell key={i} fill={TINTS[i % TINTS.length]} />)}</Bar></BarChart></ResponsiveContainer>
      </div>
    </div>
    <div className="ar-card" style={cardStyle(t)}>
      <div style={{ fontWeight: 600, color: t.text, fontSize: 15, marginBottom: 6 }}>Xodimlar bo'yicha statistika</div>
      <div style={{ color: t.muted, fontSize: 12.5, marginBottom: 14 }}>{periodLabel} · kim qancha sotgani</div>
      {byUserError && <div style={{ color: t.danger, fontSize: 12.5, marginBottom: 8 }}>Yuklab bo'lmadi: {byUserError}</div>}
      {byUser.length === 0 && !byUserError && <div style={{ color: t.muted, fontSize: 13 }}>Bu davrda savdo yo'q</div>}
      {byUser.map((u, i) => {
        const role = roleFromApi(u.role);
        return <div key={u.userId} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderTop: i ? `1px solid ${t.border}` : "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: t[i === 0 ? "successSoft" : "accentSoft"], color: t[i === 0 ? "success" : "accent"], display: "grid", placeItems: "center", flex: "none", fontWeight: 700, fontSize: 12 }}>{u.fullName.split(" ").map((x) => x[0]).join("").slice(0, 2)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: t.text, fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.fullName}</div>
            <div style={{ marginTop: 3 }}><Badge tone={role === "Kassir" ? "warn" : "purple"} t={t}>{role === "Kassir" ? <Lock size={11} /> : <Crown size={11} />} {role}</Badge></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: t.muted, fontSize: 12.5 }}><Receipt size={13} /> {u.totalOrders} chek</div>
          <div style={{ textAlign: "right", minWidth: 110 }}>
            <div style={{ color: t.text, fontWeight: 700, fontSize: 14 }}>{som(u.totalRevenue)}</div>
            <div style={{ color: t.success, fontSize: 12, fontWeight: 600, marginTop: 2 }}>+{som(u.totalProfit)} foyda</div>
          </div>
        </div>;
      })}
    </div>
  </div>;
}
