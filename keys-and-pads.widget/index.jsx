import { React } from "uebersicht";
// --- Inlined design system (self-contained; formerly theme.js) ---
// Shared design system for the widget set: color tokens, fonts, layout, the
// common card shell, drag/resize handles, a last-known-good cache, and the
// standard data-resolution helper. Imported by every widget so they stay
// visually and behaviorally consistent.
const T = {
  // Accent tints
  tintBlue: "#296BE0",
  tintPink: "#E86E87",
  tintGreen: "#59A875",
  tintOrange: "#D9946B",
  tintPurple: "#A861DE",

  // Cards
  cardLight: "rgba(255,255,255,0.74)",
  cardDark: "rgba(33,36,43,0.88)",

  // Ink (text on light)
  ink: "#1F2129",
  inkDim: "#616670",
  inkMute: "#8C919C",

  // Text on dark
  onDark: "#F7F7FA",
  onDarkDim: "#BDBFC7",
  onDarkMute: "#8F949E",

  // Walls (desktop stand-in backgrounds)
  wall1: "#F0F2F7",
  wall2: "#DBE3ED",
  wall3: "#BFC7DB",

  // GitHub ramp
  ghEmpty: "rgba(255,255,255,0.10)",
  ghGreen1: "#9CE8A8",
  ghGreen2: "#40C463",
  ghGreen3: "#30A14F",
  ghGreen4: "#216E38",

  // Scene colors
  nightSky: "#14141A",
  cosmicBase: "#0A051A",
  cosmicViolet: "#8C338C",
  cosmicMagenta: "#D9598C",
  cosmicIndigo: "#331A66",
  shaderPurple: "#402673",
  shaderTeal: "#268C8C",
  duskBase: "#4D408C",
  duskAmber: "#D9A666",
  duskPurple: "#8C4DA6",
  duskGlow: "#F28073",
  cardCream: "#F2F0E6",
  paperGrain: "#9E8052",

  archivePalette: [
    "#D98C4D", "#A64D33", "#733326", "#E0B359",
    "#8C6640", "#B88CCC", "#594D80", "#8C73BF",
    "#8CBF8C", "#4D8059", "#598CD9", "#334D8C",
  ],

  // Layout
  radius: "24px",
  captionTracking: "1.5px",
};

// Fonts. Install Instrument Serif, Geist, and Geist Mono for the intended look;
// each stack falls back to a system font if the family is missing.
const serif = "'Instrument Serif', Georgia, serif";
const sans = "'Geist', -apple-system, BlinkMacSystemFont, sans-serif";
const mono = "'Geist Mono', 'SF Mono', ui-monospace, monospace";

// Default desktop placement [x, y] per widget. Each widget calls
// card(variant, w, h, ...LAYOUT.<key>) so widgets lay out at distinct positions
// rather than stacking at the origin. These are overridden by any saved
// position from the drag handle.
const LAYOUT = {
  nowSpinning:  [380, 40],
  musicArchive: [40, 40],
  spatial:      [380, 200],
  mosaic:       [1120, 40],
  stack:        [1120, 486],
  drop:         [1120, 708],
  swap:         [380, 672],
  aiDailyPull:  [40, 368],
  apod:         [40, 576],
  atlas:        [1280, 224],
  tarot:        [1120, 224],
};

// Shared card shell. variant is "dark" or "light"; x/y set the on-desktop
// position. The common loading/empty/stale state styles are appended so every
// widget can render those states without repeating CSS.
const card = (variant, w, h, x = 0, y = 0) => `
  position: absolute;
  left: ${x}px; top: ${y}px;
  width: ${w}px;
  height: ${h}px;
  border-radius: ${T.radius};
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.35);
  background: ${variant === "dark" ? T.cardDark : T.cardLight};
  backdrop-filter: blur(20px);
  color: ${variant === "dark" ? T.onDark : T.ink};
  font-family: ${sans};
  box-sizing: border-box;
  transform-origin: top left;

  /* Promote each card to its own GPU layer so a sibling widget's frequent
     refresh cannot trigger a backdrop-filter recomposite, which otherwise made
     the blur flicker on and off. */
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;

  .ws-stale { position:absolute; top:8px; right:10px; z-index:5;
              font-family:${mono}; font-size:8px; letter-spacing:1px;
              text-transform:uppercase; opacity:0.72;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute}; }
  .ws-empty { position:absolute; inset:0; display:flex; align-items:center;
              justify-content:center; padding:24px; text-align:center;
              font-family:${serif}; font-style:italic; font-size:18px;
              opacity:0.6; color:${variant === "dark" ? T.onDarkDim : T.inkDim}; }
  .ws-skel  { position:absolute; inset:14px; border-radius:14px; opacity:0.18;
              animation: ws-pulse 1.6s ease-in-out infinite; }
  @keyframes ws-pulse { 0%,100% { opacity:0.10; } 50% { opacity:0.24; } }
  @media (prefers-reduced-motion: reduce) {
    .ws-skel { animation:none; opacity:0.16; }
  }

  .ws-drag  { position:absolute; top:6px; left:6px; z-index:30;
              width:18px; height:18px; border-radius:6px;
              display:flex; align-items:center; justify-content:center;
              font-size:11px; line-height:1; cursor:grab; opacity:0.42;
              transition:opacity .15s ease; user-select:none;
              -webkit-user-select:none;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute};
              background:${variant === "dark"
                ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-drag:hover  { opacity:0.95; }
  .ws-drag:active { cursor:grabbing; }

  .ws-resize { position:absolute; bottom:5px; right:5px; z-index:30;
               width:16px; height:16px; border-radius:5px;
               display:flex; align-items:center; justify-content:center;
               font-size:11px; line-height:1; cursor:nwse-resize; opacity:0.42;
               transition:opacity .15s ease; user-select:none;
               -webkit-user-select:none;
               color:${variant === "dark" ? T.onDarkMute : T.inkMute};
               background:${variant === "dark"
                 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-resize:hover { opacity:0.95; }
`;

// Small uppercase monospace caption used for metadata labels.
const caption = (color) => `
  font-family: ${mono};
  text-transform: uppercase;
  letter-spacing: ${T.captionTracking};
  color: ${color};
`;

// State helpers, returned as React elements (this is plain JS, not JSX).
const h = React.createElement;

// Loading: an accent-tinted skeleton block.
const Skel = ({ tint = T.tintBlue }) =>
  h("div", { className: "ws-skel", style: { background: tint } });

// Empty: a single quiet line of text.
const Empty = ({ text }) => h("div", { className: "ws-empty" }, text);

// Stale: a small marker showing the time of the last successful refresh.
const Stale = ({ ts }) =>
  h("div", { className: "ws-stale" }, `stale · ${clockStamp(ts)}`);

