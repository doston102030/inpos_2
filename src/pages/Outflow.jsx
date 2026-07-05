import { useState } from "react";
import { useStore } from "../lib/StoreContext";
import { PageHead, DataTable, Badge, FlowModal } from "../components";

export default function Outflow({ t }) {
  const { products, outflow, addOutflow } = useStore();
  const [open, setOpen] = useState(false);
  return <>
    <PageHead t={t} title="Chiqim" count={`${outflow.length} ta`} action="Yangi chiqim" onAction={() => setOpen(true)} />
    <DataTable t={t} rows={outflow} empty="Chiqim yo'q" cols={[
      { label: "Sabab", render: (r) => <Badge tone={r.reason === "Buzilgan" ? "danger" : r.reason === "Qaytarilgan" ? "accent" : "warn"} t={t}>{r.reason}</Badge> },
      { label: "Mahsulot", render: (r) => <span style={{ color: t.text, fontWeight: 600 }}>{r.product}</span> },
      { label: "Miqdor", render: (r) => <span style={{ color: t.danger, fontWeight: 700 }}>-{r.qty}</span> },
      { label: "Sana", key: "date" },
    ]} />
    {open && <FlowModal t={t} kind="out" products={products} onClose={() => setOpen(false)} onSave={(pid, qty, reason) => { addOutflow(pid, qty, reason); setOpen(false); }} />}
  </>;
}
