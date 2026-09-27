/**
 * app.js
 * Roteamento da SPA (troca de telas via JS, sem reload) e ligação entre
 * o estado (gamification.js), a câmera (camera.js) e os dados mockados (data.js).
 */

let state = JoviState.load();

const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll("[data-nav]");
const headerSubtitle = document.querySelector("[data-header-subtitle]");

const SCREEN_SUBTITLES = {
  home: "Câmera Inteligente com IA",
  camera: "Aponte e capture",
  resultado: "Resultado da captura",
  galeria: "Sua coleção de momentos",
  ranking: "Ranking global",
  perfil: "Seu progresso",
  conquistas: "Suas conquistas e badges",
  loja: "Troque pontos por recompensas",
};

/** Aplica o efeito "Nome Dourado" (item da loja) num elemento de nome */
function applyGoldUsername(el) {
  if (!el) return;
  const owned = state.redeemedItems.includes("gold_username");
  el.classList.toggle("bg-gradient-to-r", owned);
  el.classList.toggle("from-amber", owned);
  el.classList.toggle("to-yellow-200", owned);
  el.classList.toggle("bg-clip-text", owned);
  el.classList.toggle("text-transparent", owned);
}

/** Aplica itens cosméticos que afetam o app inteiro (não uma tela específica) */
function applyOwnedCosmetics() {
  document
    .getElementById("app-background")
    .classList.toggle(
      "wallpaper-animated",
      state.redeemedItems.includes("wallpaper_animated"),
    );
}

/** Aplica o tema (claro/escuro) na raiz do documento */
function applyTheme() {
  document.documentElement.classList.toggle("light", state.theme === "light");
}

/** Troca a tela ativa da SPA */
function navigateTo(screenName) {
  applyOwnedCosmetics();
  applyTheme();

  screens.forEach((s) => {
    s.classList.toggle("hidden", s.dataset.screen !== screenName);
  });

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.nav === screenName);
  });

  if (headerSubtitle) {
    headerSubtitle.textContent = SCREEN_SUBTITLES[screenName] || "";
  }

  // Ações específicas de entrada em cada tela.
  // Mantém o stream ativo ao alternar entre "camera" e "resultado" (não pede
  // permissão de novo a cada captura); só encerra ao sair de fato desse fluxo.
  const isCameraFlow = screenName === "camera" || screenName === "resultado";
  if (screenName === "camera" && !JoviCamera.stream) {
    resetCameraUI();
  }
  if (!isCameraFlow && JoviCamera.stream) {
    JoviCamera.stop();
  }

  if (screenName === "home") renderHome();
  if (screenName === "galeria") renderGallery();
  if (screenName === "ranking") renderRanking();
  if (screenName === "perfil") renderProfile();
  if (screenName === "conquistas") renderConquistas();
  if (screenName === "loja") renderStore();

  window.scrollTo(0, 0);
}

document.body.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-nav]");
  if (btn) navigateTo(btn.dataset.nav);
});

/* ============================================================
   TOAST DE CONQUISTA (substitui alert() nativo)
   ============================================================ */
const achievementToastWrapEl = document.getElementById(
  "achievement-toast-wrap",
);
const achievementToastEl = document.getElementById("achievement-toast");
let achievementQueue = [];
let achievementBusy = false;
let achievementTimer = null;

function queueAchievements(badges) {
  achievementQueue.push(...badges);
  if (!achievementBusy) showNextAchievement();
}

function showNextAchievement() {
  const badge = achievementQueue.shift();
  if (!badge) {
    achievementBusy = false;
    return;
  }
  achievementBusy = true;

  document.getElementById("achievement-toast-name").textContent = badge.name;
  document.getElementById("achievement-toast-points").textContent =
    `+${badge.points} pts`;
  achievementToastWrapEl.classList.remove("hidden");

  clearTimeout(achievementTimer);
  achievementTimer = setTimeout(dismissAchievement, 3200);
}

function dismissAchievement() {
  clearTimeout(achievementTimer);
  achievementToastWrapEl.classList.add("hidden");
  setTimeout(showNextAchievement, 250); // pequena pausa antes da próxima, se houver
}

achievementToastEl.addEventListener("click", dismissAchievement);

/* ============================================================
   VISUALIZADOR DE FOTO EM TELA CHEIA (Home e Galeria)
   ============================================================ */
let viewerPhotos = [];
let viewerIndex = 0;
const photoViewerEl = document.getElementById("photo-viewer");
const btnViewerPrev = document.getElementById("btn-viewer-prev");
const btnViewerNext = document.getElementById("btn-viewer-next");

/** Abre o visualizador numa lista de fotos, começando no índice informado */
function openPhotoViewer(photos, index) {
  viewerPhotos = photos;
  viewerIndex = index;
  renderViewerPhoto();
  photoViewerEl.classList.remove("hidden");
}

