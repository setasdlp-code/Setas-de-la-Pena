(() => {
  "use strict";

  const STORAGE_KEY = "fieldos_demo_state_v1";
  const views = [...document.querySelectorAll("[data-view]")];
  const navButtons = [...document.querySelectorAll("[data-nav-target]")];
  const roleSelect = document.querySelector("#roleSelect");
  const captureDialog = document.querySelector("#captureDialog");
  const batchDialog = document.querySelector("#batchDialog");
  const captureForm = document.querySelector("#captureForm");
  const eventTimeline = document.querySelector("#eventTimeline");
  const eventCount = document.querySelector("#eventCount");
  const toast = document.querySelector("#toast");
  const installButton = document.querySelector("#installButton");

  const roleCopy = {
    operator: {
      session: "Cultivo · activa",
      eyebrow: "Sábado · 18 de julio · Turno de cultivo",
      title: "El turno, sin ruido.",
      lede: "Identifica el objeto en mano, registra el hecho y vuelve al cultivo. Cada evento queda atribuido y seguro."
    },
    production: {
      session: "Producción · Tenjo",
      eyebrow: "Sábado · 18 de julio · Operación",
      title: "Lo que requiere atención.",
      lede: "La operación aparece como evidencia concreta: lotes, condiciones y excepciones. Cada decisión conserva su origen."
    },
    direction: {
      session: "Dirección · evidencia",
      eyebrow: "Sábado · 18 de julio · Vista de dirección",
      title: "La operación, trazable.",
      lede: "Demanda, calidad y aprendizaje comparten la misma memoria. Ninguna cifra comercial queda separada del lote que la produjo."
    }
  };

  let deferredInstallPrompt = null;
  let toastTimer = null;
  let state = readState();

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return {
        role: saved?.role || "production",
        events: Array.isArray(saved?.events) ? saved.events : [],
        acknowledged: Number(saved?.acknowledged) || 0,
        batchExecuted: Boolean(saved?.batchExecuted)
      };
    } catch {
      return { role: "production", events: [], acknowledged: 0, batchExecuted: false };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function rolesFor(element) {
    return (element.dataset.roles || "operator,production,direction").split(",");
  }

  function showView(target, options = {}) {
    const next = views.find((view) => view.dataset.view === target);
    if (!next) return;

    views.forEach((view) => {
      const active = view === next;
      view.hidden = !active;
      view.classList.toggle("is-visible", active);
    });

    document.querySelectorAll("[data-nav-target]").forEach((button) => {
      const active = button.dataset.navTarget === target;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    if (options.focus !== false) {
      const heading = next.querySelector("h1");
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    history.replaceState(null, "", `#${target}`);
  }

  function applyRole(role) {
    state.role = roleCopy[role] ? role : "production";
    roleSelect.value = state.role;
    document.body.dataset.role = state.role;

    document.querySelectorAll("[data-roles]").forEach((element) => {
      element.hidden = !rolesFor(element).includes(state.role);
    });

    document.querySelectorAll("[data-role-block]").forEach((element) => {
      element.hidden = !rolesFor(element).includes(state.role);
    });

    const copy = roleCopy[state.role];
    document.querySelector("#sessionLabel").textContent = copy.session;
    document.querySelector("#todayEyebrow").textContent = copy.eyebrow;
    document.querySelector("#today-title").textContent = copy.title;
    document.querySelector("#todayLede").textContent = copy.lede;

    const activeView = views.find((view) => !view.hidden);
    const visibleForRole = navButtons.some((button) =>
      button.dataset.navTarget === activeView?.dataset.view &&
      !button.hidden &&
      rolesFor(button).includes(state.role)
    );

    if (!visibleForRole) showView("today", { focus: false });
    saveState();
  }

  function openCapture() {
    if (typeof captureDialog.showModal === "function") captureDialog.showModal();
    else captureDialog.setAttribute("open", "");
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3400);
  }

  function formatTime(date = new Date()) {
    return new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
  }

  function appendEvent(event) {
    const item = document.createElement("li");
    const time = document.createElement("time");
    const dot = document.createElement("span");
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    const note = document.createElement("small");

    time.textContent = event.time;
    dot.className = "timeline-dot";
    if (event.type === "Cosecha") dot.classList.add("timeline-dot--harvest");
    if (event.type === "Contaminación") dot.classList.add("timeline-dot--flag");
    title.textContent = `${event.type} · C-0412`;
    note.textContent = event.note || "Evento registrado sin nota adicional";

    copy.append(title, note);
    item.append(time, dot, copy);
    eventTimeline.prepend(item);
  }

  function renderSavedEvents() {
    [...state.events].reverse().forEach(appendEvent);
    eventCount.textContent = String(4 + state.events.length);
  }

  function updateReviewCount() {
    const remaining = document.querySelectorAll("#evidenceList .evidence-item").length;
    document.querySelector("#reviewCount").textContent = String(remaining);
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.navTarget));
  });

  roleSelect.addEventListener("change", () => applyRole(roleSelect.value));

  document.querySelector("#scanButton").addEventListener("click", openCapture);
  document.querySelector("#manualRegisterButton").addEventListener("click", openCapture);
  document.querySelectorAll("[data-mobile-scan]").forEach((button) => button.addEventListener("click", openCapture));

  document.querySelectorAll(".dialog-close").forEach((button) => {
    button.addEventListener("click", () => closeDialog(button.closest("dialog")));
  });

  document.querySelectorAll("[data-quick-note]").forEach((button) => {
    button.addEventListener("click", () => {
      const noteField = document.querySelector("#eventNote");
      noteField.value = button.dataset.quickNote;
      noteField.focus();
    });
  });

  captureForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const type = new FormData(captureForm).get("eventType") || "Observación";
    const note = document.querySelector("#eventNote").value.trim();
    const record = { type: String(type), note, time: formatTime(), recordedAt: new Date().toISOString() };

    state.events.push(record);
    saveState();
    appendEvent(record);
    eventCount.textContent = String(4 + state.events.length);
    document.querySelector("#eventNote").value = "";
    closeDialog(captureDialog);
    showToast(`${record.type} guardada. El evento ya forma parte de la historia de C-0412.`);
  });

  document.querySelectorAll(".acknowledge-button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".evidence-item");
      item.remove();
      state.acknowledged += 1;
      saveState();
      updateReviewCount();
      showToast("Revisión registrada con autor y hora.");
    });
  });

  document.querySelector(".incident-ack")?.addEventListener("click", (event) => {
    event.currentTarget.disabled = true;
    event.currentTarget.textContent = "Incidencia reconocida";
    const status = event.currentTarget.closest(".incident-card")?.querySelector(".status");
    if (status) {
      status.textContent = "Reconocida";
      status.className = "status status--ready";
    }
    showToast("Incidencia reconocida. La lectura original permanece sin cambios.");
  });

  document.querySelector("#executeBatchButton").addEventListener("click", () => {
    if (typeof batchDialog.showModal === "function") batchDialog.showModal();
    else batchDialog.setAttribute("open", "");
  });

  document.querySelector("#confirmBatchButton").addEventListener("click", () => {
    state.batchExecuted = true;
    saveState();
    window.setTimeout(() => showToast("Lote ejecutado. Receta v1.8 bloqueada e inventario descontado por FIFO."), 40);
  });

  document.querySelector("#traceSearchButton")?.addEventListener("click", () => {
    showToast("Demo: la búsqueda acepta código de pedido, empaque, cosecha, contenedor, lote o insumo.");
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    installButton.hidden = true;
    showToast("Field OS quedó instalado en este dispositivo.");
  });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }

  renderSavedEvents();
  applyRole(state.role);
  const requestedView = location.hash.replace("#", "");
  if (views.some((view) => view.dataset.view === requestedView)) showView(requestedView, { focus: false });
  else showView("today", { focus: false });
})();
