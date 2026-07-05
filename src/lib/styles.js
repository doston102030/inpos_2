import { FONT } from "./theme";

export const cardStyle = (t) => ({ background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, padding: 20, boxShadow: t.shadow });
export const primaryBtn = (t) => ({ width: "100%", padding: "13px 16px", borderRadius: 14, border: "none", background: t.accent, color: t.onAccent, fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: t.shadowBtn, fontFamily: FONT });
export const ghostBtn = (t) => ({ padding: "10px 14px", borderRadius: 13, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: FONT });
export const qtyBtn = (t) => ({ width: 27, height: 27, borderRadius: 9, border: `1px solid ${t.border}`, background: t.card, color: t.text, cursor: "pointer", display: "grid", placeItems: "center" });
export const icBtn = (t) => ({ width: 38, height: 38, borderRadius: 12, border: `1px solid ${t.border}`, background: t.card, color: t.text, cursor: "pointer", display: "grid", placeItems: "center", position: "relative", flex: "none" });
export const inputS = (t) => ({ width: "100%", padding: "11px 13px", borderRadius: 12, border: `1px solid ${t.border}`, background: t.inset, color: t.text, fontSize: 14, outline: "none", fontFamily: FONT });
export const keyBtn = (t) => ({ height: 64, borderRadius: 999, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 24, fontWeight: 500, cursor: "pointer", display: "grid", placeItems: "center", boxShadow: t.shadow, fontFamily: FONT });
