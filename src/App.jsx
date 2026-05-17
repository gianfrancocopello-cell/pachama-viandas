import { useState, useEffect, useMemo, useRef } from "react";
import { db, doc, setDoc, onSnapshot } from "./firebase";

// ══════════════════════════════════════════════
// EMAILS AUTORIZADOS
// ══════════════════════════════════════════════
const ADMIN_EMAILS = [
  "gianfrancocopello@gmail.com",
  "gracielaaideegarcia@gmail.com",
];

// ══════════════════════════════════════════════
// DATOS BASE DEL MENÚ
// ══════════════════════════════════════════════
const BASE_MENU = {
  fecha: { dia: "viernes", numero: 15, mes: "mayo" },
  home: {
    titleL1: "Comida hecha",
    titleL2: "en casa,",
    titleL3: "entregada hoy.",
    desc: "Elegí el menú del día. Pedís hasta las 12:30.",
    delivery: "Zona Industrial – Barrio Sur, Comodoro Rivadavia.",
    hours: "Entrega 12:00 – 13:30",
    whatsapp: "+54 9 2974 27-9849",
  },
  opciones: {
    1: { titulo: "Opción 1", bajada: "Más abundante", descripcion: "Porciones generosas, pensadas para almuerzos completos.", precioDesde: 8900, categorias: ["ensaladas", "comidas"] },
    2: { titulo: "Opción 2", bajada: "Más liviana", descripcion: "Porciones medianas a un mejor precio, ideales para el día a día.", precioDesde: 6400, categorias: ["ensaladas", "comidas"] },
    3: { titulo: "Arma tu ensalada", bajada: "A tu gusto", descripcion: "Elegí base, proteína, toppings y aderezo. Una ensalada hecha por vos.", precioDesde: 9200, categorias: ["arma"] },
  },
  categorias: {
    arma: { nombre: "Arma tu ensalada", short: "Arma" },
    ensaladas: { nombre: "Ensaladas", short: "Ensaladas" },
    comidas: { nombre: "Comidas", short: "Comidas" },
  },
  platos: {
    ensaladas: {
      1: [
        { id: "e1-1", nombre: "Bowl Pachama", desc: "Quinoa, palta, pollo grillado, vegetales asados, semillas tostadas.", precio: 9800, tags: ["Sin TACC", "Alta proteína"], complementarios: ["Salsa César", "Sobrecito de limón", "Tostaditas"], complementarioVisible: true },
        { id: "e1-2", nombre: "César del campo", desc: "Pollo grillado, mix de hojas, parmesano en escamas, croutones de masa madre.", precio: 9200, tags: ["Clásica"], complementarios: ["Salsa César", "Sobrecito de limón", "Tostaditas"], complementarioVisible: true },
        { id: "e1-3", nombre: "Mediterránea XL", desc: "Hojas verdes, tomates cherry confitados, aceitunas, huevo, atún, papas rústicas.", precio: 9500, tags: ["Abundante"], complementarios: ["Salsa César", "Sobrecito de limón", "Tostaditas"], complementarioVisible: true },
        { id: "e1-4", nombre: "Caprese de la huerta", desc: "Tomates de estación, mozzarella fior di latte, albahaca fresca, pan tostado.", precio: 8900, tags: ["Vegetariana"], complementarios: ["Salsa César", "Sobrecito de limón", "Tostaditas"], complementarioVisible: true },
      ],
      2: [
        { id: "e2-1", nombre: "Verde simple", desc: "Mix de hojas, zanahoria, tomate, pepino, vinagreta de la casa.", precio: 6400, tags: ["Liviana"], complementarios: ["Salsa César", "Sobrecito de limón", "Tostaditas"], complementarioVisible: true },
        { id: "e2-2", nombre: "Quinoa básica", desc: "Quinoa, palta, tomate cherry, semillas, limón.", precio: 6900, tags: ["Vegana"], complementarios: ["Salsa César", "Sobrecito de limón", "Tostaditas"], complementarioVisible: true },
        { id: "e2-3", nombre: "Caprese chica", desc: "Tomate, mozzarella, albahaca, oliva.", precio: 6800, tags: ["Vegetariana"], complementarios: ["Salsa César", "Sobrecito de limón", "Tostaditas"], complementarioVisible: true },
      ],
    },
    comidas: {
      1: [
        { id: "c1-1", nombre: "Pollo al limón con puré rústico", desc: "Suprema de pollo marinada al limón y romero, puré de papa con manteca y tomillo.", precio: 9400, tags: ["Sin TACC"], complementarios: ["Salsa César", "Sobrecito de limón", "Tostaditas"], complementarioVisible: true },
        { id: "c1-2", nombre: "Lasagna de la abuela", desc: "Pasta fresca, ragú de ternera cocido a fuego lento, bechamel y parmesano.", precio: 9900, tags: ["Casera"], complementarios: ["Salsa César", "Sobrecito de limón", "Tostaditas"], complementarioVisible: true },
        { id: "c1-3", nombre: "Wok de ternera y vegetales", desc: "Tiras de bife de chorizo, brócoli, morrón, zanahoria, salsa de soja y jengibre.", precio: 9600, tags: ["Picante leve"], complementarios: ["Salsa César", "Sobrecito de limón", "Tostaditas"], complementarioVisible: true },
        { id: "c1-4", nombre: "Tarta de zapallo y cabra", desc: "Masa de hojaldre casero, zapallo asado, queso de cabra, nueces y miel.", precio: 8900, tags: ["Vegetariana"], complementarios: ["Salsa César", "Sobrecito de limón", "Tostaditas"], complementarioVisible: true },
      ],
      2: [
        { id: "c2-1", nombre: "Pollo grillado y vegetales", desc: "Suprema de pollo grillada, vegetales asados de estación.", precio: 6900, tags: ["Sin TACC"], complementarios: ["Salsa César", "Sobrecito de limón", "Tostaditas"], complementarioVisible: true },
        { id: "c2-2", nombre: "Tarta del día", desc: "Tarta de verduras de estación con masa casera.", precio: 6400, tags: ["Vegetariana"], complementarios: ["Salsa César", "Sobrecito de limón", "Tostaditas"], complementarioVisible: true },
        { id: "c2-3", nombre: "Bowl liviano", desc: "Arroz integral, vegetales salteados, huevo poché.", precio: 6800, tags: ["Liviana"], complementarios: ["Salsa César", "Sobrecito de limón", "Tostaditas"], complementarioVisible: true },
      ],
    },
  },
  arma: {
    base: 9200,
    pasos: [
      { id: "base", titulo: "Base", sub: "Elegí una", max: 1, opciones: [{ id: "rucula", nombre: "Rúcula" }, { id: "lechuga", nombre: "Lechuga" }, { id: "zanahoria", nombre: "Zanahoria" }] },
      { id: "proteina", titulo: "Proteína", sub: "Hasta 2", max: 2, opciones: [{ id: "pollo", nombre: "Pollo grillado" }, { id: "atun", nombre: "Atún" }, { id: "camarones", nombre: "Camarones" }] },
      { id: "toppings", titulo: "Toppings", sub: "Hasta 5", max: 5, opciones: [{ id: "palta", nombre: "Palta" }, { id: "cherry", nombre: "Tomate cherry" }, { id: "zanahoria", nombre: "Zanahoria" }, { id: "pepino", nombre: "Pepino" }, { id: "cebolla", nombre: "Cebolla morada" }, { id: "maiz", nombre: "Choclo" }, { id: "queso", nombre: "Queso feta" }, { id: "semillas", nombre: "Semillas tostadas" }, { id: "nueces", nombre: "Nueces" }, { id: "arandanos", nombre: "Arándanos" }] },
      { id: "aderezo", titulo: "Aderezo", sub: "Elegí uno", max: 1, opciones: [{ id: "cesar", nombre: "César de la casa" }, { id: "mostaza", nombre: "Mostaza y miel" }, { id: "oliva", nombre: "Oliva y limón" }, { id: "balsamico", nombre: "Balsámica" }, { id: "yogur", nombre: "Yogur y hierbas" }] },
    ],
  },
};

