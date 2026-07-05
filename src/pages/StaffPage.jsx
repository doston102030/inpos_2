import { useState } from "react";
import { Check } from "lucide-react";
import { useStore } from "../lib/StoreContext";
import { inputS, primaryBtn, ghostBtn } from "../lib/styles";
import { PageHead, DataTable, Badge, BackLink, Modal, Field, Switch } from "../components";

export default function StaffPage({ t, goBack }) {
  const { staff, addStaff, toggleStaffStatus } = useStore();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", pin: "", role: "Kassir" });
  const [statusFor, setStatusFor] = useState(null);
  const tone = { "Super Admin": "purple", Kassir: "success" };
  const ok = f.name.trim() && f.pin.length === 4;
  const save = () => { if (!ok) return; addStaff(f); setOpen(false); setF({ name: "", pin: "", role: "Kassir" }); };
  return <>
    {goBack && <BackLink t={t} onClick={goBack} />}
    <PageHead t={t} title="Xodimlar" count={`${staff.length} ta`} action="Xodim qo'shish" onAction={() => setOpen(true)} />
    <DataTable t={t} rows={staff} empty="Xodim yo'q" cols={[
      { label: "Xodim", render: (s) => <div style={{ display: "flex", alignItems: "center", gap: 11 }}><span style={{ width: 36, height: 36, borderRadius: 11, background: t.accentSoft, color: t.accent, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13 }}>{s.name.split(" ").map((x) => x[0]).join("")}</span><span style={{ color: t.text, fontWeight: 600 }}>{s.name}</span></div> },
      { label: "Rol", render: (s) => <Badge tone={tone[s.role]} t={t}>{s.role}</Badge> },
      { label: "Holat", render: (s) => <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Switch on={s.active} onChange={() => setStatusFor(s)} t={t} />{s.active ? <Badge tone="success" t={t}>Faol</Badge> : <Badge tone="muted" t={t}>Nofaol</Badge>}</div> },
      { label: "Amallar", render: (s) => <button onClick={() => setStatusFor(s)} style={{ ...ghostBtn(t), padding: "6px 10px", fontSize: 12 }}>{s.active ? "Nofaollashtir" : "Faollashtir"}</button> },
    ]} />
    {open && <Modal t={t} title="Xodim qo'shish" onClose={() => setOpen(false)} maxWidth={420}>
      <Field t={t} label="To'liq ism *"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={inputS(t)} /></Field>
      <Field t={t} label="PIN (4 xonali) *"><input value={f.pin} onChange={(e) => setF({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="1234" style={inputS(t)} /></Field>
      <Field t={t} label="Rol"><select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} style={inputS(t)}><option>Kassir</option><option>Super Admin</option></select></Field>
      <button onClick={save} className="ar-btn-primary" style={{ ...primaryBtn(t), opacity: ok ? 1 : 0.5 }}><Check size={18} /> Saqlash</button>
    </Modal>}
    {statusFor && <Modal t={t} title={statusFor.active ? "Xodimni nofaollashtirish" : "Xodimni faollashtirish"} onClose={() => setStatusFor(null)} maxWidth={360}>
      <div style={{ color: t.text, fontSize: 14, marginBottom: 18 }}>"<b>{statusFor.name}</b>" xodimini {statusFor.active ? "nofaollashtirishni" : "faollashtirishni"} tasdiqlaysizmi?</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={() => setStatusFor(null)} style={ghostBtn(t)}>Bekor qilish</button>
        <button onClick={() => { toggleStaffStatus(statusFor.id, !statusFor.active); setStatusFor(null); }} className="ar-btn-primary" style={{ ...primaryBtn(t), background: statusFor.active ? t.danger : t.accent }}><Check size={16} /> Tasdiqlash</button>
      </div>
    </Modal>}
  </>;
}