function renderViewerPhoto() {
  const photo = viewerPhotos[viewerIndex];
  if (!photo) return;
  document.getElementById("viewer-image").src = photo.dataUrl;
  const date = new Date(photo.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  document.getElementById("viewer-label").textContent =
    `${photo.label} · ${date}`;

  const onlyOne = viewerPhotos.length <= 1;
  btnViewerPrev.classList.toggle("hidden", onlyOne);
  btnViewerNext.classList.toggle("hidden", onlyOne);
}

document.getElementById("btn-close-viewer").addEventListener("click", () => {
  photoViewerEl.classList.add("hidden");
});

btnViewerPrev.addEventListener("click", () => {
  viewerIndex = (viewerIndex - 1 + viewerPhotos.length) % viewerPhotos.length;
  renderViewerPhoto();
});

btnViewerNext.addEventListener("click", () => {
  viewerIndex = (viewerIndex + 1) % viewerPhotos.length;
  renderViewerPhoto();
});

document.getElementById("btn-share-viewer").addEventListener("click", () => {
  const photo = viewerPhotos[viewerIndex];
  if (photo) sharePhoto(photo.dataUrl, photo.label);
});

/* ============================================================
   TELA: HOME
   ============================================================ */
function renderHome() {
  // Nível usa o total histórico ganho (não cai quando você gasta na loja)
  const level = JoviState.currentLevel(state.totalEarned);

  document
    .querySelectorAll("[data-points-display]")
    .forEach((el) => (el.textContent = state.points.toLocaleString("pt-BR")));
  document.querySelector('[data-stat="points"]').textContent = state.points;
  document.querySelector('[data-stat="level"]').textContent = level.name;
  document.querySelector('[data-stat="streak"]').textContent =
    JoviState.currentDisplayStreak(state);
  document.querySelector('[data-stat="level-name"]').textContent = level.name;
  document.querySelector('[data-stat="level-points"]').textContent =
    `${state.totalEarned.toLocaleString("pt-BR")} pts totais`;

  const recentWrap = document.querySelector("[data-recent-captures]");
  if (state.photos.length === 0) {
    recentWrap.innerHTML = `
      <p class="text-sm text-ash">Nenhuma captura ainda</p>
      <p class="text-xs text-ash/70 mt-1">Toque em <span class="text-paper">Abrir Câmera</span> para começar</p>
    `;
  } else {
    const recent = state.photos.slice(0, 4);
    recentWrap.className = "grid grid-cols-4 gap-2";
    recentWrap.innerHTML = recent
      .map(
        (p, i) => `
      <button data-recent-photo-index="${i}" class="aspect-square rounded-xl overflow-hidden bg-ink active:scale-95 transition-transform">
        <img src="${p.dataUrl}" class="w-full h-full object-cover" alt="${p.label}">
      </button>
    `,
      )
      .join("");

    recentWrap.querySelectorAll("[data-recent-photo-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openPhotoViewer(state.photos, Number(btn.dataset.recentPhotoIndex));
      });
    });
  }
}

/* ============================================================
   TELA: CÂMERA
   ============================================================ */
const videoEl = document.getElementById("camera-video");
const canvasEl = document.getElementById("camera-canvas");
const placeholderEl = document.getElementById("camera-placeholder");
const controlsEl = document.getElementById("camera-controls");
const analyzingOverlay = document.getElementById("analyzing-overlay");

function resetCameraUI() {
  placeholderEl.classList.remove("hidden");
  videoEl.classList.add("hidden");
  controlsEl.classList.add("hidden");
  controlsEl.classList.remove("flex");
  analyzingOverlay.classList.add("hidden");
  analyzingOverlay.classList.remove("flex");
}

document
  .getElementById("btn-start-camera")
  .addEventListener("click", async () => {
    const ok = await JoviCamera.start(videoEl);
    if (ok) {
      placeholderEl.classList.add("hidden");
      videoEl.classList.remove("hidden");
      controlsEl.classList.remove("hidden");
      controlsEl.classList.add("flex");
    } else {
      placeholderEl.innerHTML = `
      <p class="text-sm text-ash mb-2">Não foi possível acessar a câmera.</p>
      <p class="text-xs text-ash/70">Verifique as permissões do navegador e tente novamente.</p>
    `;
    }
  });

document.getElementById("btn-switch-camera").addEventListener("click", () => {
  JoviCamera.switchFacing(videoEl);
});

document.getElementById("btn-capture").addEventListener("click", async () => {
  analyzingOverlay.classList.remove("hidden");
  analyzingOverlay.classList.add("flex");

  const { ctx, width, height } = JoviCamera.captureFrame(videoEl, canvasEl);
  const scenario = JoviCamera.analyzeScenario(ctx, width, height);
  JoviCamera.lastScenario = scenario;

  document.getElementById("analyzing-label").textContent =
    `JOVI AI identified: ${scenario.label} (${Math.round(scenario.confidence * 100)}% confidence)`;

  // Pequena espera para dar sensação de processamento (UX intencional)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  showResult(scenario);

  // Esconde o overlay de análise ANTES de sair da tela. senão ele fica
  // "ligado" por baixo dos panos e reaparece por cima do vídeo se o usuário
  // descartar o resultado e voltar pra câmera (parecendo travado carregando)
  analyzingOverlay.classList.add("hidden");
  analyzingOverlay.classList.remove("flex");

  navigateTo("resultado");
});

/* ============================================================
   SLIDER ANTES/DEPOIS (arraste para comparar Original x IA)
   ============================================================ */
const compareWrap = document.getElementById("compare-wrap");
const compareHandle = document.getElementById("compare-handle");
const beforeLayer = document.getElementById("before-layer");

function setCompareSliderPosition(percent) {
  const clamped = Math.max(0, Math.min(100, percent));
  compareHandle.style.left = `${clamped}%`;
  beforeLayer.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
}

function percentFromPointer(clientX) {
  const rect = compareWrap.getBoundingClientRect();
  return ((clientX - rect.left) / rect.width) * 100;
}

let isDraggingCompare = false;

compareHandle.addEventListener("pointerdown", (e) => {
  isDraggingCompare = true;
  compareHandle.setPointerCapture(e.pointerId);
});

compareHandle.addEventListener("pointermove", (e) => {
  if (!isDraggingCompare) return;
  setCompareSliderPosition(percentFromPointer(e.clientX));
});

["pointerup", "pointercancel"].forEach((ev) =>
  compareHandle.addEventListener(ev, () => {
    isDraggingCompare = false;
  }),
);

// Também permite tocar/clicar em qualquer ponto da foto pra pular o slider pra lá
compareWrap.addEventListener("pointerdown", (e) => {
  if (e.target === compareHandle || compareHandle.contains(e.target)) return;
  setCompareSliderPosition(percentFromPointer(e.clientX));
});

/* ============================================================
   TELA: RESULTADO
   ============================================================ */
const resultCanvas = document.getElementById("result-canvas");
let frameEnabled = false;
let selectedExtraFilterKey = "none";

// Ajuste fino manual (sliders) soma-se por cima do filtro do cenário e do
// filtro extra, não substitui nenhum dos dois. Valores em 0 = neutro.
const adjustmentState = { brightness: 0, hue: 0, saturation: 0 };

/** true se algum dos três sliders estiver fora do neutro */
function hasManualAdjustments() {
  return (
    adjustmentState.brightness !== 0 ||
    adjustmentState.hue !== 0 ||
    adjustmentState.saturation !== 0
  );
}

