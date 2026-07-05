const BASE_URL = "http://151.243.217.250:5656";
const TOKEN_KEY = "ar_token";
const REQUEST_TIMEOUT_MS = 15000;

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (tok) => tok ? localStorage.setItem(TOKEN_KEY, tok) : localStorage.removeItem(TOKEN_KEY);

let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => { unauthorizedHandler = fn; };

async function request(path, { method = "GET", body, params } = {}) {
  let url = BASE_URL + path;
  if (params) {
    const qs = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "").map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
    if (qs) url += "?" + qs;
  }
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = "Bearer " + token;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined, signal: controller.signal });
  } catch (e) {
    if (e.name === "AbortError") throw new Error("Server javob bermayapti. Internet aloqasini tekshiring.");
    throw new Error("Internet aloqasi yo'q. Tarmoqni tekshirib, qaytadan urinib ko'ring.");
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 401) {
    if (unauthorizedHandler) unauthorizedHandler();
    throw new Error("Sessiya muddati tugadi. Qaytadan kiring.");
  }
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try { const j = await res.json(); msg = j.message || msg; } catch { /* no body */ }
    throw new Error(msg);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// --- Auth ---
export const login = (pin) => request("/api/auth/login", { method: "POST", body: { pin } });

// --- Users ---
export const listUsers = () => request("/api/users");
export const getUser = (id) => request(`/api/users/${id}`);
export const createUser = (payload) => request("/api/users", { method: "POST", body: payload });
export const updateUser = (id, payload) => request(`/api/users/${id}`, { method: "PUT", body: payload });
export const deleteUser = (id) => request(`/api/users/${id}`, { method: "DELETE" });
export const setUserStatus = (id, active) => request(`/api/users/${id}/status`, { method: "PATCH", body: { active } });

// --- Products ---
export const listProducts = (search) => request("/api/products", { params: { search, page: 0, size: 2000 } }).then((r) => r.content || []);
export const getProduct = (id) => request(`/api/products/${id}`);
export const createProduct = (payload) => request("/api/products", { method: "POST", body: payload });
export const updateProduct = (id, payload) => request(`/api/products/${id}`, { method: "PUT", body: payload });
export const deleteProduct = (id) => request(`/api/products/${id}`, { method: "DELETE" });
export const restockProduct = (id, quantity) => request(`/api/products/${id}/restock`, { method: "POST", body: { quantity } });
export const receiveStock = (payload) => request("/api/products/receive", { method: "POST", body: payload });
export const getProductByBarcode = (barcode) => request(`/api/products/barcode/${barcode}`);
export const externalBarcodeLookup = (barcode) => request(`/api/products/barcode/${barcode}/external-lookup`);
export const getRestockHistory = (id) => request(`/api/products/${id}/restock-history`);

// --- Outflow ---
export const listOutflows = () => request("/api/outflows");
export const createOutflow = (productId, payload) => request(`/api/products/${productId}/outflow`, { method: "POST", body: payload });

// --- Debts ---
export const listDebts = () => request("/api/debts");
export const createDebt = (payload) => request("/api/debts", { method: "POST", body: payload });
export const updateDebt = (id, payload) => request(`/api/debts/${id}`, { method: "PUT", body: payload });
export const payDebt = (id, amount) => request(`/api/debts/${id}/pay`, { method: "PUT", body: { amount } });
export const deleteDebt = (id) => request(`/api/debts/${id}`, { method: "DELETE" });

// --- Stock movements ---
export const getStockMovements = (params) => request("/api/stock-movements", { params });

// --- Orders ---
export const listOrders = () => request("/api/orders", { params: { page: 0, size: 2000 } }).then((r) => r.content || []);
export const getOrder = (id) => request(`/api/orders/${id}`);
export const createOrder = (payload) => request("/api/orders", { method: "POST", body: payload });

// --- Reports ---
export const getReportsRange = (from, to) => request("/api/reports", { params: { from, to } });
export const getReportsDaily = (date) => request("/api/reports/daily", { params: { date } });
export const getReportsRangeDaily = (from, to) => request("/api/reports/range-daily", { params: { from, to } });
export const getReportsByUser = (from, to) => request("/api/reports/by-user", { params: { from, to } });

export async function exportReportCsv(from, to) {
  const url = `${BASE_URL}/api/reports/export?from=${from}&to=${to}&format=csv`;
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = "Bearer " + token;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition") || "";
  const filename = (cd.match(/filename="?([^"]+)"?/) || [])[1] || `hisobot_${from}_${to}.csv`;
  return { blob, filename };
}

// --- Settings ---
export const getSettings = () => request("/api/settings");
export const updateSettings = (payload) => request("/api/settings", { method: "PUT", body: payload });

