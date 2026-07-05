import { useState, useEffect } from "react";
import {
  TrendingUp, Wallet, Boxes, BookText, Package, AlertTriangle, X, Receipt,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useStore } from "../lib/StoreContext";
import { cardStyle, inputS } from "../lib/styles";
import { som } from "../lib/format";
import { getTrend, getReportsRange, getReportsDaily } from "../lib/api";
import { Badge } from "../components";

const PERIODS = [
  { id: "kun", label: "Bugun" },
  { id: "hafta", label: "Hafta" },
  { id: "oy", label: "Oy" },
];
const iso = (d) => d.toISOString().slice(0, 10);

export default function Dashboard({ t, goTo }) {
  const { products, sales, debts } = useStore();
  const [period, setPeriod] = useState("hafta");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [trend, setTrend] = useState([]);
  const [rangeRep, setRangeRep] = useState(null);
  const [todayRep, setTodayRep] = useState(null);
  const [todayError, setTodayError] = useState(null);
  const [chartError, setChartError] = useState(null);
  const [rangeRepError, setRangeRepError] = useState(null);

  const customActive = !!(from && to);
  const range = customActive ? { f: from, tt: to } : (() => {
    const now = new Date();
    const days = period === "kun" ? 0 : period === "oy" ? 29 : 6;
    const start = new Date(now); start.setDate(now.getDate() - days);
    return { f: iso(start), tt: iso(now) };
  })();

  useEffect(() => {
    getReportsDaily().then((r) => { setTodayRep(r); setTodayError(null); }).catch((e) => setTodayError(e.message));
  }, []);
  useEffect(() => {
    let cancelled = false;
    getTrend(range.f, range.tt).then((r) => { if (!cancelled) { setTrend(r); setChartError(null); } }).catch((e) => { if (!cancelled) { setTrend([]); setChartError(e.message); } });
    getReportsRange(range.f, range.tt).then((r) => { if (!cancelled) { setRangeRep(r); setRangeRepError(null); } }).catch((e) => { if (!cancelled) { setRangeRep(null); setRangeRepError(e.message); } });
    return () => { cancelled = true; };
  }, [range.f, range.tt]);

  const low = products.filter((p) => p.stock > 0 && p.stock <= 4).length;
  const out = products.filter((p) => p.stock === 0).length;
  const debtorsSum = debts.reduce((s, d) => s + (d.amount - d.paid), 0);
  const todaySum = todayRep ? todayRep.totalRevenue : 0;
  const todayStr = new Date().toDateString();
  const todayProfit = sales.filter((s) => s.createdAt && new Date(s.createdAt).toDateString() === todayStr).reduce((s, x) => s + (x.profit || 0), 0);
  const kpis = [
    { label: "Bugungi savdo", val: todayError ? "—" : som(todaySum), sub: todayError ? "Yuklab bo'lmadi" : `${todayRep ? todayRep.totalOrders : 0} ta chek`, icon: TrendingUp, tone: todayError ? "danger" : "accent" },
    { label: "Bugungi foyda", val: som(todayProfit), sub: "haqiqiy", icon: Wallet, tone: "success" },
    { label: "Ombor qoldig'i", val: String(products.reduce((s, p) => s + p.stock, 0)), sub: `${products.length} mahsulot`, icon: Boxes, tone: "purple" },
    { label: "Qarzdorlik", val: som(debtorsSum), sub: `${debts.filter((d) => d.status !== "To'langan").length} mijoz`, icon: BookText, tone: "warn" },
  ];
  const mini = [
    { label: "Mahsulotlar", val: String(products.length), tone: "accent", icon: Package },
    { label: "Kam qolgan", val: String(low), tone: "warn", icon: AlertTriangle },
    { label: "Tugagan", val: String(out), tone: "danger", icon: X },
    { label: "Bugungi nasiya", val: som(todayRep?.creditSalesAmount || 0), tone: "warn", icon: Receipt },
  ];

  const chartSub = customActive ? `${from} – ${to} · mln so'm` : period === "kun" ? "Bugun · mln so'm" : period === "oy" ? "So'nggi 30 kun · mln so'm" : "So'nggi 7 kun · mln so'm";
  const topProducts = rangeRep?.topProducts || [];

  return <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
    <div className="ar-grid-kpi">
      {kpis.map((k) => <div key={k.label} className="ar-card" style={cardStyle(t)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ color: t.muted, fontSize: 13, fontWeight: 500 }}>{k.label}</span>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: t[k.tone + "Soft"], color: t[k.tone], display: "grid", placeItems: "center" }}><k.icon size={17} /></span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 28, marginTop: 14, lineHeight: 1, color: t.text, letterSpacing: "-.02em" }}>{k.val}</div>
        <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 600, color: t.muted }}>{k.sub}</div>
      </div>)}
    </div>
    <div className="ar-grid-main">
      <div className="ar-card" style={{ ...cardStyle(t), minHeight: 320 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 10 }}>
          <div><div style={{ fontWeight: 600, color: t.text, fontSize: 15 }}>Savdo trendi</div><div style={{ color: t.muted, fontSize: 12.5, marginTop: 2 }}>{chartSub}</div></div>
          {rangeRep && <Badge tone="success" t={t}><TrendingUp size={13} /> {rangeRep.totalOrders} chek</Badge>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 4, background: t.inset, borderRadius: 11, padding: 3 }}>
            {PERIODS.map((p) => <button key={p.id} onClick={() => { setPeriod(p.id); setFrom(""); setTo(""); }} style={{ padding: "7px 13px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12.5, fontFamily: "inherit", fontWeight: !customActive && period === p.id ? 600 : 500, background: !customActive && period === p.id ? t.card : "transparent", color: !customActive && period === p.id ? t.accent : t.muted, boxShadow: !customActive && period === p.id ? t.shadow : "none" }}>{p.label}</button>)}
          </div>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ ...inputS(t), width: 132, padding: "8px 10px", fontSize: 12.5 }} />
          <span style={{ color: t.muted, fontSize: 12.5 }}>–</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ ...inputS(t), width: 132, padding: "8px 10px", fontSize: 12.5 }} />
          {customActive && <button onClick={() => { setFrom(""); setTo(""); }} style={{ padding: "8px 12px", borderRadius: 9, border: `1px solid ${t.border}`, background: "transparent", color: t.muted, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Bekor qilish</button>}
        </div>
        {chartError && <div style={{ color: t.danger, fontSize: 12.5, marginBottom: 8 }}>Grafikni yuklab bo'lmadi: {chartError}</div>}
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trend} margin={{ top: 10, right: 6, left: -22, bottom: 0 }}>
            <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={t.accent} stopOpacity={0.22} /><stop offset="100%" stopColor={t.accent} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 6" stroke={t.border} vertical={false} />
            <XAxis dataKey="d" tick={{ fill: t.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: t.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, color: t.text, boxShadow: t.shadow }} labelStyle={{ color: t.muted }} />
            <Area type="monotone" dataKey="v" stroke={t.accent} strokeWidth={2.5} fill="url(#ga)" dot={{ r: 3, fill: t.accent }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="ar-card" style={{ ...cardStyle(t), display: "flex", flexDirection: "column", gap: 13 }}>
        <div style={{ fontWeight: 600, color: t.text, fontSize: 15 }}>Top mahsulotlar</div>
        {topProducts.length === 0 && <div style={{ color: rangeRepError ? t.danger : t.muted, fontSize: 13 }}>{rangeRepError ? "Yuklab bo'lmadi: " + rangeRepError : "Bu davrda savdo yo'q"}</div>}
        {topProducts.map((p, i) => <div key={p.productId} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: t.accent, fontWeight: 700, width: 18, fontSize: 14 }}>{i + 1}</span>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ color: t.text, fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.productName}</div></div>
          <span style={{ color: t.muted, fontSize: 12.5, fontWeight: 600 }}>{p.quantitySold} dona</span>
        </div>)}
      </div>
    </div>
    <div className="ar-grid-kpi">
      {mini.map((m) => <div key={m.label} onClick={() => goTo && goTo("inflow")} className="ar-card" style={{ ...cardStyle(t), display: "flex", alignItems: "center", gap: 14, padding: 16, cursor: goTo ? "pointer" : "default" }}>
        <span style={{ width: 40, height: 40, borderRadius: 11, background: t[m.tone + "Soft"], color: t[m.tone], display: "grid", placeItems: "center" }}><m.icon size={19} /></span>
        <div><div style={{ fontWeight: 700, fontSize: 22, color: t.text, lineHeight: 1, letterSpacing: "-.02em" }}>{m.val}</div><div style={{ color: t.muted, fontSize: 12.5, marginTop: 3 }}>{m.label}</div></div>
      </div>)}
    </div>
    <div className="ar-card" style={cardStyle(t)}>
      <div style={{ fontWeight: 600, color: t.text, fontSize: 15, marginBottom: 14 }}>Oxirgi savdolar</div>
      {sales.length === 0 && <div style={{ color: t.muted, fontSize: 13 }}>Savdo yo'q</div>}
      {sales.slice(0, 6).map((r, i) => <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 0", borderTop: i ? `1px solid ${t.border}` : "none" }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: t.inset, color: t.muted, display: "grid", placeItems: "center" }}><Receipt size={16} /></span>
        <div style={{ flex: 1 }}><div style={{ color: t.text, fontSize: 13.5, fontWeight: 600 }}>{r.id}</div><div style={{ color: t.muted, fontSize: 12 }}>{r.items} ta mahsulot · {r.t}</div></div>
        {r.who && <Badge tone={r.who === "Naqd" ? "success" : r.who === "Karta" ? "accent" : "warn"} t={t}>{r.who}</Badge>}
        <span style={{ color: t.text, fontWeight: 600, fontSize: 13.5, minWidth: 100, textAlign: "right" }}>{som(r.sum)}</span>
      </div>)}
    </div>
  </div>;
}