/** Ajusta brilho/matiz/saturação via ImageData em vez de ctx.filter.o
 * Safari/iOS ignora ctx.filter silenciosamente quando a origem do
 * drawImage é outro canvas. A matriz de matiz é a mesma do hue-rotate()
 * do CSS (preserva luminância). */
function applyManualAdjustmentsToImageData(imageData) {
  const { brightness, saturation, hue } = adjustmentState;
  const data = imageData.data;
  const brightFactor = 1 + brightness / 100;
  const satFactor = 1 + saturation / 100;
  const hueRad = (hue * Math.PI) / 180;
  const cosH = Math.cos(hueRad),
    sinH = Math.sin(hueRad);
  const m = hue
    ? [
        0.213 + cosH * 0.787 - sinH * 0.213,
        0.715 - cosH * 0.715 - sinH * 0.715,
        0.072 - cosH * 0.072 + sinH * 0.928,
        0.213 - cosH * 0.213 + sinH * 0.143,
        0.715 + cosH * 0.285 + sinH * 0.14,
        0.072 - cosH * 0.072 - sinH * 0.283,
        0.213 - cosH * 0.213 - sinH * 0.787,
        0.715 - cosH * 0.715 + sinH * 0.715,
        0.072 + cosH * 0.928 + sinH * 0.072,
      ]
    : null;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i],
      g = data[i + 1],
      b = data[i + 2];

    if (m) {
      const nr = r * m[0] + g * m[1] + b * m[2];
      const ng = r * m[3] + g * m[4] + b * m[5];
      const nb = r * m[6] + g * m[7] + b * m[8];
      r = nr;
      g = ng;
      b = nb;
    }
    if (saturation) {
      const gray = r * 0.3086 + g * 0.6094 + b * 0.082; // pesos do saturate() do CSS
      r = gray + (r - gray) * satFactor;
      g = gray + (g - gray) * satFactor;
      b = gray + (b - gray) * satFactor;
    }
    if (brightness) {
      r *= brightFactor;
      g *= brightFactor;
      b *= brightFactor;
    }

    data[i] = r < 0 ? 0 : r > 255 ? 255 : r;
    data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
    data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
  }
}

function resetManualAdjustments() {
  adjustmentState.brightness = 0;
  adjustmentState.hue = 0;
  adjustmentState.saturation = 0;

  const brightnessInput = document.getElementById("adj-brightness");
  const hueInput = document.getElementById("adj-hue");
  const saturationInput = document.getElementById("adj-saturation");
  brightnessInput.value = 0;
  hueInput.value = 0;
  saturationInput.value = 0;

  document.getElementById("adj-brightness-value").textContent = "0%";
  document.getElementById("adj-hue-value").textContent = "0°";
  document.getElementById("adj-saturation-value").textContent = "0%";
}

/** Desenha a Moldura Premium (item da loja) por cima da foto já filtrada.
    Cores fixas de propósito: é decoração sobre uma foto, não faz parte do
    chrome da interface, então não segue o tema. e <canvas> não resolve
    var() mesmo se quisesse. */
