import { useRef, useState, useEffect } from "react";
import {
  Search, ScanLine, ShoppingCart, Trash2, Minus, Plus, X, Banknote, CreditCard, Wallet, Check,
} from "lucide-react";
import { useStore } from "../lib/StoreContext";
import { cardStyle, ghostBtn, primaryBtn, qtyBtn, inputS } from "../lib/styles";
import { FONT } from "../lib/theme";
import { som } from "../lib/format";
import { Badge, Modal } from "../components";
import darkLogo from "../assets/Rasimlar/DARK.png";
import liteLogo from "../assets/Rasimlar/LITE.png";

export default function POS({ t, mode }) {
  const { products, completeSale, addDebt, toast } = useStore();
  const [q, setQ] = useState("");
  const [cart, setCart] = useState([]);
  const [pay, setPay] = useState("Naqd");
  const [nasiyaName, setNasiyaName] = useState("");
  const [nasiyaPhone, setNasiyaPhone] = useState("");
  const [nasiyaPaid, setNasiyaPaid] = useState(0);
  const [nasiyaModalOpen, setNasiyaModalOpen] = useState(false);
  const [nasiyaDraft, setNasiyaDraft] = useState({ name: "", phone: "", paid: "" });
  const [finishing, setFinishing] = useState(false);
  const [discountSum, setDiscountSum] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const searchRef = useRef(null);
  const scanBuffer = useRef("");
  const scanTimer = useRef(null);
  const add = (p) => { if (p.stock <= 0) return; setCart((c) => { const ex = c.find((x) => x.id === p.id); if (ex) return ex.qty >= p.stock ? c : c.map((x) => x.id === p.id ? { ...x, qty: x.qty + 1 } : x); return [...c, { ...p, qty: 1 }]; }); };
  useEffect(() => {
    const isTyping = () => { const el = document.activeElement; return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA"); };
    const h = (e) => {
      if (e.key === "/" && !isTyping()) { e.preventDefault(); searchRef.current?.focus(); return; }
      if (e.key === "Escape") { setQ(""); searchRef.current?.blur(); return; }
      if (isTyping()) return;
      if (e.key === "Enter") {
        const code = scanBuffer.current.trim();
        scanBuffer.current = ""; clearTimeout(scanTimer.current);
        if (!code) return;
        const match = products.find((p) => p.code === code);
        if (match) { add(match); toast(`Qo'shildi: ${match.name}`); }
        else { setQ(code); searchRef.current?.focus(); toast("Mahsulot topilmadi: " + code); }
        return;
      }
      if (e.key.length === 1) {
        scanBuffer.current += e.key;
        clearTimeout(scanTimer.current);
        scanTimer.current = setTimeout(() => { scanBuffer.current = ""; }, 300);
      }
    };
    window.addEventListener("keydown", h); return () => { window.removeEventListener("keydown", h); clearTimeout(scanTimer.current); };
  }, [products]);
  const qTrim = q.trim();
  const list = qTrim ? products.filter((p) => (p.name + p.code).toLowerCase().includes(qTrim.toLowerCase())) : [];
  const setQty = (id, d) => setCart((c) => c.map((x) => x.id === id ? { ...x, qty: Math.max(1, x.qty + d) } : x));
  const remove = (id) => setCart((c) => c.filter((x) => x.id !== id));
  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const discountNum = Math.max(Math.round(+discountSum || 0), 0);
  const discountValid = discountNum <= 200000;
  const discount = Math.min(discountNum, subtotal);
  const total = subtotal - discount;
  const nasiyaValid = pay !== "Nasiya" || nasiyaName.trim().length > 0;
  const canFinish = cart.length > 0 && discountValid && nasiyaValid;
  const nasiyaDebt = Math.max(total - nasiyaPaid, 0);
  const finish = async () => {
    if (!canFinish || finishing) return;
    setFinishing(true);
    const customer = pay === "Nasiya" ? { name: nasiyaName.trim(), phone: nasiyaPhone ? "+998" + nasiyaPhone : "" } : undefined;
    const order = await completeSale(cart, pay, discount, customer);
    setFinishing(false);
    if (!order) return;
    if (pay === "Nasiya" && nasiyaDebt > 0) await addDebt({ name: customer.name, phone: customer.phone, amount: nasiyaDebt, orderId: order.id });
    setCart([]); setDiscountSum(""); setNasiyaName(""); setNasiyaPhone(""); setNasiyaPaid(0); setCartOpen(false);
    toast("Savdo yakunlandi · qoldiq yangilandi", "success");
  };

  const CartPanel = (
    <div className="ar-card ar-cart" style={{ ...cardStyle(t), padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "16px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}><ShoppingCart size={18} style={{ color: t.accent }} /><span style={{ fontWeight: 700, color: t.text, fontSize: 15 }}>Savat</span><span style={{ background: t.accentSoft, color: t.accent, borderRadius: 999, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{cart.length}</span></div>
        <button onClick={() => setClearConfirm(true)} className="ar-btn-ghost" style={{ ...ghostBtn(t), padding: "6px 10px", fontSize: 12.5, color: t.danger, borderColor: "rgba(239, 68, 68, 0.4)", background: "rgba(239, 68, 68, 0.08)" }}><Trash2 size={14} /> Tozalash</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10, minHeight: 120 }}>
        {cart.length === 0 && <div style={{ margin: "auto", textAlign: "center", color: t.muted, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><img src={mode === "dark" ? darkLogo : liteLogo} alt="Logo" style={{ width: 120, height: "auto", objectFit: "contain", transform: "scale(2.2)", opacity: 1 }} /><div style={{ fontSize: 14.5, marginTop: -15, fontWeight: 500 }}>Savat bo'sh.<br />Mahsulot tanlang.</div></div>}
        {cart.map((x) => <div key={x.id} style={{ display: "flex", gap: 11, alignItems: "center", background: t.inset, borderRadius: 14, padding: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ color: t.text, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.name}</div><div style={{ color: t.muted, fontSize: 11.5 }}>{som(x.price)}</div></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => setQty(x.id, -1)} style={qtyBtn(t)}><Minus size={13} /></button>
            <span style={{ width: 18, textAlign: "center", fontWeight: 700, color: t.text, fontSize: 13.5 }}>{x.qty}</span>
            <button onClick={() => setQty(x.id, 1)} style={qtyBtn(t)}><Plus size={13} /></button>
            <button onClick={() => remove(x.id)} style={{ ...qtyBtn(t), color: t.danger }}><X size={14} /></button>
          </div>
        </div>)}
      </div>
      <div style={{ padding: 16, borderTop: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: t.muted }}>Oraliq summa</span><span style={{ color: t.text, fontWeight: 600 }}>{som(subtotal)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: t.muted }}>Chegirma</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="number" min="0" max={subtotal} value={discountSum} onChange={(e) => setDiscountSum(e.target.value)} placeholder="0" style={{ ...inputS(t), width: 110, padding: "6px 8px", fontSize: 13, textAlign: "right", borderColor: !discountValid ? t.danger : undefined }} />
              {discountValid && discount > 0 && <span style={{ color: t.danger, fontWeight: 600 }}>- {som(discount)}</span>}
            </div>
          </div>
          {!discountValid && <div style={{ color: t.danger, fontSize: 12, textAlign: "right" }}>Chegirma 200.000 so'mdan ko'p bo'lmasligi kerak</div>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 8, borderTop: `1px solid ${t.border}` }}><span style={{ color: t.muted, fontSize: 13 }}>Jami</span><span style={{ fontWeight: 700, fontSize: 24, color: t.text, letterSpacing: "-.02em" }}>{som(total)}</span></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[["Naqd", Banknote], ["Karta", CreditCard], ["Nasiya", Wallet]].map(([m, Ic]) => <button key={m} onClick={() => m === "Nasiya" ? (setNasiyaDraft({ name: nasiyaName, phone: nasiyaPhone, paid: nasiyaPaid ? String(nasiyaPaid) : "" }), setNasiyaModalOpen(true)) : setPay(m)} style={{ padding: "11px 6px", borderRadius: 12, fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, border: `1px solid ${pay === m ? t.accent : t.border}`, background: pay === m ? t.accentSoft : t.card, color: pay === m ? t.accent : t.muted, fontFamily: FONT }}><Ic size={17} />{m}</button>)}
        </div>
        {pay === "Nasiya" && <div style={{ display: "flex", flexDirection: "column", gap: 6, background: t.inset, borderRadius: 12, padding: "10px 12px", fontSize: 12.5 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: t.muted }}>Nasiya: <b style={{ color: t.text }}>{nasiyaName}</b>{nasiyaPhone && ` · +998${nasiyaPhone}`}</span>
            <button onClick={() => { setNasiyaDraft({ name: nasiyaName, phone: nasiyaPhone, paid: nasiyaPaid ? String(nasiyaPaid) : "" }); setNasiyaModalOpen(true); }} style={{ background: "none", border: "none", color: t.accent, fontWeight: 600, fontSize: 12.5, cursor: "pointer", fontFamily: FONT }}>O'zgartirish</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: t.muted }}>Hozir to'landi</span><span style={{ color: t.text, fontWeight: 600 }}>{som(nasiyaPaid)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: t.muted }}>Qarzga qoladi</span><span style={{ color: t.danger, fontWeight: 700 }}>{som(nasiyaDebt)}</span></div>
        </div>}
        <button onClick={finish} disabled={!canFinish || finishing} className="ar-btn-primary" style={{ ...primaryBtn(t), opacity: canFinish && !finishing ? 1 : 0.5 }}><Check size={18} /> {finishing ? "Yakunlanmoqda…" : "Savdoni yakunlash"}</button>
      </div>
    </div>
  );

  return <div className="ar-pos">
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <div className="ar-fieldwrap" style={{ display: "flex", alignItems: "center", gap: 10, background: t.card, border: `1px solid ${t.border}`, borderRadius: 999, padding: "6px 8px 6px 18px", boxShadow: t.shadow }}>
        <div style={{ display: "flex", alignItems: "center", fontWeight: 900, fontSize: 18, letterSpacing: "-.03em", marginRight: 6, userSelect: "none" }}>
          <span style={{ color: t.text }}>in</span><span style={{ color: "#3b82f6" }}>POS</span>
        </div>
        <Search size={18} style={{ color: t.muted, flex: "none" }} />
        <input ref={searchRef} className="ar-naked-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Mahsulotni qidiring yoki shtrix kodni kiriting…" style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", color: t.text, fontSize: 14, fontFamily: FONT, padding: "10px 6px" }} />
        <button onClick={() => searchRef.current?.focus()} style={{ flex: "none", display: "flex", alignItems: "center", gap: 7, border: "none", borderRadius: 999, padding: "11px 18px", background: t.text, color: t.bg, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}><ScanLine size={16} /> Skaner</button>
      </div>
      {qTrim ? <div className="ar-prodgrid">
        {list.map((p) => { const o = p.stock <= 0; return <button key={p.id} disabled={o} onClick={() => add(p)} className="ar-prodcard" style={{ textAlign: "left", border: `1px solid ${t.border}`, background: t.card, borderRadius: 18, padding: 14, cursor: o ? "not-allowed" : "pointer", opacity: o ? 0.55 : 1, display: "flex", flexDirection: "column", gap: 11, fontFamily: FONT, boxShadow: t.shadow }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>{o ? <Badge tone="danger" t={t}>Tugagan</Badge> : p.stock <= 4 ? <Badge tone="warn" t={t}>Kam · {p.stock}</Badge> : <Badge tone="muted" t={t}>{p.stock} dona</Badge>}</div>
          <div style={{ color: t.text, fontSize: 14, fontWeight: 600 }}>{p.name}</div>
          <div style={{ color: t.text, fontWeight: 700, fontSize: 16, letterSpacing: "-.01em" }}>{som(p.price)}</div>
        </button>; })}
        {list.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", color: t.muted, padding: 30, fontSize: 13.5 }}>Mahsulot topilmadi: {qTrim}</div>}
      </div> : <div style={{ textAlign: "center", padding: "24px 20px 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ padding: "40px 20px", display: "flex", justifyContent: "center" }}>
          <img src={mode === "dark" ? darkLogo : liteLogo} alt="Logo" style={{ width: 280, height: "auto", objectFit: "contain", transform: "scale(1.5)", opacity: 0.9 }} />
        </div>
      </div>}
    </div>
    <div className="ar-cart-wrap">{CartPanel}</div>
    <button className="ar-cartfab" onClick={() => setCartOpen(true)} style={{ background: t.accent, color: "#fff", boxShadow: t.shadowBtn }}><ShoppingCart size={18} /> Savat · {cart.length} <span style={{ marginLeft: "auto", fontWeight: 700 }}>{som(total)}</span></button>
    {cartOpen && <div className="ar-sheetbg" onClick={() => setCartOpen(false)}><div className="ar-sheet" onClick={(e) => e.stopPropagation()}>{CartPanel}</div></div>}
    {clearConfirm && <Modal t={t} title="Savatni tozalash" onClose={() => setClearConfirm(false)} maxWidth={360}>
      <div style={{ color: t.text, fontSize: 14, marginBottom: 18 }}>Rostdan ham barcha mahsulotlarni o'chirmoqchimisiz?</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={() => setClearConfirm(false)} style={ghostBtn(t)}>Bekor qilish</button>
        <button onClick={() => { setCart([]); setClearConfirm(false); }} className="ar-btn-primary" style={{ ...primaryBtn(t), background: t.danger }}><Trash2 size={16} /> Tozalash</button>
      </div>
    </Modal>}
    {nasiyaModalOpen && (() => {
      const draftPaid = Math.min(Math.max(Math.round(+nasiyaDraft.paid || 0), 0), total);
      const draftDebt = Math.max(total - draftPaid, 0);
      const draftValid = nasiyaDraft.name.trim().length > 0;
      return <Modal t={t} title="Nasiya savdo" onClose={() => setNasiyaModalOpen(false)} maxWidth={400}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ color: t.muted, fontSize: 12.5, marginBottom: 6 }}>Mijoz ismi *</div>
            <input autoFocus value={nasiyaDraft.name} onChange={(e) => setNasiyaDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Ism familiya" style={{ ...inputS(t), padding: "11px 13px" }} />
          </div>
          <div>
            <div style={{ color: t.muted, fontSize: 12.5, marginBottom: 6 }}>Telefon</div>
            <div className="ar-fieldwrap" style={{ ...inputS(t), padding: 0, display: "flex", alignItems: "center" }}>
              <span style={{ padding: "11px 0 11px 13px", color: t.muted, fontWeight: 600 }}>+998</span>
              <input className="ar-naked-input" value={nasiyaDraft.phone} onChange={(e) => setNasiyaDraft((d) => ({ ...d, phone: e.target.value.replace(/\D/g, "").slice(0, 9) }))} placeholder="90 123 45 67" style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: t.text, fontSize: 14, padding: "11px 13px 11px 4px", fontFamily: "inherit" }} />
            </div>
          </div>
          <div>
            <div style={{ color: t.muted, fontSize: 12.5, marginBottom: 6 }}>Hozir to'lanadigan summa</div>
            <input type="number" min="0" max={total} value={nasiyaDraft.paid} onChange={(e) => setNasiyaDraft((d) => ({ ...d, paid: e.target.value }))} placeholder="0" style={{ ...inputS(t), padding: "11px 13px" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, paddingTop: 4, borderTop: `1px solid ${t.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: t.muted }}><span>Jami summa</span><span style={{ color: t.text, fontWeight: 600 }}>{som(total)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", color: t.muted }}><span>Hozir to'landi</span><span style={{ color: t.text, fontWeight: 600 }}>{som(draftPaid)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: t.muted }}>Qarzga qoladi</span><span style={{ color: t.danger, fontWeight: 700 }}>{som(draftDebt)}</span></div>
          </div>
          <button onClick={() => { if (!draftValid) return; setNasiyaName(nasiyaDraft.name.trim()); setNasiyaPhone(nasiyaDraft.phone); setNasiyaPaid(draftPaid); setPay("Nasiya"); setNasiyaModalOpen(false); }} className="ar-btn-primary" style={{ ...primaryBtn(t), opacity: draftValid ? 1 : 0.5 }}><Check size={18} /> Tasdiqlash</button>
        </div>
      </Modal>;
    })()}
  </div>;
}
