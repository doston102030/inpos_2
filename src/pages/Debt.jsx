import { useState } from "react";
import { BookText, Users, Clock, Check, Wallet, Trash2, Pencil } from "lucide-react";
import { useStore } from "../lib/StoreContext";
import { primaryBtn, inputS, ghostBtn } from "../lib/styles";
import { som } from "../lib/format";
import { Stat, PageHead, DataTable, Badge, Modal, Field } from "../components";

function PhoneField({ t, value, onChange }) {
  const invalid = value.length > 0 && value.length < 9;
  return <Field t={t} label="Telefon">
    <div className="ar-fieldwrap" style={{ ...inputS(t), padding: 0, display: "flex", alignItems: "center", borderColor: invalid ? t.danger : undefined }}>
      <span style={{ padding: "11px 0 11px 13px", color: t.muted, fontWeight: 600 }}>+998</span>
      <input className="ar-naked-input" value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="90 123 45 67" style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: t.text, fontSize: 14, padding: "11px 13px 11px 4px", fontFamily: "inherit" }} />
    </div>
    {invalid && <div style={{ color: t.danger, fontSize: 12, marginTop: 4 }}>Telefon raqami 9 xonali bo'lishi kerak</div>}
  </Field>;
}

function DebtForm({ t, f, setF, onSave }) {
  const phoneOk = f.phone.length === 0 || f.phone.length === 9;
  const canSave = f.name.trim() && +f.amount > 0 && phoneOk;
  return <>
    <Field t={t} label="Ism *"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={inputS(t)} /></Field>
    <PhoneField t={t} value={f.phone} onChange={(v) => setF({ ...f, phone: v })} />
    <Field t={t} label="Summa *"><input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} style={inputS(t)} /></Field>
    <button onClick={() => canSave && onSave()} className="ar-btn-primary" style={{ ...primaryBtn(t), opacity: canSave ? 1 : 0.5 }}><Check size={18} /> Saqlash</button>
  </>;
}

const stripPhone = (phone) => (phone || "").replace(/^\+998/, "");

export default function Debt({ t }) {
  const { debts, addDebt, editDebt, payDebt, deleteDebt, user } = useStore();
  const [open, setOpen] = useState(false);
  const [editFor, setEditFor] = useState(null);
  const [payFor, setPayFor] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [delFor, setDelFor] = useState(null);
  const [f, setF] = useState({ name: "", phone: "", amount: "" });
  const [ef, setEf] = useState({ name: "", phone: "", amount: "" });
  const tone = { "To'langan": "success", "Qisman": "warn", "Qarzdor": "danger" };
  const canDelete = user?.role !== "Kassir";
  const totalDue = debts.reduce((s, d) => s + (d.amount - d.paid), 0);
  const save = () => { addDebt({ ...f, phone: f.phone ? "+998" + f.phone : "" }); setOpen(false); setF({ name: "", phone: "", amount: "" }); };
  const saveEdit = () => { editDebt(editFor.id, { ...ef, phone: ef.phone ? "+998" + ef.phone : "" }); setEditFor(null); };
  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div className="ar-grid-kpi">
      <Stat t={t} label="Jami qarz" val={som(totalDue)} tone="danger" icon={BookText} />
      <Stat t={t} label="Qarzdorlar" val={String(debts.filter((d) => d.status !== "To'langan").length)} tone="warn" icon={Users} />
      <Stat t={t} label="Mijozlar" val={String(debts.length)} tone="accent" icon={Clock} />
    </div>
    <div>
      <PageHead t={t} title="Qarz daftari" action="Qarz yozish" onAction={() => setOpen(true)} />
      <DataTable t={t} rows={debts} empty="Qarz yo'q" cols={[
        { label: "Mijoz", render: (d) => <span style={{ color: t.text, fontWeight: 600 }}>{d.name}</span> },
        { label: "Telefon", key: "phone" },
        { label: "Summa", render: (d) => som(d.amount) },
        { label: "To'langan", render: (d) => som(d.paid) },
        { label: "Yaratilgan", key: "created" },
        { label: "Holat", render: (d) => <Badge tone={tone[d.status]} t={t}>{d.status}</Badge> },
        { label: "Amallar", render: (d) => <div style={{ display: "flex", gap: 6 }}>
          {d.status !== "To'langan" && <button onClick={() => { setPayFor(d); setPayAmount(""); }} style={{ ...ghostBtn(t), padding: "6px 10px", fontSize: 12 }}><Wallet size={13} /> To'lov</button>}
          <button onClick={() => { setEditFor(d); setEf({ name: d.name, phone: stripPhone(d.phone), amount: String(d.amount) }); }} style={{ ...ghostBtn(t), padding: "6px 10px", fontSize: 12 }}><Pencil size={13} /></button>
          {canDelete && <button onClick={() => setDelFor(d)} style={{ ...ghostBtn(t), padding: "6px 10px", fontSize: 12, color: t.danger }}><Trash2 size={13} /></button>}
        </div> },
      ]} />
    </div>
    {open && <Modal t={t} title="Qarz yozish" onClose={() => setOpen(false)} maxWidth={420}>
      <DebtForm t={t} f={f} setF={setF} onSave={save} />
    </Modal>}
    {editFor && <Modal t={t} title="Qarzni tahrirlash" onClose={() => setEditFor(null)} maxWidth={420}>
      <DebtForm t={t} f={ef} setF={setEf} onSave={saveEdit} />
    </Modal>}
    {payFor && (() => {
      const remaining = payFor.amount - payFor.paid;
      const payValid = +payAmount > 0 && +payAmount <= remaining;
      return <Modal t={t} title={`To'lov · ${payFor.name}`} onClose={() => setPayFor(null)} maxWidth={360}>
        <div style={{ color: t.muted, fontSize: 13, marginBottom: 12 }}>Qoldiq qarz: <b style={{ color: t.text }}>{som(remaining)}</b></div>
        <Field t={t} label="To'lov summasi *"><input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="100000" max={remaining} style={inputS(t)} /></Field>
        {+payAmount > remaining && <div style={{ color: t.danger, fontSize: 12, marginTop: -8, marginBottom: 12 }}>To'lov qoldiq qarzdan ko'p bo'lishi mumkin emas</div>}
        <button onClick={() => { if (payValid) { payDebt(payFor.id, +payAmount); setPayFor(null); } }} className="ar-btn-primary" style={{ ...primaryBtn(t), opacity: payValid ? 1 : 0.5 }}><Check size={18} /> Tasdiqlash</button>
      </Modal>;
    })()}
    {delFor && <Modal t={t} title="Qarzni o'chirish" onClose={() => setDelFor(null)} maxWidth={360}>
      <div style={{ color: t.text, fontSize: 14, marginBottom: 18 }}>"<b>{delFor.name}</b>" qarz yozuvini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={() => setDelFor(null)} style={ghostBtn(t)}>Bekor qilish</button>
        <button onClick={() => { deleteDebt(delFor.id); setDelFor(null); }} className="ar-btn-primary" style={{ ...primaryBtn(t), background: t.danger }}><Trash2 size={16} /> O'chirish</button>
      </div>
    </Modal>}
  </div>;
}
