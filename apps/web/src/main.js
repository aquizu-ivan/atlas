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
const servicesRetryBtn = document.querySelector("[data-services-retry]");
const bookingDateEl = document.querySelector("[data-booking-date]");
const availabilityStateEl = document.querySelector("[data-availability-state]");
const availabilitySlotsEl = document.querySelector("[data-availability-slots]");
const availabilityRetryBtn = document.querySelector("[data-availability-retry]");
const bookingSummaryEl = document.querySelector("[data-booking-summary]");
const bookingConfirmBtn = document.querySelector("[data-booking-confirm]");
const bookingMessageEl = document.querySelector("[data-booking-message]");
const bookingConfirmationEl = document.querySelector("[data-booking-confirmation]");
const bookingsStateEl = document.querySelector("[data-bookings-state]");
const bookingsCtaEl = document.querySelector("[data-bookings-cta]");
const bookingsListEl = document.querySelector("[data-bookings-list]");
const bookingsRetryBtn = document.querySelector("[data-bookings-retry]");
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

function setButtonLoading(button, isLoading) {
  if (!button) return;
  if (isLoading) {
    button.dataset.loading = "true";
  } else {
    delete button.dataset.loading;
  }
}

function toggleRetry(button, show) {
  if (!button) return;
  button.hidden = !show;
  button.disabled = !show;
}

function resetBookingsCta() {
  bookingsCtaEl.textContent = "--";
  bookingsCtaEl.innerHTML = "";
  bookingsCtaEl.textContent = "--";
}

function setBookingsCta(message, showLink) {
  bookingsCtaEl.innerHTML = "";
  if (!message && !showLink) {
    bookingsCtaEl.textContent = "--";
    return;
  }
  if (message) {
    bookingsCtaEl.append(document.createTextNode(message));
  }
  if (showLink) {
    if (message) {
      bookingsCtaEl.append(document.createTextNode(" "));
    }
    const link = document.createElement("a");
    link.href = "#auth-panel";
    link.className = "link";
    link.textContent = "Iniciar sesion";
    bookingsCtaEl.append(link);
  }
}

function setBookingSummary(message) {
  bookingSummaryEl.textContent = message;
}

function setBookingConfirmation(message) {
  bookingConfirmationEl.textContent = message;
}

function formatStatus(status) {
  if (!status) return "pending";
  const normalized = String(status).toUpperCase();
  if (normalized === "CONFIRMED") return "Confirmada";
  if (normalized === "CANCELED") return "Cancelada";
  if (normalized === "PENDING") return "Pendiente";
  return normalized;
}