// Drag and resize support.
//
// Übersicht renders each widget into its own absolutely-positioned `.widget`
// node, all inside a shared `#uebersicht` container. The wrapper to move is the
// nearest `.widget` ancestor of a handle — not the topmost absolute element,
// which is the shared container.
//
// DragHandle updates the wrapper's left/top. ResizeHandle scales it uniformly
// via a top-left-anchored CSS transform, keeping these fixed-layout cards crisp
// instead of clipping. Both persist to localStorage, so position and size
// survive refreshes and reboots.
const posKey = (k) => `ws:pos:${k}`;
const scaleKey = (k) => `ws:scale:${k}`;
const MIN_SCALE = 0.4, MAX_SCALE = 3;

const findWrapper = (node) => node && node.closest(".widget");

// Apply any saved position and scale. Runs on every mount, since the wrapper
// may have been recreated on refresh.
const applySaved = (wrapper, key) => {
  try {
    const pos = JSON.parse(localStorage.getItem(posKey(key)) || "null");
    if (pos && typeof pos.x === "number") {
      wrapper.style.left = pos.x + "px";
      wrapper.style.top = pos.y + "px";
    }
  } catch (e) { /* storage unavailable */ }
  try {
    const scale = parseFloat(localStorage.getItem(scaleKey(key)));
    if (scale > 0) wrapper.style.transform = `scale(${scale})`;
  } catch (e) { /* storage unavailable */ }
};

const initDrag = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsDragWired) return; // attach listeners once per node
  node.__wsDragWired = true;

  // Keep grip clicks from reaching the card's own onClick handler.
  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    const origX = parseFloat(wrapper.style.left || cs.left) || 0;
    const origY = parseFloat(wrapper.style.top || cs.top) || 0;
    const onMove = (ev) => {
      wrapper.style.left = origX + (ev.clientX - startX) + "px";
      wrapper.style.top = origY + (ev.clientY - startY) + "px";
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      try {
        localStorage.setItem(posKey(key), JSON.stringify({
          x: parseFloat(wrapper.style.left) || 0,
          y: parseFloat(wrapper.style.top) || 0,
        }));
      } catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the grip to snap back to the card's default LAYOUT slot.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(posKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.left = "";
    wrapper.style.top = "";
  });
};

const initResize = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsResizeWired) return;
  node.__wsResizeWired = true;

  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    // Layout width/height are unaffected by transform, so they stay constant.
    const baseW = parseFloat(cs.width) || 1;
    const baseH = parseFloat(cs.height) || 1;
    const m = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
    const origScale = m ? parseFloat(m[1]) || 1 : 1;
    const onMove = (ev) => {
      const delta = (ev.clientX - startX + (ev.clientY - startY)) / (baseW + baseH);
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, origScale + delta));
      wrapper.style.transform = `scale(${next})`;
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      const m2 = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
      try { localStorage.setItem(scaleKey(key), String(m2 ? m2[1] : 1)); }
      catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the corner to restore the card's default size.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(scaleKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.transform = "";
  });
};

// Each handle takes the widget's LAYOUT key so position and scale are stored
// per widget. DragHandle renders top-left, ResizeHandle bottom-right.
const DragHandle = ({ k }) =>
  h("div", { className: "ws-drag", title: "Drag to move · double-click to reset",
             ref: (n) => initDrag(n, k) }, "☰");

const ResizeHandle = ({ k }) =>
  h("div", { className: "ws-resize", title: "Drag to resize · double-click to reset",
             ref: (n) => initResize(n, k) }, "⤡");

// Last-known-good cache, persisted in localStorage with a timestamp.
const remember = (key, data) => {
  try { localStorage.setItem(`ws:${key}`, JSON.stringify({ data, ts: Date.now() })); }
  catch (e) { /* storage unavailable; skip */ }
};

const recall = (key) => {
  try { return JSON.parse(localStorage.getItem(`ws:${key}`)); }
  catch (e) { return null; }
};

const clockStamp = (ms) =>
  new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

// True before the command has produced any output (the initial load tick).
const isLoading = ({ output, error }) =>
  output === undefined && !error;

// Standard data flow for command-backed widgets. parse(output) must return a
// falsy value when there is nothing usable.
//   loading -> { loading: true }            render <Skel/>
//   success -> { data }                     cached as last-known-good
//   failure -> { data, staleTs }            last-known-good + time, render <Stale/>
//   cold    -> { data, mock: true }         mock data, nothing cached yet
const resolve = (key, props, parse, mock) => {
  if (isLoading(props)) return { loading: true };
  let data = null;
  try { data = parse(props.output); } catch (e) { data = null; }
  if (data) { remember(key, data); return { data }; }
  const cached = recall(key);
  if (cached && cached.data) return { data: cached.data, staleTs: cached.ts };
  return { data: mock, mock: true };
};
// --- End inlined design system ---

// keys-and-pads — a playable 16-pad drum machine with a 16-step sequencer and a
// two-octave piano. Every sound is synthesized in the widget with Web Audio:
// no samples, no helper process, nothing leaves the machine.
//
// Play it in Übersicht's interaction mode (menu bar icon → "Interaction", or the
// shortcut you set in Übersicht's preferences). Click pads and keys, or type:
//   pads   1 2 3 4 / Q W E R / A S D F / Z X C V   (rows, top to bottom)
//   keys   A W S E D F T G Y H U J K O L P ; '     (C up to F, over one octave)
//   space  play / stop the sequencer     [ ]  tempo     , .  octave     tab  pads / keys
// Click height on a pad sets velocity: soft at the top, hard at the bottom.

const POS = [40, 40];
const KEY = "keyspads";

