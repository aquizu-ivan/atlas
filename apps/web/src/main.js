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
const authDevLinkWrap = document.querySelector("[data-auth-devlink]");
const authDevLinkInput = document.querySelector("[data-auth-devlink-input]");
const authDevLinkCopyBtn = document.querySelector("[data-auth-devlink-copy]");
const authDevLinkOpenBtn = document.querySelector("[data-auth-devlink-open]");
const authRefreshBtn = document.querySelector("[data-auth-refresh]");
const authLogoutBtn = document.querySelector("[data-auth-logout]");
const servicesStateEl = document.querySelector("[data-services-state]");
const servicesSelectEl = document.querySelector("[data-services-select]");
const servicesEmptyEl = document.querySelector("[data-services-empty]");
const servicesRetryBtn = document.querySelector("[data-services-retry]");
const bookingDateEl = document.querySelector("[data-booking-date]");
const dateTodayBtn = document.querySelector("[data-date-today]");
const dateTomorrowBtn = document.querySelector("[data-date-tomorrow]");
const dateWeekBtn = document.querySelector("[data-date-week]");
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

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

function slugify(value) {
  return normalizeKey(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day;
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readBookingQuery() {
  const params = new URLSearchParams(window.location.search);
  const rawService = params.get("service");
  const rawDate = params.get("date");
  return {
    serviceKey: normalizeKey(rawService),
    date: isValidDateString(rawDate) ? rawDate : "",
  };
}

const apiOrigin = normalizeOrigin(rawApiBase);
const healthUrl = `${apiOrigin}/api/health`;
const authBaseUrl = `${apiOrigin}/api/auth`;
const apiBaseUrl = `${apiOrigin}/api`;
const devTokenStorageKey = "atlas_dev_token";

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

function setDevLinkState(link) {
  const enabled = Boolean(link);
  if (authDevLinkWrap) {
    authDevLinkWrap.hidden = !enabled;
  }
  if (authDevLinkInput) {
    authDevLinkInput.value = enabled ? link : "";
  }
  if (authDevLinkCopyBtn) {
    authDevLinkCopyBtn.disabled = !enabled;
  }
  if (authDevLinkOpenBtn) {
    authDevLinkOpenBtn.disabled = !enabled;
  }
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

function setConfirmLabel() {
  bookingConfirmBtn.textContent = rescheduleContext ? "Confirmar reprogramacion" : "Confirmar reserva";
}

function getStoredDevToken() {
  try {
    return sessionStorage.getItem(devTokenStorageKey) || "";
  } catch {
    return "";
  }
}

function setStoredDevToken(token) {
  try {
    if (!token) {
      sessionStorage.removeItem(devTokenStorageKey);
      return;
    }
    sessionStorage.setItem(devTokenStorageKey, token);
  } catch {
    // Ignore storage errors.
  }
}

function buildAuthHeaders(headers = {}) {
  const token = getStoredDevToken();
  if (!token) {
    return headers;
  }
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

function authFetch(url, options = {}) {
  const headers = buildAuthHeaders(options.headers || {});
  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
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

function matchesServiceParam(service, key) {
  if (!service || !key) {
    return false;
  }
  const normalizedKey = normalizeKey(key);
  if (!normalizedKey) {
    return false;
  }
  const idRaw = normalizeKey(service.id);
  const shortId = idRaw.startsWith("svc_") ? idRaw.slice(4) : idRaw;
  const nameSlug = slugify(service.name || "");
  const idSlug = slugify(service.id || "");
  return normalizedKey === idRaw
    || normalizedKey === shortId
    || normalizedKey === nameSlug
    || normalizedKey === idSlug;
}

function serviceParamValue(service) {
  if (!service) {
    return "";
  }
  const idRaw = normalizeKey(service.id);
  if (idRaw.startsWith("svc_")) {
    return idRaw.slice(4);
  }
  const nameSlug = slugify(service.name || "");
  return nameSlug || service.id || "";
}

function updateBookingQuery() {
  const params = new URLSearchParams(window.location.search);
  const serviceValue = selectedService ? serviceParamValue(selectedService) : "";
  if (serviceValue) {
    params.set("service", serviceValue);
  } else {
    params.delete("service");
  }
  const dateValue = bookingDateEl.value;
  if (isValidDateString(dateValue)) {
    params.set("date", dateValue);
  } else {
    params.delete("date");
  }
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
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
let rescheduleContext = null;
const initialBookingQuery = readBookingQuery();

async function requestLink() {
  const email = authEmailInput.value.trim();
  if (!email || !email.includes("@")) {
    setAuthMessage("Email invalido");
    return;
  }

  authRequestBtn.disabled = true;
  setAuthMessage("Enviando link...");
  devLink = null;
  setDevLinkState(null);

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
    devLink = data?.data?.devLink
      || data?.data?.dev_link
      || data?.devLink
      || data?.dev_link
      || null;
    setDevLinkState(devLink);
  } catch {
    setAuthMessage("Error de red");
  } finally {
    authRequestBtn.disabled = false;
  }
}

async function copyDevLink() {
  if (!devLink) {
    setAuthMessage("Dev link no disponible");
    return;
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(devLink);
      setAuthMessage("Link copiado.");
      return;
    }
    if (authDevLinkInput) {
      authDevLinkInput.focus();
      authDevLinkInput.select();
      const copied = document.execCommand("copy");
      setAuthMessage(copied ? "Link copiado." : "No se pudo copiar.");
      return;
    }
    setAuthMessage("No se pudo copiar.");
  } catch {
    setAuthMessage("No se pudo copiar.");
  }
}

function openDevLink() {
  if (!devLink) {
    setAuthMessage("Dev link no disponible");
    return;
  }
  setAuthMessage("Abriendo link...");
  window.location.assign(devLink);
}

async function refreshSession() {
  authRefreshBtn.disabled = true;
  setAuthMessage("Verificando sesion...");

  try {
    const response = await authFetch(`${authBaseUrl}/session`);
    const data = await response.json().catch(() => null);

    if (response.ok && data && data.ok) {
      setSessionState(true, data.data?.user?.email);
      setAuthMessage("Sesion activa");
      return;
    }

    if (response.status === 401) {
      setStoredDevToken("");
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
    const response = await authFetch(`${authBaseUrl}/logout`, {
      method: "POST",
    });
    const data = await response.json().catch(() => null);

    if (response.ok && data && data.ok) {
      setStoredDevToken("");
      setSessionState(false, null);
      setAuthMessage(data.data?.message || "Sesion cerrada");
      return;
    }

    if (response.status === 401) {
      setStoredDevToken("");
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

    if (initialBookingQuery.serviceKey) {
      const match = servicesCache.find((service) => matchesServiceParam(service, initialBookingQuery.serviceKey));
      if (match) {
        selectedServiceId = match.id;
        selectedService = match;
        servicesSelectEl.value = match.id;
        bookingDateEl.disabled = false;
      }
    }

    if (initialBookingQuery.date) {
      bookingDateEl.value = initialBookingQuery.date;
      selectedDate = initialBookingQuery.date;
      updateBookingSummary();
      if (selectedServiceId) {
        loadAvailability();
      }
    }
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
  setConfirmLabel();
  bookingConfirmBtn.disabled = true;
  toggleRetry(availabilityRetryBtn, false);
}

function applyDatePreset(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const value = formatDateInput(date);
  bookingDateEl.value = value;
  selectedDate = value;
  updateBookingSummary();
  updateBookingQuery();
  loadAvailability();
}

function normalizeIso(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString();
}

function ensureServiceOption(service) {
  if (!service || !servicesSelectEl) {
    return;
  }
  const existingOption = servicesSelectEl.querySelector(`option[value="${service.id}"]`);
  if (existingOption) {
    existingOption.textContent = service.name || existingOption.textContent;
    return;
  }
  const option = document.createElement("option");
  option.value = service.id;
  option.textContent = service.name || "Servicio";
  servicesSelectEl.append(option);
}

function startReschedule(booking) {
  if (!booking || booking.status === "CANCELED") {
    return;
  }
  rescheduleContext = {
    bookingId: booking.id,
    serviceId: booking.serviceId,
    startAt: normalizeIso(booking.startAt),
    serviceName: booking.service?.name || "Servicio",
    durationMin: booking.service?.durationMinutes || 0,
  };
  selectedServiceId = booking.serviceId;
  const cached = servicesCache.find((service) => service.id === booking.serviceId);
  selectedService = cached || {
    id: booking.serviceId,
    name: booking.service?.name || "Servicio",
    durationMin: booking.service?.durationMinutes || 0,
  };
  if (!cached) {
    ensureServiceOption(selectedService);
  }
  servicesSelectEl.value = booking.serviceId;
  servicesSelectEl.disabled = true;
  bookingDateEl.disabled = false;
  const baseDate = normalizeIso(booking.startAt);
  if (baseDate) {
    bookingDateEl.value = baseDate.slice(0, 10);
    selectedDate = bookingDateEl.value;
  }
  clearAvailability();
  updateBookingSummary();
  updateBookingQuery();
  setBookingMessage("Selecciona un nuevo horario para reprogramar.");
  setConfirmLabel();
  loadAvailability();
  const bookingPanel = document.getElementById("booking-panel");
  if (bookingPanel && bookingPanel.scrollIntoView) {
    bookingPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function resetReschedule() {
  rescheduleContext = null;
  servicesSelectEl.disabled = !selectedServiceId;
  setConfirmLabel();
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
    if (rescheduleContext) {
      setBookingSummary(`Reprogramar: ${serviceName} - ${selectedDate}`);
    } else {
      setBookingSummary(`${serviceName} - ${selectedDate}`);
    }
    return;
  }
  if (rescheduleContext) {
    setBookingSummary(`Reprogramar: ${serviceName} - ${formatSlotLabel(selectedSlot)}`);
  } else {
    setBookingSummary(`${serviceName} - ${formatSlotLabel(selectedSlot)}`);
  }
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

  const isReschedule = Boolean(rescheduleContext);
  if (isReschedule) {
    const original = rescheduleContext.startAt;
    const next = normalizeIso(selectedSlot);
    if (original && next && original === next) {
      setBookingMessage("Elige un horario distinto.");
      return;
    }
  }

  setBookingMessage(isReschedule ? "Reprogramando..." : "Reservando...");
  setBookingConfirmation("--");
  const buttons = availabilitySlotsEl.querySelectorAll("button");
  buttons.forEach((button) => { button.disabled = true; });
  bookingConfirmBtn.disabled = true;
  setButtonLoading(bookingConfirmBtn, true);

  try {
    const response = await authFetch(apiEndpoint("/bookings"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    if (isReschedule) {
      setBookingMessage("Procesando reprogramacion...");
    } else {
      setBookingMessage("Reserva creada.");
    }
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

    if (!isReschedule) {
      await loadBookings();
      await loadAvailability();
      selectedSlot = "";
      bookingConfirmBtn.disabled = true;
      return;
    }

    const originalId = rescheduleContext?.bookingId;
    if (!originalId) {
      resetReschedule();
      await loadBookings();
      await loadAvailability();
      selectedSlot = "";
      bookingConfirmBtn.disabled = true;
      return;
    }

    const cancelRes = await authFetch(apiEndpoint(`/bookings/${originalId}/cancel`), {
      method: "POST",
    });
    if (!cancelRes.ok) {
      if (booking?.id) {
        await authFetch(apiEndpoint(`/bookings/${booking.id}/cancel`), { method: "POST" });
      }
      setBookingMessage("No pudimos reprogramar. Intenta de nuevo.");
      setBookingConfirmation("--");
      return;
    }

    setBookingMessage("Reserva reprogramada.");
    resetReschedule();
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
    const response = await authFetch(apiEndpoint("/bookings/me"));
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

      const actions = document.createElement("div");
      actions.className = "booking-actions";

      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "button ghost";
      cancel.textContent = booking.status === "CANCELED" ? "Cancelada" : "Cancelar";
      cancel.disabled = booking.status === "CANCELED";
      cancel.addEventListener("click", () => cancelBooking(booking.id));
      actions.append(cancel);

      if (booking.status !== "CANCELED") {
        const reschedule = document.createElement("button");
        reschedule.type = "button";
        reschedule.className = "button ghost";
        reschedule.textContent = "Reprogramar";
        reschedule.addEventListener("click", () => startReschedule(booking));
        actions.append(reschedule);
      }

      item.append(title, meta, actions);
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
    const response = await authFetch(apiEndpoint(`/bookings/${bookingId}/cancel`), {
      method: "POST",
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
authDevLinkCopyBtn.addEventListener("click", copyDevLink);
authDevLinkOpenBtn.addEventListener("click", openDevLink);
authRefreshBtn.addEventListener("click", refreshSession);
authLogoutBtn.addEventListener("click", logout);
bookingConfirmBtn.addEventListener("click", createBooking);
dateTodayBtn.addEventListener("click", () => applyDatePreset(0));
dateTomorrowBtn.addEventListener("click", () => applyDatePreset(1));
dateWeekBtn.addEventListener("click", () => applyDatePreset(7));
servicesRetryBtn.addEventListener("click", loadServices);
availabilityRetryBtn.addEventListener("click", loadAvailability);
bookingsRetryBtn.addEventListener("click", loadBookings);
servicesSelectEl.addEventListener("change", (event) => {
  if (rescheduleContext) {
    setBookingMessage("Elige un nuevo horario para reprogramar.");
    return;
  }
  selectedServiceId = event.target.value;
  selectedService = servicesCache.find((service) => service.id === selectedServiceId) || null;
  bookingDateEl.disabled = !selectedServiceId;
  clearAvailability();
  updateBookingSummary();
  updateBookingQuery();
  if (selectedServiceId && bookingDateEl.value) {
    loadAvailability();
  }
});
bookingDateEl.addEventListener("change", () => {
  updateBookingSummary();
  updateBookingQuery();
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

function handleAuthHash() {
  const rawHash = window.location.hash.replace(/^#/, "");
  if (!rawHash) {
    return null;
  }

  const params = new URLSearchParams(rawHash);
  const auth = params.get("auth");
  const devToken = params.get("devToken");

  if (devToken) {
    setStoredDevToken(devToken);
    setAuthMessage("Sesion activada (DEV)");
    setHelperMessage("Ya puedes usar tu sesion.");
  }

  if (auth === "success" && !devToken) {
    setAuthMessage("Sesion activa");
    setHelperMessage("Ya puedes usar tu sesion.");
  } else if (auth === "error") {
    setStoredDevToken("");
    setAuthMessage("No pudimos iniciar sesion.");
    setHelperMessage("El link puede estar expirado o invalido.");
    setSessionState(false, null);
  }

  params.delete("auth");
  params.delete("devToken");
  const nextHash = params.toString();
  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash ? `#${nextHash}` : ""}`;
  window.history.replaceState({}, "", nextUrl);
  return auth || (devToken ? "success" : null);
}

setHelperMessage("Usa tu email para recibir un link.");
setDevLinkState(null);
clearAvailability();
setServicesState("Cargando...");
setBookingsState("Cargando...");
setConfirmLabel();

const authHash = handleAuthHash();
const authQuery = authHash ? null : handleAuthQuery();
loadHealth();
if (authHash === "success" || authQuery === "success" || (!authHash && !authQuery)) {
  refreshSession();
}
loadServices();
loadBookings();