function describeError(response, data) {
  if (!response) {
    return "No se pudo conectar";
  }
  if (response.status === 400) {
    const detail = data?.error?.message;
    if (!detail) {
      return "Datos invalidos";
    }
    const humanDetail = String(detail)
      .replace("StartAt outside availability", "Horario fuera de disponibilidad")
      .replace("Invalid startAt", "Fecha invalida")
      .replace("Invalid date", "Fecha invalida")
      .replace("Missing required fields", "Faltan datos")
      .replace("Missing required query params", "Faltan datos");
    return `Datos invalidos: ${humanDetail}`;
  }
  if (response.status === 401) {
    return "Necesitas iniciar sesion";
  }
  if (response.status === 404) {
    return "Not found";
  }
  if (response.status === 409) {
    return "Ese horario ya no esta disponible.";
  }
  if (response.status >= 500) {
    return "No se pudo conectar";
  }
  return data?.error?.message || "Request error";
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

function calculateEndAt(startAt, durationMin) {
  const startDate = new Date(startAt);
  if (Number.isNaN(startDate.getTime())) {
    return null;
  }
  const duration = Number(durationMin) || 0;
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
  return endDate.toISOString();
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
let selectedService = null;
let selectedSlot = "";
let selectedDate = "";

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
  setServicesState("Cargando...");
  servicesEmptyEl.textContent = "--";
  servicesSelectEl.disabled = true;
  servicesSelectEl.innerHTML = "<option value=\"\">Selecciona un servicio</option>";
  servicesCache = [];
  selectedServiceId = "";
  selectedService = null;
  selectedSlot = "";
  selectedDate = "";
  bookingDateEl.value = "";
  bookingDateEl.disabled = true;
  setBookingSummary("Selecciona un horario");
  setBookingMessage("--");
  setBookingConfirmation("--");
  toggleRetry(servicesRetryBtn, false);

  try {
    const response = await fetch(apiEndpoint("/services"));
    const data = await response.json().catch(() => null);

    if (response.status === 404) {
      setServicesState("Not available yet");
      servicesEmptyEl.textContent = "Servicios no disponibles";
      return;
    }
    if (!response.ok) {
      setServicesState("No se pudo conectar");
      toggleRetry(servicesRetryBtn, true);
      return;
    }

    const services = parseServicesPayload(data);
    if (!Array.isArray(services) || services.length === 0) {
      setServicesState("Sin servicios");
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
    servicesEmptyEl.textContent = "Selecciona un servicio";
    setServicesState("Listo");
  } catch {
    setServicesState("No se pudo conectar");
    toggleRetry(servicesRetryBtn, true);
  }
}

function clearAvailability() {
  availabilitySlotsEl.innerHTML = "";
  setAvailabilityState("--");
  setBookingMessage("--");
  setBookingSummary("Selecciona un horario");
  setBookingConfirmation("--");
  selectedSlot = "";
  bookingConfirmBtn.disabled = true;
  toggleRetry(availabilityRetryBtn, false);
}

async function loadAvailability() {
  const date = bookingDateEl.value;
  selectedDate = date;
  if (!selectedServiceId || !selectedDate) {
    setAvailabilityState("Selecciona servicio y fecha");
    availabilitySlotsEl.innerHTML = "";
    return;
  }

  setAvailabilityState("Cargando...");
  setBookingMessage("--");
  setBookingConfirmation("--");
  availabilitySlotsEl.innerHTML = "";
  selectedSlot = "";
  bookingConfirmBtn.disabled = true;
  updateBookingSummary();
  toggleRetry(availabilityRetryBtn, false);

  const query = new URLSearchParams({
    serviceId: selectedServiceId,
    date: selectedDate,
  }).toString();

  try {
    const response = await fetch(`${apiEndpoint("/availability")}?${query}`);
    const data = await response.json().catch(() => null);

    if (response.status === 404) {
      setAvailabilityState("Not available yet");
      return;
    }
    if (!response.ok) {
      const message = describeError(response, data);
      setAvailabilityState(message);
      if (response.status >= 500) {
        toggleRetry(availabilityRetryBtn, true);
      }
      return;
    }

    const slots = parseSlotsPayload(data);
    if (!Array.isArray(slots) || slots.length === 0) {
      setAvailabilityState("Sin horarios disponibles");
      return;
    }

    setAvailabilityState("Listo");
    for (const slot of slots) {
      const startAt = slot.startAt || slot;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button ghost slot-button";
      button.textContent = formatSlotLabel(startAt);
      button.addEventListener("click", () => selectSlot(startAt, button));
      availabilitySlotsEl.append(button);
    }
  } catch {
    setAvailabilityState("No se pudo conectar");
    toggleRetry(availabilityRetryBtn, true);
  }
}

function updateBookingSummary() {
  const serviceName = selectedService?.name || "Servicio";
  if (!selectedServiceId || !selectedDate) {
    setBookingSummary("Selecciona un horario");
    return;
  }
  if (!selectedSlot) {
    setBookingSummary(`${serviceName} - ${selectedDate}`);
    return;
  }
  setBookingSummary(`${serviceName} - ${formatSlotLabel(selectedSlot)}`);
}

function selectSlot(startAt, button) {
  selectedSlot = startAt;
  const buttons = availabilitySlotsEl.querySelectorAll("button");
  buttons.forEach((slotButton) => {
    slotButton.classList.toggle("is-selected", slotButton === button);
  });
  updateBookingSummary();
  bookingConfirmBtn.disabled = false;
}

async function createBooking() {
  if (!selectedServiceId || !selectedSlot) {
    setBookingMessage("Datos invalidos");
    return;
  }

  setBookingMessage("Reservando...");
  setBookingConfirmation("--");
  const buttons = availabilitySlotsEl.querySelectorAll("button");
  buttons.forEach((button) => { button.disabled = true; });
  bookingConfirmBtn.disabled = true;
  setButtonLoading(bookingConfirmBtn, true);

  try {
    const response = await fetch(apiEndpoint("/bookings"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        serviceId: selectedServiceId,
        startAt: selectedSlot,
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
      const message = describeError(response, data);
      setBookingMessage(message);
      return;
    }

    setBookingMessage("Reserva creada.");
    const booking = data?.data?.booking;
    if (booking) {
      const serviceName = selectedService?.name || "Servicio";
      const endAt = calculateEndAt(booking.startAt, selectedService?.durationMin);
      const statusLabel = formatStatus(booking.status);
      const confirmationParts = [
        `ID: ${booking.id}`,
        `Servicio: ${serviceName}`,
        `Inicio: ${formatSlotLabel(booking.startAt)}`,
      ];
      if (endAt) {
        confirmationParts.push(`Fin: ${formatSlotLabel(endAt)}`);
      }
      confirmationParts.push(`Estado: ${statusLabel}`);
      setBookingConfirmation(confirmationParts.join(" - "));
    }
    await loadBookings();
    await loadAvailability();
    selectedSlot = "";
    bookingConfirmBtn.disabled = true;
  } catch {
    setBookingMessage("No se pudo conectar");
  } finally {
    buttons.forEach((button) => { button.disabled = false; });
    setButtonLoading(bookingConfirmBtn, false);
    bookingConfirmBtn.disabled = !selectedSlot;
  }
}

async function loadBookings() {
  setBookingsState("Cargando...");
  bookingsListEl.innerHTML = "";
  setBookingsCta(null, false);
  toggleRetry(bookingsRetryBtn, false);

  try {
    const response = await fetch(apiEndpoint("/bookings/me"), {
      credentials: "include",
    });
    const data = await response.json().catch(() => null);

    if (response.status === 401) {
      setBookingsState("Necesitas iniciar sesion");
      setBookingsCta("Para ver tus reservas,", true);
      toggleRetry(bookingsRetryBtn, true);
      return;
    }
    if (response.status === 404) {
      setBookingsState("Not available yet");
      return;
    }
    if (!response.ok) {
      setBookingsState(describeError(response, data));
      if (response.status >= 500) {
        toggleRetry(bookingsRetryBtn, true);
      }
      return;
    }

    const bookings = parseBookingsPayload(data);
    if (!Array.isArray(bookings) || bookings.length === 0) {
      setBookingsState("Sin reservas");
      setBookingsCta("Crea tu primera reserva.", false);
      return;
    }

    setBookingsState("Listo");
    for (const booking of bookings) {
      const item = document.createElement("div");
      item.className = "booking-item";

      const title = document.createElement("div");
      title.className = "value";
      title.textContent = formatSlotLabel(booking.startAt);

      const meta = document.createElement("div");
      meta.className = "booking-meta";
      const status = formatStatus(booking.status);
      const serviceName = booking.service?.name ? ` - ${booking.service.name}` : "";
      meta.textContent = `${status}${serviceName}`;

      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "button ghost";
      cancel.textContent = booking.status === "CANCELED" ? "Cancelada" : "Cancelar";
      cancel.disabled = booking.status === "CANCELED";
      cancel.addEventListener("click", () => cancelBooking(booking.id));

      item.append(title, meta, cancel);
      bookingsListEl.append(item);
    }
  } catch {
    setBookingsState("No se pudo conectar");
    toggleRetry(bookingsRetryBtn, true);
  }
}

async function cancelBooking(bookingId) {
  if (!bookingId) {
    setBookingsState("Datos invalidos");
    return;
  }

  setBookingsState("Cancelando...");
  setBookingsCta(null, false);
  toggleRetry(bookingsRetryBtn, false);
  try {
    const response = await fetch(apiEndpoint(`/bookings/${bookingId}/cancel`), {
      method: "POST",
      credentials: "include",
    });
    const data = await response.json().catch(() => null);

    if (response.status === 401) {
      setBookingsState("Necesitas iniciar sesion");
      setBookingsCta("Para cancelar,", true);
      toggleRetry(bookingsRetryBtn, true);
      return;
    }
    if (response.status === 404) {
      setBookingsState("Not found");
      return;
    }
    if (!response.ok || !data || !data.ok) {
      setBookingsState(describeError(response, data));
      if (response.status >= 500) {
        toggleRetry(bookingsRetryBtn, true);
      }
      return;
    }

    setBookingsState("Reserva cancelada");
    await loadBookings();
  } catch {
    setBookingsState("No se pudo conectar");
    toggleRetry(bookingsRetryBtn, true);
  }
}

authRequestBtn.addEventListener("click", requestLink);
authConsumeBtn.addEventListener("click", consumeDevLink);
authRefreshBtn.addEventListener("click", refreshSession);
authLogoutBtn.addEventListener("click", logout);
bookingConfirmBtn.addEventListener("click", createBooking);
servicesRetryBtn.addEventListener("click", loadServices);
availabilityRetryBtn.addEventListener("click", loadAvailability);
bookingsRetryBtn.addEventListener("click", loadBookings);
servicesSelectEl.addEventListener("change", (event) => {
  selectedServiceId = event.target.value;
  selectedService = servicesCache.find((service) => service.id === selectedServiceId) || null;
  bookingDateEl.disabled = !selectedServiceId;
  clearAvailability();
  updateBookingSummary();
  if (selectedServiceId && bookingDateEl.value) {
    loadAvailability();
  }
});
bookingDateEl.addEventListener("change", () => {
  updateBookingSummary();
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
setServicesState("Cargando...");
setBookingsState("Cargando...");

const authQuery = handleAuthQuery();
loadHealth();
if (authQuery === "success" || !authQuery) {
  refreshSession();
}
loadServices();
loadBookings();
