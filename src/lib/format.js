export const som = (n) => Number(n || 0).toLocaleString("ru-RU").replace(/[\s ]/g, ".") + " so'm";
export const nowTime = () => new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
