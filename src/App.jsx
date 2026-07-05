import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import {
  Menu, Moon, Sun, LogOut, Lock, Crown, Check, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Store } from "./lib/StoreContext";
import { FONT, THEMES } from "./lib/theme";
import { NAV, ROLE_PERMS, homeFor, roleToneOf } from "./lib/nav";
import { icBtn } from "./lib/styles";
import { CSS } from "./lib/css";
import { Badge } from "./components";
import {
  setToken, setUnauthorizedHandler, listProducts, listOrders, listUsers, listDebts, listOutflows, getStockMovements,
  createProduct, restockProduct, createOrder, createUser, setUserStatus,
  createDebt, updateDebt, payDebt as apiPayDebt, deleteDebt as apiDeleteDebt, createOutflow,
  updateProduct, deleteProduct as apiDeleteProduct, getSettings, updateSettings,
  fromApiProduct, toApiProductPayload, fromApiOrder, fromApiDebt, fromApiOutflow, fromApiStockMovement,
  roleFromApi, roleToApi, payToApi, reasonToApi,
} from "./lib/api";
import darkLogo from "./assets/Rasimlar/DARK.png";
import liteLogo from "./assets/Rasimlar/LITE.png";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Stock from "./pages/Stock";
import Inflow from "./pages/Inflow";
import Outflow from "./pages/Outflow";
import Debt from "./pages/Debt";
import SMS from "./pages/SMS";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import StaffPage from "./pages/StaffPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const [mode, setMode] = useState("light");
  const [language, setLanguage] = useState("uz");
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const t = THEMES[mode];

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [staff, setStaff] = useState([]);
  const [debts, setDebts] = useState([]);
  const [outflow, setOutflow] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [stockMovementsError, setStockMovementsError] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("default");
  const toastTimer = useRef(null);
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const master = ctx.createGain(); master.gain.value = 0.22; master.connect(ctx.destination);
      const notes = [[1318.5, now, 0.32], [1567.98, now + 0.09, 0.32], [2093, now + 0.19, 0.55]];
      notes.forEach(([freq, start, dur]) => {
        [1, 2, 3].forEach((h, i) => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.type = "sine"; osc.frequency.value = freq * h;
          const peak = [0.5, 0.16, 0.06][i];
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
          osc.connect(gain); gain.connect(master);
          osc.start(start); osc.stop(start + dur + 0.02);
        });
      });
      setTimeout(() => ctx.close(), 900);
    } catch {}
  };
  const toast = (m, type = "default") => { setToastMsg(m); setToastType(type); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToastMsg(""), 2200); if (type === "success") playChime(); };

  const refreshProducts = useCallback(async () => {
    try { setProducts((await listProducts()).map(fromApiProduct)); return true; }
    catch (e) { toast("Mahsulotlarni yuklab bo'lmadi: " + e.message); return false; }
  }, []);
  const refreshOrders = useCallback(async () => {
    try { setSales((await listOrders()).map(fromApiOrder).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))); return true; }
    catch (e) { toast("Savdolarni yuklab bo'lmadi: " + e.message); return false; }
  }, []);
  const refreshStaff = useCallback(async () => {
    try { setStaff((await listUsers()).map((u) => ({ id: u.id, name: u.fullName, role: roleFromApi(u.role), active: u.active !== false }))); return true; }
    catch (e) { toast("Xodimlarni yuklab bo'lmadi: " + e.message); return false; }
  }, []);
  const refreshDebts = useCallback(async () => {
    try { setDebts((await listDebts()).map(fromApiDebt)); return true; }
    catch (e) { toast("Qarzlarni yuklab bo'lmadi: " + e.message); return false; }
  }, []);
  const refreshOutflows = useCallback(async () => {
    try { setOutflow((await listOutflows()).map(fromApiOutflow)); return true; }
    catch (e) { toast("Chiqimlarni yuklab bo'lmadi: " + e.message); return false; }
  }, []);
  const refreshStockMovements = useCallback(async () => {
    try { setStockMovements((await getStockMovements()).map(fromApiStockMovement).sort((a, b) => b.id - a.id)); setStockMovementsError(null); return true; }
    catch (e) { setStockMovementsError(e.message); return false; }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
      setCollapsed(false);
      setNavOpen(false);
      toast("Sessiya muddati tugadi, qaytadan kiring");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (!user) return;
    const allowed = ROLE_PERMS[user.role] || [];
    refreshProducts(); refreshOrders();
    if (allowed.includes("staff")) refreshStaff();
    if (allowed.includes("debt")) refreshDebts();
    if (allowed.includes("outflow")) refreshOutflows();
    if (allowed.includes("stock") || allowed.includes("inflow")) refreshStockMovements();
    if (allowed.includes("settings")) getSettings().then((s) => { setMode(s.darkMode ? "dark" : "light"); setLanguage(s.language || "uz"); }).catch(() => {});
  }, [user, refreshProducts, refreshOrders, refreshStaff, refreshDebts, refreshOutflows, refreshStockMovements]);

  const canSeeStockMovements = () => { const a = ROLE_PERMS[user?.role] || []; return a.includes("stock") || a.includes("inflow"); };
  const maybeRefreshStockMovements = () => { if (canSeeStockMovements()) refreshStockMovements(); };

  const [refreshing, setRefreshing] = useState(false);
  const refreshAll = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    const allowed = ROLE_PERMS[user.role] || [];
    const tasks = [refreshProducts(), refreshOrders()];
    if (allowed.includes("staff")) tasks.push(refreshStaff());
    if (allowed.includes("debt")) tasks.push(refreshDebts());
    if (allowed.includes("outflow")) tasks.push(refreshOutflows());
    if (allowed.includes("stock") || allowed.includes("inflow")) tasks.push(refreshStockMovements());
    const results = await Promise.all(tasks);
    setRefreshing(false);
    if (results.every(Boolean)) toast("Ma'lumotlar yangilandi");
  }, [user, refreshProducts, refreshOrders, refreshStaff, refreshDebts, refreshOutflows, refreshStockMovements]);

  const store = useMemo(() => ({
    products, debts, sales, stockMovements, stockMovementsError, outflow, staff, user, toast,
    addProduct: async (p) => {
      try {
        const created = await createProduct(toApiProductPayload(p));
        setProducts((s) => [fromApiProduct(created), ...s]);
        maybeRefreshStockMovements(); toast("Mahsulot qo'shildi");
      } catch (e) { toast("Xatolik: " + e.message); }
    },
    editProduct: async (id, p) => {
      try {
        const updated = await updateProduct(id, toApiProductPayload(p));
        setProducts((s) => s.map((x) => x.id === id ? fromApiProduct(updated) : x));
        toast("Mahsulot yangilandi");
      } catch (e) { toast("Xatolik: " + e.message); }
    },
    deleteProduct: async (id) => {
      try { await apiDeleteProduct(id); setProducts((s) => s.filter((x) => x.id !== id)); toast("Mahsulot o'chirildi"); }
      catch (e) { toast("Xatolik: " + e.message); }
    },
    completeSale: async (cart, pay, discount, customer) => {
      try {
        const discountAmount = Math.round(discount) || 0;
        const order = await createOrder({
          items: cart.map((c) => ({ productId: c.id, quantity: c.qty })), discountAmount, paymentMethod: payToApi(pay),
          ...(pay === "Nasiya" && customer ? { customerName: customer.name, customerPhone: customer.phone || undefined } : {}),
        });
        setSales((s) => [fromApiOrder(order), ...s]);
        refreshProducts(); maybeRefreshStockMovements();
        return order;
      } catch (e) { toast("Savdoni yakunlab bo'lmadi: " + e.message); return null; }
    },
    addInflow: async (pid, qty) => {
      try {
        const updated = await restockProduct(pid, qty);
        setProducts((ps) => ps.map((x) => x.id === pid ? fromApiProduct(updated) : x));
        maybeRefreshStockMovements(); toast("Kirim qo'shildi · qoldiq oshdi");
      } catch (e) { toast("Xatolik: " + e.message); }
    },
    addOutflow: async (pid, qty, reasonLabel, note) => {
      try {
        const created = await createOutflow(pid, { quantity: qty, reason: reasonToApi(reasonLabel), note });
        setOutflow((s) => [fromApiOutflow(created), ...s]);
        refreshProducts(); maybeRefreshStockMovements();
        toast("Chiqim qo'shildi · qoldiq kamaydi");
      } catch (e) { toast("Xatolik: " + e.message); }
    },
    addDebt: async (d) => {
      try {
        const created = await createDebt({ customerName: d.name, phone: d.phone || undefined, amount: +d.amount, orderId: d.orderId || undefined });
        setDebts((s) => [fromApiDebt(created), ...s]); toast("Qarz yozildi");
      } catch (e) { toast("Xatolik: " + e.message); }
    },
    editDebt: async (id, d) => {
      try {
        const updated = await updateDebt(id, { customerName: d.name, phone: d.phone || undefined, amount: +d.amount });
        setDebts((s) => s.map((x) => x.id === id ? fromApiDebt(updated) : x)); toast("Qarz yangilandi");
      } catch (e) { toast("Xatolik: " + e.message); }
    },
    payDebt: async (id, amount) => {
      try {
        const updated = await apiPayDebt(id, amount);
        setDebts((s) => s.map((d) => d.id === id ? fromApiDebt(updated) : d)); toast("To'lov qabul qilindi");
      } catch (e) { toast("Xatolik: " + e.message); }
    },
    deleteDebt: async (id) => {
      try { await apiDeleteDebt(id); setDebts((s) => s.filter((d) => d.id !== id)); toast("Qarz o'chirildi"); }
      catch (e) { toast("Xatolik: " + e.message); }
    },
    addStaff: async (f) => {
      try {
        await createUser({ fullName: f.name, pin: f.pin, role: roleToApi(f.role) });
        refreshStaff(); toast("Xodim qo'shildi");
      } catch (e) { toast("Xatolik: " + e.message); }
    },
    toggleStaffStatus: async (id, active) => {
      try { await setUserStatus(id, active); refreshStaff(); toast(active ? "Xodim faollashtirildi" : "Xodim nofaollashtirildi"); }
      catch (e) { toast("Xatolik: " + e.message); }
    },
  }), [products, debts, sales, stockMovements, stockMovementsError, outflow, staff, user, refreshProducts, refreshStaff, refreshStockMovements]);

  if (!user) return <Login t={t} mode={mode} setMode={setMode} onLogin={(u) => { setUser(u); setActive(homeFor(u.role)); }} />;

  const allowed = ROLE_PERMS[user.role];
  const allowedNav = NAV.filter((n) => allowed.includes(n.id));
  const safeActive = allowed.includes(active) ? active : homeFor(user.role);
  const EXTRA_TITLES = { staff: "Xodimlar", reports: "Hisobotlar", sms: "SMS Markaz" };
  const cur = NAV.find((n) => n.id === safeActive) || { label: EXTRA_TITLES[safeActive] || "" };
  const roleTone = roleToneOf(user.role);
  const go = (id) => { setActive(id); setNavOpen(false); };
  const logout = () => { setToken(null); setUser(null); setCollapsed(false); setNavOpen(false); };
  const toggleDark = () => { const next = mode === "dark" ? "light" : "dark"; setMode(next); updateSettings({ darkMode: next === "dark", language }).catch(() => {}); };

  const screen = () => {
    switch (safeActive) {
      case "dashboard": return <Dashboard t={t} goTo={go} />;
      case "pos": return <POS t={t} mode={mode} />;
      case "stock": return <Stock t={t} />;
      case "inflow": return <Inflow t={t} />;
      case "outflow": return <Outflow t={t} />;
      case "debt": return <Debt t={t} />;
      case "sms": return <SMS t={t} goBack={() => go("settings")} />;
      case "reports": return <Reports t={t} goBack={() => go("settings")} />;
      case "analytics": return <Analytics t={t} />;
      case "staff": return <StaffPage t={t} goBack={() => go("settings")} />;
      case "settings": return <SettingsPage t={t} mode={mode} language={language} onToggleDark={toggleDark} allowed={allowed} goTo={go} />;
      default: return <Dashboard t={t} />;
    }
  };

  return <Store.Provider value={store}>
    <div className="ar-root" style={{ "--accent": t.accent, background: t.bg, color: t.text, minHeight: "100vh", display: "flex", fontFamily: FONT }}>
      <style>{CSS.replace(/__ACCENT__/g, t.accent)}</style>
      {navOpen && <div className="ar-overlay" onClick={() => setNavOpen(false)} />}
      <aside className={"ar-aside" + (navOpen ? " open" : "")} style={{ width: 180, flex: "none", background: t.sidebar, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column" }}>
        <div
          style={{ background: "transparent", border: "none", padding: 0, width: "100%", height: 90, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${t.border}`, position: "relative", userSelect: "none", overflow: "hidden" }}
        >
          <img
            src={mode === "dark" ? darkLogo : liteLogo}
            alt="Logo"
            style={{ height: "100%", width: "100%", objectFit: "contain", transform: "scale(2.2)" }}
          />
        </div>
        <nav className="ar-nav" style={{ flex: 1, overflowY: "auto", padding: "16px 12px 6px", display: "flex", flexDirection: "column", gap: 10 }}>
          {!collapsed && user.role === "Kassir" && <div style={{ color: t.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", padding: "4px 12px 8px" }}>Kassir paneli</div>}
          {allowedNav.map((n) => { const on = safeActive === n.id; return <button key={n.id} onClick={() => go(n.id)} title={n.label} className="ar-navitem" style={{ display: "flex", alignItems: "center", gap: 12, padding: collapsed ? "11px 0" : "10px 12px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 12, border: `1px solid ${on ? t.accent : t.border}`, cursor: "pointer", background: on ? t.sidebarActive : "transparent", color: on ? t.accent : t.sidebarText, fontSize: 13.5, fontWeight: on ? 600 : 500, width: "100%", textAlign: "left", fontFamily: FONT }}><n.icon size={18} style={{ flex: "none", color: on ? t.accent : t.muted }} />{!collapsed && n.label}</button>; })}
        </nav>
        <div style={{ padding: 12, borderTop: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? 0 : "8px", justifyContent: collapsed ? "center" : "flex-start" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: t[roleTone + "Soft"], color: t[roleTone], display: "grid", placeItems: "center", flex: "none", fontWeight: 700, fontSize: 12 }}>{user.name.split(" ").map((x) => x[0]).join("")}</div>
            {!collapsed && <div style={{ lineHeight: 1.2, flex: 1, minWidth: 0 }}><div style={{ color: t.text, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div><div style={{ color: t.muted, fontSize: 11 }}>{user.role}</div></div>}
            {!collapsed && <button onClick={logout} title="Chiqish" style={{ ...icBtn(t), width: 32, height: 32, borderRadius: 10 }}><LogOut size={15} /></button>}
          </div>
        </div>
      </aside>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header style={{ height: 64, borderBottom: `1px solid ${t.border}`, background: t.card, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", position: "sticky", top: 0, zIndex: 20 }}>
          <button className="ar-hamburger" onClick={() => setNavOpen(true)} style={icBtn(t)}><Menu size={18} /></button>
          <div style={{ lineHeight: 1.15, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 18, color: t.text, letterSpacing: "-.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cur.label}</div></div>
          <span className="ar-rolebadge" style={{ marginLeft: 4 }}><Badge tone={roleTone} t={t}>{user.role === "Kassir" ? <Lock size={11} /> : <Crown size={11} />} {user.role}</Badge></span>
          <div style={{ flex: 1 }} />
          <button onClick={refreshAll} title="Yangilash" disabled={refreshing} style={{ ...icBtn(t), opacity: refreshing ? 0.5 : 1, cursor: refreshing ? "default" : "pointer" }}><RefreshCw size={18} className={refreshing ? "ar-spin" : ""} /></button>
          <button onClick={toggleDark} style={icBtn(t)}>{mode === "light" ? <Moon size={18} /> : <Sun size={18} />}</button>
        </header>
        <main key={safeActive} className="ar-fade" style={{ flex: 1, padding: 20, overflowX: "hidden" }}>{screen()}</main>
      </div>
      {toastMsg && <div className="ar-toast" style={{ background: toastType === "success" ? t.accent : t.text, color: toastType === "success" ? "#fff" : t.bg }}><Check size={16} /> {toastMsg}</div>}
    </div>
  </Store.Provider>;
}
