import { useState, useEffect } from "react";
import { MessageSquare, Wallet, Send } from "lucide-react";
import { useStore } from "../lib/StoreContext";
import { cardStyle, primaryBtn, inputS } from "../lib/styles";
import { listSmsCampaigns, sendSms, getSmsBalance, fromApiSmsCampaign } from "../lib/api";
import { Stat, PageHead, BackLink } from "../components";

export default function SMS({ t, goBack }) {
  const { toast } = useStore();
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [balance, setBalance] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    listSmsCampaigns().then((c) => setCampaigns(c.map(fromApiSmsCampaign))).catch((e) => toast("Kampaniyalarni yuklab bo'lmadi: " + e.message));
    getSmsBalance().then((b) => setBalance(b.balance)).catch(() => setBalance(null));
  };
  useEffect(refresh, []);

  const now = new Date();
  const thisMonthSent = campaigns.filter((c) => c.createdAt && new Date(c.createdAt).getMonth() === now.getMonth() && new Date(c.createdAt).getFullYear() === now.getFullYear()).reduce((s, c) => s + (c.count || 0), 0);
  const ok = to.trim() && msg.trim();
  const send = async () => {
    if (!ok || busy) return;
    setBusy(true);
    try {
      const recipients = to.split(",").map((x) => x.trim()).filter(Boolean);
      await sendSms(recipients, msg.trim());
      setTo(""); setMsg(""); toast("SMS yuborildi"); refresh();
    } catch (e) { toast("Yuborilmadi: " + e.message); }
    finally { setBusy(false); }
  };

  return <>
    {goBack && <BackLink t={t} onClick={goBack} />}
    <div className="ar-grid-kpi" style={{ marginBottom: 16 }}>
      <Stat t={t} label="Bu oy yuborildi" val={String(thisMonthSent)} tone="accent" icon={MessageSquare} />
      <Stat t={t} label="Balans" val={balance !== null ? String(balance) : "—"} tone="purple" icon={Wallet} />
    </div>
    <div className="ar-grid-main">
      <div><PageHead t={t} title="Kampaniyalar" />
        <div className="ar-card" style={{ ...cardStyle(t), padding: 0, overflow: "hidden", marginTop: 14 }}>
          {campaigns.length === 0 && <div style={{ padding: 20, color: t.muted, fontSize: 13 }}>Hozircha kampaniya yo'q</div>}
          {campaigns.map((s, i) => <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 18px", borderTop: i ? `1px solid ${t.border}` : "none" }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: t.accentSoft, color: t.accent, display: "grid", placeItems: "center" }}><MessageSquare size={17} /></span>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ color: t.text, fontWeight: 600, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.message}</div><div style={{ color: t.muted, fontSize: 12 }}>{s.recipients} · {s.t}</div></div>
            <span style={{ color: t.muted, fontSize: 12.5, fontWeight: 600 }}>{s.count} ta</span>
          </div>)}
        </div>
      </div>
      <div className="ar-card" style={{ ...cardStyle(t), height: "fit-content" }}>
        <div style={{ fontWeight: 600, color: t.text, fontSize: 15, marginBottom: 12 }}>Yangi xabar</div>
        <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="+998901234567, +998907654321" style={inputS(t)} />
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Xabar matni…" rows={4} style={{ ...inputS(t), resize: "none", marginTop: 10 }} />
        <button onClick={send} className="ar-btn-primary" style={{ ...primaryBtn(t), marginTop: 12, opacity: ok && !busy ? 1 : 0.5 }}><Send size={16} /> {busy ? "Yuborilmoqda…" : "Yuborish"}</button>
      </div>
    </div>
  </>;
}
