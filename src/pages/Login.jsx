import { useState, useEffect } from "react";
import { Moon, Sun, Delete } from "lucide-react";
import { FONT } from "../lib/theme";
import { icBtn, keyBtn } from "../lib/styles";
import { CSS } from "../lib/css";
import { login, setToken, roleFromApi } from "../lib/api";
import darkLogo from "../assets/Rasimlar/DARK.png";
import liteLogo from "../assets/Rasimlar/LITE.png";

export default function Login({ t, mode, setMode, onLogin }) {
  const [pin, setPin] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (np) => {
    setBusy(true);
    try {
      const res = await login(np);
      setToken(res.token);
      onLogin({ id: res.id, name: res.fullName || res.username || "Foydalanuvchi", role: roleFromApi(res.role), branch: "Markaziy filial" });
    } catch (e) {
      setErr(e.message || "PIN noto'g'ri"); setPin("");
    } finally { setBusy(false); }
  };
  const press = (d) => {
    if (busy) return; setErr("");
    if (d === "del") return setPin((p) => p.slice(0, -1));
    if (pin.length >= 4) return;
    const np = pin + d; setPin(np);
    if (np.length === 4) submit(np);
  };
  useEffect(() => {
    const onKey = (e) => {
      if (e.key >= "0" && e.key <= "9") press(e.key);
      else if (e.key === "Backspace") press("del");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pin, busy]);
  return <div style={{ "--accent": t.accent, minHeight: "100vh", background: t.bg, color: t.text, fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
    <style>{CSS.replace(/__ACCENT__/g, t.accent)}</style>
    <button onClick={() => setMode(mode === "light" ? "dark" : "light")} style={{ ...icBtn(t), position: "absolute", top: 24, right: 24 }}>{mode === "light" ? <Moon size={18} /> : <Sun size={18} />}</button>
    <div className="ar-fade" style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
      <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <img
          src={mode === "dark" ? darkLogo : liteLogo}
          alt="Logo"
          style={{ height: "100%", objectFit: "contain", transform: "scale(3.2)", transition: "all .2s ease", pointerEvents: "none" }}
        />
      </div>
      <div style={{ color: t.muted, fontSize: 13.5, marginTop: 16 }}>{busy ? "Tekshirilmoqda…" : "PIN kodingizni kiriting"}</div>
      <div style={{ marginTop: 26 }}>
        <div className={err ? "ar-shake" : ""} style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 12 }}>{[0, 1, 2, 3].map((i) => <span key={i} style={{ width: 14, height: 14, borderRadius: 999, transition: "all .15s", background: pin.length > i ? (err ? t.danger : t.accent) : "transparent", border: `2px solid ${pin.length > i ? (err ? t.danger : t.accent) : t.border}` }} />)}</div>
        {err && <div style={{ color: t.danger, fontSize: 12.5, marginBottom: 10 }}>{err}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, maxWidth: 260, margin: "0 auto" }}>{["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => <button key={d} onClick={() => press(d)} disabled={busy} className="ar-key" style={keyBtn(t)}>{d}</button>)}<span /><button onClick={() => press("0")} disabled={busy} className="ar-key" style={keyBtn(t)}>0</button><button onClick={() => press("del")} disabled={busy} className="ar-key" style={{ ...keyBtn(t), background: "transparent", border: "none", boxShadow: "none", color: t.muted }}><Delete size={22} /></button></div>
      </div>
    </div>
  </div>;
}
