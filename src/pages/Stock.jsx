import { useState, useEffect } from "react";
import { Boxes, AlertTriangle, X, Wallet } from "lucide-react";
import { useStore } from "../lib/StoreContext";
import { som } from "../lib/format";
import { Stat, PageHead, DataTable, Badge } from "../components";
import { getStockMovements, fromApiStockMovement } from "../lib/api";
import { inputS } from "../lib/styles";

const PERIODS = [
  { id: "kun", label: "Bugun" },
  { id: "hafta", label: "Hafta" },
  { id: "oy", label: "Oy" },
];
const iso = (d) => d.toISOString().slice(0, 10);

export default function Stock({ t }) {
  const { products, stockMovements, stockMovementsError } = useStore();
  const tone = { Kirim: "success", Savdo: "accent", Chiqim: "danger" };

  const [period, setPeriod] = useState("hafta");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filtered, setFiltered] = useState(null);
  const [filterError, setFilterError] = useState(null);
  const [productFilter, setProductFilter] = useState(null);

  const customActive = !!(from && to);
  const range = customActive ? { f: from, tt: to } : (() => {
    const now = new Date();
    const days = period === "kun" ? 0 : period === "oy" ? 29 : 6;
    const start = new Date(now); start.setDate(now.getDate() - days);
    return { f: iso(start), tt: iso(now) };
  })();

  useEffect(() => {
    let cancelled = false;
    getStockMovements({ from: range.f + "T00:00:00", to: range.tt + "T23:59:59" })
      .then((r) => { if (!cancelled) { setFiltered(r.map(fromApiStockMovement).sort((a, b) => b.id - a.id)); setFilterError(null); } })
      .catch((e) => { if (!cancelled) { setFiltered([]); setFilterError(e.message); } });
    return () => { cancelled = true; };
  }, [range.f, range.tt]);

  const rows = filtered ?? stockMovements;
  const rowsError = filtered === null ? stockMovementsError : filterError;

  const lowProducts = products.filter((p) => p.stock > 0 && p.stock <= 4);
  const outProducts = products.filter((p) => p.stock === 0);
  const filteredProducts = productFilter === "low" ? lowProducts : productFilter === "out" ? outProducts : [];

  return <>
    <div className="ar-grid-kpi" style={{ marginBottom: 16 }}>
      <Stat t={t} label="Ombordagi qoldiq" val={String(products.reduce((s, p) => s + p.stock, 0))} tone="accent" icon={Boxes} />
      <Stat t={t} label="Kam qolgan" val={String(lowProducts.length)} tone="warn" icon={AlertTriangle} onClick={() => setProductFilter((m) => m === "low" ? null : "low")} active={productFilter === "low"} />
      <Stat t={t} label="Tugagan" val={String(outProducts.length)} tone="danger" icon={X} onClick={() => setProductFilter((m) => m === "out" ? null : "out")} active={productFilter === "out"} />
      <Stat t={t} label="Ombor qiymati" val={som(products.reduce((s, p) => s + p.buy * p.stock, 0))} tone="success" icon={Wallet} />
    </div>
    {productFilter && <div style={{ marginBottom: 16 }}>
      <PageHead t={t} title={productFilter === "low" ? "Kam qolgan mahsulotlar" : "Tugagan mahsulotlar"} />
      <DataTable t={t} rows={filteredProducts} empty="Mahsulot yo'q" cols={[
        { label: "Mahsulot", render: (p) => <span style={{ color: t.text, fontWeight: 600 }}>{p.name}</span> },
        { label: "Shtrix-kod", render: (p) => p.code || "—" },
        { label: "Qoldiq", render: (p) => <Badge tone={p.stock === 0 ? "danger" : "warn"} t={t}>{p.stock} dona</Badge> },
        { label: "Narxi", render: (p) => som(p.price) },
      ]} />
    </div>}
    <PageHead t={t} title="Ombor harakati" />
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 4, background: t.inset, borderRadius: 11, padding: 3 }}>
        {PERIODS.map((p) => <button key={p.id} onClick={() => { setPeriod(p.id); setFrom(""); setTo(""); }} style={{ padding: "7px 13px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12.5, fontFamily: "inherit", fontWeight: !customActive && period === p.id ? 600 : 500, background: !customActive && period === p.id ? t.card : "transparent", color: !customActive && period === p.id ? t.accent : t.muted, boxShadow: !customActive && period === p.id ? t.shadow : "none" }}>{p.label}</button>)}
      </div>
      <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ ...inputS(t), width: 132, padding: "8px 10px", fontSize: 12.5 }} />
      <span style={{ color: t.muted, fontSize: 12.5 }}>–</span>
      <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ ...inputS(t), width: 132, padding: "8px 10px", fontSize: 12.5 }} />
      {customActive && <button onClick={() => { setFrom(""); setTo(""); }} style={{ padding: "8px 12px", borderRadius: 9, border: `1px solid ${t.border}`, background: "transparent", color: t.muted, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Bekor qilish</button>}
    </div>
    <DataTable t={t} rows={rows} empty={rowsError ? "Yuklab bo'lmadi: " + rowsError : "Hozircha harakat yo'q"} cols={[
      { label: "Tur", render: (r) => <Badge tone={tone[r.type]} t={t}>{r.type}</Badge> },
      { label: "Mahsulot", render: (r) => <span style={{ color: t.text, fontWeight: 600 }}>{r.product}</span> },
      { label: "Miqdor", render: (r) => <span style={{ color: r.qty.startsWith("+") ? t.success : t.danger, fontWeight: 700 }}>{r.qty}</span> },
      { label: "Kim", key: "who" }, { label: "Vaqt", key: "t" },
    ]} />
  </>;
}