function drawFrame(ctx, width, height) {
  const margin = width * 0.035;
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#E38CF4");
  grad.addColorStop(1, "#8A0BA3");
  ctx.strokeStyle = grad;
  ctx.lineWidth = Math.max(4, width * 0.015);
  ctx.strokeRect(margin / 2, margin / 2, width - margin, height - margin);

  ctx.font = `${Math.round(width * 0.032)}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("JOVI Moments", width - margin * 1.4, height - margin * 1.4);
}

/** Recompõe o canvas de resultado: base + filtro da IA + filtro extra (se
    escolhido) + moldura (se ativada). chamado sempre que algum desses muda */
function redrawResultCanvas() {
  const scenario = JoviCamera.lastScenario;
  const ctx = resultCanvas.getContext("2d");
  const extra =
    JOVI_EXTRA_FILTERS.find((f) => f.key === selectedExtraFilterKey) ||
    JOVI_EXTRA_FILTERS[0];
  const combinedFilter = [scenario.filter, extra.css].filter(Boolean).join(" ");

  ctx.filter = combinedFilter || "none";
  ctx.drawImage(canvasEl, 0, 0, resultCanvas.width, resultCanvas.height);
  ctx.filter = "none";

  // Camada de cor por cima do resultado. diferente do ajuste de saturação/matiz
  // (que só amplifica cor que já existe na foto), isso pinta uma tonalidade
  // própria de cada cenário por cima da imagem. Funciona mesmo em fotos com
  // pouca cor (documento, ambiente escuro), onde só mexer na saturação não
  // faz diferença visível nenhuma. não tem cor pra amplificar.
  if (scenario.tint) {
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = scenario.tint;
    ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);
    ctx.restore();
  }

  // Ajuste fino manual (sliders de Brilho/Tom/Saturação): reprocessa os
  // pixels da imagem JÁ composta (filtro da IA + tint) diretamente via
  // ImageData. não usa ctx.filter (ver applyManualAdjustmentsToImageData
  // pro motivo). É por cima do tint de propósito: permite atenuar o efeito
  // de cor que estava parecendo artificial.
  if (hasManualAdjustments()) {
    const imageData = ctx.getImageData(
      0,
      0,
      resultCanvas.width,
      resultCanvas.height,
    );
    applyManualAdjustmentsToImageData(imageData);
    ctx.putImageData(imageData, 0, 0);
  }

  if (frameEnabled) drawFrame(ctx, resultCanvas.width, resultCanvas.height);
}

function setFrameToggleUI(enabled) {
  const indicator = document.getElementById("frame-toggle-indicator");
  const dot = indicator.querySelector("span");
  indicator.classList.toggle("bg-violet", enabled);
  indicator.classList.toggle("bg-white/10", !enabled);
  dot.style.transform = enabled ? "translateX(16px)" : "translateX(0)";
}

function renderExtraFiltersRow() {
  const row = document.getElementById("extra-filters-row");
  row.innerHTML = JOVI_EXTRA_FILTERS.map(
    (f) => `
    <button data-extra-filter="${f.key}" class="extra-filter-btn shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
      f.key === selectedExtraFilterKey
        ? "bg-violet text-white"
        : "bg-surface text-ash"
    }">${f.label}</button>
  `,
  ).join("");

  row.querySelectorAll(".extra-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedExtraFilterKey = btn.dataset.extraFilter;
      renderExtraFiltersRow();
      redrawResultCanvas();
    });
  });
}

/* ============================================================
   AJUSTE FINO MANUAL. sliders de Brilho / Tom / Saturação
   ============================================================ */
// A manipulação de pixels em applyManualAdjustmentsToImageData é mais pesada
// que ctx.filter (que nem funcionava). no arraste, o evento "input" dispara
// várias vezes por frame, então agrupa via requestAnimationFrame pra rodar
// no máximo uma vez por frame em vez de uma vez por micro-movimento do dedo.
let adjustRedrawScheduled = false;
function scheduleAdjustRedraw() {
  if (adjustRedrawScheduled) return;
  adjustRedrawScheduled = true;
  requestAnimationFrame(() => {
    adjustRedrawScheduled = false;
    redrawResultCanvas();
  });
}

document.getElementById("adj-brightness").addEventListener("input", (e) => {
  adjustmentState.brightness = Number(e.target.value);
  document.getElementById("adj-brightness-value").textContent =
    `${adjustmentState.brightness > 0 ? "+" : ""}${adjustmentState.brightness}%`;
  scheduleAdjustRedraw();
});

document.getElementById("adj-hue").addEventListener("input", (e) => {
  adjustmentState.hue = Number(e.target.value);
  document.getElementById("adj-hue-value").textContent =
    `${adjustmentState.hue > 0 ? "+" : ""}${adjustmentState.hue}°`;
  scheduleAdjustRedraw();
});

document.getElementById("adj-saturation").addEventListener("input", (e) => {
  adjustmentState.saturation = Number(e.target.value);
  document.getElementById("adj-saturation-value").textContent =
    `${adjustmentState.saturation > 0 ? "+" : ""}${adjustmentState.saturation}%`;
  scheduleAdjustRedraw();
});

document
  .getElementById("btn-reset-adjustments")
  .addEventListener("click", () => {
    resetManualAdjustments();
    redrawResultCanvas();
  });

/* ============================================================
   CORREÇÃO MANUAL — "Não era isso?" (como no protótipo da Sprint 1)
   ============================================================ */
const JOVI_SCENARIO_ICONS = {
  portrait:
    '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  landscape:
    '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  food: '<path d="M7 2v6a2 2 0 0 0 2 2v12M11 2v20M17 2c1.5 0 3 1.5 3 4v4c0 1.5-1 2-2 2h-1v10"/>',
  document:
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/>',
  night: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  action: '<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/>',
};

function renderCorrectionGrid() {
  const grid = document.getElementById("correction-grid");
  const current = JoviCamera.lastScenario;
  grid.innerHTML = JOVI_SCENARIOS.map((s) => {
    const isActive = current && current.key === s.key;
    return `
      <button data-correct-scenario="${s.key}" class="flex flex-col items-center gap-1 py-2.5 rounded-xl transition-colors ${
        isActive ? "bg-violet/20 text-violet" : "bg-surface-alt text-ash"
      }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${JOVI_SCENARIO_ICONS[s.key]}</svg>
        <span class="text-[10px]">${s.label}</span>
      </button>
    `;
  }).join("");

  grid.querySelectorAll("[data-correct-scenario]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const scenario = JOVI_SCENARIOS.find(
        (s) => s.key === btn.dataset.correctScenario,
      );
      applyManualScenario(scenario);
      renderCorrectionGrid();
    });
  });
}

/** Aplica um cenário escolhido manualmente pelo usuário (IA errou o contexto) */
function applyManualScenario(scenario) {
  JoviCamera.lastScenario = { ...scenario, confidence: null, manual: true };
  redrawResultCanvas();

  document.getElementById("result-label").textContent =
    `${scenario.label} · Ajustado manualmente`;

  const adjWrap = document.getElementById("result-adjustments");
  adjWrap.innerHTML = scenario.adjustments
    .map(
      (adj) => `
    <div class="flex items-center justify-between text-sm">
      <span class="text-ash">${adj.name}</span>
      <span class="font-mono text-mint text-xs">${adj.value}</span>
    </div>
  `,
    )
    .join("");
}

document
  .getElementById("btn-toggle-correction")
  .addEventListener("click", () => {
    const wrap = document.getElementById("correction-grid-wrap");
    const chevron = document.getElementById("correction-chevron");
    const willShow = wrap.classList.contains("hidden");
    wrap.classList.toggle("hidden");
    chevron.style.transform = willShow ? "rotate(180deg)" : "rotate(0deg)";
    if (willShow) renderCorrectionGrid();
  });

document.getElementById("btn-toggle-frame").addEventListener("click", () => {
  frameEnabled = !frameEnabled;
  setFrameToggleUI(frameEnabled);
  redrawResultCanvas();
});

function showResult(scenario) {
  resultCanvas.width = canvasEl.width;
  resultCanvas.height = canvasEl.height;

  // Camada "Original": cópia fiel do frame capturado, sem nenhum filtro
  const beforeCanvas = document.getElementById("before-canvas");
  beforeCanvas.width = canvasEl.width;
  beforeCanvas.height = canvasEl.height;
  beforeCanvas.getContext("2d").drawImage(canvasEl, 0, 0);

  // Reseta a posição do slider e as escolhas de personalização a cada nova captura
  setCompareSliderPosition(50);
  frameEnabled = false;
  selectedExtraFilterKey = "none";
  resetManualAdjustments();
  setFrameToggleUI(false);
  document.getElementById("correction-grid-wrap").classList.add("hidden");
  document.getElementById("correction-chevron").style.transform =
    "rotate(0deg)";

  redrawResultCanvas();

  document.getElementById("result-label").textContent =
    `${scenario.label} · IA (${Math.round(scenario.confidence * 100)}%)`;

  const adjWrap = document.getElementById("result-adjustments");
  adjWrap.innerHTML = scenario.adjustments
    .map(
      (adj) => `
    <div class="flex items-center justify-between text-sm">
      <span class="text-ash">${adj.name}</span>
      <span class="font-mono text-mint text-xs">${adj.value}</span>
    </div>
  `,
    )
    .join("");

  // Mostra os controles de personalização só se os itens foram resgatados na Loja
  const frameOwned = state.redeemedItems.includes("frame_premium");
  const filtersOwned = state.redeemedItems.includes("filter_pack");

  const frameBtn = document.getElementById("btn-toggle-frame");
  frameBtn.classList.toggle("hidden", !frameOwned);
  frameBtn.classList.toggle("flex", frameOwned);

  const filtersWrap = document.getElementById("extra-filters-wrap");
  filtersWrap.classList.toggle("hidden", !filtersOwned);
  if (filtersOwned) renderExtraFiltersRow();
}

document.getElementById("btn-discard").addEventListener("click", () => {
  navigateTo("camera");
});

document.getElementById("btn-save").addEventListener("click", () => {
  const scenario = JoviCamera.lastScenario;
  const dataUrl = resultCanvas.toDataURL("image/jpeg", 0.85);
  const secondPointLabel = scenario.manual
    ? `Ajuste aplicado em ${scenario.label} Mode`
    : `IA aplicada em ${scenario.label} Mode`;

  state = JoviState.registerDailyActivity(state);
  state = JoviState.addPhoto(state, {
    dataUrl,
    scenario: scenario.key,
    label: scenario.label,
  });
  state = JoviState.addPoints(state, 5, `Captura em ${scenario.label} Mode`);
  state = JoviState.addPoints(state, 10, secondPointLabel);

  const { state: newState, newlyUnlocked } = JoviState.checkBadges(state);
  state = newState;
  JoviState.save(state);

  navigateTo("home");

  if (newlyUnlocked.length > 0) {
    queueAchievements(newlyUnlocked);
  }
});

/* ============================================================
   COMPARTILHAMENTO (Web Share API, com fallback de download)
   ============================================================ */
const toastWrapEl = document.getElementById("jovi-toast-wrap");
const toastEl = document.getElementById("jovi-toast");
let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastWrapEl.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastWrapEl.classList.add("hidden"), 2600);
}

/** Converte uma dataURL em File para uso com navigator.share */
async function dataUrlToFile(dataUrl, filename) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

async function sharePhoto(dataUrl, label) {
  const filename = `jovi-moments-${label.toLowerCase()}-${Date.now()}.jpg`;

  try {
    const file = await dataUrlToFile(dataUrl, filename);
    const shareData = {
      files: [file],
      title: "JOVI Moments",
      text: `Capturado com JOVI Moments — modo ${label} 📸`,
    };

    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      registerShare();
      return;
    }
  } catch (err) {
    // Usuário cancelou o compartilhamento nativo. não trata como erro
    if (err && err.name === "AbortError") return;
    console.warn("JOVI: Web Share API indisponível, usando fallback.", err);
  }

  // Fallback: navegador sem suporte a compartilhar arquivos (ex.: desktop)
  downloadImage(dataUrl, filename);
  showToast("Compartilhamento não suportado aqui — imagem baixada");
}

function downloadImage(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function registerShare() {
  state.shareCount += 1;
  state = JoviState.addPoints(state, 5, "Compartilhamento de foto");
  JoviState.save(state);
  showToast("Compartilhado! +5 pts 🎉");
}

document.getElementById("btn-share-result").addEventListener("click", () => {
  const scenario = JoviCamera.lastScenario;
  const dataUrl = resultCanvas.toDataURL("image/jpeg", 0.85);
  sharePhoto(dataUrl, scenario ? scenario.label : "Momento");
});

/* ============================================================
   TELA: GALERIA
   ============================================================ */
document
  .getElementById("gallery-search")
  .addEventListener("input", renderGallery);

function renderGallery() {
  const filtersWrap = document.getElementById("gallery-filters");
  const gridWrap = document.getElementById("gallery-grid");
  const emptyWrap = document.getElementById("gallery-empty");
  const searchInput = document.getElementById("gallery-search");

  const categories = ["Todos", ...new Set(state.photos.map((p) => p.label))];
  const activeCategory = filtersWrap.dataset.active || "Todos";
  const searchTerm = searchInput.value.trim().toLowerCase();

  filtersWrap.innerHTML = categories
    .map(
      (cat) => `
    <button data-category="${cat}" class="category-btn shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
      cat === activeCategory ? "bg-violet text-white" : "bg-surface text-ash"
    }">${cat}</button>
  `,
    )
    .join("");

  filtersWrap.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      filtersWrap.dataset.active = btn.dataset.category;
      renderGallery();
    });
  });

  let filtered =
    activeCategory === "Todos"
      ? state.photos
      : state.photos.filter((p) => p.label === activeCategory);

  if (searchTerm) {
    filtered = filtered.filter((p) =>
      p.label.toLowerCase().includes(searchTerm),
    );
  }

  if (filtered.length === 0) {
    gridWrap.classList.add("hidden");
    emptyWrap.classList.remove("hidden");
  } else {
    gridWrap.classList.remove("hidden");
    emptyWrap.classList.add("hidden");
    gridWrap.innerHTML = filtered
      .map(
        (p, i) => `
      <div class="aspect-square rounded-2xl overflow-hidden bg-surface relative">
        <button data-photo-index="${i}" class="absolute inset-0 w-full h-full">
          <img src="${p.dataUrl}" class="w-full h-full object-cover" alt="${p.label}">
        </button>
        <span class="absolute bottom-2 left-2 text-[10px] font-mono bg-ink/70 backdrop-blur px-2 py-0.5 rounded-full pointer-events-none">${p.label}</span>
        <button data-delete-photo="${p.id}" class="absolute top-2 left-2 w-7 h-7 rounded-full bg-ink/70 backdrop-blur flex items-center justify-center active:scale-90 transition-transform">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
        </button>
        <button data-share-photo="${p.id}" class="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink/70 backdrop-blur flex items-center justify-center active:scale-90 transition-transform">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
        </button>
      </div>
    `,
      )
      .join("");

    gridWrap.querySelectorAll("[data-photo-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openPhotoViewer(filtered, Number(btn.dataset.photoIndex));
      });
    });

    gridWrap.querySelectorAll("[data-share-photo]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const photo = state.photos.find((p) => p.id === btn.dataset.sharePhoto);
        if (photo) sharePhoto(photo.dataUrl, photo.label);
      });
    });

    gridWrap.querySelectorAll("[data-delete-photo]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        // Confirmação nativa de propósito: é uma exclusão permanente (a foto
        // só existe no dataUrl salvo em localStorage, não tem "lixeira" pra
        // desfazer) — um diálogo do próprio navegador deixa isso claro sem
        // precisar construir um modal de confirmação só pra isso.
        if (
          !confirm(
            "Apagar esta foto da galeria? Essa ação não pode ser desfeita.",
          )
        )
          return;
        state = JoviState.removePhoto(state, btn.dataset.deletePhoto);
        JoviState.save(state);
        renderGallery();
      });
    });
  }
}

/* ============================================================
   TELA: RANKING
   ============================================================ */
function renderRanking() {
  // Ranking usa o total histórico ganho. comprar na loja não deveria te
  // fazer cair de posição, já que o ranking mede conquista, não saldo em caixa
  const userEntry = {
    id: "user",
    isUser: true,
    name: state.displayName,
    tag: JoviState.currentLevel(state.totalEarned).name,
    points: state.totalEarned,
    flag: "BR",
  };
  const full = [...JOVI_RANKING_MOCK, userEntry].sort(
    (a, b) => b.points - a.points,
  );
  const userPosition = full.findIndex((e) => e.isUser) + 1;

  const podiumWrap = document.getElementById("ranking-podium");
  const top3 = full.slice(0, 3);
  const order = [1, 0, 2]; // 2º, 1º, 3º visualmente
  podiumWrap.innerHTML = order
    .map((i) => {
      const entry = top3[i];
      if (!entry) return "";
      const size = i === 0 ? "w-16 h-16 text-base" : "w-12 h-12 text-sm";
      const rank = i + 1;
      return `
      <button data-rank-id="${entry.id}" class="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
        <div class="${size} rounded-full bg-gradient-to-br from-violet to-indigo flex items-center justify-center font-display font-semibold text-white">${rank}</div>
        <p class="text-xs font-medium truncate max-w-[70px] text-center">${entry.name}</p>
        <p class="text-[10px] font-mono text-ash">${entry.points.toLocaleString("pt-BR")}</p>
      </button>
    `;
    })
    .join("");

  const listWrap = document.getElementById("ranking-list");
  listWrap.innerHTML = full
    .map(
      (entry, idx) => `
    <button data-rank-id="${entry.id}" class="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left active:scale-[0.98] transition-transform ${entry.isUser ? "bg-violet/15 border border-violet/30" : "bg-surface"}">
      <span class="w-5 text-xs font-mono text-ash">${idx + 1}</span>
      <span class="text-xs font-mono w-6">${entry.flag}</span>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">${entry.name}</p>
        <p class="text-[10px] text-ash">${JoviState.currentLevel(entry.points).name}</p>
      </div>
      <p class="font-mono text-sm">${entry.points.toLocaleString("pt-BR")}</p>
    </button>
  `,
    )
    .join("");

  document.querySelectorAll("[data-rank-id]").forEach((btn) => {
    btn.addEventListener("click", () => openRankingProfile(btn.dataset.rankId));
  });

  const ownUserNameEl = listWrap.querySelector(
    '[data-rank-id="user"] p.text-sm',
  );
  if (ownUserNameEl) applyGoldUsername(ownUserNameEl);
}

/** Abre o cartão de perfil de uma posição do ranking (mockado, exceto a sua) */
function openRankingProfile(id) {
  let entry;

  if (id === "user") {
    const memberSince = state.createdAt
      ? new Date(state.createdAt).toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        })
      : "—";
    entry = {
      avatar: state.avatar,
      name: state.displayName,
      tag: JoviState.currentLevel(state.totalEarned).name,
      points: state.totalEarned,
      badges: state.unlockedBadges.length,
      since: memberSince,
      bio: "Seu perfil no JOVI Moments.",
    };
  } else {
    entry = JOVI_RANKING_MOCK.find((e) => e.id === id);
  }
  if (!entry) return;

  document.getElementById("rp-avatar").textContent =
    entry.avatar || entry.name.charAt(0);
  document.getElementById("rp-name").textContent = entry.name;
  // O efeito de nome dourado é só seu, então só aplica quando o cartão é o seu próprio
  if (id === "user") {
    applyGoldUsername(document.getElementById("rp-name"));
  } else {
    document
      .getElementById("rp-name")
      .classList.remove(
        "bg-gradient-to-r",
        "from-amber",
        "to-yellow-200",
        "bg-clip-text",
        "text-transparent",
      );
  }
  document.getElementById("rp-tag").textContent = JoviState.currentLevel(
    entry.points,
  ).name;
  document.getElementById("rp-bio").textContent = entry.bio || "";
  document.getElementById("rp-points").textContent =
    entry.points.toLocaleString("pt-BR");
  document.getElementById("rp-badges").textContent = entry.badges ?? 0;
  document.getElementById("rp-since").textContent = entry.since || "—";
  document.getElementById("ranking-profile-panel").classList.remove("hidden");
}

document
  .getElementById("btn-close-ranking-profile")
  .addEventListener("click", () => {
    document.getElementById("ranking-profile-panel").classList.add("hidden");
  });

/* ============================================================
   TELA: PERFIL
   ============================================================ */
function renderProfile() {
  // Nível usa o total histórico ganho (não cai quando você gasta na loja)
  const level = JoviState.currentLevel(state.totalEarned);
  document.querySelector('[data-profile="display-name"]').textContent =
    state.displayName;
  applyGoldUsername(document.querySelector('[data-profile="display-name"]'));
  document.querySelector('[data-profile="level-name"]').textContent =
    level.name;
  document.querySelector('[data-profile="points-total"]').textContent =
    `${state.totalEarned.toLocaleString("pt-BR")} pts totais`;
  document.querySelector('[data-profile="photo-count"]').textContent =
    state.photos.length;
  document.querySelector('[data-profile="share-count"]').textContent =
    state.shareCount;
  document.querySelector('[data-profile="streak-count"]').textContent =
    JoviState.currentDisplayStreak(state);
  document.getElementById("profile-avatar").textContent = state.avatar;

  // Itens cosméticos resgatados na Loja
  document
    .getElementById("badge-crown-icon")
    .classList.toggle(
      "hidden",
      !state.redeemedItems.includes("badge_exclusive"),
    );
  const avatarCharm = document.getElementById("avatar-charm");
  avatarCharm.classList.toggle(
    "hidden",
    !state.redeemedItems.includes("phone_charm"),
  );
  avatarCharm.classList.toggle(
    "flex",
    state.redeemedItems.includes("phone_charm"),
  );

  // Ranking resumido (também por total histórico, mesma lógica da tela de Ranking)
  const userEntry = {
    name: state.displayName,
    points: state.totalEarned,
    isUser: true,
  };
  const full = [...JOVI_RANKING_MOCK, userEntry].sort(
    (a, b) => b.points - a.points,
  );
  const position = full.findIndex((e) => e.isUser) + 1;
  document.querySelector('[data-profile="global-rank"]').textContent =
    `#${position}`;
  document.querySelector('[data-profile="rank-context"]').textContent =
    state.totalEarned > 0
      ? `#${position} de ${full.length} · ${state.totalEarned.toLocaleString("pt-BR")} pts`
      : "Capture fotos para entrar no ranking";

  // Categoria favorita
  const favorite = JoviState.favoriteCategory(state);
  document.querySelector('[data-profile="favorite-category"]').textContent =
    favorite
      ? `${favorite.label} - ${favorite.count} ${favorite.count === 1 ? "foto" : "fotos"}`
      : "Nenhum - seu contexto mais usado pela IA";

  // Grade de categorias (contagem por cenário já suportado pela IA)
  const categoriesWrap = document.getElementById("profile-categories");
  categoriesWrap.innerHTML = JOVI_SCENARIOS.map((scenario) => {
    const count = state.photos.filter(
      (p) => p.scenario === scenario.key,
    ).length;
    return `
      <div class="bg-surface rounded-xl p-2.5 text-center">
        <p class="font-mono text-sm font-semibold ${count > 0 ? "text-paper" : "text-ash/50"}">${count}</p>
        <p class="text-[10px] text-ash">${scenario.label}</p>
      </div>
    `;
  }).join("");

  // Contador de conquistas no botão de navegação
  document.querySelector('[data-profile="badges-fraction"]').textContent =
    `${state.unlockedBadges.length}/${JOVI_BADGES.length}`;
}