// ---------------------------------------------------------------------------
// Sound engine (module singleton; survives React re-renders)
// ---------------------------------------------------------------------------
const Engine = (() => {
  let ac = null, master, comp, drumBus, keyBus, verb, verbGain, noiseBuf, shaper;

  const impulse = (sec, decay) => {
    const len = Math.floor(ac.sampleRate * sec);
    const b = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  };
  const ensure = () => {
    if (ac) { if (ac.state === "suspended") ac.resume(); return ac; }
    const AC = window.AudioContext || window.webkitAudioContext;
    ac = new AC({ latencyHint: "interactive" });
    master = ac.createGain(); master.gain.value = (recall("keyspads") || {}).data && (recall("keyspads") || {}).data.vol != null ? (recall("keyspads") || {}).data.vol : 0.85;
    comp = ac.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 4;
    comp.attack.value = 0.003; comp.release.value = 0.12;
    drumBus = ac.createGain(); drumBus.gain.value = 0.9;
    keyBus = ac.createGain(); keyBus.gain.value = 0.62;
    verb = ac.createConvolver(); verb.buffer = impulse(1.7, 2.4);
    verbGain = ac.createGain(); verbGain.gain.value = 0.14;
    shaper = ac.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = (i / 1023) * 2 - 1; curve[i] = Math.tanh(x * 1.6); }
    shaper.curve = curve; shaper.oversample = "2x";
    drumBus.connect(master); keyBus.connect(master);
    keyBus.connect(verbGain); drumBus.connect(verbGain); verbGain.connect(verb); verb.connect(master);
    master.connect(comp); comp.connect(ac.destination);
    const n = ac.sampleRate * 2;
    noiseBuf = ac.createBuffer(1, n, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return ac;
  };
  const noise = () => { const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s; };
  const osc = (type, f, t) => { const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); return o; };
  const filt = (type, f, q) => { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q != null) b.Q.value = q; return b; };
  const env = (g, t, peak, a, d, floor = 0.0001) => {
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    g.gain.exponentialRampToValueAtTime(floor, t + a + d);
  };
  const chain = (nodes, out) => { for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]); nodes[nodes.length - 1].connect(out); };
  // 808-style metallic partials (ratios from the TR-808 hat circuit).
  const metal = (t, base = 40) => [2, 3, 4.16, 5.43, 6.79, 8.21].map((r) => osc("square", base * r, t));

  // --- Drums. Each voice takes a start time and a velocity 0..1. ---
  const kick = (t, v) => {
    const o = osc("sine", 150, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.05);
    const g = ac.createGain(); env(g, t, 1.05 * v, 0.001, 0.46);
    chain([o, g, shaper], drumBus); o.start(t); o.stop(t + 0.52);
    const n = noise(); const hp = filt("highpass", 2600); const ng = ac.createGain(); env(ng, t, 0.3 * v, 0.001, 0.018);
    chain([n, hp, ng], drumBus); n.start(t); n.stop(t + 0.04);
  };
  const snare = (t, v) => {
    const o = osc("triangle", 210, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.05);
    const g = ac.createGain(); env(g, t, 0.6 * v, 0.001, 0.07);
    chain([o, g], drumBus); o.start(t); o.stop(t + 0.1);
    const n = noise(); const bp = filt("bandpass", 1500, 0.6); const hp = filt("highpass", 600);
    const ng = ac.createGain(); env(ng, t, 0.9 * v, 0.001, 0.19);
    chain([n, hp, bp, ng], drumBus); n.start(t); n.stop(t + 0.25);
  };
  const clap = (t, v) => {
    const n = noise(); const bp = filt("bandpass", 1150, 1.3); const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    for (let k = 0; k < 3; k++) { const s = t + k * 0.011; g.gain.setValueAtTime(0.75 * v, s); g.gain.exponentialRampToValueAtTime(0.06, s + 0.01); }
    g.gain.setValueAtTime(0.8 * v, t + 0.033); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.033 + 0.17);
    chain([n, bp, g], drumBus); n.start(t); n.stop(t + 0.25);
  };
  const hat = (t, v, open) => {
    const bp = filt("bandpass", 10000, 0.9); const hp = filt("highpass", 7000); const g = ac.createGain();
    env(g, t, 0.55 * v, 0.002, open ? 0.34 : 0.05);
    const os = metal(t); os.forEach((o) => { o.connect(bp); o.start(t); o.stop(t + (open ? 0.4 : 0.09)); });
    chain([bp, hp, g], drumBus);
  };
  const rim = (t, v) => {
    const o = osc("sine", 1000, t); const g = ac.createGain(); env(g, t, 0.6 * v, 0.0005, 0.007);
    chain([o, g], drumBus); o.start(t); o.stop(t + 0.03);
    const o2 = osc("square", 480, t); const g2 = ac.createGain(); env(g2, t, 0.25 * v, 0.0005, 0.012);
    const bp2 = filt("bandpass", 1800, 2); chain([o2, bp2, g2], drumBus); o2.start(t); o2.stop(t + 0.03);
    const n = noise(); const bp = filt("bandpass", 3200, 3); const ng = ac.createGain(); env(ng, t, 0.4 * v, 0.0005, 0.02);
    chain([n, bp, ng], drumBus); n.start(t); n.stop(t + 0.04);
  };
  const tom = (f) => (t, v) => {
    const o = osc("sine", f * 1.55, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.09);
    const g = ac.createGain(); env(g, t, 0.85 * v, 0.001, 0.34);
    chain([o, g], drumBus); o.start(t); o.stop(t + 0.4);
    const n = noise(); const bp = filt("bandpass", 900, 1); const ng = ac.createGain(); env(ng, t, 0.14 * v, 0.001, 0.03);
    chain([n, bp, ng], drumBus); n.start(t); n.stop(t + 0.06);
  };
  const cowbell = (t, v) => {
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.38 * v, t + 0.001); g.gain.exponentialRampToValueAtTime(0.13 * v, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    const bp = filt("bandpass", 2640, 1);
    [587, 845].forEach((f) => { const o = osc("square", f, t); o.connect(bp); o.start(t); o.stop(t + 0.32); });
    chain([bp, g], drumBus);
  };
  const shaker = (t, v) => {
    const n = noise(); const bp = filt("bandpass", 7200, 1.4); const hp = filt("highpass", 5200); const g = ac.createGain();
    env(g, t, 0.42 * v, 0.008, 0.075); chain([n, hp, bp, g], drumBus); n.start(t); n.stop(t + 0.12);
  };
  const crash = (t, v) => {
    const n = noise(); const bp = filt("bandpass", 5500, 0.5); const g = ac.createGain();
    env(g, t, 0.5 * v, 0.003, 1.5); chain([n, bp, g], drumBus); n.start(t); n.stop(t + 1.6);
    const bp2 = filt("bandpass", 9000, 0.8); const g2 = ac.createGain(); env(g2, t, 0.22 * v, 0.003, 1.2);
    metal(t, 52).forEach((o) => { o.connect(bp2); o.start(t); o.stop(t + 1.3); }); chain([bp2, g2], drumBus);
  };
  const ride = (t, v) => {
    const bp = filt("bandpass", 6200, 1.8); const g = ac.createGain(); env(g, t, 0.32 * v, 0.002, 0.75);
    metal(t, 47).forEach((o) => { o.connect(bp); o.start(t); o.stop(t + 0.8); }); chain([bp, g], drumBus);
    const o = osc("sine", 1180, t); const g2 = ac.createGain(); env(g2, t, 0.16 * v, 0.001, 0.3);
    chain([o, g2], drumBus); o.start(t); o.stop(t + 0.35);
  };
  const conga = (t, v) => {
    const o = osc("sine", 265, t); o.frequency.exponentialRampToValueAtTime(190, t + 0.03);
    const g = ac.createGain(); env(g, t, 0.8 * v, 0.001, 0.24); chain([o, g], drumBus); o.start(t); o.stop(t + 0.3);
  };
  const bass808 = (t, v) => {
    const o = osc("sine", 118, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.055);
    const g = ac.createGain(); env(g, t, 1.0 * v, 0.002, 0.95);
    chain([o, g, shaper], drumBus); o.start(t); o.stop(t + 1.0);
  };
  const zap = (t, v) => {
    const o = osc("sine", 1400, t); o.frequency.exponentialRampToValueAtTime(170, t + 0.14);
    const g = ac.createGain(); env(g, t, 0.5 * v, 0.001, 0.17); chain([o, g], drumBus); o.start(t); o.stop(t + 0.2);
  };

  // Pad order is the 4x4 grid, top row first. Family sets the LED tint.
  const DRUMS = [
    { id: "crash",  name: "Crash",   fam: "cym",  play: crash },
    { id: "ride",   name: "Ride",    fam: "cym",  play: ride },
    { id: "bell",   name: "Cowbell", fam: "perc", play: cowbell },
    { id: "zap",    name: "Zap",     fam: "perc", play: zap },
    { id: "tomlo",  name: "Tom lo",  fam: "tom",  play: tom(92) },
    { id: "tommid", name: "Tom mid", fam: "tom",  play: tom(132) },
    { id: "tomhi",  name: "Tom hi",  fam: "tom",  play: tom(184) },
    { id: "conga",  name: "Conga",   fam: "tom",  play: conga },
    { id: "hat",    name: "Hat",     fam: "cym",  play: (t, v) => hat(t, v, false) },
    { id: "ohat",   name: "Open hat",fam: "cym",  play: (t, v) => hat(t, v, true) },
    { id: "shaker", name: "Shaker",  fam: "perc", play: shaker },
    { id: "rim",    name: "Rim",     fam: "snr",  play: rim },
    { id: "kick",   name: "Kick",    fam: "kick", play: kick },
    { id: "snare",  name: "Snare",   fam: "snr",  play: snare },
    { id: "clap",   name: "Clap",    fam: "snr",  play: clap },
    { id: "bass",   name: "808",     fam: "kick", play: bass808 },
  ];
  const hit = (i, v = 0.9, when) => { const a = ensure(); DRUMS[i].play(when == null ? a.currentTime + 0.003 : when, Math.min(1, Math.max(0.05, v))); };

  // --- Keys. Three voices: Grand (additive, inharmonic partials), EP (two-operator FM), Bell (FM 3.5:1). ---
  const voices = new Map(); let order = [];
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12) * (1 + 0.00025 * (m - 69)); // slight stretched tuning
  const release = (voice, t) => {
    voice.gains.forEach((g) => { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), t); g.gain.setTargetAtTime(0.0001, t, voice.rel); });
    voice.oscs.forEach((o) => { try { o.stop(t + voice.rel * 6); } catch (e) {} });
  };
  const noteOn = (midi, v = 0.85, preset = "grand") => {
    const a = ensure(); const t = a.currentTime + 0.002; const f = mtof(midi);
    if (voices.has(midi)) { release(voices.get(midi), t); voices.delete(midi); }
    if (order.length >= 12) { const old = order.shift(); if (voices.has(old)) { release(voices.get(old), t); voices.delete(old); } }
    const out = ac.createGain(); out.gain.value = 1; out.connect(keyBus);
    const gains = [], oscs = []; let rel = 0.09;
    if (preset === "grand") {
      const B = 0.00013 * Math.pow(f / 261.6, 1.2) + 0.00004;
      const tau0 = Math.min(6, Math.max(0.5, 3.4 * Math.pow(261.6 / f, 0.55)));
      const N = f > 2000 ? 4 : f > 900 ? 6 : 9;
      for (let n = 1; n <= N; n++) {
        const fn = f * n * Math.sqrt(1 + B * n * n); if (fn > 17000) break;
        const amp = 0.55 * v * Math.pow(n, -1.32) * Math.pow(0.58 + 0.42 * v, n - 1);
        const tau = tau0 / (1 + 0.36 * (n - 1));
        const o = osc("sine", fn, t); const g = ac.createGain();
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(amp, t + 0.004); g.gain.setTargetAtTime(0.0001, t + 0.004, tau / 4.2);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + tau * 2.2 + 1); gains.push(g); oscs.push(o);
        if (n === 1) { // a second, slightly detuned string for warmth
          const o2 = osc("sine", fn * 1.0016, t); const g2 = ac.createGain();
          g2.gain.setValueAtTime(0.0001, t); g2.gain.linearRampToValueAtTime(amp * 0.4, t + 0.006); g2.gain.setTargetAtTime(0.0001, t + 0.006, tau / 4);
          o2.connect(g2); g2.connect(out); o2.start(t); o2.stop(t + tau * 2.2 + 1); gains.push(g2); oscs.push(o2);
        }
      }
      const n = noise(); const bp = filt("bandpass", Math.min(9000, f * 2.6), 1.6); const ng = ac.createGain();
      env(ng, t, 0.09 * v, 0.001, 0.014); chain([n, bp, ng], out); n.start(t); n.stop(t + 0.03);
      rel = 0.08;
    } else if (preset === "ep") {
      const car = osc("sine", f, t); const amp = ac.createGain();
      amp.gain.setValueAtTime(0.0001, t); amp.gain.linearRampToValueAtTime(0.8 * v, t + 0.002); amp.gain.setTargetAtTime(0.0001, t + 0.01, 1.1);
      const m1 = osc("sine", f, t); const i1 = ac.createGain();
      i1.gain.setValueAtTime(f * (0.6 + 1.9 * v), t); i1.gain.setTargetAtTime(f * 0.12, t, 0.5);
      const m2 = osc("sine", f * 14, t); const i2 = ac.createGain();
      i2.gain.setValueAtTime(f * 0.45 * v, t); i2.gain.setTargetAtTime(0, t, 0.045);
      m1.connect(i1); i1.connect(car.frequency); m2.connect(i2); i2.connect(car.frequency);
      const lp = filt("lowpass", 5200 + 4000 * v, 0.6);
      chain([car, amp, lp], out);
      [car, m1, m2].forEach((o) => { o.start(t); o.stop(t + 6); oscs.push(o); }); gains.push(amp);
      rel = 0.12;
    } else { // bell
      const car = osc("sine", f, t); const amp = ac.createGain();
      amp.gain.setValueAtTime(0.0001, t); amp.gain.linearRampToValueAtTime(0.6 * v, t + 0.003); amp.gain.setTargetAtTime(0.0001, t + 0.01, 1.5);
      const m = osc("sine", f * 3.5, t); const idx = ac.createGain();
      idx.gain.setValueAtTime(f * (1.2 + 2.2 * v), t); idx.gain.setTargetAtTime(0, t, 0.9);
      m.connect(idx); idx.connect(car.frequency);
      const car2 = osc("sine", f * 1.004, t); const amp2 = ac.createGain();
      amp2.gain.setValueAtTime(0.0001, t); amp2.gain.linearRampToValueAtTime(0.2 * v, t + 0.003); amp2.gain.setTargetAtTime(0.0001, t + 0.01, 1.2);
      chain([car, amp], out); chain([car2, amp2], out);
      [car, m, car2].forEach((o) => { o.start(t); o.stop(t + 8); oscs.push(o); }); gains.push(amp, amp2);
      rel = 0.25;
    }
    voices.set(midi, { gains, oscs, rel, out }); order.push(midi);
  };
  const noteOff = (midi) => {
    const v = voices.get(midi); if (!v) return; release(v, ac.currentTime); voices.delete(midi); order = order.filter((m) => m !== midi);
  };
  const allOff = () => { Array.from(voices.keys()).forEach(noteOff); };

  // --- Step sequencer: Web Audio clock with a short lookahead. ---
  const seq = { playing: false, bpm: 96, step: 0, next: 0, timer: null, pattern: [], onStep: () => {} };
  const schedule = () => {
    while (seq.next < ac.currentTime + 0.12) {
      const s = seq.step, at = seq.next;
      for (let i = 0; i < DRUMS.length; i++) if (seq.pattern[i] & (1 << s)) DRUMS[i].play(at, s % 4 === 0 ? 0.95 : 0.8);
      const delay = Math.max(0, (at - ac.currentTime) * 1000);
      setTimeout(() => { if (seq.playing) seq.onStep(s); }, delay);
      seq.next += 60 / seq.bpm / 4; seq.step = (s + 1) % 16;
    }
  };
  const play = () => { ensure(); if (seq.playing) return; seq.playing = true; seq.step = 0; seq.next = ac.currentTime + 0.05; seq.timer = setInterval(schedule, 25); };
  const stop = () => { seq.playing = false; clearInterval(seq.timer); seq.timer = null; seq.onStep(-1); };

  const setVolume = (v) => { if (master) master.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), ac.currentTime, 0.02); };
  return { ensure, hit, noteOn, noteOff, allOff, DRUMS, seq, play, stop, setVolume, get ctx() { return ac; } };
})();

