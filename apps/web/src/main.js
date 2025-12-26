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
const authEmailInput = document.querySelector("[data-auth-email]");
const authRequestBtn = document.querySelector("[data-auth-request]");
const authMessageEl = document.querySelector("[data-auth-message]");
const authStatusEl = document.querySelector("[data-auth-status]");
const authUserEl = document.querySelector("[data-auth-user]");
const authDevEl = document.querySelector("[data-auth-dev]");
const authConsumeBtn = document.querySelector("[data-auth-consume]");
const authRefreshBtn = document.querySelector("[data-auth-refresh]");
const authLogoutBtn = document.querySelector("[data-auth-logout]");

function normalizeBase(value) {
  if (!value) return "";
  return value.trim().replace(/\/+$/, "");
}

function normalizeOrigin(base) {
  const normalized = normalizeBase(base);
  if (normalized.toLowerCase().endsWith("/api")) {
    return normalized.slice(0, -4);
  }
  return normalized;
}

const apiOrigin = normalizeOrigin(rawApiBase);
const healthUrl = `${apiOrigin}/api/health`;
const authBaseUrl = `${apiOrigin}/api/auth`;

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

function setAuthMessage(message) {
  authMessageEl.textContent = message;
}

function setSessionState(isActive, email) {
  authStatusEl.textContent = isActive ? "Online" : "Offline";
  authUserEl.textContent = isActive && email ? email : "--";
}

function setDevLinkState(label, enabled) {
  authDevEl.textContent = label;
  authConsumeBtn.disabled = !enabled;
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

let devLink = null;

async function requestLink() {
  const email = authEmailInput.value.trim();
  if (!email || !email.includes("@")) {
    setAuthMessage("Email invalido");
    return;
  }

  authRequestBtn.disabled = true;
  setAuthMessage("Enviando link...");

  try {
    const response = await fetch(`${authBaseUrl}/request-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => null);

    if (!response.ok || !data || !data.ok) {
      const message = data?.error?.message || "Error de red";
      setAuthMessage(message);
      return;
    }

    setAuthMessage(data.data?.message || "Link enviado");
    if (data.data?.devLink) {
      devLink = data.data.devLink;
      setDevLinkState("Ready", true);
    } else {
      devLink = null;
      setDevLinkState("Not available", false);
    }
  } catch {
    setAuthMessage("Error de red");
  } finally {
    authRequestBtn.disabled = false;
  }
}

async function consumeDevLink() {
  if (!devLink) {
    setAuthMessage("Dev link no disponible");
    return;
  }

  authConsumeBtn.disabled = true;
  setAuthMessage("Consumiendo link...");

  try {
    const response = await fetch(devLink, { credentials: "include" });
    const data = await response.json().catch(() => null);

    if (!response.ok || !data || !data.ok) {
      const message = data?.error?.message || "Error de red";
      setAuthMessage(message);
      return;
    }

    setAuthMessage(data.data?.message || "Sesion activa");
    devLink = null;
    setDevLinkState("Used", false);
    await refreshSession();
  } catch {
    setAuthMessage("Error de red");
  } finally {
    authConsumeBtn.disabled = !devLink;
  }
}

async function refreshSession() {
  authRefreshBtn.disabled = true;
  setAuthMessage("Verificando sesion...");

  try {
    const response = await fetch(`${authBaseUrl}/session`, {
      credentials: "include",
    });
    const data = await response.json().catch(() => null);

    if (response.ok && data && data.ok) {
      setSessionState(true, data.data?.user?.email);
      setAuthMessage("Sesion activa");
      return;
    }

    if (response.status === 401) {
      setSessionState(false, null);
      setAuthMessage("Necesitas iniciar sesion");
      return;
    }

    const message = data?.error?.message || "Error de red";
    setAuthMessage(message);
  } catch {
    setAuthMessage("Error de red");
  } finally {
    authRefreshBtn.disabled = false;
  }
}

async function logout() {
  authLogoutBtn.disabled = true;
  setAuthMessage("Cerrando sesion...");

  try {
    const response = await fetch(`${authBaseUrl}/logout`, {
      method: "POST",
      credentials: "include",
    });
    const data = await response.json().catch(() => null);

    if (response.ok && data && data.ok) {
      setSessionState(false, null);
      setAuthMessage(data.data?.message || "Sesion cerrada");
      return;
    }

    if (response.status === 401) {
      setSessionState(false, null);
      setAuthMessage("Necesitas iniciar sesion");
      return;
    }

    const message = data?.error?.message || "Error de red";
    setAuthMessage(message);
  } catch {
    setAuthMessage("Error de red");
  } finally {
    authLogoutBtn.disabled = false;
  }
}

authRequestBtn.addEventListener("click", requestLink);
authConsumeBtn.addEventListener("click", consumeDevLink);
authRefreshBtn.addEventListener("click", refreshSession);
authLogoutBtn.addEventListener("click", logout);

loadHealth();
refreshSession();
