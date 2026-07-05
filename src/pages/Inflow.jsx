import { useState } from "react";
import { Search, Check, Plus, Pencil, Trash2 } from "lucide-react";
import { useStore } from "../lib/StoreContext";
import { inputS, ghostBtn, primaryBtn } from "../lib/styles";
import { som } from "../lib/format";
import { Badge, PageHead, DataTable, Field, Modal, FlowModal } from "../components";

function ProductModal({ t, initial, onClose, onSave }) {
  const [f, setF] = useState(initial ? { name: initial.name, price: String(initial.price), buy: String(initial.buy), stock: String(initial.stock), code: initial.code || "" } : { name: "", price: "", buy: "", stock: "", code: "" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const ok = f.name.trim() && +f.price > 0;
  const save = () => { if (!ok) return; onSave({ name: f.name.trim(), price: +f.price || 0, buy: Math.max(0, +f.buy || 0), stock: Math.max(0, Math.floor(+f.stock || 0)), code: f.code.trim() }); };
  return <Modal t={t} title={initial ? "Mahsulotni tahrirlash" : "Yangi mahsulot"} onClose={onClose}>
    <Field t={t} label="Nomi *"><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="masalan, Sauvage EDP" style={inputS(t)} /></Field>
    {!initial && <Field t={t} label="Boshlang'ich qoldiq"><input type="number" value={f.stock} onChange={(e) => set("stock", e.target.value)} placeholder="100" style={inputS(t)} /></Field>}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <Field t={t} label="Sotuv narxi *"><input type="number" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="1250000" style={inputS(t)} /></Field>
      <Field t={t} label="Xarid narxi"><input type="number" value={f.buy} onChange={(e) => set("buy", e.target.value)} placeholder="820000" style={inputS(t)} /></Field>
    </div>
    <Field t={t} label="Shtrix kod"><input value={f.code} onChange={(e) => set("code", e.target.value)} placeholder="skaner bilan yoki bo'sh qoldiring (avtomatik yaratiladi)" style={inputS(t)} /></Field>
    <button onClick={save} className="ar-btn-primary" style={{ ...primaryBtn(t), marginTop: 8, opacity: ok ? 1 : 0.5 }}><Check size={18} /> Saqlash</button>
  </Modal>;
}

const TABS = [{ id: "kirim", label: "Kirimlar" }, { id: "mahsulot", label: "Mahsulotlar" }];

export default function Inflow({ t }) {
  const { products, stockMovements, stockMovementsError, addInflow, addProduct, editProduct, deleteProduct } = useStore();
  const inflow = stockMovements.filter((m) => m.type === "Kirim");
  const [tab, setTab] = useState("kirim");
  const [openIn, setOpenIn] = useState(false);
  const [openProd, setOpenProd] = useState(false);
  const [editFor, setEditFor] = useState(null);
  const [delFor, setDelFor] = useState(null);
  const [q, setQ] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const list = products
    .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
    .filter((p) => stockFilter === "low" ? (p.stock > 0 && p.stock <= 4) : stockFilter === "out" ? p.stock === 0 : true);
  const STOCK_FILTERS = [
    { id: "all", label: "Hammasi" },
    { id: "low", label: "Kam qolgan" },
    { id: "out", label: "Tugagan" },
  ];

  return <>
    <div style={{ display: "flex", gap: 4, background: t.inset, borderRadius: 11, padding: 3, width: "fit-content", marginBottom: 16 }}>
      {TABS.map((tb) => <button key={tb.id} onClick={() => setTab(tb.id)} style={{ padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: tab === tb.id ? 600 : 500, background: tab === tb.id ? t.card : "transparent", color: tab === tb.id ? t.accent : t.muted, boxShadow: tab === tb.id ? t.shadow : "none" }}>{tb.label}</button>)}
    </div>

    {tab === "kirim" ? <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: t.text, letterSpacing: "-.01em" }}>Kirim<span style={{ color: t.muted, fontWeight: 500 }}> · {inflow.length} ta</span></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setOpenProd(true)} style={ghostBtn(t)}><Plus size={16} /> Yangi mahsulot</button>
          <button onClick={() => setOpenIn(true)} className="ar-btn-primary" style={{ ...primaryBtn(t), width: "auto", padding: "9px 16px", fontSize: 13.5 }}><Plus size={16} /> Yangi kirim</button>
        </div>
      </div>
      <DataTable t={t} rows={inflow} empty={stockMovementsError ? "Yuklab bo'lmadi: " + stockMovementsError : "Kirim yo'q"} cols={[
        { label: "Mahsulot", key: "product" },
        { label: "Miqdor", render: (r) => <Badge tone="success" t={t}>{r.qty}</Badge> },
        { label: "Kim", key: "who" },
        { label: "Vaqt", key: "t" },
      ]} />
      {openIn && <FlowModal t={t} kind="in" products={products} onClose={() => setOpenIn(false)} onSave={(pid, qty) => { addInflow(pid, qty); setOpenIn(false); }} />}
    </> : <>
      <PageHead t={t} title="Mahsulotlar" count={`${products.length} ta`} />
      <div style={{ position: "relative", marginTop: 12 }}>
        <Search size={16} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: t.muted }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qidirish…" style={{ ...inputS(t), padding: "10px 12px 10px 38px", maxWidth: 320 }} />
      </div>
      <div style={{ display: "flex", gap: 4, background: t.inset, borderRadius: 11, padding: 3, width: "fit-content", marginTop: 12 }}>
        {STOCK_FILTERS.map((f) => <button key={f.id} onClick={() => setStockFilter(f.id)} style={{ padding: "7px 13px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12.5, fontFamily: "inherit", fontWeight: stockFilter === f.id ? 600 : 500, background: stockFilter === f.id ? t.card : "transparent", color: stockFilter === f.id ? t.accent : t.muted, boxShadow: stockFilter === f.id ? t.shadow : "none" }}>{f.label}</button>)}
      </div>
      <DataTable t={t} rows={list} empty="Mahsulot yo'q" cols={[
        { label: "Mahsulot", render: (p) => <span style={{ color: t.text, fontWeight: 600 }}>{p.name}</span> },
        { label: "Shtrix kod", render: (p) => <span style={{ color: t.muted }}>{p.code || "—"}</span> },
        { label: "Narx", render: (p) => <span style={{ color: t.text, fontWeight: 600 }}>{som(p.price)}</span> },
        { label: "Qoldiq", render: (p) => <span style={{ color: t.text }}>{p.stock}</span> },
        { label: "Status", render: (p) => p.stock === 0 ? <Badge tone="danger" t={t}>Tugagan</Badge> : p.stock <= 4 ? <Badge tone="warn" t={t}>Kam qolgan</Badge> : <Badge tone="success" t={t}>Sotuvda</Badge> },
        { label: "Amallar", render: (p) => <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setEditFor(p)} style={{ ...ghostBtn(t), padding: "6px 10px", fontSize: 12 }}><Pencil size={13} /></button>
          <button onClick={() => setDelFor(p)} style={{ ...ghostBtn(t), padding: "6px 10px", fontSize: 12, color: t.danger }}><Trash2 size={13} /></button>
        </div> },
      ]} />
    </>}
    {openProd && <ProductModal t={t} onClose={() => setOpenProd(false)} onSave={(p) => { addProduct(p); setOpenProd(false); }} />}
    {editFor && <ProductModal t={t} initial={editFor} onClose={() => setEditFor(null)} onSave={(p) => { editProduct(editFor.id, p); setEditFor(null); }} />}
    {delFor && <Modal t={t} title="Mahsulotni o'chirish" onClose={() => setDelFor(null)} maxWidth={360}>
      <div style={{ color: t.text, fontSize: 14, marginBottom: 18 }}>"<b>{delFor.name}</b>" mahsulotini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={() => setDelFor(null)} style={ghostBtn(t)}>Bekor qilish</button>
        <button onClick={() => { deleteProduct(delFor.id); setDelFor(null); }} className="ar-btn-primary" style={{ ...primaryBtn(t), background: t.danger }}><Trash2 size={16} /> O'chirish</button>
      </div>
    </Modal>}
  </>;
}