document
  .getElementById("btn-share-ranking")
  .addEventListener("click", async () => {
    const level = JoviState.currentLevel(state.totalEarned);
    const userEntry = {
      name: state.displayName,
      points: state.totalEarned,
      isUser: true,
    };
    const full = [...JOVI_RANKING_MOCK, userEntry].sort(
      (a, b) => b.points - a.points,
    );
    const position = full.findIndex((e) => e.isUser) + 1;

    const text = `Estou em #${position} no ranking global do JOVI Moments com ${state.totalEarned.toLocaleString("pt-BR")} pts como ${level.name}! 📸🏆`;
    const shareData = {
      title: "JOVI Moments",
      text,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch (err) {
      if (err && err.name === "AbortError") return;
      console.warn(
        "JOVI: Web Share API indisponível para texto, usando fallback.",
        err,
      );
    }

    // Fallback: copia para a área de transferência
    try {
      await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      showToast("Copiado! Cole onde quiser compartilhar");
    } catch {
      showToast("Não foi possível compartilhar automaticamente");
    }
  });

/* ============================================================
   TELA: CONQUISTAS
   ============================================================ */
function renderConquistas() {
  document.querySelector('[data-conquistas="fraction"]').textContent =
    `${state.unlockedBadges.length}/${JOVI_BADGES.length}`;
  document.querySelector('[data-conquistas="balance"]').textContent =
    `${state.points.toLocaleString("pt-BR")} pts`;
  document.querySelector('[data-conquistas="total-earned"]').textContent =
    `${state.totalEarned.toLocaleString("pt-BR")} pts`;

  const historyWrap = document.getElementById("points-history");
  if (state.pointHistory.length === 0) {
    historyWrap.innerHTML = `<div class="bg-surface rounded-2xl p-4 text-center text-sm text-ash">Nenhum ponto registrado ainda</div>`;
  } else {
    historyWrap.innerHTML = state.pointHistory
      .slice(0, 8)
      .map((entry) => {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        });
        const positive = entry.points >= 0;
        return `
        <div class="flex items-center justify-between bg-surface rounded-xl px-3.5 py-2.5">
          <div>
            <p class="text-sm">${entry.label}</p>
            <p class="text-[10px] text-ash">${dateStr}</p>
          </div>
          <span class="font-mono text-sm ${positive ? "text-mint" : "text-red-400"}">${positive ? "+" : ""}${entry.points}</span>
        </div>
      `;
      })
      .join("");
  }

  const badgesWrap = document.getElementById("all-badges");
  badgesWrap.innerHTML = JOVI_BADGES.map((badge) => {
    const unlocked = state.unlockedBadges.includes(badge.id);
    return `
      <div class="flex items-center gap-3 bg-surface rounded-xl p-3.5 ${unlocked ? "" : "opacity-50"}">
        <div class="w-10 h-10 rounded-xl ${unlocked ? "bg-gradient-to-br from-violet to-indigo" : "bg-white/5"} flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${unlocked ? "white" : "#9A98AC"}" stroke-width="2"><path d="M12 2 9 9l-7 1 5 5-1.5 7L12 18l6.5 4L17 15l5-5-7-1Z"/></svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium flex items-center gap-1.5">
            ${badge.name}
            ${unlocked ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-mint)" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>' : ""}
          </p>
          <p class="text-[11px] text-ash">${badge.desc}</p>
        </div>
        <span class="font-mono text-xs text-mint shrink-0">+${badge.points} pts</span>
      </div>
    `;
  }).join("");
}

