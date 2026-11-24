(function () {
  "use strict";

  const mvDespues = document.getElementById("mv-despues");
  const mvAntes = document.getElementById("mv-antes");
  const loadingRibbon = document.getElementById("loading-ribbon");
  const loadingBar = document.getElementById("loading-bar");

  const infoSheet = document.getElementById("info-sheet");
  const infoKicker = document.getElementById("info-kicker");
  const infoTitle = document.getElementById("info-title");
  const infoDesc = document.getElementById("info-desc");
  const infoMetrics = document.getElementById("info-metrics");

  const panelCompare = document.getElementById("panel-compare");
  const compareRange = document.getElementById("compare-range");
  const presetBtns = Array.from(document.querySelectorAll(".compare-presets .chip-btn"));

  const panelTour = document.getElementById("panel-tour");
  const tourStepEl = document.getElementById("tour-step");
  const tourTitleEl = document.getElementById("tour-title");
  const tourDescEl = document.getElementById("tour-desc");
  const btnTourPrev = document.getElementById("btn-tour-prev");
  const btnTourNext = document.getElementById("btn-tour-next");
  const btnTourPlay = document.getElementById("btn-tour-play");

  const dockBtns = Array.from(document.querySelectorAll(".dock-btn[data-mode]"));
  const hotspotBtns = Array.from(document.querySelectorAll(".hotspot"));

  const btnToggleHotspots = document.getElementById("btn-toggle-hotspots");
  const btnResetView = document.getElementById("btn-reset-view");
  const btnAr = document.getElementById("btn-ar");
  const btnCloseInfo = document.getElementById("btn-close-info");
  const btnBrandHome = document.getElementById("btn-brand-home");

  const btnGoCompare = document.getElementById("btn-go-compare");
  const btnGoExplore = document.getElementById("btn-go-explore");
  const btnGoTour = document.getElementById("btn-go-tour");
  const btnGoAr = document.getElementById("btn-go-ar");

  const toastBanner = document.getElementById("toast-banner");
  const toastText = document.getElementById("toast-text");
  const btnToastClose = document.getElementById("btn-toast-close");

  const DEFAULT_ORBIT = "38deg 54deg 1.55m";
  const DEFAULT_TARGET = "0.02m 0.025m 0.00m";

  const HOTSPOTS = {
    grupal: {
      kicker: "VISIÓN METROPOLITANA · 4 POLÍGONOS",
      title: "Pieza Urbana Grupal Integrada (50,45 ha)",
      desc: "Consolidación continua de 4 polígonos (NW, SW, SE y NE) articulados por la Av. Caracas (BRT), la Av. Ciudad de Lima (Calle 19) y un sistema de alamedas y bulevares peatonales que reemplazan 1.858 predios fragmentados.",
      metrics: ["50,45 ha intervenidas", "1.858 predios Antes", "113 supermanzanas", "1.185 árboles"]
    },
    ne: {
      kicker: "POLÍGONO NE · DISTRITO VIVO",
      title: "Distrito Vivo: 9 Manzanas, Parque Norte y M08 Cívico",
      desc: "Bulevar arbolado de Calle 22, equipamiento cívico central (M08 en 5 pisos), Parque Norte con estanque (166,4 m²) y escalonamiento tipológico de zócalos 2P a torres de 12P, 14P y 18P sobre Av. Caracas.",
      metrics: ["Zócalo 2P + 5P–18P", "Bulevar Calle 22", "M08 Cívico + Parque", "299 árboles propios"]
    },
    sw: {
      kicker: "POLÍGONO SW · SUPERMANZANAS DE PATIO ABIERTO",
      title: "8 Claustros Escalonados y Parque Triangular Occidental",
      desc: "Composición de 8 manzanas cuadradas de patio abierto con vegetación interior, parque diagonal en el borde sur-occidental y torres de 18 pisos rematando hacia la Calle 19.",
      metrics: ["8 patios abiertos", "Zócalo 2P + 5P/12P/18P", "Parque SW diagonal"]
    },
    se: {
      kicker: "POLÍGONO SE · FACHADA CARACAS Y PLAZA OCHAVE",
      title: "Ochave Monumental en 14P y Fachada Urbana 18P",
      desc: "Cuatro manzanas articuladas alrededor de una plaza ochave central de 14 pisos, flanqueadas al oriente por un frente de 18 pisos sobre la Av. Caracas y al occidente por terrazas escalonadas de 5P y 12P.",
      metrics: ["Plaza Ochave 14P", "Frente Caracas 18P", "Borde Av. Lima"]
    },
    nw: {
      kicker: "POLÍGONO NW · TEJIDO ORGÁNICO ESCALONADO",
      title: "Manzanas Curvas Perimetrales (10P a 18P)",
      desc: "Morfología orgánica adaptada al trazado inclinado del noroccidente, manteniendo basamentos comerciales de doble altura (2P) y cuerpos escalonados en ladrillo, terracota, champán y grafito.",
      metrics: ["Trazado orgánico", "Alturas 2P + 5P–18P", "Patios comunitarios"]
    },
    ejes: {
      kicker: "MOVILIDAD Y ESPACIO PÚBLICO",
      title: "Sutura Vial, Ciclorrutas, BRT y Alamedas Verdes",
      desc: "Continuidad transversal norte-sur y oriente-occidente con pasos peatonales seguros, franjas blandas arborizadas, carriles exclusivos de TransMilenio por la Caracas y zócalos activos en todos los cruces.",
      metrics: ["Av. Caracas BRT", "Av. Ciudad de Lima", "Alameda Central", "Cobertura verde continua"]
    }
  };

  const TOUR_STOPS = [
    {
      id: "grupal",
      title: "Vista General — Pieza Grupal (50,45 ha)",
      desc: "Panorámica conjunta de los cuatro polígonos articulados en lenguaje material unificado y alturas de 2P a 18P.",
      orbit: "38deg 54deg 1.55m",
      target: "0.02m 0.025m 0.00m"
    },
    {
      id: "sw",
      title: "Polígono SW — Claustros Verdes y Parque Sur",
      desc: "8 manzanas de patio central abierto conectadas al parque triangular SW y al eje de la Av. Ciudad de Lima.",
      orbit: "32deg 52deg 0.82m",
      target: "-0.121m 0.025m 0.243m"
    },
    {
      id: "se",
      title: "Polígono SE — Plaza Ochave y Av. Caracas",
      desc: "Cruces ochavados a 14 pisos en el corazón del sector y remate metropolitano de 18 pisos hacia TransMilenio.",
      orbit: "48deg 54deg 0.74m",
      target: "0.219m 0.025m 0.142m"
    },
    {
      id: "ne",
      title: "Polígono NE — Distrito Vivo (Calle 22 y Parque Norte)",
      desc: "Bulevar Calle 22, equipamiento cívico M08 (5P), Parque Norte con estanque y torres de hasta 18 pisos.",
      orbit: "44deg 52deg 0.72m",
      target: "0.234m 0.025m -0.207m"
    },
    {
      id: "nw",
      title: "Polígono NW — Curvas Orgánicas y Transición de Escala",
      desc: "Trazado orgánico con basamento comercial continuo 2P y variación escalonada desde 5P hasta 18 pisos.",
      orbit: "-38deg 52deg 0.76m",
      target: "-0.040m 0.025m -0.201m"
    },
    {
      id: "ejes",
      title: "Eje Central — Suturas Verdes y Corredor BRT",
      desc: "Lectura continua de los ejes urbanos que unen las cuatro piezas en una sola estructura ambiental y cívica.",
      orbit: "64deg 56deg 1.05m",
      target: "0.12m 0.020m -0.01m"
    }
  ];

  let currentMode = "landing";
  let tourIndex = 0;
  let tourTimer = null;
  let toastTimer = null;
  let antesReady = false;
  let syncPending = false;
  let syncPauseUntil = 0;

  function showToast(msg, ms = 4200) {
    toastText.textContent = msg;
    toastBanner.hidden = false;
    clearTimeout(toastTimer);
    if (ms > 0) {
      toastTimer = setTimeout(() => {
        toastBanner.hidden = true;
      }, ms);
    }
  }

  function setSplit(val) {
    const pct = Math.max(0, Math.min(100, Number(val)));
    document.documentElement.style.setProperty("--split", String(pct));
    compareRange.value = String(pct);
    presetBtns.forEach((b) => b.classList.toggle("active", Number(b.dataset.split) === pct));
  }

  function applyCamera(orbit, target) {
    syncPauseUntil = performance.now() + 900;
    mvDespues.cameraOrbit = orbit;
    mvDespues.cameraTarget = target;
    if (antesReady) {
      mvAntes.cameraOrbit = orbit;
      mvAntes.cameraTarget = target;
    }
  }

  function resetCamera() {
    applyCamera(DEFAULT_ORBIT, DEFAULT_TARGET);
  }

  function syncAntesCamera(forceJump = false) {
    if (!antesReady) return;
    if (!forceJump && performance.now() < syncPauseUntil) return;
    try {
      const orbit = mvDespues.getCameraOrbit();
      const target = mvDespues.getCameraTarget();
      const fov = mvDespues.getFieldOfView();
      mvAntes.cameraOrbit = `${orbit.theta}rad ${orbit.phi}rad ${orbit.radius}m`;
      mvAntes.cameraTarget = `${target.x}m ${target.y}m ${target.z}m`;
      mvAntes.fieldOfView = `${fov}deg`;
      if (forceJump && typeof mvAntes.jumpCameraToGoal === "function") {
        mvAntes.jumpCameraToGoal();
      }
    } catch (_) {
      // ignore before element fully initialized
    }
  }

  mvDespues.addEventListener("camera-change", () => {
    if (currentMode !== "compare" || syncPending) return;
    syncPending = true;
    requestAnimationFrame(() => {
      syncPending = false;
      syncAntesCamera(false);
    });
  });

  mvAntes.addEventListener("load", () => {
    antesReady = true;
    syncAntesCamera(true);
  });

  mvDespues.addEventListener("progress", (e) => {
    const p = Math.round((e.detail?.totalProgress ?? 0) * 100);
    loadingBar.style.width = `${p}%`;
    if (p >= 100) {
      setTimeout(() => {
        loadingRibbon.style.opacity = "0";
      }, 350);
    }
  });

  function stopAutoTour() {
    if (tourTimer) {
      clearInterval(tourTimer);
      tourTimer = null;
    }
    btnTourPlay.textContent = "Auto ▶";
    btnTourPlay.classList.remove("active");
  }

  function goToTourStop(idx) {
    tourIndex = (idx + TOUR_STOPS.length) % TOUR_STOPS.length;
    const stop = TOUR_STOPS[tourIndex];
    tourStepEl.textContent = `PARADA ${tourIndex + 1} / ${TOUR_STOPS.length}`;
    tourTitleEl.textContent = stop.title;
    tourDescEl.textContent = stop.desc;
    applyCamera(stop.orbit, stop.target);
    hotspotBtns.forEach((b) => b.classList.toggle("active", b.dataset.id === stop.id));
  }

  function openHotspot(id) {
    const info = HOTSPOTS[id];
    const btn = hotspotBtns.find((b) => b.dataset.id === id);
    if (!info || !btn) return;
    infoKicker.textContent = info.kicker;
    infoTitle.textContent = info.title;
    infoDesc.textContent = info.desc;
    infoMetrics.innerHTML = info.metrics.map((m) => `<span class="metric-chip">${m}</span>`).join("");
    infoSheet.hidden = false;
    hotspotBtns.forEach((b) => b.classList.toggle("active", b === btn));
    if (btn.dataset.orbit && btn.dataset.target) {
      applyCamera(btn.dataset.orbit, btn.dataset.target);
    }
  }

  function closeHotspot() {
    infoSheet.hidden = true;
    hotspotBtns.forEach((b) => b.classList.remove("active"));
  }

  function setMode(mode) {
    currentMode = mode;
    document.body.dataset.mode = mode;
    stopAutoTour();
    closeHotspot();

    dockBtns.forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
    panelCompare.hidden = mode !== "compare";
    panelTour.hidden = mode !== "tour";

    if (mode === "compare") {
      syncAntesCamera(true);
    } else if (mode === "tour") {
      goToTourStop(tourIndex);
    }
  }

  function toggleHotspots() {
    const isOn = document.body.dataset.hotspots !== "off";
    document.body.dataset.hotspots = isOn ? "off" : "on";
    btnToggleHotspots.setAttribute("aria-pressed", String(!isOn));
    if (isOn) closeHotspot();
  }

  async function launchAR() {
    if (currentMode === "landing") setMode("explore");
    if (mvDespues.canActivateAR) {
      try {
        await mvDespues.activateAR();
      } catch (_) {
        showToast("No se pudo iniciar la sesión AR en este dispositivo. Usa el modo Explorar o Comparar 3D.");
      }
    } else {
      showToast("La Realidad Aumentada está disponible desde un teléfono compatible (Android ARCore o iPhone/iPad Safari). En PC explora e interactúa en 3D.");
    }
  }

  hotspotBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentMode !== "explore") setMode("explore");
      openHotspot(btn.dataset.id);
    });
  });

  dockBtns.forEach((btn) => btn.addEventListener("click", () => setMode(btn.dataset.mode)));
  compareRange.addEventListener("input", (e) => setSplit(e.target.value));
  presetBtns.forEach((btn) => btn.addEventListener("click", () => setSplit(btn.dataset.split)));

  btnTourPrev.addEventListener("click", () => { stopAutoTour(); goToTourStop(tourIndex - 1); });
  btnTourNext.addEventListener("click", () => { stopAutoTour(); goToTourStop(tourIndex + 1); });
  btnTourPlay.addEventListener("click", () => {
    if (tourTimer) {
      stopAutoTour();
    } else {
      btnTourPlay.textContent = "Pausar ❚❚";
      btnTourPlay.classList.add("active");
      tourTimer = setInterval(() => goToTourStop(tourIndex + 1), 4200);
    }
  });

  btnToggleHotspots.addEventListener("click", toggleHotspots);
  btnResetView.addEventListener("click", () => { stopAutoTour(); closeHotspot(); resetCamera(); });
  btnCloseInfo.addEventListener("click", closeHotspot);
  btnAr.addEventListener("click", launchAR);
  btnBrandHome.addEventListener("click", () => setMode("landing"));
  btnToastClose.addEventListener("click", () => { toastBanner.hidden = true; });

  btnGoCompare.addEventListener("click", () => { setMode("compare"); setSplit(50); });
  btnGoExplore.addEventListener("click", () => setMode("explore"));
  btnGoTour.addEventListener("click", () => setMode("tour"));
  btnGoAr.addEventListener("click", launchAR);

  setSplit(50);
  setMode("landing");
})();
