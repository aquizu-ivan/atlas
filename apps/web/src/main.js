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
const authHelperEl = document.querySelector("[data-auth-helper]");
const authHelperExtraEl = document.querySelector("[data-auth-helper-extra]");
const authConsumeBtn = document.querySelector("[data-auth-consume]");
const authRefreshBtn = document.querySelector("[data-auth-refresh]");
const authLogoutBtn = document.querySelector("[data-auth-logout]");
const servicesStateEl = document.querySelector("[data-services-state]");
const servicesSelectEl = document.querySelector("[data-services-select]");
const servicesEmptyEl = document.querySelector("[data-services-empty]");
const bookingDateEl = document.querySelector("[data-booking-date]");
const availabilityStateEl = document.querySelector("[data-availability-state]");
const availabilitySlotsEl = document.querySelector("[data-availability-slots]");
const bookingMessageEl = document.querySelector("[data-booking-message]");
const bookingsStateEl = document.querySelector("[data-bookings-state]");
const bookingsListEl = document.querySelector("[data-bookings-list]");
const isProduction = import.meta.env.MODE === "production";

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
const apiBaseUrl = `${apiOrigin}/api`;

apiEl.textContent = healthUrl;

function apiEndpoint(path) {
  if (!path) return apiBaseUrl;
  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

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

function setHelperMessage(message) {
  authHelperEl.textContent = message;
}

function setDevLinkState(enabled) {
  if (isProduction) {
    authConsumeBtn.hidden = true;
    authHelperExtraEl.textContent = "";
    authHelperExtraEl.style.display = "none";
    return;
  }

  authConsumeBtn.hidden = false;
  authConsumeBtn.disabled = !enabled;
  authHelperExtraEl.textContent = enabled ? "Dev link listo." : "Solo en dev/test.";
  authHelperExtraEl.style.display = "block";
}

function setServicesState(message) {
  servicesStateEl.textContent = message;
}

function setAvailabilityState(message) {
  availabilityStateEl.textContent = message;
}

function setBookingMessage(message) {
  bookingMessageEl.textContent = message;
}

function setBookingsState(message) {
  bookingsStateEl.textContent = message;
}

function formatSlotLabel(iso) {
  if (!iso || typeof iso !== "string") {
    return "--";
  }
  const trimmed = iso.replace("Z", "");
  if (trimmed.includes("T")) {
    return trimmed.replace("T", " ").slice(0, 16);
  }
  return trimmed;
}

function parseServicesPayload(data) {
  return data?.data?.services || data?.services || [];
}

function parseSlotsPayload(data) {
  return data?.data?.slots || data?.slots || [];
}

function parseBookingsPayload(data) {
  return data?.data?.bookings || data?.bookings || [];
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
let servicesCache = [];
let selectedServiceId = "";

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

    setAuthMessage("Revisa tu email y abre el link para iniciar sesion.");
    setHelperMessage("El link llega por email. Abrelo para iniciar sesion.");
    if (data.data?.devLink) {
      devLink = data.data.devLink;
      setDevLinkState(true);
    } else {
      devLink = null;
      setDevLinkState(false);
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
    setDevLinkState(false);
    await refreshSession();
  } catch {
    setAuthMessage("Error de red");
  } finally {
    if (!isProduction) {
      authConsumeBtn.disabled = !devLink;
    }
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

async function loadServices() {
  setServicesState("Loading...");
  servicesEmptyEl.textContent = "--";
  servicesSelectEl.disabled = true;
  servicesSelectEl.innerHTML = "<option value=\"\">Selecciona un servicio</option>";
  servicesCache = [];

  try {
    const response = await fetch(apiEndpoint("/services"));
    const data = await response.json().catch(() => null);

    if (response.status === 404) {
      setServicesState("Not available yet");
      servicesEmptyEl.textContent = "Servicios no disponibles";
      return;
    }
    if (!response.ok) {
      setServicesState("Service error");
      return;
    }

    const services = parseServicesPayload(data);
    if (!Array.isArray(services) || services.length === 0) {
      setServicesState("Empty");
      servicesEmptyEl.textContent = "Sin servicios";
      return;
    }

    servicesCache = services;
    for (const service of services) {
      const option = document.createElement("option");
      option.value = service.id;
      option.textContent = service.name || "Servicio";
      servicesSelectEl.append(option);
    }
    servicesSelectEl.disabled = false;
    setServicesState("Ready");
  } catch {
    setServicesState("Network error");
  }
}

function clearAvailability() {
  availabilitySlotsEl.innerHTML = "";
  setAvailabilityState("--");
  setBookingMessage("--");
}

async function loadAvailability() {
  const date = bookingDateEl.value;
  if (!selectedServiceId || !date) {
    setAvailabilityState("Selecciona servicio y fecha");
    availabilitySlotsEl.innerHTML = "";
    return;
  }

  setAvailabilityState("Loading...");
  setBookingMessage("--");
  availabilitySlotsEl.innerHTML = "";

  const query = new URLSearchParams({
    serviceId: selectedServiceId,
    date,
  }).toString();

  try {
    const response = await fetch(`${apiEndpoint("/availability")}?${query}`);
    const data = await response.json().catch(() => null);

    if (response.status === 404) {
      setAvailabilityState("Not available yet");
      return;
    }
    if (!response.ok) {
      setAvailabilityState("Service error");
      return;
    }

    const slots = parseSlotsPayload(data);
    if (!Array.isArray(slots) || slots.length === 0) {
      setAvailabilityState("Empty");
      return;
    }

    setAvailabilityState("Ready");
    for (const slot of slots) {
      const startAt = slot.startAt || slot;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button ghost slot-button";
      button.textContent = formatSlotLabel(startAt);
      button.addEventListener("click", () => createBooking(startAt));
      availabilitySlotsEl.append(button);
    }
  } catch {
    setAvailabilityState("Network error");
  }
}

async function createBooking(startAt) {
  if (!selectedServiceId || !startAt) {
    setBookingMessage("Request error");
    return;
  }

  setBookingMessage("Reservando...");
  const buttons = availabilitySlotsEl.querySelectorAll("button");
  buttons.forEach((button) => { button.disabled = true; });

  try {
    const response = await fetch(apiEndpoint("/bookings"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        serviceId: selectedServiceId,
        startAt,
      }),
    });
    const data = await response.json().catch(() => null);

    if (response.status === 401) {
      setBookingMessage("Necesitas iniciar sesion. Usa el panel Auth.");
      return;
    }
    if (response.status === 409) {
      setBookingMessage("Ese horario ya no esta disponible.");
      return;
    }
    if (response.status === 404) {
      setBookingMessage("Not available yet");
      return;
    }
    if (!response.ok || !data || !data.ok) {
      const message = data?.error?.message || "Service error";
      setBookingMessage(message);
      return;
    }

    setBookingMessage("Reserva creada.");
    await loadBookings();
    await loadAvailability();
  } catch {
    setBookingMessage("Network error");
  } finally {
    buttons.forEach((button) => { button.disabled = false; });
  }
}

async function loadBookings() {
  setBookingsState("Loading...");
  bookingsListEl.innerHTML = "";

  try {
    const response = await fetch(apiEndpoint("/bookings/me"), {
      credentials: "include",
    });
    const data = await response.json().catch(() => null);

    if (response.status === 401) {
      setBookingsState("Necesitas iniciar sesion");
      return;
    }
    if (response.status === 404) {
      setBookingsState("Not available yet");
      return;
    }
    if (!response.ok) {
      setBookingsState("Service error");
      return;
    }

    const bookings = parseBookingsPayload(data);
    if (!Array.isArray(bookings) || bookings.length === 0) {
      setBookingsState("Empty");
      return;
    }

    setBookingsState("Ready");
    for (const booking of bookings) {
      const item = document.createElement("div");
      item.className = "booking-item";

      const title = document.createElement("div");
      title.className = "value";
      title.textContent = formatSlotLabel(booking.startAt);

      const meta = document.createElement("div");
      meta.className = "booking-meta";
      const status = booking.status || "unknown";
      const serviceName = booking.service?.name ? ` · ${booking.service.name}` : "";
      meta.textContent = `${status}${serviceName}`;

      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "button ghost";
      cancel.textContent = "Cancelar";
      cancel.addEventListener("click", () => cancelBooking(booking.id));

      item.append(title, meta, cancel);
      bookingsListEl.append(item);
    }
  } catch {
    setBookingsState("Network error");
  }
}

async function cancelBooking(bookingId) {
  if (!bookingId) {
    setBookingsState("Request error");
    return;
  }

  setBookingsState("Cancelando...");
  try {
    const response = await fetch(apiEndpoint(`/bookings/${bookingId}/cancel`), {
      method: "POST",
      credentials: "include",
    });
    const data = await response.json().catch(() => null);

    if (response.status === 401) {
      setBookingsState("Necesitas iniciar sesion");
      return;
    }
    if (response.status === 404) {
      setBookingsState("Not available yet");
      return;
    }
    if (!response.ok || !data || !data.ok) {
      const message = data?.error?.message || "Service error";
      setBookingsState(message);
      return;
    }

    setBookingsState("Reserva cancelada");
    await loadBookings();
  } catch {
    setBookingsState("Network error");
  }
}

authRequestBtn.addEventListener("click", requestLink);
authConsumeBtn.addEventListener("click", consumeDevLink);
authRefreshBtn.addEventListener("click", refreshSession);
authLogoutBtn.addEventListener("click", logout);
servicesSelectEl.addEventListener("change", (event) => {
  selectedServiceId = event.target.value;
  bookingDateEl.disabled = !selectedServiceId;
  clearAvailability();
  if (selectedServiceId && bookingDateEl.value) {
    loadAvailability();
  }
});
bookingDateEl.addEventListener("change", () => {
  loadAvailability();
});

function handleAuthQuery() {
  const params = new URLSearchParams(window.location.search);
  const auth = params.get("auth");
  if (!auth) {
    return null;
  }

  if (auth === "success") {
    setAuthMessage("Sesion activa");
    setHelperMessage("Ya puedes usar tu sesion.");
  } else if (auth === "error") {
    setAuthMessage("No pudimos iniciar sesion.");
    setHelperMessage("El link puede estar expirado o invalido.");
    setSessionState(false, null);
  }

  params.delete("auth");
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
  return auth;
}

setHelperMessage("Usa tu email para recibir un link.");
setDevLinkState(false);
clearAvailability();
setServicesState("Loading...");
setBookingsState("Loading...");

const authQuery = handleAuthQuery();
loadHealth();
if (authQuery === "success" || !authQuery) {
  refreshSession();
}
loadServices();
loadBookings();