/* ============================================================
   PAINEL DE CONFIGURAÇÕES
   ============================================================ */
const AVATAR_OPTIONS = [
  "V",
  "📸",
  "🌙",
  "🏔️",
  "🍜",
  "⭐",
  "🎬",
  "🌊",
  "🐾",
  "🔥",
  "🌸",
  "🚀",
  "🎨",
  "⚡",
];
const settingsPanel = document.getElementById("settings-panel");
const inputDisplayName = document.getElementById("input-display-name");
const avatarPicker = document.getElementById("avatar-picker");
let pendingAvatar = null;

function updateThemeToggleUI() {
  const isLight = state.theme === "light";
  const indicator = document.getElementById("theme-toggle-indicator");
  const dot = indicator.querySelector("span");
  document.getElementById("theme-toggle-label").textContent = isLight
    ? "Lilás Boreal"
    : "Azul Safira";
  dot.style.transform = isLight ? "translateX(0)" : "translateX(16px)";
  // Sol pro modo Lilás Boreal (claro), lua pro Azul Safira (escuro) 
  document
    .getElementById("theme-icon-path")
    .setAttribute(
      "d",
      isLight
        ? "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
        : "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
    );
}

function openSettings() {
  inputDisplayName.value = state.displayName;
  pendingAvatar = state.avatar;
  avatarPicker.innerHTML = AVATAR_OPTIONS.map(
    (av) => `
    <button data-avatar="${av}" class="w-10 h-10 rounded-full flex items-center justify-center text-base border-2 transition-colors ${
      av === pendingAvatar
        ? "border-violet bg-violet/15"
        : "border-transparent bg-surface-alt"
    }">${av}</button>
  `,
  ).join("");
  avatarPicker.querySelectorAll("[data-avatar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      pendingAvatar = btn.dataset.avatar;
      avatarPicker
        .querySelectorAll("[data-avatar]")
        .forEach((b) =>
          b.classList.toggle(
            "border-violet",
            b.dataset.avatar === pendingAvatar,
          ),
        );
      avatarPicker
        .querySelectorAll("[data-avatar]")
        .forEach((b) =>
          b.classList.toggle(
            "bg-violet/15",
            b.dataset.avatar === pendingAvatar,
          ),
        );
    });
  });
  updateThemeToggleUI();
  settingsPanel.classList.remove("hidden");
}