const formatPrecio = (n) => "$" + Number(n).toLocaleString("es-AR");

// ══════════════════════════════════════════════
// ADMIN STORE — con Firebase Firestore
// ══════════════════════════════════════════════
function loadLS(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function saveLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

function applyOverrides(base, ov) {
  const r = JSON.parse(JSON.stringify(base));
  for (const [path, val] of Object.entries(ov)) {
    const parts = path.split(".");
    let cur = r;
    for (let i = 0; i < parts.length - 1; i++) { if (cur[parts[i]] == null) break; cur = cur[parts[i]]; }
    cur[parts[parts.length - 1]] = val;
  }
  return r;
}
function getByPath(obj, path) { return path.split(".").reduce((c, k) => (c == null ? undefined : c[k]), obj); }

const OVERRIDES_REF = doc(db, "menu", "overrides");

function fsWrite(ov) {
  setDoc(OVERRIDES_REF, { data: JSON.stringify(ov) }).catch(console.error);
}

function useAdminStore() {
  // Cargamos overrides desde cache local para render inmediato
  const [overrides, setOv] = useState(() => loadLS("pv_overrides_cache", {}));
  const [images, setImgs] = useState(() => loadLS("pv_images_v2", {}));
  const [session, setSess] = useState(() => loadLS("pv_session_v2", null));

  // Suscripción en tiempo real a Firestore
  useEffect(() => {
    const unsub = onSnapshot(OVERRIDES_REF, (snap) => {
      try {
        const data = snap.exists() ? JSON.parse(snap.data()?.data || "{}") : {};
        setOv(data);
        saveLS("pv_overrides_cache", data);
      } catch(e) { console.error("Firestore parse error:", e); }
    }, (err) => console.error("Firestore error:", err));
    return () => unsub();
  }, []);

  const menu = applyOverrides(BASE_MENU, overrides);
  const isAdmin = !!session;

  const login = (email) => {
    if (ADMIN_EMAILS.includes(email.trim().toLowerCase())) {
      const s = { email: email.trim().toLowerCase() };
      setSess(s); saveLS("pv_session_v2", s); return true;
    }
    return false;
  };
  const logout = () => { setSess(null); saveLS("pv_session_v2", null); };

  const setOverride = (path, value) => setOv(prev => {
    const n = { ...prev, [path]: value };
    saveLS("pv_overrides_cache", n);
    fsWrite(n);
    return n;
  });
  const clearOverride = (path) => setOv(prev => {
    const n = { ...prev }; delete n[path];
    saveLS("pv_overrides_cache", n);
    fsWrite(n);
    return n;
  });
  const setImage = (id, url) => setImgs(prev => { const n = { ...prev, [id]: url }; saveLS("pv_images_v2", n); return n; });
  const clearImage = (id) => setImgs(prev => { const n = { ...prev }; delete n[id]; saveLS("pv_images_v2", n); return n; });
  const resetAll = () => {
    setOv({}); setImgs({});
    saveLS("pv_overrides_cache", {}); saveLS("pv_images_v2", {});
    fsWrite({});
  };

  return { menu, overrides, images, session, isAdmin, login, logout, setOverride, clearOverride, setImage, clearImage, resetAll };
}

// ══════════════════════════════════════════════
// CSS
// ══════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

:root {
  --crema: oklch(0.965 0.018 80);
  --crema-deep: oklch(0.92 0.03 75);
  --crema-line: oklch(0.88 0.035 70);
  --terracota: oklch(0.62 0.13 42);
  --terracota-deep: oklch(0.46 0.12 40);
  --terracota-soft: oklch(0.88 0.06 50);
  --tierra: oklch(0.28 0.035 50);
  --tierra-soft: oklch(0.48 0.025 55);
  --verde: oklch(0.56 0.07 125);
  --verde-soft: oklch(0.86 0.045 125);
  --hueso: oklch(0.995 0.008 80);
  --warn: oklch(0.65 0.13 60);
  --pv-pad-card: 16px;
  --pv-pad-screen: 16px;
  --pv-gap-list: 12px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', system-ui, sans-serif; background: oklch(0.94 0.025 60); min-height: 100vh; -webkit-font-smoothing: antialiased; }

.pv-stage { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
.pv-device { width: 390px; height: 844px; border-radius: 48px; overflow: hidden; position: relative; background: var(--crema); box-shadow: 0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12); }
.pv-device-island { position: absolute; top: 11px; left: 50%; transform: translateX(-50%); width: 126px; height: 37px; border-radius: 24px; background: #000; z-index: 50; }
.pv-device-home { position: absolute; bottom: 0; left: 0; right: 0; height: 34px; display: flex; justify-content: center; align-items: flex-end; padding-bottom: 8px; pointer-events: none; z-index: 60; }
.pv-device-home-bar { width: 139px; height: 5px; border-radius: 100px; background: rgba(0,0,0,0.2); }
.pv-app { position: absolute; inset: 0; background: var(--crema); color: var(--tierra); display: flex; flex-direction: column; overflow: hidden; font-family: 'DM Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
.pv-app * { box-sizing: border-box; font-family: inherit; -webkit-font-smoothing: antialiased; }
.pv-app * { transition: background-color .18s ease, transform .18s ease, opacity .18s ease, border-color .18s ease; }
.pv-header { padding: 56px 18px 0; flex-shrink: 0; }
.pv-header-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.pv-back { width: 38px; height: 38px; border-radius: 999px; background: var(--hueso); border: 1px solid var(--crema-line); display: flex; align-items: center; justify-content: center; cursor: pointer; appearance: none; }
.pv-header-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 18px; letter-spacing: 0.01em; color: var(--tierra); }
.pv-body { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 14px var(--pv-pad-screen) 120px; scrollbar-width: none; }
.pv-body::-webkit-scrollbar { display: none; }
.pv-body-with-cart { padding-bottom: 140px; }
.pv-serif { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; }
.pv-eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; color: var(--tierra-soft); font-weight: 500; }
.pv-h1 { font-family: 'Instrument Serif', Georgia, serif; font-size: 44px; line-height: 1.02; color: var(--tierra); letter-spacing: -0.01em; }
.pv-h2 { font-family: 'Instrument Serif', Georgia, serif; font-size: 30px; line-height: 1.05; color: var(--tierra); letter-spacing: -0.01em; }
.pv-h3 { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; line-height: 1.1; color: var(--tierra); }
.pv-meta { font-size: 13px; color: var(--tierra-soft); line-height: 1.4; }
.pv-body-text { font-size: 14px; color: var(--tierra); line-height: 1.45; }
.pv-btn { appearance: none; border: 0; cursor: pointer; height: 52px; padding: 0 22px; border-radius: 999px; background: var(--terracota); color: var(--hueso); font-size: 15px; font-weight: 600; letter-spacing: 0.005em; display: inline-flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 1px 0 rgba(255,255,255,0.5) inset, 0 8px 22px -8px oklch(0.55 0.12 40 / 0.5); }
.pv-btn:hover { background: var(--terracota-deep); }
.pv-btn-full { width: 100%; }
.pv-btn-sm { height: 38px; padding: 0 14px; font-size: 13px; }
.pv-card { background: var(--hueso); border: 1px solid var(--crema-line); border-radius: 20px; padding: var(--pv-pad-card); }
.pv-card-tap { cursor: pointer; }
.pv-card-tap:hover { border-color: var(--terracota-soft); }
.pv-card-tap:active { transform: scale(0.985); }
.pv-img { background: repeating-linear-gradient(135deg, oklch(0.93 0.04 55) 0 12px, oklch(0.90 0.045 50) 12px 24px); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: oklch(0.40 0.05 50); font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase; position: relative; overflow: hidden; }
.pv-img::after { content: ''; position: absolute; inset: 0; border: 1px dashed oklch(0.55 0.06 50 / 0.4); border-radius: 14px; pointer-events: none; }
.pv-img-veg { background: repeating-linear-gradient(135deg, oklch(0.86 0.045 125) 0 12px, oklch(0.83 0.05 125) 12px 24px); color: oklch(0.36 0.05 125); }
.pv-img-veg::after { border-color: oklch(0.5 0.07 125 / 0.4); }
.pv-tag { display: inline-block; font-size: 11px; padding: 3px 8px; border-radius: 999px; background: var(--crema-deep); color: var(--tierra); letter-spacing: 0.02em; }
.pv-tag-veg { background: var(--verde-soft); color: oklch(0.32 0.07 125); }
.pv-tabs { display: flex; gap: 6px; background: var(--crema-deep); border-radius: 999px; padding: 4px; }
.pv-tab { flex: 1; height: 38px; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; color: var(--tierra-soft); cursor: pointer; white-space: nowrap; }
.pv-tab[aria-selected="true"] { background: var(--hueso); color: var(--tierra); box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.pv-cart-bar { position: absolute; left: 12px; right: 12px; bottom: 28px; background: var(--tierra); color: var(--hueso); border-radius: 18px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 12px 30px -10px oklch(0.25 0.04 50 / 0.4); z-index: 20; }
.pv-cart-bar small { font-size: 11px; opacity: 0.7; }
.pv-list-grid { display: grid; gap: var(--pv-gap-list); grid-template-columns: 1fr; }
.pv-dish-list { display: grid; grid-template-columns: 80px 1fr; gap: 12px; align-items: center; }
.pv-dish-list .pv-img { width: 80px; height: 80px; }
.pv-input { appearance: none; width: 100%; height: 48px; padding: 0 16px; border-radius: 14px; background: var(--hueso); border: 1px solid var(--crema-line); font-size: 15px; color: var(--tierra); font-family: inherit; }
.pv-input:focus { outline: none; border-color: var(--terracota); }
.pv-label { font-size: 12px; color: var(--tierra-soft); margin-bottom: 6px; display: block; font-weight: 500; letter-spacing: 0.01em; }
.pv-field { margin-bottom: 14px; }
.pv-chip { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 999px; background: var(--hueso); border: 1px solid var(--crema-line); color: var(--tierra); font-size: 13px; cursor: pointer; user-select: none; appearance: none; font-family: inherit; }
.pv-chip[aria-pressed="true"] { background: var(--terracota); color: var(--hueso); border-color: var(--terracota); }
.pv-chip-veg[aria-pressed="true"] { background: var(--verde); border-color: var(--verde); }
.pv-stepper { display: inline-flex; align-items: center; gap: 12px; background: var(--crema-deep); padding: 4px; border-radius: 999px; }
.pv-stepper button { appearance: none; border: 0; width: 34px; height: 34px; border-radius: 999px; background: var(--hueso); color: var(--tierra); font-size: 18px; cursor: pointer; }
.pv-stepper-val { min-width: 18px; text-align: center; font-weight: 600; font-size: 15px; }
.pv-bowl-wrap { position: relative; width: 220px; height: 220px; margin: 12px auto 4px; }
.pv-bowl-bg { position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle at 35% 30%, oklch(0.99 0.005 80) 0%, oklch(0.93 0.025 75) 60%, oklch(0.85 0.035 65) 100%); box-shadow: inset 0 -20px 40px oklch(0.7 0.05 50 / 0.2), 0 20px 40px -15px oklch(0.6 0.08 50 / 0.4); overflow: hidden; }
.pv-bowl-fill { position: absolute; inset: 8%; border-radius: 50%; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px; padding: 14px; overflow: hidden; }
.pv-bowl-dot { width: 18px; height: 18px; border-radius: 50%; background: var(--verde); opacity: 0.85; }
.pv-bowl-empty { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Instrument Serif', serif; font-size: 18px; color: var(--tierra-soft); text-align: center; padding: 0 40px; line-height: 1.2; }
.pv-checkmark { width: 88px; height: 88px; border-radius: 50%; background: var(--verde); color: var(--hueso); display: flex; align-items: center; justify-content: center; margin: 32px auto 24px; box-shadow: 0 20px 40px -15px oklch(0.5 0.1 130 / 0.5); }
.adm-fab { position: absolute; right: 16px; bottom: 48px; z-index: 30; width: 42px; height: 42px; border-radius: 50%; background: var(--tierra); border: none; color: rgba(255,255,255,0.55); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.25); transition: all .2s; appearance: none; }
.adm-fab:hover { background: var(--terracota); color: white; transform: scale(1.08); }
.adm-tabs { display: flex; gap: 5px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 18px; scrollbar-width: none; }
.adm-tabs::-webkit-scrollbar { display: none; }
.adm-tab { appearance: none; border: 1.5px solid var(--crema-line); background: var(--hueso); color: var(--tierra); font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; padding: 6px 12px; border-radius: 999px; cursor: pointer; white-space: nowrap; transition: all .15s; }
.adm-tab.on { background: var(--tierra); border-color: var(--tierra); color: white; }
.adm-card { background: var(--hueso); border: 1px solid var(--crema-line); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 12px; margin-bottom: 10px; }
.adm-label { font-size: 10px; font-weight: 600; color: var(--tierra-soft); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; }
.adm-reset { appearance: none; border: none; background: transparent; color: var(--terracota); font-size: 10px; font-weight: 700; cursor: pointer; padding: 0; font-family: inherit; }
.adm-input { width: 100%; appearance: none; border: 1.5px solid var(--crema-line); background: var(--crema-deep); color: var(--tierra); font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 8px 10px; border-radius: 9px; outline: none; }
.adm-input:focus { border-color: var(--terracota); }
.adm-textarea { resize: none; height: 64px; }
.adm-pfx { position: relative; }
.adm-pfx-sym { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--tierra-soft); font-size: 13px; pointer-events: none; }
.adm-pfx .adm-input { padding-left: 22px; }
.adm-img-row { display: flex; gap: 10px; align-items: center; }
.adm-img-thumb { width: 58px; height: 58px; border-radius: 10px; background: var(--crema-deep); border: 1.5px dashed var(--crema-line); display: flex; align-items: center; justify-content: center; font-size: 9px; color: var(--tierra-soft); flex-shrink: 0; overflow: hidden; }
.adm-img-thumb img { width: 100%; height: 100%; object-fit: cover; }
.adm-img-btns { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.adm-img-btn { appearance: none; border: 1px solid var(--crema-line); background: var(--crema-deep); color: var(--tierra); font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; padding: 7px 10px; border-radius: 8px; cursor: pointer; text-align: left; }
.adm-img-btn:hover { border-color: var(--terracota); color: var(--terracota); }
.adm-img-btn.del { color: var(--warn); border-color: transparent; background: transparent; }
.adm-opt-row { display: flex; gap: 6px; align-items: center; background: var(--crema-deep); border: 1px solid var(--crema-line); border-radius: 9px; padding: 5px 8px; }
.adm-opt-inp { flex: 1; appearance: none; border: none; background: transparent; color: var(--tierra); font-family: 'DM Sans', sans-serif; font-size: 12px; outline: none; }
.adm-opt-del { appearance: none; border: none; background: transparent; color: var(--tierra-soft); cursor: pointer; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.adm-opt-del:hover { background: oklch(0.96 0.02 30); color: var(--warn); }
.adm-add-opt { appearance: none; border: 1.5px dashed var(--terracota); background: transparent; color: var(--terracota); font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; padding: 8px; border-radius: 10px; cursor: pointer; width: 100%; margin-top: 6px; }
.adm-danger { margin-top: 28px; padding: 14px; background: oklch(0.96 0.02 30); border-radius: 12px; border: 1px dashed oklch(0.7 0.1 30); }
.adm-danger-title { font-size: 11px; font-weight: 700; color: oklch(0.45 0.15 30); margin-bottom: 4px; }
.adm-danger-sub { font-size: 10px; color: oklch(0.5 0.1 30); line-height: 1.5; margin-bottom: 8px; }
.adm-danger-btn { appearance: none; border: 1px solid oklch(0.6 0.15 30); background: transparent; color: oklch(0.45 0.15 30); font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; padding: 6px 14px; border-radius: 999px; cursor: pointer; }
.adm-session { margin-bottom: 14px; padding: 10px 12px; background: var(--verde-soft); border-radius: 10px; display: flex; align-items: center; justify-content: space-between; }
.adm-badge { font-size: 9px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--verde); background: white; padding: 3px 8px; border-radius: 999px; border: 1px solid var(--verde); }
.adm-login-err { font-size: 11px; color: var(--warn); background: oklch(0.97 0.02 60); border-radius: 8px; padding: 8px 12px; margin-top: 8px; line-height: 1.4; }
`;

// ══════════════════════════════════════════════
// ICONS
// ══════════════════════════════════════════════
const Icon = {
  back: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bag: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 8h14l-1.2 11.2a2 2 0 01-2 1.8H8.2a2 2 0 01-2-1.8L5 8z" stroke="currentColor" strokeWidth="1.8"/><path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  check: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  spark: () => <svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" fill="currentColor"/></svg>,
  pin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6"/></svg>,
  clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  shield: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  user: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m1 0v12a2 2 0 01-2 2H9a2 2 0 01-2-2V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  lock: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="11" rx="2" stroke="var(--terracota)" strokeWidth="2"/><path d="M8 10V7a4 4 0 018 0v3" stroke="var(--terracota)" strokeWidth="2"/></svg>,
};

function Img({ id, veg, style, images }) {
  const src = images?.[id];
  const cls = `pv-img${veg ? " pv-img-veg" : ""}`;
  if (src) return <div className={cls} style={{ ...style, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }} />;
  return <div className={cls} style={style}>foto</div>;
}

function Header({ onBack, title, right }) {
  return (
    <div className="pv-header">
      <div className="pv-header-bar">
        {onBack ? <button className="pv-back" onClick={onBack}><Icon.back /></button> : <div style={{ width: 38 }} />}
        <div className="pv-header-title">{title}</div>
        <div style={{ width: 38, display: "flex", justifyContent: "flex-end" }}>{right}</div>
      </div>
    </div>
  );
}

function CartBar({ cart, onTap, label = "Ver carrito" }) {
  const total = cart.reduce((a, i) => a + i.precio * i.cantidad, 0);
  const count = cart.reduce((a, i) => a + i.cantidad, 0);
  if (count === 0) return null;
  return (
    <div className="pv-cart-bar" onClick={onTap} style={{ cursor: "pointer" }}>
      <div>
        <small>{count} {count === 1 ? "plato" : "platos"} · {formatPrecio(total)}</small>
        <div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>{label}</div>
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 999, background: "var(--terracota)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--hueso)" }}><Icon.bag /></div>
    </div>
  );
}

function HomeScreen({ go, cart, D, isAdmin, images }) {
  return (
    <>
      <Header title="Pachama Viandas" right={
        <button onClick={() => go({ screen: isAdmin ? "admin" : "login" })} style={{ appearance: "none", border: "1px solid var(--crema-line)", background: "var(--hueso)", width: 38, height: 38, borderRadius: 999, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, color: "var(--tierra-soft)" }}>
          {isAdmin ? <Icon.shield /> : <Icon.user />}
        </button>
      } />
      <div className="pv-body pv-body-with-cart">
        <div style={{ marginTop: 10, marginBottom: 24 }}>
          <div className="pv-eyebrow">Hoy · {D.fecha.dia} {D.fecha.numero} de {D.fecha.mes}</div>
          <div className="pv-h1" style={{ marginTop: 8 }}>
            {D.home.titleL1}<br />
            <em style={{ fontStyle: "italic", color: "var(--terracota)" }}>{D.home.titleL2}</em><br />
            {D.home.titleL3}
          </div>
          <div className="pv-body-text" style={{ marginTop: 12, maxWidth: 320 }}>{D.home.desc}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1, 2, 3].map((n) => {
            const op = D.opciones[n];
            const isOne = n === 1, isArma = n === 3;
            return (
              <div key={n} className="pv-card pv-card-tap"
                onClick={() => isArma ? go({ screen: "arma" }) : go({ screen: "menu", opcion: n, categoria: op.categorias[0] })}
                style={{ background: isOne ? "var(--tierra)" : isArma ? "var(--verde-soft)" : "var(--hueso)", color: isOne ? "var(--hueso)" : isArma ? "oklch(0.28 0.08 130)" : "var(--tierra)", borderColor: isOne ? "var(--tierra)" : isArma ? "transparent" : "var(--crema-line)", position: "relative", overflow: "hidden", padding: 22 }}>
                <div style={{ position: "absolute", right: -30, top: -30, width: 160, height: 160, borderRadius: "50%", background: isOne ? "oklch(0.36 0.05 50)" : isArma ? "radial-gradient(circle at 30% 30%, oklch(0.95 0.04 130) 0%, oklch(0.78 0.08 130) 100%)" : "var(--crema-deep)", opacity: isOne ? 0.6 : 1 }} />
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.16em", opacity: 0.65, fontWeight: 500 }}>{op.bajada}</div>
                  <div className="pv-serif" style={{ fontSize: 38, lineHeight: 1, marginTop: 8 }}>{op.titulo}</div>
                  <div style={{ fontSize: 13, marginTop: 10, opacity: 0.75, maxWidth: 240, lineHeight: 1.4 }}>{op.descripcion}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 18 }}>
                    <span style={{ fontSize: 11, opacity: 0.7 }}>Desde</span>
                    <span style={{ fontSize: 22, fontWeight: 600 }}>{formatPrecio(op.precioDesde)}</span>
                  </div>
                  <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {!isArma && op.categorias.map((c) => (
                      <span key={c} className="pv-tag" style={{ background: isOne ? "oklch(0.36 0.05 50)" : "var(--crema-deep)", color: isOne ? "var(--hueso)" : "var(--tierra)" }}>{D.categorias[c].nombre}</span>
                    ))}
                    {isArma && <span className="pv-tag" style={{ background: "oklch(0.32 0.08 130)", color: "var(--hueso)" }}>Empezar →</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 26, padding: 16, borderRadius: 16, background: "var(--terracota-soft)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "oklch(0.36 0.08 40)" }}><Icon.clock /><span style={{ fontSize: 12, fontWeight: 500 }}>{D.home.hours}</span></div>
          <div style={{ fontSize: 12, color: "oklch(0.36 0.08 40)", marginTop: 6, opacity: 0.85 }}>{D.home.delivery}</div>
        </div>
      </div>
      <CartBar cart={cart} onTap={() => go({ screen: "carrito" })} />
    </>
  );
}

function MenuScreen({ state, go, cart, D, images }) {
  const op = D.opciones[state.opcion];
  const cat = state.categoria;
  return (
    <>
      <Header onBack={() => go({ screen: "home" })} title={op.titulo} />
      <div className="pv-body pv-body-with-cart">
        <div style={{ marginBottom: 16 }}>
          <div className="pv-eyebrow">{op.bajada}</div>
          <div className="pv-h2" style={{ marginTop: 4 }}>Hoy en el menú</div>
        </div>
        <div className="pv-tabs" style={{ marginBottom: 18 }}>
          {op.categorias.map((c) => (
            <div key={c} className="pv-tab" aria-selected={cat === c} onClick={() => go({ ...state, categoria: c })}>{D.categorias[c].short}</div>
          ))}
        </div>
        {cat === "arma"
          ? <div className="pv-card pv-card-tap" onClick={() => go({ ...state, screen: "arma" })} style={{ background: "var(--verde-soft)", borderColor: "transparent", padding: 22, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -40, bottom: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, oklch(0.95 0.04 130) 0%, oklch(0.78 0.08 130) 100%)" }} />
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "oklch(0.32 0.08 130)" }}><Icon.spark /><span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Personalizá</span></div>
                <div className="pv-serif" style={{ fontSize: 32, lineHeight: 1, marginTop: 8, color: "oklch(0.28 0.08 130)" }}>Arma tu<br />ensalada.</div>
                <div style={{ fontSize: 13, marginTop: 10, color: "oklch(0.32 0.05 125)", maxWidth: 220 }}>Base, proteína, toppings y aderezo. A tu gusto.</div>
                <button className="pv-btn pv-btn-sm" style={{ marginTop: 16, background: "oklch(0.32 0.08 130)", boxShadow: "none" }}>Empezar</button>
              </div>
            </div>
          : <div className="pv-list-grid">
              {(D.platos[cat]?.[state.opcion] || []).map((p) => (
                <div key={p.id} className="pv-card pv-card-tap" onClick={() => go({ ...state, screen: "detalle", plato: p })}>
                  <div className="pv-dish-list">
                    <Img id={`plato.${p.id}`} veg images={images} style={{ width: 80, height: 80 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}>{p.nombre}</div>
                      <div style={{ fontSize: 12, color: "var(--tierra-soft)", marginTop: 4, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.desc}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--terracota)" }}>{formatPrecio(p.precio)}</div>
                        <div style={{ display: "flex", gap: 4 }}>{p.tags.slice(0, 1).map((t) => <span key={t} className="pv-tag pv-tag-veg">{t}</span>)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
      <CartBar cart={cart} onTap={() => go({ screen: "carrito" })} />
    </>
  );
}

function DetalleScreen({ state, go, setCart, images }) {
  const p = state.plato;
  const [qty, setQty] = useState(1);
  const compls = p.complementarios || [];
  const esComp = !!p.complementarioVisible && compls.length > 0;
  const add = () => {
    setCart((c) => {
      const ex = c.find((it) => it.id === p.id && !it.custom);
      if (ex) return c.map((it) => it.id === p.id && !it.custom ? { ...it, cantidad: it.cantidad + qty } : it);
      return [...c, { id: p.id, nombre: p.nombre, precio: p.precio, cantidad: qty }];
    });
    go({ screen: "menu", opcion: state.opcion, categoria: state.categoria });
  };
  return (
    <>
      <Header onBack={() => go({ screen: "menu", opcion: state.opcion, categoria: state.categoria })} title="Detalle" />
      <div className="pv-body" style={{ paddingBottom: 120 }}>
        <Img id={`plato.${p.id}`} veg images={images} style={{ height: 190, marginBottom: 18 }} />
        <div className="pv-h2">{p.nombre}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>{p.tags.map((t) => <span key={t} className="pv-tag pv-tag-veg">{t}</span>)}</div>
        <div className="pv-body-text" style={{ marginTop: 14 }}>{p.desc}</div>
        {esComp && (
          <div style={{ marginTop: 22, padding: 16, borderRadius: 16, background: "var(--verde-soft)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "oklch(0.32 0.08 130)", marginBottom: 10 }}>Complementario</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {compls.map((c) => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "oklch(0.28 0.08 130)" }}>
                  <span style={{ width: 18, height: 18, borderRadius: 999, background: "oklch(0.55 0.1 130)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="var(--hueso)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "oklch(0.36 0.06 130)", marginTop: 10, opacity: 0.85 }}>Incluidos sin cargo.</div>
          </div>
        )}
        <div style={{ marginTop: 26, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="pv-stepper">
            <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span className="pv-stepper-val">{qty}</span>
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{formatPrecio(p.precio * qty)}</div>
        </div>
      </div>
      <div className="pv-cart-bar" onClick={add} style={{ cursor: "pointer" }}>
        <div><small>Agregar al pedido</small><div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>Sumar {qty} {qty === 1 ? "plato" : "platos"}</div></div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{formatPrecio(p.precio * qty)}</div>
      </div>
    </>
  );
}

function ArmaScreen({ go, cart, setCart, D }) {
  const [sel, setSel] = useState({ base: [], proteina: [], toppings: [], aderezo: [] });
  const arma = D.arma;
  const toggle = (pasoId, opId, max) => {
    setSel((s) => {
      const cur = s[pasoId] || [];
      if (cur.includes(opId)) return { ...s, [pasoId]: cur.filter((x) => x !== opId) };
      if (cur.length >= max) return max === 1 ? { ...s, [pasoId]: [opId] } : s;
      return { ...s, [pasoId]: [...cur, opId] };
    });
  };
  const completo = arma.pasos.every((p) => (sel[p.id] || []).length > 0);
  const totalSel = arma.pasos.reduce((a, p) => a + (sel[p.id] || []).length, 0);
  const colorFor = (paso) => ({ base: "oklch(0.6 0.1 130)", proteina: "oklch(0.55 0.12 40)", toppings: "oklch(0.7 0.13 70)", aderezo: "oklch(0.85 0.08 90)" }[paso] || "oklch(0.6 0.05 50)");
  const allSel = useMemo(() => arma.pasos.flatMap((p) => (sel[p.id] || []).map((id) => ({ paso: p.id, id }))), [sel, arma.pasos]);
  const add = () => {
    const resumen = arma.pasos.map((p) => (sel[p.id] || []).map((id) => p.opciones.find((o) => o.id === id)?.nombre).join(", ")).filter(Boolean).join(" · ");
    setCart((c) => [...c, { id: "arma-" + Date.now(), nombre: "Ensalada a tu gusto", precio: arma.base, cantidad: 1, custom: true, notas: resumen }]);
    go({ screen: "home" });
  };
  return (
    <>
      <Header onBack={() => go({ screen: "home" })} title="Arma tu ensalada" />
      <div className="pv-body" style={{ paddingBottom: 140 }}>
        <div className="pv-bowl-wrap">
          <div className="pv-bowl-bg" />
          {allSel.length === 0 && <div className="pv-bowl-empty">Tu bowl vacío<br />empezá eligiendo una base</div>}
          <div className="pv-bowl-fill">
            {allSel.map((s, i) => (
              <div key={s.paso + s.id} className="pv-bowl-dot" style={{ background: colorFor(s.paso), width: s.paso === "base" ? 28 : s.paso === "proteina" ? 24 : 16, height: s.paso === "base" ? 28 : s.paso === "proteina" ? 24 : 16, transform: `rotate(${i * 23}deg)` }} />
            ))}
          </div>
        </div>
        {arma.pasos.map((paso) => (
          <div key={paso.id} style={{ marginTop: 22 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
              <div><div className="pv-h3" style={{ fontSize: 20 }}>{paso.titulo}</div><div className="pv-meta">{paso.sub}</div></div>
              <div style={{ fontSize: 12, color: "var(--tierra-soft)" }}>{(sel[paso.id] || []).length}/{paso.max}</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {paso.opciones.map((op) => {
                const active = (sel[paso.id] || []).includes(op.id);
                return <button key={op.id} className={`pv-chip ${paso.id === "base" || paso.id === "toppings" ? "pv-chip-veg" : ""}`} aria-pressed={active} onClick={() => toggle(paso.id, op.id, paso.max)}>{op.nombre}</button>;
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="pv-cart-bar" onClick={completo ? add : null} style={{ opacity: completo ? 1 : 0.6, cursor: completo ? "pointer" : "not-allowed", background: completo ? "var(--terracota)" : "var(--tierra)" }}>
        <div><small style={{ opacity: 0.85 }}>{totalSel} ingredientes elegidos</small><div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>{completo ? `Agregar · ${formatPrecio(arma.base)}` : "Completá los pasos"}</div></div>
        <div style={{ width: 40, height: 40, borderRadius: 999, background: completo ? "oklch(0.36 0.05 50)" : "var(--crema-deep)", display: "flex", alignItems: "center", justifyContent: "center", color: completo ? "var(--hueso)" : "var(--tierra-soft)", fontSize: 20, fontWeight: 600 }}>+</div>
      </div>
    </>
  );
}

function CarritoScreen({ go, cart, setCart }) {
  const subtotal = cart.reduce((a, i) => a + i.precio * i.cantidad, 0);
  const envio = subtotal >= 9000 ? 0 : 900;
  const total = subtotal + envio;
  const upd = (idx, d) => setCart((c) => { const n = [...c]; n[idx] = { ...n[idx], cantidad: n[idx].cantidad + d }; return n.filter((it) => it.cantidad > 0); });
  return (
    <>
      <Header onBack={() => go({ screen: "home" })} title="Tu pedido" />
      <div className="pv-body" style={{ paddingBottom: 140 }}>
        {cart.length === 0
          ? <div style={{ textAlign: "center", padding: "60px 30px" }}>
              <div className="pv-h3" style={{ marginBottom: 10 }}>Tu canasta está vacía</div>
              <div className="pv-meta">Volvé al menú y elegí lo de hoy.</div>
              <button className="pv-btn" style={{ marginTop: 24 }} onClick={() => go({ screen: "home" })}>Ver menú</button>
            </div>
          : <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cart.map((it, i) => (
                  <div key={i} className="pv-card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div className={`pv-img${!it.custom ? " pv-img-veg" : ""}`} style={{ width: 64, height: 64, borderRadius: 12, flexShrink: 0, fontSize: 9 }}>foto</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>{it.nombre}</div>
                      {it.notas && <div style={{ fontSize: 11, color: "var(--tierra-soft)", marginTop: 4, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{it.notas}</div>}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--terracota)" }}>{formatPrecio(it.precio * it.cantidad)}</div>
                        <div className="pv-stepper" style={{ padding: 2, gap: 8 }}>
                          <button style={{ width: 28, height: 28 }} onClick={() => upd(i, -1)}>−</button>
                          <span className="pv-stepper-val" style={{ fontSize: 13 }}>{it.cantidad}</span>
                          <button style={{ width: 28, height: 28 }} onClick={() => upd(i, 1)}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 22, padding: 18, background: "var(--hueso)", border: "1px solid var(--crema-line)", borderRadius: 18 }}>
                <PrecioRow label="Subtotal" value={formatPrecio(subtotal)} />
                <PrecioRow label={`Envío${envio === 0 ? " (gratis)" : ""}`} value={envio === 0 ? "Gratis" : formatPrecio(envio)} />
                <div style={{ height: 1, background: "var(--crema-line)", margin: "12px 0" }} />
                <PrecioRow label="Total" value={formatPrecio(total)} bold />
              </div>
            </>
        }
      </div>
      {cart.length > 0 && (
        <div className="pv-cart-bar" onClick={() => go({ screen: "checkout" })} style={{ cursor: "pointer" }}>
          <div><small>Total {formatPrecio(total)}</small><div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>Ir a confirmar</div></div>
          <div style={{ fontSize: 18 }}>→</div>
        </div>
      )}
    </>
  );
}

function PrecioRow({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
      <div style={{ fontSize: bold ? 16 : 13, color: bold ? "var(--tierra)" : "var(--tierra-soft)", fontWeight: bold ? 600 : 400 }}>{label}</div>
      <div style={{ fontSize: bold ? 18 : 13, fontWeight: bold ? 700 : 500, color: "var(--tierra)" }}>{value}</div>
    </div>
  );
}

function CheckoutScreen({ go, cart, setCart, D }) {
  const [form, setForm] = useState({ nombre: "", dir: "", pago: "transferencia" });
  const subtotal = cart.reduce((a, i) => a + i.precio * i.cantidad, 0);
  const envio = subtotal >= 9000 ? 0 : 900;
  const total = subtotal + envio;
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const confirm = () => {
    const numero = (D.home.whatsapp || "").replace(/\D/g, "");
    const lineas = cart.map((it) => `• ${it.cantidad}x ${it.nombre}${it.notas ? ` (${it.notas})` : ""} — ${formatPrecio(it.precio * it.cantidad)}`).join("\n");
    const msg = ["*Nuevo pedido — Pachama Viandas*", "", `*Cliente:* ${form.nombre || "Sin nombre"}`, `*Dirección:* ${form.dir || "Sin dirección"}`, `*Pago:* ${form.pago === "transferencia" ? "Transferencia" : "Efectivo"}`, "", "*Pedido:*", lineas, "", `*Total:* ${formatPrecio(total)}`].join("\n");
    if (numero) window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, "_blank");
    go({ screen: "confirm", form, total });
  };
  return (
    <>
      <Header onBack={() => go({ screen: "carrito" })} title="Confirmar pedido" />
      <div className="pv-body" style={{ paddingBottom: 140 }}>
        <div className="pv-eyebrow" style={{ marginBottom: 4 }}>Entrega</div>
        <div className="pv-h3" style={{ marginBottom: 14 }}>¿Dónde la dejamos?</div>
        <div className="pv-field"><label className="pv-label">Nombre</label><input className="pv-input" value={form.nombre} onChange={(e) => setF("nombre", e.target.value)} placeholder="Tu nombre" /></div>
        <div className="pv-field"><label className="pv-label">Dirección</label><input className="pv-input" value={form.dir} onChange={(e) => setF("dir", e.target.value)} placeholder="Calle y número" /></div>
        <div className="pv-eyebrow" style={{ marginTop: 24, marginBottom: 4 }}>Pago</div>
        <div className="pv-h3" style={{ marginBottom: 14 }}>Forma de pago</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[{ id: "transferencia", label: "Transferencia", sub: "CBU / alias bancario" }, { id: "efectivo", label: "Efectivo al entregar", sub: "" }].map((o) => {
            const sel = form.pago === o.id;
            return (
              <div key={o.id} className="pv-card pv-card-tap" onClick={() => setF("pago", o.id)} style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, borderColor: sel ? "var(--terracota)" : "var(--crema-line)", background: sel ? "var(--terracota-soft)" : "var(--hueso)" }}>
                <div style={{ width: 20, height: 20, borderRadius: 999, border: "2px solid", borderColor: sel ? "var(--terracota)" : "var(--crema-line)", background: sel ? "var(--terracota)" : "transparent", boxShadow: sel ? "inset 0 0 0 3px var(--hueso)" : "none", flexShrink: 0 }} />
                <div><div style={{ fontSize: 14, fontWeight: 600 }}>{o.label}</div>{o.sub && <div style={{ fontSize: 12, color: "var(--tierra-soft)" }}>{o.sub}</div>}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 22, padding: 16, background: "var(--hueso)", border: "1px solid var(--crema-line)", borderRadius: 16 }}>
          <PrecioRow label="Subtotal" value={formatPrecio(subtotal)} />
          <PrecioRow label={envio === 0 ? "Envío (gratis)" : "Envío"} value={envio === 0 ? "Gratis" : formatPrecio(envio)} />
          <div style={{ height: 1, background: "var(--crema-line)", margin: "10px 0" }} />
          <PrecioRow label="Total a pagar" value={formatPrecio(total)} bold />
        </div>
      </div>
      <div className="pv-cart-bar" onClick={confirm} style={{ cursor: "pointer" }}>
        <div><small>Total {formatPrecio(total)}</small><div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>Confirmar pedido</div></div>
        <div style={{ fontSize: 18 }}>→</div>
      </div>
    </>
  );
}

function ConfirmScreen({ state, go, setCart }) {
  const codigo = useMemo(() => "PV-" + Math.floor(Math.random() * 9000 + 1000), []);
  return (
    <>
      <Header title="¡Listo!" />
      <div className="pv-body" style={{ textAlign: "center", paddingTop: 20 }}>
        <div className="pv-checkmark"><Icon.check /></div>
        <div className="pv-eyebrow">Pedido {codigo}</div>
        <div className="pv-h2" style={{ marginTop: 8 }}>Recibimos<br />tu pedido.</div>
        <div className="pv-body-text" style={{ marginTop: 12, padding: "0 24px" }}>Te llega hoy entre las <b>12:30 y 13:00</b>. Te avisamos por WhatsApp cuando salga.</div>
        <div className="pv-card" style={{ marginTop: 28, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Icon.pin /><span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--terracota)" }}>Entrega</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{state.form?.nombre || "—"}</div>
          <div style={{ fontSize: 13, color: "var(--tierra-soft)", marginTop: 4 }}>{state.form?.dir || "—"}</div>
          <div style={{ height: 1, background: "var(--crema-line)", margin: "14px 0" }} />
          <PrecioRow label="Total cobrado" value={formatPrecio(state.total || 0)} bold />
        </div>
        <button className="pv-btn pv-btn-full" style={{ marginTop: 28 }} onClick={() => { setCart([]); go({ screen: "home" }); }}>Volver al menú</button>
      </div>
    </>
  );
}

function LoginScreen({ go, admin }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    if (!email.trim()) { setErr("Ingresá tu email."); return; }
    if (admin.login(email)) { setErr(""); go({ screen: "admin" }); }
    else setErr("Email no autorizado.");
  };
  return (
    <>
      <Header onBack={() => go({ screen: "home" })} title="Administrador" right={<div style={{ width: 38 }} />} />
      <div className="pv-body" style={{ display: "flex", flexDirection: "column", paddingTop: 30 }}>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: "center", marginBottom: 20 }}><Icon.lock /></div>
        <div className="pv-h2" style={{ textAlign: "center", marginBottom: 8 }}>Iniciar sesión</div>
        <div className="pv-meta" style={{ textAlign: "center", marginBottom: 28 }}>Acceso restringido.</div>
        <div className="pv-field">
          <label className="pv-label">Email</label>
          <input className="pv-input" type="email" autoComplete="email" placeholder="tu@email.com" value={email} style={err ? { borderColor: "var(--warn)" } : {}} onChange={(e) => { setEmail(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && submit()} />
          {err && <div className="adm-login-err">{err}</div>}
        </div>
        <button className="pv-btn pv-btn-full" onClick={submit}>Ingresar</button>
        <div style={{ flex: 2 }} />
      </div>
    </>
  );
}

function AdminScreen({ go, admin, D }) {
  const [tab, setTab] = useState("general");
  useEffect(() => { if (!admin.isAdmin) go({ screen: "login" }); }, [admin.isAdmin]);
  if (!admin.isAdmin) return null;
  return (
    <>
      <Header onBack={() => go({ screen: "home" })} title="Editor del menú"
        right={<button onClick={() => { admin.logout(); go({ screen: "home" }); }} style={{ appearance: "none", border: 0, background: "transparent", color: "var(--tierra-soft)", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Salir</button>}
      />
      <div className="pv-body">
        <div className="adm-session">
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--verde)", marginBottom: 2 }}>Conectado como</div>
            <div style={{ fontSize: 12, color: "var(--tierra)", fontWeight: 500 }}>{admin.session.email}</div>
          </div>
          <span className="adm-badge">Admin</span>
        </div>
        <div className="adm-tabs">
          {[{ id: "general", l: "General" }, { id: "opciones", l: "Opciones" }, { id: "platos", l: "Platos" }, { id: "arma", l: "Arma" }].map((t) => (
            <button key={t.id} className={`adm-tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>{t.l}</button>
          ))}
        </div>
        {tab === "general" && <AdminGeneral admin={admin} D={D} />}
        {tab === "opciones" && <AdminOpciones admin={admin} D={D} />}
        {tab === "platos" && <AdminPlatos admin={admin} D={D} />}
        {tab === "arma" && <AdminArma admin={admin} D={D} />}
        <div className="adm-danger">
          <div className="adm-danger-title">Zona de peligro</div>
          <div className="adm-danger-sub">Restablece todos los textos, precios e imágenes.</div>
          <button className="adm-danger-btn" onClick={() => { if (window.confirm("¿Restablecer todo?")) admin.resetAll(); }}>Restablecer todo</button>
        </div>
      </div>
    </>
  );
}