const DRUMS = Engine.DRUMS;
const PAD_KEYS = "1234qwerasdfzxcv";
const NOTE_KEYS = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12, o: 13, l: 14, p: 15, ";": 16, "'": 17 };
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BLACK = { 1: 1, 3: 2, 6: 4, 8: 5, 10: 6 };
const DEFAULT_PATTERN = (() => { const p = new Array(16).fill(0); p[12] = (1 << 0) | (1 << 4) | (1 << 8) | (1 << 12) | (1 << 14); p[13] = (1 << 4) | (1 << 12); p[8] = 0x5555; p[10] = (1 << 2) | (1 << 6) | (1 << 10) | (1 << 14); return p; })();
const PRESETS = [["grand", "GRAND"], ["ep", "EP"], ["bell", "BELL"]];
const QUAD = ["#E5452B", "#F08A24", "#F3C63C", "#F2EFE6"]; // TR-808 step-key colours, four per group
const FONTS = "keys-and-pads.widget/fonts";

const W = 520, H = 640;

// The body borrows the language of a small hardware sampler: a light grey slab
// with a charcoal display band, black keys with white legends, printed labels,
// one orange accent, and the 808's four-colour step row underneath.
export const className = card("light", W, H, ...POS) + `
  @font-face { font-family: "Doto"; src: url("${FONTS}/Doto-400-900.woff2") format("woff2"); font-weight: 400 900; }
  @font-face { font-family: "Barlow Condensed"; src: url("${FONTS}/BarlowCondensed-600.woff2") format("woff2"); font-weight: 600; }
  @font-face { font-family: "Barlow Condensed"; src: url("${FONTS}/BarlowCondensed-700.woff2") format("woff2"); font-weight: 700; }
  --body: #E6E4DE; --body2: #D8D5CD; --ink: #1D1D1B; --print: #4A4945; --orange: #F5561E; --key: #2A2A2A; --key2: #3A3A3A;
  --lbl: "Barlow Condensed", "Arial Narrow", sans-serif; --dot: "Doto", "Menlo", monospace;
  background: linear-gradient(180deg, #ECEAE4 0%, var(--body) 30%, var(--body2) 100%);
  backdrop-filter: none; border-radius: 22px; padding: 0; overflow: hidden;
  box-shadow: 0 30px 60px rgba(0,0,0,0.45), 0 2px 0 rgba(255,255,255,0.6) inset, 0 0 0 1px #B9B6AE;
  color: var(--ink); font-family: var(--lbl); user-select: none; -webkit-user-select: none;
  &::before { content:""; position:absolute; inset:0; pointer-events:none; opacity:0.35; mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.16'/%3E%3C/svg%3E"); }
  .ws-drag { color: #777; background: rgba(0,0,0,0.05); top: 10px; left: 10px; }
  .ws-resize { color: #777; background: rgba(0,0,0,0.05); }

  /* display band */
  .lcd { position:relative; margin: 0; height: 96px; background: linear-gradient(180deg, #2B2B2B 0%, #1B1B1B 100%);
         box-shadow: inset 0 -1px 0 rgba(255,255,255,0.06), inset 0 8px 18px rgba(0,0,0,0.45); padding: 16px 22px 12px 22px; display:flex; flex-direction:column; justify-content:space-between; }
  .lcd .brand { position:absolute; top: 10px; left: 22px; font: 700 9px/1 var(--lbl); letter-spacing: 2.4px; color: #8A8A86; text-transform: uppercase; }
  .lcd .brand b { color: var(--orange); font-weight: 700; margin-left: 8px; }
  .lcd .icons { position:absolute; top: 12px; right: 22px; display:flex; gap: 8px; }
  .lcd .icons i { width: 12px; height: 12px; display:block; opacity: 0.22; background: #fff; -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; transition: opacity .15s; }
  .lcd .icons i.on { opacity: 0.95; }
  .lcd .icons i.on.org { background: var(--orange); }
  .lcd .main { display:flex; align-items:flex-end; justify-content:space-between; margin-top: 18px; }
  .lcd .hit { font: 700 30px/1 var(--dot); color: #F3F3F1; letter-spacing: 1px; white-space:nowrap; overflow:hidden; text-overflow: ellipsis; max-width: 300px; text-shadow: 0 0 10px rgba(255,255,255,0.25); }
  .lcd .hit small { font-size: 14px; color: #8D8D89; margin-left: 10px; letter-spacing: 0; }
  .lcd .meta { font: 700 12px/1 var(--dot); color: #A8A8A3; text-align:right; letter-spacing: 1px; }
  .lcd .meta b { color: #F3F3F1; font-weight: 700; }
  .lcd .vu { position:absolute; right: 22px; bottom: 34px; display:flex; gap: 3px; }
  .lcd .vu i { width: 5px; height: 5px; border-radius: 1px; background: rgba(255,255,255,0.10); display:block; }
  .lcd .vu i.on { background: #F3F3F1; box-shadow: 0 0 6px rgba(255,255,255,0.6); }
  .lcd .vu i.on.hot { background: var(--orange); box-shadow: 0 0 6px var(--orange); }

  /* panel */
  .panel { padding: 14px 20px 14px; display:grid; grid-template-columns: 64px 1fr 84px; gap: 14px; }
  .print { font: 600 8px/1 var(--lbl); letter-spacing: 1.4px; text-transform: uppercase; color: var(--print); white-space:nowrap; }
  .col { display:flex; flex-direction:column; align-items:center; gap: 8px; }
  .knob { position:relative; width: 44px; height: 44px; border-radius: 50%; cursor: ns-resize;
          background: radial-gradient(circle at 40% 35%, #FFFFFF 0%, #E9E7E1 55%, #C9C6BE 100%);
          box-shadow: 0 4px 6px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.9) inset, 0 0 0 1px rgba(0,0,0,0.12); }
  .knob.orange { background: radial-gradient(circle at 40% 35%, #FF8A5C 0%, var(--orange) 55%, #C93F12 100%); }
  .knob .ind { position:absolute; inset:0; border-radius:50%; }
  .knob .ind::after { content:""; position:absolute; left: 50%; top: 5px; width: 3px; height: 12px; margin-left: -1.5px; border-radius: 2px; background: var(--ink); }
  .knob.orange .ind::after { background: #fff; }
  .btn { width: 44px; height: 30px; border-radius: 7px; display:flex; align-items:center; justify-content:center; cursor:pointer;
         font: 600 9px/1 var(--lbl); letter-spacing: 1.2px; text-transform: uppercase; color: var(--ink);
         background: linear-gradient(180deg, #F6F5F1 0%, #DEDBD3 100%); box-shadow: 0 2px 0 #B9B6AE, 0 3px 4px rgba(0,0,0,0.18), inset 0 1px 0 #fff; transition: transform .05s, box-shadow .05s; }
  .btn:active, .btn.down { transform: translateY(2px); box-shadow: 0 0 0 #B9B6AE, 0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 #fff; }
  .btn.dark { background: linear-gradient(180deg, #3A3A3A 0%, #222 100%); color: #F3F3F1; box-shadow: 0 2px 0 #0d0d0d, 0 3px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12); }
  .btn.orange { background: linear-gradient(180deg, #FF7A45 0%, var(--orange) 100%); color: #fff; box-shadow: 0 2px 0 #B23B10, 0 3px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.35); }
  .btn.wide { width: 84px; }
  .led { width: 6px; height: 6px; border-radius: 50%; background: #B7B4AC; box-shadow: inset 0 1px 1px rgba(0,0,0,0.25); }
  .led.on { background: var(--orange); box-shadow: 0 0 6px var(--orange), 0 0 1px var(--orange); }
  .with-led { display:flex; align-items:center; gap: 6px; }

  /* pads */
  .pads { display:grid; grid-template-columns: repeat(4, 58px); justify-content: center; gap: 8px 10px; align-content: start; }
  .pcell { display:flex; flex-direction:column; align-items:center; gap: 5px; }
  .pad { position:relative; width: 58px; height: 58px; border-radius: 10px; cursor:pointer; overflow:hidden;
         background: linear-gradient(180deg, var(--key2) 0%, var(--key) 60%, #1E1E1E 100%);
         box-shadow: 0 3px 0 #0E0E0E, 0 5px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14); transition: transform .05s, box-shadow .05s, background .1s; }
  .pad:active, .pad.down { transform: translateY(3px); box-shadow: 0 0 0 #0E0E0E, 0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.14); }
  .pad .k { position:absolute; top: 6px; left: 8px; font: 700 12px/1 var(--lbl); color: #F3F3F1; letter-spacing: 0.5px; }
  .pad .sym { position:absolute; right: 8px; bottom: 6px; font: 600 8px/1 var(--lbl); color: #8C8C88; letter-spacing: 1px; text-transform: uppercase; }
  .pad .glow { position:absolute; inset:0; background: radial-gradient(circle at 50% 60%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 60%); opacity:0; }
  .pad.lit .glow { animation: kp-glow .35s ease-out; }
  @keyframes kp-glow { 0% { opacity: 0.9; } 100% { opacity: 0; } }
  .pcell .print { display:flex; align-items:center; gap: 5px; }
  .pcell .print .led { width: 5px; height: 5px; }

  /* step row */
  .steps { grid-column: 1 / -1; display:grid; grid-template-columns: repeat(16, 1fr); gap: 6px; padding: 6px 2px 0; }
  .step { display:flex; flex-direction:column; align-items:center; gap: 5px; cursor:pointer; }
  .step .sled { width: 5px; height: 5px; border-radius: 50%; background: #B7B4AC; box-shadow: inset 0 1px 1px rgba(0,0,0,0.25); }
  .step.on .sled { background: #E5452B; box-shadow: 0 0 6px #E5452B; }
  .step.now .sled { background: #fff; box-shadow: 0 0 8px #fff; }
  .step .cap { width: 100%; height: 24px; border-radius: 5px; background: var(--q); box-shadow: 0 2px 0 rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.35); transition: transform .05s; }
  .step:active .cap { transform: translateY(2px); box-shadow: 0 0 0 rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.35); }
  .step .n { font: 600 7px/1 var(--lbl); color: var(--print); letter-spacing: 0.5px; }

  /* keys */
  .kb { grid-column: 1 / -1; position:relative; height: 82px; margin-top: 2px; border-radius: 8px; padding: 3px; background: #B9B6AE; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 0 #fff; display:flex; gap: 2px; }
  .white { position:relative; flex:1; border-radius: 0 0 5px 5px; cursor:pointer; background: linear-gradient(180deg, #FBFAF7 0%, #EDEBE5 85%, #D9D6CE 100%); box-shadow: inset 0 -3px 0 rgba(0,0,0,0.08), 0 1px 0 rgba(0,0,0,0.2); transition: background .04s; }
  .white.on { background: linear-gradient(180deg, #FFD9C9 0%, #FFB08C 100%); }
  .white .n { position:absolute; bottom: 6px; left:0; right:0; text-align:center; font: 600 8px/1 var(--lbl); color: #9A978F; letter-spacing: 0.6px; pointer-events:none; }
  .white .n b { display:block; color: var(--ink); font-size: 9px; margin-bottom: 2px; }
  .black { position:absolute; top: 3px; height: 50px; width: 6.4%; margin-left: -3.2%; border-radius: 0 0 4px 4px; cursor:pointer; z-index:2;
           background: linear-gradient(180deg, #3C3C3C 0%, #1E1E1E 100%); box-shadow: 0 3px 3px rgba(0,0,0,0.4), inset 0 -3px 0 rgba(255,255,255,0.06); }
  .black.on { background: linear-gradient(180deg, #FF8A5C 0%, #D8471A 100%); }
  .footer { grid-column: 1 / -1; display:flex; justify-content:space-between; padding-top: 2px; }
`;

