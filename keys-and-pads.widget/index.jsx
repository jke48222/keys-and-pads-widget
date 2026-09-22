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
              font-size:11px; line-height:1; cursor:grab; opacity:0.22;
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
               font-size:11px; line-height:1; cursor:nwse-resize; opacity:0.22;
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
    master = ac.createGain(); master.gain.value = 0.85;
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

  return { ensure, hit, noteOn, noteOff, allOff, DRUMS, seq, play, stop, get ctx() { return ac; } };
})();

const DRUMS = Engine.DRUMS;
const PAD_KEYS = "1234qwerasdfzxcv";
const NOTE_KEYS = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12, o: 13, l: 14, p: 15, ";": 16, "'": 17 };
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BLACK = { 1: 1, 3: 2, 6: 4, 8: 5, 10: 6 }; // semitone -> white keys below it in the octave
const DEFAULT_PATTERN = (() => { const p = new Array(16).fill(0); p[12] = (1 << 0) | (1 << 4) | (1 << 8) | (1 << 12) | (1 << 14); p[13] = (1 << 4) | (1 << 12); p[8] = 0x5555; p[10] = (1 << 2) | (1 << 6) | (1 << 10) | (1 << 14); return p; })();
const PRESETS = [["grand", "Grand"], ["ep", "EP"], ["bell", "Bell"]];
const FAM_TINT = { kick: T.tintOrange, snr: T.tintPink, cym: T.tintBlue, tom: T.tintGreen, perc: T.tintPurple };

const W = 560, H = 436;

export const refreshFrequency = false;

