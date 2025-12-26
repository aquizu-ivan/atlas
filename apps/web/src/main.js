import "./style.css";

const rawApiBase = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.MODE === "production"
    ? "https://atlas-atlas.up.railway.app"
    : "http://localhost:4000");

const stateEl = document.querySelector("[data-state]");
const dotEl = document.querySelector("[data-dot]");
const envEl = document.querySelector("[data-env]");
const startedEl = document.querySelector("[data-started]");
const uptimeEl = document.querySelector("[data-uptime]");
const dbEl = document.querySelector("[data-db]");
const apiEl = document.querySelector("[data-api]");

function normalizeBase(value) {
  if (!value) return "";
  return value.trim().replace(/\/+$/, "");
}

function buildHealthUrl(base) {
  const normalized = normalizeBase(base);
  if (normalized.toLowerCase().endsWith("/api")) {
    return `${normalized}/health`;
  }
  return `${normalized}/api/health`;
}

const healthUrl = buildHealthUrl(rawApiBase);
apiEl.textContent = healthUrl;

function setState(label, tone) {
  stateEl.textContent = label;
  dotEl.dataset.tone = tone;
}

function setError(label) {
  setState(label, "error");
  envEl.textContent = "--";
  startedEl.textContent = "--";
  uptimeEl.textContent = "--";
  dbEl.textContent = "--";
}

async function loadHealth() {
  setState("Loading", "pending");
  try {
    const response = await fetch(healthUrl);
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      if (response.status === 404) {
        setError("Not found");
        return;
      }
      if (response.status >= 500) {
        setError("Service error");
        return;
      }
      setError("Request error");
      return;
    }

    if (!data || !data.ok) {
      setError("Service error");
      return;
    }

    setState("Online", "ok");
    envEl.textContent = data.env || "unknown";
    startedEl.textContent = data.startedAt || "--";
    uptimeEl.textContent = String(data.uptimeSec ?? "--");
    dbEl.textContent = data.db && data.db.configured ? "connected" : "not connected";
  } catch (error) {
    setError("Network error");
  }
}

loadHealth();
