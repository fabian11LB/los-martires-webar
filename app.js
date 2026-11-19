(() => {
  const mvDespues = document.getElementById("mv-despues");
  const mvAntes = document.getElementById("mv-antes");
  const loadingRibbon = document.getElementById("loading-ribbon");
  const loadingBar = document.getElementById("loading-bar");

  const panelCompare = document.getElementById("panel-compare");
  const panelTour = document.getElementById("panel-tour");
  const infoSheet = document.getElementById("info-sheet");
  const infoKicker = document.getElementById("info-kicker");
  const infoTitle = document.getElementById("info-title");
  const infoDesc = document.getElementById("info-desc");
  const infoMetrics = document.getElementById("info-metrics");
  const infoClose = document.getElementById("info-close");

  const compareRange = document.getElementById("compare-range");
  const toastBanner = document.getElementById("toast-banner");
  const toastText = document.getElementById("toast-text");
  const toastClose = document.getElementById("toast-close");

  const btnHome = document.getElementById("btn-home");
  const btnTopAr = document.getElementById("btn-top-ar");
  const btnToggleHotspots = document.getElementById("btn-toggle-hotspots");
  const btnTourPrev = document.getElementById("btn-tour-prev");
  const btnTourNext = document.getElementById("btn-tour-next");
  const btnTourReset = document.getElementById("btn-tour-reset");

  const tourStepEl = document.getElementById("tour-step");
  const tourTitleEl = document.getElementById("tour-title");
  const tourDescEl = document.getElementById("tour-desc");

  const DEFAULT_ORBIT = "38deg 58deg 1.18m";
  const DEFAULT_TARGET = "0m 0.04m 0m";
  const DEFAULT_FOV = "34deg";

  // Datos reales verificados desde metrics.json + raycast 3D libre de obstrucciones en Blender
  const HOTSPOTS = {
    "1": {
      kicker: "01 · CONECTIVIDAD Y ACCESIBILIDAD",
      title: "Boulevard Peatonal Transversal",
      desc: "Eje amarillo peatonal que cose las supermanzanas occidentales y orientales con cruces seguros a nivel y accesibilidad continua.",
      metrics: ["2,552 m² boulevard", "321 pasos cebra", "Pendiente natural 0–6 m"],
      target: "-0.02m 0.025m -0.175m",
      orbit: "90deg 52deg 0.36m",
    },
    "2": {
      kicker: "02 · CIRCULACIONES Y MOVILIDAD",
      title: "Corredor Multimodal y Ciclorruta",
      desc: "Segregación clara entre carril exclusivo de transporte público, ciclorruta coral continua norte-sur y calzadas vehiculares ordenadas.",
      metrics: ["1,852 m² ciclorruta", "1,817 m² transporte", "13,887 m² calzadas"],
      target: "0m 0.022m 0m",
      orbit: "15deg 50deg 0.42m",
    },
    "3": {
      kicker: "03 · ESPACIO PÚBLICO Y ZÓCALO",
      title: "Plazas Duras y Basamento Comercial",
      desc: "El 58.8% del predio permanece abierto como espacio público y vacíos urbanos, activado en primeros y segundos pisos por zócalos comerciales en doble altura.",
      metrics: ["68,819 m² espacio abierto", "17,965 m² plazas adoquín", "84,370 m² comercio"],
      target: "0.02m 0.019m 0.275m",
      orbit: "0deg 52deg 0.42m",
    },
    "4": {
      kicker: "04 · ESTRUCTURA AMBIENTAL",
      title: "Parque Norte, Arbolado y Estanque",
      desc: "Corredor ecológico continuo que amortigua escorrentías mediante un estanque de agua en el sector noreste y densifica la cobertura vegetal nativa.",
      metrics: ["17,388 m² zona verde", "299 árboles · 650 arbustos", "Estanque 166.4 m²"],
      target: "0.104m 0.028m -0.380m",
      orbit: "110deg 54deg 0.28m",
    },
    "5": {
      kicker: "05 · EQUIPAMIENTOS Y DENSIDAD",
      title: "Pieza Cívica NE y Torres Mixtas",
      desc: "Equipamiento cultural y comunitario de baja altura (3–5 pisos) articulado con superbloques residenciales de dobles fachadas bioclimáticas.",
      metrics: ["22,568 m² equipamiento", "362,884 m² vivienda", "IO 0.412 · IC 4.01"],
      target: "0.111m 0.048m -0.218m",
      orbit: "125deg 54deg 0.34m",
    },
  };

  // Experiencia C: 3 corredores abiertos peatonales verificados sin intersección con edificios
  const TOUR_STOPS = [
    {
      title: "1. Zócalo Comercial y Eje Sur",
      desc: "Perspectiva abierta sobre el eje central frente a los basamentos comerciales de doble altura (superbloques de 17–20 pisos).",
      target: "0m 0.034m 0.28m",
      orbit: "0deg 74deg 0.16m",
      fov: "42deg",
    },
    {
      title: "2. Boulevard Peatonal Central",
      desc: "Visual longitudinal abierta a lo largo del boulevard amarillo desde el corredor oriental hacia el centro del proyecto.",
      target: "-0.02m 0.034m -0.175m",
      orbit: "90deg 72deg 0.24m",
      fov: "42deg",
    },
    {
      title: "3. Parque Norte y Estanque",
      desc: "Mirador en el extremo nororiental hacia el espejo de agua (166.4 m²), deck en madera, arbolado y pieza cívica de baja altura.",
      target: "0.104m 0.036m -0.365m",
      orbit: "115deg 72deg 0.18m",
      fov: "40deg",
    },
  ];

  let currentMode = "landing";
  let tourIndex = 0;
  let antesLoaded = false;
  let syncRafId = 0;
  let lastCamSig = "";

  function showToast(msg, durationMs = 6000) {
    toastText.textContent = msg;
    toastBanner.hidden = false;
    window.clearTimeout(showToast._timer);
    if (durationMs > 0) {
      showToast._timer = window.setTimeout(() => {
        toastBanner.hidden = true;
      }, durationMs);
    }
  }

  function ensureAntesLoaded() {
    if (antesLoaded) return;
    antesLoaded = true;
    mvAntes.src = "assets/maqueta_1vty_antes.glb";
  }

  function setCamera(orbit, target, fov = DEFAULT_FOV) {
    mvDespues.cameraTarget = target;
    mvDespues.cameraOrbit = orbit;
    mvDespues.fieldOfView = fov;
    if (currentMode === "compare") syncAntesCamera(true);
  }

  function syncAntesCamera(force = false) {
    if (!antesLoaded || !mvDespues.getCameraOrbit) return;
    const o = mvDespues.getCameraOrbit();
    const t = mvDespues.getCameraTarget();
    const fov = mvDespues.getFieldOfView();
    const sig = `${o.theta.toFixed(4)}|${o.phi.toFixed(4)}|${o.radius.toFixed(4)}|${t.x.toFixed(4)}|${t.y.toFixed(4)}|${t.z.toFixed(4)}|${fov.toFixed(2)}`;
    if (!force && sig === lastCamSig) return;
    lastCamSig = sig;
    mvAntes.cameraTarget = `${t.x}m ${t.y}m ${t.z}m`;
    mvAntes.cameraOrbit = `${o.theta}rad ${o.phi}rad ${o.radius}m`;
    mvAntes.fieldOfView = `${fov}deg`;
    if (typeof mvAntes.jumpCameraToGoal === "function") {
      mvAntes.jumpCameraToGoal();
    }
  }

  function runCompareSyncLoop() {
    window.cancelAnimationFrame(syncRafId);
    if (currentMode !== "compare") return;
    syncAntesCamera(false);
    syncRafId = window.requestAnimationFrame(runCompareSyncLoop);
  }

  function applySplit(val) {
    const clamped = Math.max(0, Math.min(100, Number(val)));
    document.documentElement.style.setProperty("--split", String(clamped));
    compareRange.value = String(clamped);
    document.querySelectorAll(".compare-presets .chip-btn").forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.split) === clamped);
    });
  }

  function closeInfoSheet() {
    infoSheet.hidden = true;
    document.querySelectorAll(".hotspot").forEach((el) => el.classList.remove("active"));
  }

  function openHotspot(id) {
    const data = HOTSPOTS[id];
    if (!data) return;
    document.querySelectorAll(".hotspot").forEach((el) => {
      el.classList.toggle("active", el.dataset.hs === id);
    });
    infoKicker.textContent = data.kicker;
    infoTitle.textContent = data.title;
    infoDesc.textContent = data.desc;
    infoMetrics.innerHTML = data.metrics.map((m) => `<span class="metric-chip">${m}</span>`).join("");
    infoSheet.hidden = false;
    setCamera(data.orbit, data.target, "34deg");
  }

  function applyTourStop(idx) {
    tourIndex = (idx + TOUR_STOPS.length) % TOUR_STOPS.length;
    const stop = TOUR_STOPS[tourIndex];
    tourStepEl.textContent = `PUNTO ${tourIndex + 1} / ${TOUR_STOPS.length}`;
    tourTitleEl.textContent = stop.title;
    tourDescEl.textContent = stop.desc;
    setCamera(stop.orbit, stop.target, stop.fov);
  }

  function setMode(mode) {
    if (mode === "ar") {
      triggerAR();
      return;
    }

    currentMode = mode;
    document.body.dataset.mode = mode;
    closeInfoSheet();

    panelCompare.hidden = mode !== "compare";
    panelTour.hidden = mode !== "tour";

    document.querySelectorAll(".mode-dock .dock-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.go === mode);
    });

    if (mode === "compare") {
      ensureAntesLoaded();
      applySplit(compareRange.value);
      syncAntesCamera(true);
      runCompareSyncLoop();
    } else {
      window.cancelAnimationFrame(syncRafId);
      if (mode === "tour") {
        applyTourStop(tourIndex);
      } else if (mode === "explore") {
        setCamera(DEFAULT_ORBIT, DEFAULT_TARGET, DEFAULT_FOV);
      }
    }
  }

  async function triggerAR() {
    // Entrar al visor si estaba en portada para asegurar fallback 3D inmediato
    if (currentMode === "landing") {
      setMode("explore");
    }

    if (mvDespues.canActivateAR) {
      try {
        await mvDespues.activateAR();
      } catch (err) {
        showToast("No fue posible abrir la cámara AR. Puedes explorar la maqueta en el visor 3D web.");
      }
    } else {
      showToast(
        "AR no disponible en este navegador/equipo (requiere celular compatible con WebXR, Scene Viewer o AR Quick Look). Activo el visor 3D interactivo."
      );
    }
  }

  // Eventos de carga
  mvDespues.addEventListener("progress", (e) => {
    const pct = Math.round((e.detail.totalProgress || 0) * 100);
    loadingBar.style.width = `${pct}%`;
    if (pct >= 100) {
      window.setTimeout(() => { loadingRibbon.style.opacity = "0"; }, 350);
    }
  });

  mvDespues.addEventListener("load", () => {
    loadingBar.style.width = "100%";
    window.setTimeout(() => { loadingRibbon.style.opacity = "0"; }, 250);
  });

  mvDespues.addEventListener("error", () => {
    showToast("Error cargando el modelo 3D. Verifica la conexión o recarga la página.", 0);
  });

  mvDespues.addEventListener("camera-change", () => {
    if (currentMode === "compare") {
      syncAntesCamera(false);
    }
  });

  mvAntes.addEventListener("load", () => {
    if (currentMode === "compare") {
      syncAntesCamera(true);
    }
  });

  mvDespues.addEventListener("ar-status", (e) => {
    if (e.detail.status === "failed") {
      showToast("La sesión AR fue cancelada o falló. Continúas en el visor 3D web.");
    }
  });

  // Navegación
  document.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.go));
  });

  btnHome.addEventListener("click", () => setMode("landing"));
  btnTopAr.addEventListener("click", triggerAR);
  toastClose.addEventListener("click", () => { toastBanner.hidden = true; });
  infoClose.addEventListener("click", closeInfoSheet);

  btnToggleHotspots.addEventListener("click", () => {
    const isOn = document.body.dataset.hotspots !== "off";
    document.body.dataset.hotspots = isOn ? "off" : "on";
    btnToggleHotspots.setAttribute("aria-pressed", String(!isOn));
    if (isOn) closeInfoSheet();
  });

  document.querySelectorAll(".hotspot").forEach((hs) => {
    hs.addEventListener("click", (e) => {
      e.stopPropagation();
      openHotspot(hs.dataset.hs);
    });
  });

  compareRange.addEventListener("input", (e) => applySplit(e.target.value));
  document.querySelectorAll(".compare-presets .chip-btn").forEach((btn) => {
    btn.addEventListener("click", () => applySplit(btn.dataset.split));
  });

  btnTourPrev.addEventListener("click", () => applyTourStop(tourIndex - 1));
  btnTourNext.addEventListener("click", () => applyTourStop(tourIndex + 1));
  btnTourReset.addEventListener("click", () => setCamera(DEFAULT_ORBIT, DEFAULT_TARGET, DEFAULT_FOV));
})();
