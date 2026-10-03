// Replace these values with your published store, bot invite, and support URLs.
const DP_CONFIG = {
  extensionStoreUrl: "https://github.com/bot471912-dot/discordProtect/releases/latest/download/DiscordProtect.zip",
  botInviteUrl: "",
  supportInviteUrl: ""
};

const toast = document.querySelector("#toast");
let toastTimer;
let pendingPing = "";
let pingTimer;

function showMessage(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3600);
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

for (const link of document.querySelectorAll(".configured-link")) {
  const key = link.dataset.config;
  const destination = DP_CONFIG[key];
  if (isHttpsUrl(destination)) {
    link.href = destination;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.removeAttribute("aria-disabled");
  } else {
    link.href = "#connect";
    link.setAttribute("aria-disabled", "true");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showMessage(`Configurez l’URL « ${key} » dans script.js avant publication.`);
    });
  }
}

document.querySelector("#year").textContent = String(new Date().getFullYear());

function animateCounters() {
  const counters = document.querySelectorAll("[data-count]");
  const formatter = new Intl.NumberFormat("fr-FR");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const reveal = (element) => {
    const target = Number(element.dataset.count);
    const suffix = element.dataset.suffix ?? "";
    if (reduceMotion) {
      element.textContent = formatter.format(target) + suffix;
      return;
    }
    const start = performance.now();
    const duration = 1000;
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = formatter.format(Math.round(target * eased)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(reveal);
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      reveal(entry.target);
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.35 });
  counters.forEach((counter) => observer.observe(counter));
}

function renderExtensionState(connected, state) {
  const status = document.querySelector("#extension-state");
  const count = document.querySelector("#extension-count");
  status.classList.toggle("connected", connected);
  if (!connected) {
    status.textContent = "Extension non détectée";
    count.textContent = "Installez l’extension pour afficher ici son compteur local du jour.";
    return;
  }
  status.textContent = state.protectionEnabled ? "Extension connectée · protection active" : "Extension connectée · protection en pause";
  const features = [
    ["Publicités et traceurs", state.protectionEnabled],
    ["Popups cookies", state.cookiePopupEnabled],
    ["Anti-tracking", state.antiTrackingEnabled],
    ["Outils Discord", state.discordToolsEnabled],
    ["Anti-Rickroll", state.antiRickrollEnabled],
    ["Mode Productivité", state.productivityModeEnabled]
  ].map(([name, active]) => `${name} ${active ? "actif" : "désactivé"}`);
  count.textContent = `${new Intl.NumberFormat("fr-FR").format(state.blockedToday)} action(s) de protection aujourd’hui sur cet appareil. ${features.join(" · ")}.`;
}

function pingExtension() {
  pendingPing = crypto.randomUUID();
  const requestId = pendingPing;
  window.postMessage({ type: "DP_EXTENSION_PING", requestId }, window.location.origin);
  clearTimeout(pingTimer);
  pingTimer = setTimeout(() => {
    if (pendingPing === requestId) {
      pendingPing = "";
      renderExtensionState(false, null);
    }
  }, 1200);
}

window.addEventListener("message", (event) => {
  if (event.source !== window || event.origin !== window.location.origin) return;
  const message = event.data;
  if (message?.type !== "DP_EXTENSION_PONG" || message.requestId !== pendingPing) return;
  pendingPing = "";
  clearTimeout(pingTimer);
  renderExtensionState(true, {
    protectionEnabled: Boolean(message.protectionEnabled),
    cookiePopupEnabled: Boolean(message.cookiePopupEnabled),
    antiTrackingEnabled: Boolean(message.antiTrackingEnabled),
    discordToolsEnabled: Boolean(message.discordToolsEnabled),
    antiRickrollEnabled: Boolean(message.antiRickrollEnabled),
    productivityModeEnabled: Boolean(message.productivityModeEnabled),
    blockedToday: Number(message.blockedToday) || 0
  });
});

animateCounters();
pingExtension();
setInterval(pingExtension, 15000);
