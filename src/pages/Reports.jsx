import { useState } from "react";
import { Download } from "lucide-react";
import { useStore } from "../lib/StoreContext";
import { cardStyle, primaryBtn, inputS } from "../lib/styles";
import { exportReportCsv } from "../lib/api";
import { PageHead, BackLink, Field } from "../components";

const iso = (d) => d.toISOString().slice(0, 10);
const today = new Date();
const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);

export default function Reports({ t, goBack }) {
  const { toast } = useStore();
  const [from, setFrom] = useState(iso(weekAgo));
  const [to, setTo] = useState(iso(today));
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (!from || !to) return;
    setBusy(true);
    try {
      const { blob, filename } = await exportReportCsv(from, to);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast("Hisobot yuklab olindi");
    } catch (e) { toast("Yuklab bo'lmadi: " + e.message); }
    finally { setBusy(false); }
  };

  return <>
    {goBack && <BackLink t={t} onClick={goBack} />}
    <PageHead t={t} title="Hisobotlar" />
    <div className="ar-card" style={{ ...cardStyle(t), marginTop: 14, maxWidth: 480 }}>
      <div style={{ fontWeight: 600, color: t.text, fontSize: 15, marginBottom: 12 }}>Savdo hisobotini yuklab olish (CSV)</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field t={t} label="Boshlanish sanasi"><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={inputS(t)} /></Field>
        <Field t={t} label="Tugash sanasi"><input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={inputS(t)} /></Field>
      </div>
      <button onClick={download} className="ar-btn-primary" style={{ ...primaryBtn(t), opacity: busy ? 0.6 : 1 }} disabled={busy}>
        {busy ? <>Tayyorlanmoqda…</> : <><Download size={16} /> Yuklab olish</>}
      </button>
    </div>
  </>;
}
