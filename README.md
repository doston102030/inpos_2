# Arome — Parfumery ERP / POS / Ombor

Premium parfumeriya tizimi. Apple/iOS uslubidagi dizayn, React + Vite.

## Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda ochiladi: http://localhost:5173

## Build (production)

```bash
npm run build
npm run preview
```

## Kirish (demo PIN)

- Super Admin — Doston Karimov — PIN **1234** (hamma modul)
- Admin — Aziza Yo'ldosheva — PIN **2345**
- Kassir — Bobur Sodiqov — PIN **0000** (faqat POS, Mijozlar, Qarz)

## Imkoniyatlar

- 17 ta modul: Boshqaruv, POS, Mahsulotlar, Kategoriyalar, Brendlar, Ombor,
  Kirim, Chiqim, Mijozlar, Qarz daftari, Bonus, SMS, Telegram, Hisobotlar,
  Analitika, Xodimlar, Sozlamalar
- Rol asosida ruxsat (RBAC) + PIN login
- POS: skaner/qidiruv, savat, to'lov, savdo yakunlanganda qoldiq avtomatik kamayadi
- Ovoz bilan mahsulot qo'shish (mikrofon — Chrome'da to'liq ishlaydi)
- Light / Dark rejim
- To'liq mobil (responsive) — admin telefondan kuzatadi
- Hamma ma'lumot hozircha xotirada (backend keyin ulanadi)

## Keyingi qadam — Backend

Ma'lumotlar hozir brauzer xotirasida. Doimiy saqlash, real login va
qoldiq sinxronizatsiyasi uchun backend kerak (tavsiya: Supabase).

## Texnologiyalar

React 18 · Vite 5 · lucide-react · recharts
# inpos_1
# inpos_2