export const className = card("light", W, H, ...POS) + `
  padding: 16px 18px 12px;
  display: flex; flex-direction: column; gap: 10px;
  user-select: none; -webkit-user-select: none;
  --pad: 56px; --gap: 8px;

  .top { display:flex; align-items:center; justify-content:space-between; height: 22px; }
  .cap { ${caption(T.inkMute)} }
  .mode { display:flex; gap:2px; background: rgba(0,0,0,0.06); border-radius: 8px; padding: 2px; }
  .mode span { font-family:${mono}; font-size:9px; letter-spacing:1.2px; text-transform:uppercase; padding: 3px 9px; border-radius: 6px; color:${T.inkMute}; cursor:pointer; }
  .mode span.on { background:#fff; color:${T.ink}; box-shadow: 0 1px 2px rgba(0,0,0,0.12); }

  .body { display:flex; gap: 14px; }
  .pads { display:grid; grid-template-columns: repeat(4, var(--pad)); grid-auto-rows: var(--pad); gap: var(--gap); }
  .pad { position:relative; border-radius: 13px; cursor:pointer; overflow:hidden;
         background: linear-gradient(180deg, #FFFFFF 0%, #EEF0F5 100%);
         box-shadow: 0 2px 0 rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
         transition: transform .06s ease, box-shadow .06s ease, background .12s ease; }
  .pad:active { transform: translateY(2px); box-shadow: 0 0 0 rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.07), inset 0 2px 4px rgba(0,0,0,0.08); }
  .pad.sel { box-shadow: 0 2px 0 rgba(0,0,0,0.10), 0 0 0 1.5px var(--tint), inset 0 1px 0 rgba(255,255,255,0.9); }
  .pad .led { position:absolute; top:8px; right:8px; width:6px; height:6px; border-radius:50%; background: var(--tint); opacity:0.45; transition: opacity .18s ease, box-shadow .18s ease; }
  .pad.lit .led { opacity:1; box-shadow: 0 0 10px var(--tint), 0 0 2px var(--tint); }
  .pad .name { position:absolute; left:8px; bottom:7px; font-family:${mono}; font-size:8px; letter-spacing:1px; text-transform:uppercase; color:${T.inkDim}; }
  .pad .key { position:absolute; top:6px; left:8px; font-family:${mono}; font-size:9px; color:${T.inkMute}; opacity:0.7; }
  .pad .ripple { position:absolute; left:50%; top:50%; width:10px; height:10px; margin:-5px 0 0 -5px; border-radius:50%;
                 background: var(--tint); opacity:0.5; animation: kp-ripple .42s ease-out forwards; pointer-events:none; }
  @keyframes kp-ripple { from { transform: scale(0.6); opacity:0.55; } to { transform: scale(9); opacity:0; } }

  .side { flex:1; display:flex; flex-direction:column; gap: 10px; min-width: 0; }
  .lcd { flex:1; border-radius: 14px; background: ${T.cardDark}; color:${T.onDark}; padding: 12px 14px 10px;
         display:flex; flex-direction:column; justify-content:space-between; box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(0,0,0,0.25); }
  .lcd .row { display:flex; justify-content:space-between; align-items:baseline; font-family:${mono}; font-size:9px; letter-spacing:1.4px; text-transform:uppercase; color:${T.onDarkMute}; }
  .lcd .hit { font-family:${serif}; font-style:italic; font-size:26px; line-height:1; color:${T.onDark}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .lcd .hit small { font-family:${mono}; font-style:normal; font-size:10px; letter-spacing:1px; color:${T.onDarkDim}; margin-left:8px; }
  .lcd .vu { display:flex; gap:3px; height:8px; align-items:flex-end; }
  .lcd .vu i { flex:1; background: rgba(255,255,255,0.14); border-radius:2px; height:100%; transition: background .1s ease; }
  .lcd .vu i.on { background: ${T.tintGreen}; }
  .lcd .vu i.on.hot { background: ${T.tintOrange}; }

  .steps { display:grid; grid-template-columns: repeat(16, 1fr); gap: 3px; }
  .step { height: 20px; border-radius: 5px; background: rgba(0,0,0,0.07); cursor:pointer; position:relative; transition: background .1s ease; }
  .step:nth-child(4n+1) { background: rgba(0,0,0,0.11); }
  .step.on { background: var(--tint); box-shadow: inset 0 -2px 0 rgba(0,0,0,0.12); }
  .step.now::after { content:""; position:absolute; inset:-2px; border-radius:7px; border: 1.5px solid ${T.ink}; opacity:0.7; }

  .ctl { display:flex; align-items:center; gap: 8px; }
  .btn { height:28px; min-width:28px; padding:0 10px; border-radius: 9px; background:#fff; box-shadow: 0 1px 0 rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06);
         display:flex; align-items:center; justify-content:center; font-family:${mono}; font-size:10px; letter-spacing:0.8px; color:${T.ink}; cursor:pointer; }
  .btn:active { transform: translateY(1px); box-shadow: 0 0 0 1px rgba(0,0,0,0.08); }
  .btn.play { width:34px; padding:0; border-radius:50%; font-size:11px; }
  .btn.play.on { background:${T.ink}; color:#fff; }
  .bpm { font-family:${mono}; font-size:11px; color:${T.ink}; min-width: 62px; text-align:center; }
  .bpm b { font-weight:500; }
  .chips { display:flex; gap:4px; margin-left:auto; }
  .chip { font-family:${mono}; font-size:9px; letter-spacing:1px; text-transform:uppercase; padding:5px 8px; border-radius:7px; color:${T.inkMute}; cursor:pointer; background: rgba(0,0,0,0.05); }
  .chip.on { background:${T.ink}; color:#fff; }

  .piano { position:relative; height: 92px; display:flex; border-radius: 10px; overflow:hidden;
           box-shadow: 0 0 0 1px rgba(0,0,0,0.08), 0 2px 0 rgba(0,0,0,0.08); background:#D9DCE3; }
  .white { position:relative; flex:1; margin-right:1px; border-radius: 0 0 6px 6px; cursor:pointer;
           background: linear-gradient(180deg, #FFFFFF 0%, #F3F4F8 92%, #E3E6EE 100%); box-shadow: inset 0 -3px 0 rgba(0,0,0,0.06); transition: background .05s ease; }
  .white:last-child { margin-right:0; }
  .white.on { background: linear-gradient(180deg, #DCE7FB 0%, #BCD0F6 100%); box-shadow: inset 0 -1px 0 rgba(0,0,0,0.08); }
  .white .n { position:absolute; bottom:5px; left:0; right:0; text-align:center; font-family:${mono}; font-size:8px; color:${T.inkMute}; opacity:0.75; pointer-events:none; }
  .white .n b { display:block; font-weight:500; color:${T.inkDim}; }
  .black { position:absolute; top:0; height: 56px; width: 7%; margin-left: -3.5%; border-radius: 0 0 5px 5px; cursor:pointer; z-index:2;
           background: linear-gradient(180deg, #3A3D46 0%, #23252B 100%); box-shadow: 0 3px 4px rgba(0,0,0,0.35), inset 0 -3px 0 rgba(255,255,255,0.05); }
  .black.on { background: linear-gradient(180deg, ${T.tintBlue} 0%, #1E4FA8 100%); }

  .foot { text-align:center; font-family:${mono}; font-size:8.5px; letter-spacing:0.3px; color:${T.inkMute}; opacity:0.85; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
`;