function AF({ label, path, multi, admin, D }) {
  const val = getByPath(D, path) ?? "";
  const isOv = path in admin.overrides;
  return (
    <div>
      <div className="adm-label">{label}{isOv && <button className="adm-reset" onClick={() => admin.clearOverride(path)}>Restablecer</button>}</div>
      {multi ? <textarea className="adm-input adm-textarea" value={val} onChange={(e) => admin.setOverride(path, e.target.value)} /> : <input className="adm-input" value={val} onChange={(e) => admin.setOverride(path, e.target.value)} />}
    </div>
  );
}
function NF({ label, path, admin, D }) {
  const val = getByPath(D, path) ?? 0;
  const isOv = path in admin.overrides;
  return (
    <div>
      <div className="adm-label">{label}{isOv && <button className="adm-reset" onClick={() => admin.clearOverride(path)}>Restablecer</button>}</div>
      <div className="adm-pfx"><span className="adm-pfx-sym">$</span><input className="adm-input" type="number" value={val} onChange={(e) => admin.setOverride(path, parseInt(e.target.value, 10) || 0)} /></div>
    </div>
  );
}
function ImgF({ label, id, admin }) {
  const src = admin.images[id];
  const ref = useRef(null);
  const onPick = (e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => admin.setImage(id, r.result); r.readAsDataURL(f); };
  return (
    <div>
      <div className="adm-label">{label}</div>
      <div className="adm-img-row">
        <div className="adm-img-thumb">{src ? <img src={src} alt="" /> : "foto"}</div>
        <div className="adm-img-btns">
          <button className="adm-img-btn" onClick={() => ref.current.click()}>{src ? "Cambiar imagen" : "Subir imagen"}</button>
          {src && <button className="adm-img-btn del" onClick={() => admin.clearImage(id)}>Quitar imagen</button>}
        </div>
        <input ref={ref} type="file" accept="image/*" onChange={onPick} style={{ display: "none" }} />
      </div>
    </div>
  );
}
function TF({ label, path, admin, D }) {
  const val = !!getByPath(D, path);
  const isOv = path in admin.overrides;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div className="adm-label" style={{ marginBottom: 0 }}>{label}{isOv && <button className="adm-reset" onClick={() => admin.clearOverride(path)}>Restablecer</button>}</div>
      <button onClick={() => admin.setOverride(path, !val)} role="switch" aria-checked={val}
        style={{ appearance: "none", border: 0, width: 38, height: 22, borderRadius: 999, background: val ? "var(--terracota)" : "var(--crema-line)", position: "relative", cursor: "pointer", padding: 0, transition: "background .15s", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: 2, left: val ? 18 : 2, width: 18, height: 18, borderRadius: 999, background: "var(--hueso)", transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
      </button>
    </div>
  );
}
function LF({ label, path, admin, D }) {
  const items = getByPath(D, path) || [];
  const isOv = path in admin.overrides;
  const upd = (fn) => admin.setOverride(path, fn(items));
  return (
    <div>
      <div className="adm-label">{label} · {items.length}{isOv && <button className="adm-reset" onClick={() => admin.clearOverride(path)}>Restablecer</button>}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {items.map((item, j) => (
          <div key={j} className="adm-opt-row">
            <input className="adm-opt-inp" value={item} onChange={(e) => upd((arr) => arr.map((x, i) => i === j ? e.target.value : x))} />
            <button className="adm-opt-del" onClick={() => upd((arr) => arr.filter((_, i) => i !== j))}><Icon.trash /></button>
          </div>
        ))}
      </div>
      <button className="adm-add-opt" onClick={() => upd((arr) => [...arr, "Nuevo complementario"])}>+ Agregar</button>
    </div>
  );
}
function ACard({ title, children }) {
  return <div style={{ marginBottom: 20 }}>{title && <div className="pv-h3" style={{ fontSize: 16, marginBottom: 10 }}>{title}</div>}<div className="adm-card">{children}</div></div>;
}
function AdminGeneral({ admin, D }) {
  return <>
    <ACard title="Pantalla principal"><AF label="Título — línea 1" path="home.titleL1" admin={admin} D={D} /><AF label="Título — línea 2 (cursiva)" path="home.titleL2" admin={admin} D={D} /><AF label="Título — línea 3" path="home.titleL3" admin={admin} D={D} /><AF label="Descripción" path="home.desc" multi admin={admin} D={D} /></ACard>
    <ACard title="Fecha del día"><AF label="Día de la semana" path="fecha.dia" admin={admin} D={D} /><AF label="Número" path="fecha.numero" admin={admin} D={D} /><AF label="Mes" path="fecha.mes" admin={admin} D={D} /></ACard>
    <ACard title="Entrega"><AF label="Zona de entrega" path="home.delivery" multi admin={admin} D={D} /><AF label="Horario" path="home.hours" admin={admin} D={D} /></ACard>
    <ACard title="WhatsApp"><AF label="Número de WhatsApp" path="home.whatsapp" admin={admin} D={D} /></ACard>
  </>;
}
function AdminOpciones({ admin, D }) {
  return <>{[1, 2, 3].map((n) => { const op = D.opciones[n]; return <ACard key={n} title={op.titulo}><AF label="Título" path={`opciones.${n}.titulo`} admin={admin} D={D} /><AF label="Badge" path={`opciones.${n}.bajada`} admin={admin} D={D} /><AF label="Descripción" path={`opciones.${n}.descripcion`} multi admin={admin} D={D} /><NF label="Precio desde" path={`opciones.${n}.precioDesde`} admin={admin} D={D} /></ACard>; })}</>;
}
function AdminPlatos({ admin, D }) {
  const groups = [{ t: "Ensaladas · Op. 1", cat: "ensaladas", op: 1 }, { t: "Comidas · Op. 1", cat: "comidas", op: 1 }, { t: "Ensaladas · Op. 2", cat: "ensaladas", op: 2 }, { t: "Comidas · Op. 2", cat: "comidas", op: 2 }];
  return <>{groups.map((g) => (
    <div key={g.t} style={{ marginBottom: 20 }}>
      <div className="pv-h3" style={{ fontSize: 16, marginBottom: 10 }}>{g.t}</div>
      {(D.platos[g.cat][g.op] || []).map((p, idx) => (
        <div key={p.id} className="adm-card" style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "var(--tierra-soft)", letterSpacing: ".08em", textTransform: "uppercase" }}>{p.id}</div>
          <ImgF label="Imagen del plato" id={`plato.${p.id}`} admin={admin} />
          <AF label="Nombre" path={`platos.${g.cat}.${g.op}.${idx}.nombre`} admin={admin} D={D} />
          <AF label="Descripción" path={`platos.${g.cat}.${g.op}.${idx}.desc`} multi admin={admin} D={D} />
          <NF label="Precio" path={`platos.${g.cat}.${g.op}.${idx}.precio`} admin={admin} D={D} />
          <div style={{ height: 1, background: "var(--crema-line)" }} />
          <TF label="Mostrar complementarios" path={`platos.${g.cat}.${g.op}.${idx}.complementarioVisible`} admin={admin} D={D} />
          <LF label="Complementarios" path={`platos.${g.cat}.${g.op}.${idx}.complementarios`} admin={admin} D={D} />
        </div>
      ))}
    </div>
  ))}</>;
}
function AdminArma({ admin, D }) {
  const pasos = D.arma.pasos;
  const rnmOpt = (pi, oi, nombre) => admin.setOverride(`arma.pasos.${pi}.opciones`, pasos[pi].opciones.map((o, i) => i === oi ? { ...o, nombre } : o));
  const rmOpt = (pi, oi) => admin.setOverride(`arma.pasos.${pi}.opciones`, pasos[pi].opciones.filter((_, i) => i !== oi));
  const addOpt = (pi) => admin.setOverride(`arma.pasos.${pi}.opciones`, [...pasos[pi].opciones, { id: "opt-" + Date.now(), nombre: "Nueva opción" }]);
  return <>
    <ACard title="Precio base"><NF label="Precio de la ensalada" path="arma.base" admin={admin} D={D} /></ACard>
    {pasos.map((paso, pi) => (
      <div key={paso.id} style={{ marginBottom: 20 }}>
        <div className="pv-h3" style={{ fontSize: 16, marginBottom: 10 }}>Paso {pi + 1} — {paso.titulo}</div>
        <div className="adm-card">
          <AF label="Título del paso" path={`arma.pasos.${pi}.titulo`} admin={admin} D={D} />
          <AF label="Subtítulo" path={`arma.pasos.${pi}.sub`} admin={admin} D={D} />
          <div>
            <div className="adm-label">Opciones ({paso.opciones.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {paso.opciones.map((opt, oi) => (
                <div key={opt.id} className="adm-opt-row">
                  <input className="adm-opt-inp" value={opt.nombre} onChange={(e) => rnmOpt(pi, oi, e.target.value)} />
                  <button className="adm-opt-del" onClick={() => rmOpt(pi, oi)}><Icon.trash /></button>
                </div>
              ))}
            </div>
            <button className="adm-add-opt" onClick={() => addOpt(pi)}>+ Agregar opción</button>
          </div>
        </div>
      </div>
    ))}
  </>;
}

// ══════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════
export default function App() {
  const admin = useAdminStore();
  const D = admin.menu;
  const [state, setState] = useState({ screen: "home" });
  const [cart, setCart] = useState([]);
  const go = (next) => setState((s) => ({ ...s, ...next }));
  const shared = { go, cart, setCart, D, admin, images: admin.images, isAdmin: admin.isAdmin };
  const screens = {
    home: <HomeScreen {...shared} />,
    menu: <MenuScreen {...shared} state={state} />,
    detalle: <DetalleScreen {...shared} state={state} />,
    arma: <ArmaScreen {...shared} />,
    carrito: <CarritoScreen {...shared} />,
    checkout: <CheckoutScreen {...shared} />,
    confirm: <ConfirmScreen {...shared} state={state} />,
    login: <LoginScreen {...shared} />,
    admin: <AdminScreen {...shared} />,
  };
  return (
    <>
      <style>{CSS}</style>
      <div className="pv-stage">
        <div className="pv-device">
          <div className="pv-device-island" />
          <div className="pv-app">
            {screens[state.screen] || screens.home}
          </div>
          <div className="pv-device-home"><div className="pv-device-home-bar" /></div>
        </div>
      </div>
    </>
  );
}