// --- SMS ---
export const listSmsCampaigns = () => request("/api/sms/campaigns");
export const sendSms = (recipients, message) => request("/api/sms/send", { method: "POST", body: { recipients: Array.isArray(recipients) ? recipients : [recipients], message } });
export const getSmsBalance = () => request("/api/sms/balance");

// --- Adapters: API shape <-> frontend shape ---
const TINTS = ["#2563EB", "#10B981", "#FF9500", "#FF2D55", "#AF52DE", "#30B0C7", "#5856D6", "#FF3B30", "#00C7BE", "#A2845E"];
export const fromApiProduct = (p) => ({
  id: p.id, name: p.name,
  price: p.price, buy: p.purchasePrice, stock: p.stockQuantity, code: p.barcode || "",
  tint: TINTS[p.id % TINTS.length],
});
export const toApiProductPayload = (f) => ({
  name: f.name, barcode: f.code || undefined,
  purchasePrice: +f.buy || 0, price: +f.price || 0, stockQuantity: +f.stock || 0,
});

const ROLE_TO_LABEL = { SUPER_ADMIN: "Super Admin", CASHIER: "Kassir" };
const LABEL_TO_ROLE = { "Super Admin": "SUPER_ADMIN", "Kassir": "CASHIER" };
export const roleFromApi = (r) => ROLE_TO_LABEL[r] || "Kassir";
export const roleToApi = (label) => LABEL_TO_ROLE[label] || "CASHIER";

const PAY_TO_API = { "Naqd": "CASH", "Karta": "CARD", "Aralash": "MIXED", "Nasiya": "CREDIT" };
const PAY_FROM_API = { CASH: "Naqd", CARD: "Karta", MIXED: "Aralash", CREDIT: "Nasiya" };
export const payToApi = (label) => PAY_TO_API[label] || "CASH";
export const payFromApi = (v) => PAY_FROM_API[v] || v;

const REASON_TO_API = { "Buzilgan": "DAMAGED", "Yo'qolgan": "LOST", "Qaytarilgan": "RETURNED" };
const REASON_FROM_API = { DAMAGED: "Buzilgan", LOST: "Yo'qolgan", RETURNED: "Qaytarilgan" };
export const reasonToApi = (label) => REASON_TO_API[label] || "DAMAGED";
export const reasonFromApi = (v) => REASON_FROM_API[v] || v;

const DEBT_STATUS_FROM_API = { PAID: "To'langan", PARTIAL: "Qisman", UNPAID: "Qarzdor" };
export const debtStatusFromApi = (v) => DEBT_STATUS_FROM_API[v] || v;

export const fromApiDebt = (d) => ({
  id: d.id, name: d.customerName, phone: d.phone || "—", amount: d.amount, paid: d.paidAmount || 0,
  created: d.createdAt ? new Date(d.createdAt).toLocaleDateString("uz-UZ") : "—", status: debtStatusFromApi(d.status), orderId: d.orderId,
});

export const fromApiOutflow = (o) => ({
  id: o.id, reason: reasonFromApi(o.reason), product: o.productName, qty: o.quantity,
  date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("uz-UZ") : "", note: o.note || "",
});

const MOVEMENT_TYPE_LABEL = { IN: "Kirim", OUT: "Chiqim", SALE: "Savdo", ADJUSTMENT: "Tuzatish" };
export const fromApiStockMovement = (m) => ({
  id: m.id, type: MOVEMENT_TYPE_LABEL[m.type] || m.type, product: m.productName,
  qty: (m.type === "IN" ? "+" : "-") + m.quantity,
  who: m.performedBy || "—", reason: m.reason || "",
  t: m.createdAt ? new Date(m.createdAt).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "",
});

export async function getTrend(from, to) {
  const data = await getReportsRangeDaily(from, to);
  return data.map((x) => ({
    d: new Date(x.date).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" }),
    v: +(x.totalRevenue / 1e6).toFixed(2),
  }));
}

export const fromApiSmsCampaign = (c) => ({
  id: c.id, message: c.message, recipients: c.recipients, count: c.smsCount, createdAt: c.createdAt,
  t: c.createdAt ? new Date(c.createdAt).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "",
});

export const fromApiOrder = (o) => ({
  id: "#" + o.id, items: o.items?.length || 0, sum: o.totalAmount,
  profit: (o.items || []).reduce((s, it) => s + (it.profit || 0), 0),
  who: o.paymentMethod ? payFromApi(o.paymentMethod) : undefined,
  t: o.createdAt ? new Date(o.createdAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }) : "",
  createdAt: o.createdAt,
});