document
  .getElementById("btn-open-settings")
  .addEventListener("click", openSettings);
document
  .getElementById("btn-close-settings")
  .addEventListener("click", () => settingsPanel.classList.add("hidden"));

document.getElementById("btn-toggle-theme").addEventListener("click", () => {
  state.theme = state.theme === "light" ? "dark" : "light";
  JoviState.save(state);
  applyTheme();
  updateThemeToggleUI();
});

document.getElementById("btn-save-settings").addEventListener("click", () => {
  state.displayName = inputDisplayName.value.trim() || "Você";
  state.avatar = pendingAvatar || state.avatar;
  JoviState.save(state);
  settingsPanel.classList.add("hidden");
  renderProfile();
});

document.getElementById("btn-reset-progress").addEventListener("click", () => {
  if (
    confirm("Isso vai apagar todos os pontos, fotos e conquistas. Confirmar?")
  ) {
    state = JoviState.reset();
    settingsPanel.classList.add("hidden");
    navigateTo("home");
  }
});

/* ============================================================
   TELA: LOJA
   ============================================================ */
function renderStore() {
  document.querySelector('[data-store="balance"]').textContent =
    `${state.points.toLocaleString("pt-BR")} pts`;

  const filtersWrap = document.getElementById("store-filters");
  const categories = ["Todos", "Simples", "Interm.", "Premium"];
  const activeCategory = filtersWrap.dataset.active || "Todos";

  filtersWrap.innerHTML = categories
    .map(
      (cat) => `
    <button data-store-category="${cat}" class="store-category-btn shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
      cat === activeCategory ? "bg-violet text-white" : "bg-surface text-ash"
    }">${cat}</button>
  `,
    )
    .join("");

  filtersWrap.querySelectorAll(".store-category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      filtersWrap.dataset.active = btn.dataset.storeCategory;
      renderStore();
    });
  });

  const filteredItems =
    activeCategory === "Todos"
      ? JOVI_STORE_ITEMS
      : JOVI_STORE_ITEMS.filter((item) => item.category === activeCategory);

  const wrap = document.getElementById("store-items");
  wrap.innerHTML = filteredItems
    .map((item) => {
      const redeemed = state.redeemedItems.includes(item.id);
      const canAfford = state.points >= item.price;
      const icon = JOVI_STORE_ICONS[item.icon] || JOVI_STORE_ICONS.crown;
      return `
      <div class="bg-surface rounded-2xl p-3.5 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl ${icon.bg} flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${icon.stroke}" stroke-width="2"><path d="${icon.path}"/></svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">${item.name}</p>
          <p class="text-[11px] text-ash line-clamp-2">${item.desc}</p>
          <p class="font-mono text-xs text-mint mt-0.5">${item.price.toLocaleString("pt-BR")} pts · ${item.category}</p>
        </div>
        <button
          data-redeem="${item.id}"
          ${redeemed || !canAfford ? "disabled" : ""}
          class="shrink-0 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
            redeemed
              ? "bg-mint/15 text-mint"
              : canAfford
                ? "bg-gradient-to-r from-violet to-indigo text-white"
                : "bg-white/5 text-ash/50 cursor-not-allowed"
          }"
        >${redeemed ? "Resgatado" : canAfford ? "Resgatar" : "Falta pts"}</button>
      </div>
    `;
    })
    .join("");

  wrap.querySelectorAll("[data-redeem]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = JOVI_STORE_ITEMS.find((i) => i.id === btn.dataset.redeem);
      const { state: newState, ok } = JoviState.redeemItem(state, item);
      if (ok) {
        state = newState;
        JoviState.save(state);
        renderStore();
        applyOwnedCosmetics();
      }
    });
  });
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
navigateTo("home");
