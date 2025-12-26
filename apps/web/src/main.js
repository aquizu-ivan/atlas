import "./style.css";

const apiBase = import.meta.env.VITE_API_BASE_URL
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

apiEl.textContent = apiBase;

function setState(label, tone) {
  stateEl.textContent = label;
  dotEl.dataset.tone = tone;
}

async function loadHealth() {
  setState("Loading", "pending");
  try {
    const response = await fetch(`${apiBase}/api/health`);
    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error("health not ok");
    }

    setState("Online", "ok");
    envEl.textContent = data.env || "unknown";
    startedEl.textContent = data.startedAt || "--";
    uptimeEl.textContent = String(data.uptimeSec ?? "--");
    dbEl.textContent = data.db && data.db.configured ? "connected" : "not connected";
  } catch (error) {
    setState("Error", "error");
    envEl.textContent = "--";
    startedEl.textContent = "--";
    uptimeEl.textContent = "--";
    dbEl.textContent = "--";
  }
}

loadHealth();