function KeysPads() {
  const saved = React.useMemo(() => (recall(KEY) || {}).data || {}, []);
  const [mode, setMode] = React.useState(saved.mode || "pads");
  const [preset, setPreset] = React.useState(saved.preset || "grand");
  const [octave, setOctave] = React.useState(saved.octave == null ? 4 : saved.octave);
  const [bpm, setBpm] = React.useState(saved.bpm || 96);
  const [pattern, setPattern] = React.useState(Array.isArray(saved.pattern) && saved.pattern.length === 16 ? saved.pattern : DEFAULT_PATTERN);
  const [sel, setSel] = React.useState(12);
  const [playing, setPlaying] = React.useState(false);
  const [step, setStep] = React.useState(-1);
  const [lit, setLit] = React.useState({});
  const [held, setHeld] = React.useState({});
  const [last, setLast] = React.useState({ text: "Ready", sub: "click or type" });
  const [vu, setVu] = React.useState(0);
  const ref = React.useRef({ mode, octave, preset, playing, bpm });
  ref.current = { mode, octave, preset, playing, bpm };

  React.useEffect(() => { remember(KEY, { mode, preset, octave, bpm, pattern }); }, [mode, preset, octave, bpm, pattern]);
  React.useEffect(() => { Engine.seq.pattern = pattern; }, [pattern]);
  React.useEffect(() => { Engine.seq.bpm = bpm; }, [bpm]);
  React.useEffect(() => {
    Engine.seq.onStep = (s) => {
      setStep(s);
      if (s >= 0) { const on = DRUMS.map((d, i) => (pattern[i] & (1 << s)) ? i : -1).filter((i) => i >= 0); if (on.length) flash(on, 0.8); }
    };
  }, [pattern]);

  const flash = (idxs, v) => {
    setLit((l) => { const n = { ...l }; idxs.forEach((i) => { n[i] = (n[i] || 0) + 1; }); return n; });
    setVu(Math.max(1, Math.round(v * 8)));
    setTimeout(() => setVu((x) => Math.max(0, x - 3)), 90);
    setTimeout(() => setVu((x) => Math.max(0, x - 3)), 180);
  };
  const hitPad = React.useCallback((i, v) => {
    Engine.hit(i, v); flash([i], v);
    setLast({ text: DRUMS[i].name, sub: `vel ${Math.round(v * 127)}` });
  }, []);
  const noteOn = React.useCallback((midi, v) => {
    Engine.noteOn(midi, v, ref.current.preset);
    setHeld((h) => ({ ...h, [midi]: true }));
    setLast({ text: `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`, sub: PRESETS.find((p) => p[0] === ref.current.preset)[1] });
    flash([], v);
  }, []);
  const noteOff = React.useCallback((midi) => { Engine.noteOff(midi); setHeld((h) => { const n = { ...h }; delete n[midi]; return n; }); }, []);

  const togglePlay = React.useCallback(() => {
    if (ref.current.playing) { Engine.stop(); setPlaying(false); } else { Engine.play(); setPlaying(true); }
  }, []);

  // Computer keyboard: works while Übersicht interaction mode is on.
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

  // Piano pointer handling with glissando: one pointer, note follows the key under it.
  const drag = React.useRef(null);
  const midiAt = (x, y) => { const el = document.elementFromPoint(x, y); const k = el && el.closest && el.closest("[data-midi]"); return k ? Number(k.getAttribute("data-midi")) : null; };
  const onPianoDown = (e) => {
    const m = midiAt(e.clientX, e.clientY); if (m == null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = e.currentTarget.getBoundingClientRect(); const v = 0.5 + 0.5 * Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    drag.current = { m, v }; noteOn(m, v);
  };
  const onPianoMove = (e) => {
    if (!drag.current) return; const m = midiAt(e.clientX, e.clientY);
    if (m != null && m !== drag.current.m) { noteOff(drag.current.m); drag.current.m = m; noteOn(m, drag.current.v); }
  };
  const onPianoUp = () => { if (drag.current) { noteOff(drag.current.m); drag.current = null; } };

  const toggleStep = (s) => setPattern((p) => { const n = p.slice(); n[sel] = n[sel] ^ (1 << s); return n; });
  const clearPattern = () => setPattern((p) => { const n = p.slice(); n[sel] = 0; return n; });
  const base = (octave + 1) * 12;
  const whites = [], blacks = [];
  for (let o = 0; o < 2; o++) for (let s = 0; s < 12; s++) {
    const midi = base + o * 12 + s;
    if (BLACK[s] == null) whites.push({ midi, name: NAMES[s], oct: octave + o, key: Object.keys(NOTE_KEYS).find((k) => NOTE_KEYS[k] === o * 12 + s) });
    else blacks.push({ midi, left: ((o * 7 + BLACK[s]) / 14) * 100 });
  }
  const selTint = FAM_TINT[DRUMS[sel].fam];

  return (
    <div>
      <DragHandle k={KEY} />
      <ResizeHandle k={KEY} />
      <div className="top">
        <span className="cap">Keys &amp; Pads · 808 kit · synthesized</span>
        <div className="mode" title="Which instrument the computer keyboard plays (Tab)">
          <span className={mode === "pads" ? "on" : ""} onClick={() => setMode("pads")}>Pads</span>
          <span className={mode === "keys" ? "on" : ""} onClick={() => setMode("keys")}>Keys</span>
        </div>
      </div>
      <div className="body">
        <div className="pads">
          {DRUMS.map((d, i) => (
            <div key={d.id} className={`pad ${sel === i ? "sel" : ""} ${lit[i] ? "lit" : ""}`} style={{ "--tint": FAM_TINT[d.fam] }}
                 onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); hitPad(i, 0.45 + 0.55 * ((e.clientY - r.top) / r.height)); setSel(i); }}>
              <span className="key">{PAD_KEYS[i].toUpperCase()}</span>
              <span className="led" />
              <span className="name">{d.name}</span>
              {lit[i] ? <span key={lit[i]} className="ripple" /> : null}
            </div>
          ))}
        </div>
        <div className="side">
          <div className="lcd">
            <div className="row"><span>{mode === "pads" ? "Typing plays pads" : "Typing plays keys"}</span><span>{bpm} bpm · oct {octave}</span></div>
            <div className="hit">{last.text}<small>{last.sub}</small></div>
            <div className="vu">{Array.from({ length: 12 }, (_, i) => <i key={i} className={i < vu ? (i > 8 ? "on hot" : "on") : ""} />)}</div>
          </div>
          <div className="steps" style={{ "--tint": selTint }} title={`Steps for ${DRUMS[sel].name}`}>
            {Array.from({ length: 16 }, (_, s) => <div key={s} className={`step ${pattern[sel] & (1 << s) ? "on" : ""} ${step === s ? "now" : ""}`} onPointerDown={() => toggleStep(s)} />)}
          </div>
          <div className="ctl">
            <div className={`btn play ${playing ? "on" : ""}`} onClick={togglePlay} title="Play / stop (space)">{playing ? "■" : "▶"}</div>
            <div className="btn" onClick={() => setBpm((b) => Math.max(50, b - 2))}>−</div>
            <div className="bpm"><b>{bpm}</b> bpm</div>
            <div className="btn" onClick={() => setBpm((b) => Math.min(200, b + 2))}>+</div>
            <div className="btn" onClick={clearPattern} title="Clear this pad's steps">clr</div>
          </div>
          <div className="ctl">
            <div className="btn" onClick={() => setOctave((o) => Math.max(1, o - 1))} title="Octave down (,)">‹ oct</div>
            <div className="btn" onClick={() => setOctave((o) => Math.min(7, o + 1))} title="Octave up (.)">oct ›</div>
            <div className="chips">{PRESETS.map(([id, name]) => <span key={id} className={`chip ${preset === id ? "on" : ""}`} onClick={() => setPreset(id)}>{name}</span>)}</div>
          </div>
        </div>
      </div>
      <div className="piano" onPointerDown={onPianoDown} onPointerMove={onPianoMove} onPointerUp={onPianoUp} onPointerCancel={onPianoUp}>
        {whites.map((w) => (
          <div key={w.midi} className={`white ${held[w.midi] ? "on" : ""}`} data-midi={w.midi}>
            <span className="n">{w.key ? w.key.toUpperCase() : ""}<b>{w.name}{w.oct}</b></span>
          </div>
        ))}
        {blacks.map((b) => <div key={b.midi} className={`black ${held[b.midi] ? "on" : ""}`} data-midi={b.midi} style={{ left: `${b.left}%` }} />)}
      </div>
      <div className="foot">pads 1234 · qwer · asdf · zxcv&nbsp;&nbsp;·&nbsp;&nbsp;keys a w s e d f t g y h u j k&nbsp;&nbsp;·&nbsp;&nbsp;space play · [ ] tempo · , . octave · tab switches</div>
    </div>
  );
}

export const render = () => <KeysPads />;
