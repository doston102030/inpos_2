import { useEffect } from "react";
import { X } from "lucide-react";
import { icBtn } from "../lib/styles";

export default function Modal({ t, title, onClose, children, maxWidth = 480 }) {
  useEffect(() => { const h = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return <div className="ar-modalbg" onClick={onClose}>
    <div className="ar-modal ar-pop" onClick={(e) => e.stopPropagation()} style={{ background: t.card, borderRadius: 22, width: "100%", maxWidth, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 30px 80px -20px rgba(0,0,0,.5)", border: `1px solid ${t.border}` }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: t.text }}>{title}</span>
        <button onClick={onClose} style={icBtn(t)}><X size={18} /></button>
      </div>
      <div style={{ padding: 20, overflowY: "auto" }}>{children}</div>
    </div>
  </div>;
}
