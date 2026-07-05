export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background: rgba(142,142,147,.4); border-radius: 999px; }
::-webkit-scrollbar-track { background: transparent; }
.ar-fade { animation: arfade .25s ease; }
@keyframes arfade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.ar-pop { animation: arpop .2s ease; }
@keyframes arpop { from { opacity: 0; transform: scale(.96) translateY(8px); } to { opacity: 1; transform: none; } }
.ar-shake { animation: arshake .4s; }
@keyframes arshake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-9px)} 40%{transform:translateX(9px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
.ar-mic-on { animation: arpulse 1s infinite; }
@keyframes arpulse { 0%,100%{ box-shadow: 0 0 0 0 rgba(255,59,48,.4);} 50%{ box-shadow: 0 0 0 8px rgba(255,59,48,0);} }
.ar-spin { animation: arspin .7s linear infinite; }
@keyframes arspin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.ar-navitem { transition: background .15s ease, color .15s ease; }
.ar-navitem:hover { background: rgba(37,99,235,.06); }
.ar-prodcard { transition: transform .16s ease, box-shadow .2s ease, border-color .16s ease; }
.ar-prodcard:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 12px 28px -12px rgba(0,0,0,.22); border-color: __ACCENT__ !important; }
.ar-btn-primary { transition: transform .12s ease, filter .15s ease; }
.ar-btn-primary:hover { filter: brightness(1.05); }
.ar-btn-primary:active { transform: scale(.98); }
.ar-btn-ghost:hover { border-color: __ACCENT__ !important; }
.ar-row { transition: background .12s ease; }
.ar-row:hover td { background: rgba(37,99,235,.045); }
.ar-key { transition: transform .1s ease, background .15s ease; }
.ar-key:hover { background: rgba(37,99,235,.06); }
.ar-key:active { transform: scale(.94); }
.ar-userbtn { transition: transform .14s ease, box-shadow .2s ease, border-color .14s ease; }
.ar-userbtn:hover { transform: translateY(-2px); border-color: __ACCENT__ !important; }
input:focus, textarea:focus, select:focus { border-color: __ACCENT__ !important; box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
.ar-naked-input:focus { box-shadow: none !important; border-color: transparent !important; }
.ar-fieldwrap:focus-within { border-color: __ACCENT__ !important; box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
input[type=number] { -moz-appearance: textfield; }
input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.ar-aside { position: sticky; top: 0; height: 100vh; z-index: 60; }
.ar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 55; animation: arfade .2s ease; }
.ar-hamburger { display: none !important; }
.ar-modalbg { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 100; display: grid; place-items: center; padding: 18px; animation: arfade .2s ease; backdrop-filter: blur(3px); }
.ar-toast { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); z-index: 200; padding: 12px 20px; border-radius: 14px; font-size: 13.5px; font-weight: 600; display: flex; align-items: center; gap: 8px; box-shadow: 0 12px 34px rgba(0,0,0,.3); animation: artoast .3s ease; }
@keyframes artoast { from { opacity: 0; transform: translate(-50%, -12px); } to { opacity: 1; transform: translate(-50%, 0); } }
.ar-cartfab { display: none; }
.ar-grid-kpi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.ar-grid-main { display: grid; grid-template-columns: 1.7fr 1fr; gap: 16px; }
.ar-grid-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.ar-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; align-items: start; }
.ar-pos { display: grid; grid-template-columns: 1fr 420px; gap: 16px; align-items: start; }
.ar-cart { position: sticky; top: 86px; height: calc(100vh - 108px); }
.ar-prodgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
.ar-chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; }
@media (max-width: 1100px) {
  .ar-grid-kpi { grid-template-columns: repeat(2, 1fr); }
  .ar-grid-main { grid-template-columns: 1fr; }
  .ar-grid-cards { grid-template-columns: repeat(2, 1fr); }
  .ar-grid-2 { grid-template-columns: 1fr; }
  .ar-pos { grid-template-columns: 1fr; }
  .ar-cart-wrap { display: none; }
  .ar-cartfab { position: sticky; bottom: 14px; width: 100%; display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 16px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 4px; }
  .ar-sheetbg { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 90; display: flex; align-items: flex-end; animation: arfade .2s ease; }
  .ar-sheet { width: 100%; max-height: 88vh; overflow: hidden; animation: arsheet .28s ease; }
  .ar-sheet .ar-cart { position: static; height: auto; max-height: 88vh; border-radius: 22px 22px 0 0; }
}
@keyframes arsheet { from { transform: translateY(100%); } to { transform: none; } }
@media (max-width: 900px) {
  .ar-aside { position: fixed; top: 0; left: 0; width: 248px !important; transform: translateX(-100%); transition: transform .25s ease; }
  .ar-aside.open { transform: translateX(0); box-shadow: 0 0 50px rgba(0,0,0,.35); }
  .ar-hamburger { display: grid !important; }
  .ar-collapsebtn { display: none !important; }
}
@media (min-width: 901px) { .ar-overlay { display: none; } }
.ar-tablehint { display: none; }
@media (max-width: 700px) {
  .ar-table th, .ar-table td { padding: 9px 12px !important; font-size: 12.5px; }
  .ar-tablewrap::after { content: ""; position: absolute; top: 0; right: 0; bottom: 0; width: 26px; background: linear-gradient(to right, transparent, rgba(0,0,0,.07)); pointer-events: none; }
  .ar-tablehint { display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 11px; font-weight: 600; padding: 6px 0; border-top: 1px solid rgba(142,142,147,.2); }
}
@media (max-width: 560px) {
  .ar-grid-kpi, .ar-grid-cards { grid-template-columns: 1fr; }
  .ar-rolebadge { display: none; }
  .ar-prodgrid { grid-template-columns: repeat(2, 1fr); }
}
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;
