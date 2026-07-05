import { useState } from "react";
import { Check } from "lucide-react";
import Modal from "./Modal";
import Field from "./Field";
import { inputS, primaryBtn } from "../lib/styles";

export default function FlowModal({ t, kind, products, onClose, onSave }) {
  const [code, setCode] = useState("");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("Buzilgan");
  const reasons = ["Buzilgan", "Yo'qolgan", "Qaytarilgan"];
  const match = code ? products.find((p) => p.code === code.trim()) : null;
  const qtyNum = +qty;
  const qtyValid = Number.isInteger(qtyNum) && qtyNum > 0;
  const outOfStock = kind === "out" && match && qtyValid && qtyNum > match.stock;
  const ok = match && qtyValid && !outOfStock;
  return <Modal t={t} title={kind === "in" ? "Yangi kirim" : "Yangi chiqim"} onClose={onClose} maxWidth={420}>
    <Field t={t} label="Shtrix kod">
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Skaner bilan yoki qo'lda kiriting" style={inputS(t)} autoFocus />
      {code && (match ? <div style={{ color: t.success, fontSize: 12.5, marginTop: 6, fontWeight: 600 }}>✓ {match.name} {kind === "out" && `(qoldiq: ${match.stock})`}</div> : <div style={{ color: t.danger, fontSize: 12.5, marginTop: 6, fontWeight: 600 }}>Mahsulot topilmadi</div>)}
    </Field>
    <Field t={t} label="Miqdor"><input type="number" min="1" step="1" value={qty} onChange={(e) => setQty(e.target.value)} placeholder={kind === "in" ? "100" : "1"} style={inputS(t)} /></Field>
    {qty && !qtyValid && <div style={{ color: t.danger, fontSize: 12.5, marginTop: -8, marginBottom: 12 }}>Miqdor butun va musbat son bo'lishi kerak</div>}
    {outOfStock && <div style={{ color: t.danger, fontSize: 12.5, marginTop: -8, marginBottom: 12 }}>Omborda yetarli mahsulot yo'q (qoldiq: {match.stock})</div>}
    {kind === "out" && <Field t={t} label="Sabab"><select value={reason} onChange={(e) => setReason(e.target.value)} style={inputS(t)}>{reasons.map((r) => <option key={r}>{r}</option>)}</select></Field>}
    <button onClick={() => ok && onSave(match.id, qtyNum, kind === "out" ? reason : undefined)} className="ar-btn-primary" style={{ ...primaryBtn(t), opacity: ok ? 1 : 0.5 }}><Check size={18} /> Saqlash</button>
  </Modal>;
}