const ICONS = {
  play: "M2 1 L11 6.5 L2 12 Z", pads: "M1 1h4v4H1zM7 1h4v4H7zM1 7h4v4H1zM7 7h4v4H7z", keys: "M1 1h2v10H1zM4 1h2v6H4zM7 1h2v10H7zM10 1h2v6h-2z",
  grand: "M2 10 C2 4 10 4 10 10 M2 10h8", ep: "M1 6 L4 2 L7 10 L10 6", bell: "M6 1 L9 8 H3 Z M4 9h4v2H4z",
};
const Icon = ({ id, on, org }) => <i className={`${on ? "on" : ""} ${org ? "org" : ""}`} style={{ WebkitMaskImage: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'><path d='${ICONS[id]}' fill='white' stroke='white' stroke-width='1.4' stroke-linejoin='round' fill-opacity='${id === "ep" || id === "grand" ? 0 : 1}'/></svg>`)}")` }} />;

function KeysPads() {
  const saved = React.useMemo(() => (recall(KEY) || {}).data || {}, []);
  const [mode, setMode] = React.useState(saved.mode || "pads");
  const [preset, setPreset] = React.useState(saved.preset || "grand");
  const [octave, setOctave] = React.useState(saved.octave == null ? 4 : saved.octave);
  const [bpm, setBpm] = React.useState(saved.bpm || 96);
  const [vol, setVol] = React.useState(saved.vol == null ? 0.85 : saved.vol);
  const [pattern, setPattern] = React.useState(Array.isArray(saved.pattern) && saved.pattern.length === 16 ? saved.pattern : DEFAULT_PATTERN);
  const [sel, setSel] = React.useState(12);
  const [playing, setPlaying] = React.useState(false);
  const [step, setStep] = React.useState(-1);
  const [lit, setLit] = React.useState({});
  const [held, setHeld] = React.useState({});
  const [last, setLast] = React.useState({ text: "READY", sub: "" });
  const [vu, setVu] = React.useState(0);
  const ref = React.useRef({ mode, octave, preset, playing, bpm });
  ref.current = { mode, octave, preset, playing, bpm };

  React.useEffect(() => { remember(KEY, { mode, preset, octave, bpm, vol, pattern }); }, [mode, preset, octave, bpm, vol, pattern]);
  React.useEffect(() => { Engine.seq.pattern = pattern; }, [pattern]);
  React.useEffect(() => { Engine.seq.bpm = bpm; }, [bpm]);
  React.useEffect(() => { Engine.setVolume(vol); }, [vol]);
  React.useEffect(() => {
    Engine.seq.onStep = (s) => { setStep(s); if (s >= 0) { const on = DRUMS.map((d, i) => (pattern[i] & (1 << s)) ? i : -1).filter((i) => i >= 0); if (on.length) flash(on, 0.8); } };
  }, [pattern]);

  const flash = (idxs, v) => {
    setLit((l) => { const n = { ...l }; idxs.forEach((i) => { n[i] = (n[i] || 0) + 1; }); return n; });
    setVu(Math.max(1, Math.round(v * 10))); setTimeout(() => setVu((x) => Math.max(0, x - 4)), 90); setTimeout(() => setVu((x) => Math.max(0, x - 4)), 180);
  };
  const hitPad = React.useCallback((i, v) => { Engine.hit(i, v); flash([i], v); setLast({ text: DRUMS[i].name.toUpperCase(), sub: `VEL ${Math.round(v * 127)}` }); }, []);
  const noteOn = React.useCallback((midi, v) => {
    Engine.noteOn(midi, v, ref.current.preset); setHeld((h) => ({ ...h, [midi]: true }));
    setLast({ text: `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`, sub: PRESETS.find((p) => p[0] === ref.current.preset)[1] }); flash([], v);
  }, []);
  const noteOff = React.useCallback((midi) => { Engine.noteOff(midi); setHeld((h) => { const n = { ...h }; delete n[midi]; return n; }); }, []);
  const togglePlay = React.useCallback(() => { if (ref.current.playing) { Engine.stop(); setPlaying(false); } else { Engine.play(); setPlaying(true); } }, []);

  React.useEffect(() => {
    const down = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (e.repeat) { if (k === " " || NOTE_KEYS[k] != null || PAD_KEYS.includes(k)) e.preventDefault(); return; }
      if (k === " ") { e.preventDefault(); togglePlay(); return; }
      if (k === "tab") { e.preventDefault(); setMode((m) => (m === "pads" ? "keys" : "pads")); return; }
      if (k === "[") { setBpm((b) => Math.max(50, b - 2)); return; }
      if (k === "]") { setBpm((b) => Math.min(200, b + 2)); return; }
      if (k === ",") { setOctave((o) => Math.max(1, o - 1)); return; }
      if (k === ".") { setOctave((o) => Math.min(7, o + 1)); return; }
      if (ref.current.mode === "keys" && NOTE_KEYS[k] != null) { e.preventDefault(); noteOn((ref.current.octave + 1) * 12 + NOTE_KEYS[k], 0.85); return; }
      const pi = PAD_KEYS.indexOf(k);
      if (ref.current.mode === "pads" && pi >= 0) { e.preventDefault(); hitPad(pi, 0.9); setSel(pi); }
    };
    const up = (e) => { const k = e.key.toLowerCase(); if (NOTE_KEYS[k] != null) noteOff((ref.current.octave + 1) * 12 + NOTE_KEYS[k]); };
    const blur = () => Engine.allOff();
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, [hitPad, noteOn, noteOff, togglePlay]);

  // Knobs: drag vertically. Volume knob 0..1, tempo knob 50..200.
  const knob = (get, set, min, max, per) => ({
    onPointerDown: (e) => { e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.__y = e.clientY; e.currentTarget.__v = get(); },
    onPointerMove: (e) => { if (e.currentTarget.__y == null) return; const dv = (e.currentTarget.__y - e.clientY) * per; set(Math.max(min, Math.min(max, e.currentTarget.__v + dv))); },
    onPointerUp: (e) => { e.currentTarget.__y = null; }, onPointerCancel: (e) => { e.currentTarget.__y = null; },
  });
  const rot = (v, min, max) => -135 + 270 * ((v - min) / (max - min));

  const drag = React.useRef(null);
  const midiAt = (x, y) => { const el = document.elementFromPoint(x, y); const k = el && el.closest && el.closest("[data-midi]"); return k ? Number(k.getAttribute("data-midi")) : null; };
  const onPianoDown = (e) => { const m = midiAt(e.clientX, e.clientY); if (m == null) return; e.currentTarget.setPointerCapture(e.pointerId); const r = e.currentTarget.getBoundingClientRect(); const v = 0.5 + 0.5 * Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)); drag.current = { m, v }; noteOn(m, v); };
  const onPianoMove = (e) => { if (!drag.current) return; const m = midiAt(e.clientX, e.clientY); if (m != null && m !== drag.current.m) { noteOff(drag.current.m); drag.current.m = m; noteOn(m, drag.current.v); } };
  const onPianoUp = () => { if (drag.current) { noteOff(drag.current.m); drag.current = null; } };

  const toggleStep = (s) => setPattern((p) => { const n = p.slice(); n[sel] = n[sel] ^ (1 << s); return n; });
  const clearPattern = () => setPattern((p) => { const n = p.slice(); n[sel] = 0; return n; });
  const base = (octave + 1) * 12; const whites = [], blacks = [];
  for (let o = 0; o < 2; o++) for (let s = 0; s < 12; s++) {
    const midi = base + o * 12 + s;
    if (BLACK[s] == null) whites.push({ midi, name: NAMES[s], oct: octave + o, key: Object.keys(NOTE_KEYS).find((k) => NOTE_KEYS[k] === o * 12 + s) });
    else blacks.push({ midi, left: ((o * 7 + BLACK[s]) / 14) * 100 });
  }

  return (
    <div>
      <DragHandle k={KEY} />
      <ResizeHandle k={KEY} />
      <div className="lcd">
        <div className="brand">Keys &amp; Pads<b>808 · SYNTH</b></div>
        <div className="icons">
          <Icon id="play" on={playing} org />
          <Icon id="pads" on={mode === "pads"} />
          <Icon id="keys" on={mode === "keys"} />
          <Icon id="grand" on={preset === "grand"} />
          <Icon id="ep" on={preset === "ep"} />
          <Icon id="bell" on={preset === "bell"} />
        </div>
        <div className="main">
          <div className="hit">{last.text}{last.sub ? <small>{last.sub}</small> : null}</div>
          <div className="meta"><b>{bpm}</b> BPM<br />OCT <b>{octave}</b> · VOL <b>{Math.round(vol * 100)}</b></div>
        </div>
        <div className="vu">{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < vu ? (i > 7 ? "on hot" : "on") : ""} />)}</div>
      </div>
      <div className="panel">
        <div className="col">
          <span className="print">Volume</span>
          <div className="knob" {...knob(() => vol, setVol, 0, 1, 0.006)}><div className="ind" style={{ transform: `rotate(${rot(vol, 0, 1)}deg)` }} /></div>
          <span className="print" style={{ marginTop: 6 }}>Tempo</span>
          <div className="knob orange" {...knob(() => bpm, setBpm, 50, 200, 0.6)}><div className="ind" style={{ transform: `rotate(${rot(bpm, 50, 200)}deg)` }} /></div>
          <span className="print" style={{ marginTop: 8 }}>Typing</span>
          <div className="with-led"><span className={`led ${mode === "pads" ? "on" : ""}`} /><div className="btn" onClick={() => setMode("pads")}>Pads</div></div>
          <div className="with-led"><span className={`led ${mode === "keys" ? "on" : ""}`} /><div className="btn" onClick={() => setMode("keys")}>Keys</div></div>
        </div>
        <div className="pads">
          {DRUMS.map((d, i) => (
            <div key={d.id} className="pcell">
              <span className="print"><span className={`led ${sel === i ? "on" : ""}`} />{d.name}</span>
              <div className={`pad ${lit[i] ? "lit" : ""}`} onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); hitPad(i, 0.45 + 0.55 * ((e.clientY - r.top) / r.height)); setSel(i); }}>
                <span className="k">{PAD_KEYS[i].toUpperCase()}</span>
                <span className="sym">{d.fam}</span>
                {lit[i] ? <span key={lit[i]} className="glow" /> : null}
              </div>
            </div>
          ))}
        </div>
        <div className="col">
          <span className="print">Sequencer</span>
          <div className={`btn wide ${playing ? "orange" : "dark"}`} onClick={togglePlay}>{playing ? "Stop" : "Play"}</div>
          <div className="btn wide" onClick={clearPattern}>Clear</div>
          <span className="print" style={{ marginTop: 6 }}>Octave</span>
          <div style={{ display: "flex", gap: 6 }}>
            <div className="btn" style={{ width: 39 }} onClick={() => setOctave((o) => Math.max(1, o - 1))}>−</div>
            <div className="btn" style={{ width: 39 }} onClick={() => setOctave((o) => Math.min(7, o + 1))}>+</div>
          </div>
          <span className="print" style={{ marginTop: 6 }}>Voice</span>
          {PRESETS.map(([id, name]) => <div key={id} className={`btn wide ${preset === id ? "dark" : ""}`} onClick={() => setPreset(id)}>{name}</div>)}
        </div>
        <div className="steps">
          {Array.from({ length: 16 }, (_, s) => (
            <div key={s} className={`step ${pattern[sel] & (1 << s) ? "on" : ""} ${step === s ? "now" : ""}`} style={{ "--q": QUAD[Math.floor(s / 4)] }} onPointerDown={() => toggleStep(s)}>
              <span className="sled" /><span className="cap" /><span className="n">{s + 1}</span>
            </div>
          ))}
        </div>
        <div className="kb" onPointerDown={onPianoDown} onPointerMove={onPianoMove} onPointerUp={onPianoUp} onPointerCancel={onPianoUp}>
          {whites.map((w) => <div key={w.midi} className={`white ${held[w.midi] ? "on" : ""}`} data-midi={w.midi}><span className="n"><b>{w.name}{w.oct}</b>{w.key ? w.key.toUpperCase() : ""}</span></div>)}
          {blacks.map((b) => <div key={b.midi} className={`black ${held[b.midi] ? "on" : ""}`} data-midi={b.midi} style={{ left: `${b.left}%` }} />)}
        </div>
        <div className="footer">
          <span className="print">1234 · QWER · ASDF · ZXCV pads &nbsp; A–K keys</span>
          <span className="print">Space play · [ ] tempo · , . octave · Tab typing target</span>
        </div>
      </div>
    </div>
  );
}

export const render = () => <KeysPads />;
