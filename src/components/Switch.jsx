export default function Switch({ on, onChange, t }) {
  return <button onClick={onChange} style={{ width: 48, height: 29, borderRadius: 999, background: on ? t.success : t.border, border: "none", cursor: "pointer", position: "relative", transition: "background .2s", flex: "none" }}>
    <span style={{ position: "absolute", top: 2.5, left: on ? 21.5 : 2.5, width: 24, height: 24, borderRadius: 999, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.3)", transition: "left .2s" }} />
  </button>;
}
