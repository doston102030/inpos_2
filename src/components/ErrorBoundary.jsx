import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: "system-ui, sans-serif", padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Kutilmagan xatolik yuz berdi</div>
          <div style={{ color: "#666", fontSize: 14 }}>Sahifani qaytadan yuklab ko'ring.</div>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#2563EB", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Sahifani yangilash
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
