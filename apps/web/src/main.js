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
const servicesCardEl = document.querySelector("[data-services-card]");
const servicesSummaryEl = document.querySelector("[data-services-summary]");
const servicesSummaryNameEl = document.querySelector("[data-services-summary-name]");
const servicesSummaryDurationRowEl = document.querySelector("[data-services-summary-duration-row]");
const servicesSummaryDurationEl = document.querySelector("[data-services-summary-duration]");
const servicesSelectEl = document.querySelector("[data-services-select]");
const servicesHintEl = document.querySelector("[data-services-hint]");
const servicesRetryBtn = document.querySelector("[data-services-retry]");
const bookingDateEl = document.querySelector("[data-booking-date]");
const dateTodayBtn = document.querySelector("[data-date-today]");
const dateTomorrowBtn = document.querySelector("[data-date-tomorrow]");
const dateWeekBtn = document.querySelector("[data-date-week]");
const availabilityStateEl = document.querySelector("[data-availability-state]");
const availabilitySlotsEl = document.querySelector("[data-availability-slots]");
const availabilityRetryBtn = document.querySelector("[data-availability-retry]");
const bookingSummaryServiceEl = document.querySelector("[data-booking-summary-service]");
const bookingSummaryDateEl = document.querySelector("[data-booking-summary-date]");
const bookingSummaryTimeEl = document.querySelector("[data-booking-summary-time]");
const bookingConfirmBtn = document.querySelector("[data-booking-confirm]");
const bookingMessageEl = document.querySelector("[data-booking-message]");
const bookingConfirmationEl = document.querySelector("[data-booking-confirmation]");
const bookingsStateEl = document.querySelector("[data-bookings-state]");
const bookingsCtaEl = document.querySelector("[data-bookings-cta]");
const bookingsActiveListEl = document.querySelector("[data-bookings-active-list]");
const bookingsActiveSummaryEl = document.querySelector("[data-bookings-active-summary]");
const bookingsHistorySummaryEl = document.querySelector("[data-bookings-history-summary]");
const bookingsHistoryEl = document.querySelector("[data-bookings-history]");
const bookingsHistoryStateEl = document.querySelector("[data-bookings-history-state]");
const bookingsHistoryListEl = document.querySelector("[data-bookings-history-list]");
const bookingsRetryBtn = document.querySelector("[data-bookings-retry]");
const healthPanel = document.querySelector("[data-panel-health]");
const authPanel = document.querySelector("[data-panel-auth]");
const bookingPanel = document.querySelector("[data-panel-booking]");
const bookingsPanel = document.querySelector("[data-panel-bookings]");
const adminPanel = document.querySelector("[data-panel-admin]");
const adminStatusEl = document.querySelector("[data-admin-status]");
const adminTokenInput = document.querySelector("[data-admin-token]");
const adminConnectBtn = document.querySelector("[data-admin-connect]");
const adminDateInput = document.querySelector("[data-admin-date]");
const adminAgendaStateEl = document.querySelector("[data-admin-agenda-state]");
const adminAgendaListEl = document.querySelector("[data-admin-agenda-list]");
const adminAgendaRetryBtn = document.querySelector("[data-admin-agenda-retry]");
const adminAgendaSummaryEl = document.querySelector("[data-admin-agenda-summary]");
const adminUsersStateEl = document.querySelector("[data-admin-users-state]");
const adminUsersListEl = document.querySelector("[data-admin-users-list]");
const adminUsersRetryBtn = document.querySelector("[data-admin-users-retry]");
const adminUsersSummaryEl = document.querySelector("[data-admin-users-summary]");
const adminServicesStateEl = document.querySelector("[data-admin-services-state]");
const adminServicesListEl = document.querySelector("[data-admin-services-list]");
const adminServiceNameInput = document.querySelector("[data-admin-service-name]");
const adminServiceDurationInput = document.querySelector("[data-admin-service-duration]");
const adminServiceActiveInput = document.querySelector("[data-admin-service-active]");
const adminServiceSaveBtn = document.querySelector("[data-admin-service-save]");
const adminServiceResetBtn = document.querySelector("[data-admin-service-reset]");
const adminServicesMessageEl = document.querySelector("[data-admin-services-message]");
const adminServicesRetryBtn = document.querySelector("[data-admin-services-retry]");
const adminServicesSummaryEl = document.querySelector("[data-admin-services-summary]");
const adminModeToggleBtn = document.querySelector("[data-admin-mode-toggle]");
const adminModeNoteEl = document.querySelector("[data-admin-mode-note]");
const adminBodyEl = document.querySelector("[data-admin-body]");
const adminPanelsEl = document.querySelector("[data-admin-panels]");
const adminAccessNoteEl = document.querySelector("[data-admin-access-note]");
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
const adminTokenStorageKey = "atlas_admin_token";
const adminModeStorageKey = "atlas_admin_mode";
const summaryPlaceholder = "\u2014";

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
  authStatusEl.textContent = isActive ? "Sesion activa" : "Sesion cerrada";
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
  servicesStateEl.textContent = message || "";
}

function setServicesHint(message) {
  if (servicesHintEl) {
    servicesHintEl.textContent = message || "";
  }
}

function setAvailabilityState(message) {
  availabilityStateEl.textContent = message || "";
}

function setBookingMessage(message) {
  bookingMessageEl.textContent = message || "";
}

function setBookingsState(message) {
  bookingsStateEl.textContent = message || "";
}

function setBookingsHistoryState(message) {
  if (bookingsHistoryStateEl) {
    bookingsHistoryStateEl.textContent = message || "";
  }
}

function setButtonLoading(button, isLoading) {
  if (!button) return;
  if (isLoading) {
    button.dataset.loading = "true";
  } else {
    delete button.dataset.loading;
  }
}

function setBusy(element, isBusy) {
  if (!element) return;
  element.setAttribute("aria-busy", isBusy ? "true" : "false");
}

function setNoteLoading(element, isLoading) {
  if (!element) return;
  if (isLoading) {
    element.dataset.loading = "true";
  } else {
    delete element.dataset.loading;
  }
}

function toggleRetry(button, show) {
  if (!button) return;
  button.hidden = !show;
  button.disabled = !show;
}

function resetBookingsCta() {
  bookingsCtaEl.textContent = "";
  bookingsCtaEl.innerHTML = "";
}

function setBookingsCta(message, showLink) {
  bookingsCtaEl.innerHTML = "";
  if (!message && !showLink) {
    bookingsCtaEl.textContent = "";
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
    link.textContent = "Abrir acceso";
    bookingsCtaEl.append(link);
  }
}

function updateBookingSummaries(activeCount, historyCount) {
  if (bookingsActiveSummaryEl) {
    bookingsActiveSummaryEl.textContent = `Activas (${activeCount})`;
  }
  if (bookingsHistorySummaryEl) {
    bookingsHistorySummaryEl.textContent = `Historial (${historyCount})`;
  }
}

function updateAdminSummaries(type, count) {
  if (type === "agenda" && adminAgendaSummaryEl) {
    const dateLabel = isValidDateString(adminDateInput?.value)
      ? adminDateInput.value
      : "--";
    adminAgendaSummaryEl.textContent = `Agenda (${dateLabel})`;
  }
  if (type === "users" && adminUsersSummaryEl) {
    adminUsersSummaryEl.textContent = `Usuarios (${count ?? 0})`;
  }
  if (type === "services" && adminServicesSummaryEl) {
    adminServicesSummaryEl.textContent = `Servicios (${count ?? 0})`;
  }
}

function setSummaryValue(element, value) {
  if (!element) return;
  element.textContent = value || summaryPlaceholder;
}

function setBookingConfirmation(message) {
  bookingConfirmationEl.textContent = message || "";
}

function setConfirmLabel() {
  bookingConfirmBtn.textContent = rescheduleContext ? "Confirmar reprogramacion" : "Confirmar reserva";
}

function setAdminStatus(message) {
  if (adminStatusEl) {
    adminStatusEl.textContent = message;
  }
}

function setAdminAgendaState(message) {
  if (adminAgendaStateEl) {
    adminAgendaStateEl.textContent = message || "";
  }
}

function setAdminUsersState(message) {
  if (adminUsersStateEl) {
    adminUsersStateEl.textContent = message || "";
  }
}

function setAdminServicesState(message) {
  if (adminServicesStateEl) {
    adminServicesStateEl.textContent = message || "";
  }
}

function setAdminServicesMessage(message) {
  if (adminServicesMessageEl) {
    adminServicesMessageEl.textContent = message || "";
  }
}

function setAdminMode(enabled) {
  if (!adminBodyEl || !adminModeToggleBtn || !adminModeNoteEl) {
    return;
  }
  setStoredAdminMode(enabled);
  adminBodyEl.hidden = !enabled;
  adminModeToggleBtn.textContent = enabled ? "Desactivar modo admin" : "Activar modo admin";
  adminModeNoteEl.textContent = enabled ? "Acceso de administracion." : "Solo para administracion.";

  if (!enabled) {
    return;
  }

  if (getStoredAdminToken()) {
    setAdminStatus("Conectado.");
    if (adminAccessNoteEl) {
      adminAccessNoteEl.textContent = "Acceso de administracion.";
    }
    if (adminPanelsEl) {
      adminPanelsEl.hidden = false;
    }
    loadAdminAgenda();
    loadAdminUsers();
    loadAdminServices();
  } else {
    setAdminStatus("Sin acceso.");
    if (adminAccessNoteEl) {
      adminAccessNoteEl.textContent = "Ingresa el token para continuar.";
    }
    if (adminPanelsEl) {
      adminPanelsEl.hidden = true;
    }
    setAdminAgendaState("Sin acceso.");
    setAdminUsersState("Sin acceso.");
    setAdminServicesState("Sin acceso.");
  }
}

function getStoredAdminToken() {
  try {
    return sessionStorage.getItem(adminTokenStorageKey) || "";
  } catch {
    return "";
  }
}

function getStoredAdminMode() {
  try {
    return sessionStorage.getItem(adminModeStorageKey) === "true";
  } catch {
    return false;
  }
}

function setStoredAdminMode(enabled) {
  try {
    sessionStorage.setItem(adminModeStorageKey, enabled ? "true" : "false");
  } catch {
    // Ignore storage errors.
  }
}

function setStoredAdminToken(token) {
  try {
    if (!token) {
      sessionStorage.removeItem(adminTokenStorageKey);
      return;
    }
    sessionStorage.setItem(adminTokenStorageKey, token);
  } catch {
    // Ignore storage errors.
  }
}

function adminFetch(url, options = {}) {
  const token = getStoredAdminToken();
  if (!token) {
    return Promise.reject(new Error("Admin token missing"));
  }
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  return fetch(url, {
    ...options,
    headers,
  });
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
  if (normalized === "PENDING") return "Pendiente (a confirmar)";
  return normalized;
}

function describeError(response, data) {
  if (!response) {
    return "No pudimos conectar. Reintenta.";
  }
  if (response.status === 400) {
    const detail = data?.error?.message;
    if (!detail) {
      return "Datos invalidos.";
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
    return "Necesitas iniciar sesion.";
  }
  if (response.status === 404) {
    return "No disponible.";
  }
  if (response.status === 409) {
    return "Ese horario ya no esta disponible. Actualiza horarios.";
  }
  if (response.status >= 500) {
    return "No pudimos conectar. Reintenta.";
  }
  return data?.error?.message || "No pudimos completar.";
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

function formatDateCompact(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return date.toISOString().replace("T", " ").slice(0, 16);
}

function formatDateOnly(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTimeLabel(value) {
  if (!value) {
    return summaryPlaceholder;
  }
  const label = formatSlotLabel(value);
  if (label.includes(" ")) {
    return label.split(" ")[1];
  }
  return label;
}

async function adminUpdateBooking(bookingId, action) {
  if (!bookingId) {
    setAdminAgendaState("Datos invalidos.");
    return;
  }
  const path = action === "confirm"
    ? `/admin/bookings/${bookingId}/confirm`
    : `/admin/bookings/${bookingId}/cancel`;
  setAdminAgendaState(action === "confirm" ? "Confirmando" : "Cancelando");
  setNoteLoading(adminAgendaStateEl, true);
  try {
    const response = await adminFetch(`${apiBaseUrl}${path}`, {
      method: "PATCH",
    });
    const data = await response.json().catch(() => null);
    if (response.status === 401) {
      setStoredAdminToken("");
      setAdminStatus("Sin acceso.");
      setAdminAgendaState("Sin acceso.");
      if (adminAccessNoteEl) {
        adminAccessNoteEl.textContent = "Acceso no valido. Revisa el token.";
      }
      return;
    }
    if (response.status === 404) {
      setAdminAgendaState("Reserva no encontrada.");
      return;
    }
    if (response.status === 409) {
      setAdminAgendaState(data?.error?.message || "No pudimos actualizar.");
      return;
    }
    if (!response.ok || !data || !data.ok) {
      setAdminAgendaState("No pudimos actualizar.");
      return;
    }
    setAdminAgendaState(action === "confirm" ? "Reserva confirmada." : "Reserva cancelada.");
    await loadAdminAgenda();
  } catch {
    setAdminAgendaState("No pudimos conectar. Reintenta.");
  } finally {
    setNoteLoading(adminAgendaStateEl, false);
  }
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

function updateServiceHint() {
  if (!servicesHintEl) {
    return;
  }
  if (!selectedServiceId) {
    setServicesHint("Elegi un servicio para ver horarios.");
    return;
  }
  setServicesHint("");
}

function updateServiceSummary() {
  if (!servicesSummaryEl) {
    return;
  }
  if (!selectedServiceId || !selectedService) {
    servicesSummaryEl.hidden = true;
    if (servicesCardEl) {
      servicesCardEl.dataset.hasSelection = "false";
    }
    return;
  }
  servicesSummaryEl.hidden = false;
  if (servicesCardEl) {
    servicesCardEl.dataset.hasSelection = "true";
  }
  if (servicesSummaryNameEl) {
    servicesSummaryNameEl.textContent = selectedService.name || "Servicio";
  }
  const duration = selectedService.durationMin ?? selectedService.durationMinutes;
  if (duration && servicesSummaryDurationEl) {
    servicesSummaryDurationEl.textContent = `Duracion: ${duration} min`;
    if (servicesSummaryDurationRowEl) {
      servicesSummaryDurationRowEl.hidden = false;
    }
  } else if (servicesSummaryDurationRowEl) {
    servicesSummaryDurationRowEl.hidden = true;
  }
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
  setBusy(healthPanel, true);
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
  } finally {
    setBusy(healthPanel, false);
  }
}

let devLink = null;
let servicesCache = [];
let selectedServiceId = "";
let selectedService = null;
let selectedSlot = "";
let selectedDate = "";
let rescheduleContext = null;
let adminServiceEditingId = "";
const initialBookingQuery = readBookingQuery();

async function requestLink() {
  const email = authEmailInput.value.trim();
  if (!email || !email.includes("@")) {
    setAuthMessage("Email invalido");
    return;
  }

  authRequestBtn.disabled = true;
  setBusy(authPanel, true);
  setNoteLoading(authMessageEl, true);
  setAuthMessage("Enviando link");
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

    setAuthMessage("Te enviamos un link.");
    setHelperMessage("Revisa tu correo y abri el link.");
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
    setNoteLoading(authMessageEl, false);
    setBusy(authPanel, false);
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
      setAuthMessage(copied ? "Link copiado." : "No pudimos copiar.");
      return;
    }
    setAuthMessage("No pudimos copiar.");
  } catch {
    setAuthMessage("No pudimos copiar.");
  }
}

function openDevLink() {
  if (!devLink) {
    setAuthMessage("Dev link no disponible");
    return;
  }
  setAuthMessage("Abriendo link");
  window.location.assign(devLink);
}

async function refreshSession() {
  authRefreshBtn.disabled = true;
  setBusy(authPanel, true);
  setNoteLoading(authMessageEl, true);
  setAuthMessage("Actualizando sesion");

  try {
    const response = await authFetch(`${authBaseUrl}/session`);
    const data = await response.json().catch(() => null);

    if (response.ok && data && data.ok) {
      setSessionState(true, data.data?.user?.email);
      setAuthMessage("Sesion activa.");
      return;
    }

    if (response.status === 401) {
      setStoredDevToken("");
      setSessionState(false, null);
      setAuthMessage("Necesitas iniciar sesion.");
      return;
    }

    const message = data?.error?.message || "Error de red";
    setAuthMessage(message);
  } catch {
    setAuthMessage("Error de red");
  } finally {
    authRefreshBtn.disabled = false;
    setNoteLoading(authMessageEl, false);
    setBusy(authPanel, false);
  }
}

async function logout() {
  authLogoutBtn.disabled = true;
  setBusy(authPanel, true);
  setNoteLoading(authMessageEl, true);
  setAuthMessage("Cerrando sesion");

  try {
    const response = await authFetch(`${authBaseUrl}/logout`, {
      method: "POST",
    });
    const data = await response.json().catch(() => null);

    if (response.ok && data && data.ok) {
      setStoredDevToken("");
      setSessionState(false, null);
      setAuthMessage(data.data?.message || "Sesion cerrada.");
      return;
    }

    if (response.status === 401) {
      setStoredDevToken("");
      setSessionState(false, null);
      setAuthMessage("Necesitas iniciar sesion.");
      return;
    }

    const message = data?.error?.message || "Error de red";
    setAuthMessage(message);
  } catch {
    setAuthMessage("Error de red");
  } finally {
    authLogoutBtn.disabled = false;
    setNoteLoading(authMessageEl, false);
    setBusy(authPanel, false);
  }
}

async function loadServices() {
  setBusy(bookingPanel, true);
  setNoteLoading(servicesStateEl, true);
  setServicesState("Cargando servicios");
  setServicesHint("");
  servicesSelectEl.disabled = true;
  servicesSelectEl.innerHTML = "<option value=\"\">Selecciona un servicio</option>";
  servicesCache = [];
  selectedServiceId = "";
  selectedService = null;
  selectedSlot = "";
  selectedDate = "";
  bookingDateEl.value = "";
  bookingDateEl.disabled = true;
  updateServiceSummary();
  updateBookingSummary();
  setBookingMessage("");
  setBookingConfirmation("");
  toggleRetry(servicesRetryBtn, false);

  try {
    const response = await fetch(apiEndpoint("/services"));
    const data = await response.json().catch(() => null);

    if (response.status === 404) {
      setServicesState("Servicios no disponibles.");
      setServicesHint("");
      return;
    }
    if (!response.ok) {
      setServicesState("No pudimos conectar. Reintenta.");
      setServicesHint("");
      toggleRetry(servicesRetryBtn, true);
      return;
    }

    const services = parseServicesPayload(data);
    if (!Array.isArray(services) || services.length === 0) {
      setServicesState("Sin servicios disponibles.");
      setServicesHint("");
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
    setServicesState("");

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
    updateServiceHint();
    updateServiceSummary();
    updateBookingSummary();
  } catch {
    setServicesState("No pudimos conectar. Reintenta.");
    setServicesHint("");
    toggleRetry(servicesRetryBtn, true);
  } finally {
    setNoteLoading(servicesStateEl, false);
    setBusy(bookingPanel, false);
  }
}

function clearAvailability() {
  availabilitySlotsEl.innerHTML = "";
  const hasSelection = Boolean(selectedServiceId && bookingDateEl.value);
  setAvailabilityState(hasSelection ? "" : "Elegi servicio y fecha");
  setBookingMessage("");
  setBookingConfirmation("");
  selectedSlot = "";
  setConfirmLabel();
  bookingConfirmBtn.disabled = true;
  toggleRetry(availabilityRetryBtn, false);
  updateBookingSummary();
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
  updateServiceSummary();
  updateServiceHint();
  bookingDateEl.disabled = false;
  const baseDate = normalizeIso(booking.startAt);
  if (baseDate) {
    bookingDateEl.value = baseDate.slice(0, 10);
    selectedDate = bookingDateEl.value;
  }
  clearAvailability();
  updateBookingSummary();
  updateBookingQuery();
  setBookingMessage("Elegi un nuevo horario para reprogramar.");
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
  updateServiceHint();
  setConfirmLabel();
}

async function loadAvailability() {
  const date = bookingDateEl.value;
  selectedDate = date;
  if (!selectedServiceId || !selectedDate) {
    setAvailabilityState("Elegi servicio y fecha");
    availabilitySlotsEl.innerHTML = "";
    setNoteLoading(availabilityStateEl, false);
    return;
  }

  setAvailabilityState("Buscando horarios");
  setNoteLoading(availabilityStateEl, true);
  setBookingMessage("");
  setBookingConfirmation("");
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
      setAvailabilityState("Horarios no disponibles.");
      return;
    }
    if (!response.ok) {
      setAvailabilityState("No pudimos conectar. Reintenta.");
      if (response.status >= 500) {
        toggleRetry(availabilityRetryBtn, true);
      }
      return;
    }

    const slots = parseSlotsPayload(data);
    if (!Array.isArray(slots) || slots.length === 0) {
      setAvailabilityState("No hay horarios para esta fecha. Proba otro dia.");
      return;
    }

    setAvailabilityState("");
    for (const slot of slots) {
      const startAt = slot.startAt || slot;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button ghost slot-button";
      button.setAttribute("role", "listitem");
      button.textContent = formatSlotLabel(startAt);
      button.addEventListener("click", () => selectSlot(startAt, button));
      availabilitySlotsEl.append(button);
    }
  } catch {
    setAvailabilityState("No pudimos conectar. Reintenta.");
    toggleRetry(availabilityRetryBtn, true);
  } finally {
    setNoteLoading(availabilityStateEl, false);
  }
}

function ensureBookingGuidance() {
  const current = bookingMessageEl.textContent.trim();
  if (current && !current.startsWith("Elegi")) {
    return;
  }
  if (!selectedServiceId || !selectedDate) {
    setBookingMessage("");
    return;
  }
  if (!selectedSlot) {
    setBookingMessage(rescheduleContext
      ? "Elegi un nuevo horario para reprogramar."
      : "Elegi un horario para continuar.");
    return;
  }
  setBookingMessage("");
}

function updateBookingSummary() {
  const serviceLabel = selectedService?.name || summaryPlaceholder;
  const dateLabel = selectedDate || summaryPlaceholder;
  const timeLabel = selectedSlot ? formatTimeLabel(selectedSlot) : summaryPlaceholder;
  setSummaryValue(bookingSummaryServiceEl, serviceLabel);
  setSummaryValue(bookingSummaryDateEl, dateLabel);
  setSummaryValue(bookingSummaryTimeEl, timeLabel);
  ensureBookingGuidance();
}

function selectSlot(startAt, button) {
  selectedSlot = startAt;
  const buttons = availabilitySlotsEl.querySelectorAll("button");
  buttons.forEach((slotButton) => {
    slotButton.classList.toggle("is-selected", slotButton === button);
  });
  updateBookingSummary();
  setBookingMessage("");
  bookingConfirmBtn.disabled = false;
}

async function createBooking() {
  if (!selectedServiceId || !selectedSlot) {
    setBookingMessage("Datos invalidos.");
    return;
  }

  const isReschedule = Boolean(rescheduleContext);
  if (isReschedule) {
    const original = rescheduleContext.startAt;
    const next = normalizeIso(selectedSlot);
    if (original && next && original === next) {
      setBookingMessage("Elegi un horario distinto.");
      return;
    }
  }

  setBookingMessage(isReschedule ? "Reprogramando" : "Reservando");
  setNoteLoading(bookingMessageEl, true);
  setBookingConfirmation("");
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
      setBookingMessage("Necesitas iniciar sesion para confirmar.");
      return;
    }
    if (response.status === 409) {
      setBookingMessage("Ese horario ya no esta disponible. Actualiza horarios.");
      return;
    }
    if (response.status === 404) {
      setBookingMessage("No pudimos confirmar.");
      return;
    }
    if (!response.ok || !data || !data.ok) {
      const message = describeError(response, data);
      setBookingMessage(message);
      return;
    }

    if (isReschedule) {
      setBookingMessage("Reprogramacion lista.");
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
      setBookingMessage("No pudimos reprogramar. Reintenta.");
      setBookingConfirmation("");
      return;
    }

    setBookingMessage("Reprogramacion lista.");
    resetReschedule();
    await loadBookings();
    await loadAvailability();
    selectedSlot = "";
    bookingConfirmBtn.disabled = true;
  } catch {
    setBookingMessage("No pudimos conectar. Reintenta.");
  } finally {
    buttons.forEach((button) => { button.disabled = false; });
    setButtonLoading(bookingConfirmBtn, false);
    bookingConfirmBtn.disabled = !selectedSlot;
    setNoteLoading(bookingMessageEl, false);
  }
}

async function loadBookings() {
  setBusy(bookingsPanel, true);
  setNoteLoading(bookingsStateEl, true);
  setNoteLoading(bookingsHistoryStateEl, true);
  setBookingsState("Actualizando reservas");
  bookingsActiveListEl.innerHTML = "";
  bookingsHistoryListEl.innerHTML = "";
  setBookingsHistoryState("Actualizando historial");
  setBookingsCta(null, false);
  updateBookingSummaries(0, 0);
  toggleRetry(bookingsRetryBtn, false);

  try {
    const response = await authFetch(apiEndpoint("/bookings/me"));
    const data = await response.json().catch(() => null);

    if (response.status === 401) {
      setBookingsState("Necesitas iniciar sesion para ver tus reservas.");
      setBookingsCta("", true);
      setBookingsHistoryState("Sin acceso.");
      updateBookingSummaries(0, 0);
      toggleRetry(bookingsRetryBtn, true);
      return;
    }
    if (response.status === 404) {
      setBookingsState("Reservas no disponibles.");
      setBookingsHistoryState("Reservas no disponibles.");
      updateBookingSummaries(0, 0);
      return;
    }
    if (!response.ok) {
      setBookingsState(describeError(response, data));
      setBookingsHistoryState(describeError(response, data));
      updateBookingSummaries(0, 0);
      if (response.status >= 500) {
        toggleRetry(bookingsRetryBtn, true);
      }
      return;
    }

    const bookings = parseBookingsPayload(data);
    if (!Array.isArray(bookings) || bookings.length === 0) {
      setBookingsState("Aun no hay reservas activas.");
      setBookingsHistoryState("Historial vacio.");
      setBookingsCta("Crea tu primera reserva.", false);
      updateBookingSummaries(0, 0);
      return;
    }

    const active = bookings.filter((booking) => booking.status !== "CANCELED");
    const history = bookings.filter((booking) => booking.status === "CANCELED");
    setBookingsState(active.length ? "" : "Aun no hay reservas activas.");
    setBookingsHistoryState(history.length ? "" : "Historial vacio.");
    updateBookingSummaries(active.length, history.length);

    for (const booking of active) {
      const item = document.createElement("div");
      item.className = "booking-item";
      item.setAttribute("role", "listitem");

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
      bookingsActiveListEl.append(item);
    }

    for (const booking of history) {
      const item = document.createElement("div");
      item.className = "booking-item";
      item.setAttribute("role", "listitem");

      const title = document.createElement("div");
      title.className = "value";
      title.textContent = formatSlotLabel(booking.startAt);

      const meta = document.createElement("div");
      meta.className = "booking-meta";
      const status = formatStatus(booking.status);
      const serviceName = booking.service?.name ? ` - ${booking.service.name}` : "";
      meta.textContent = `${status}${serviceName}`;

      item.append(title, meta);
      bookingsHistoryListEl.append(item);
    }
  } catch {
    setBookingsState("No pudimos conectar. Reintenta.");
    setBookingsHistoryState("No pudimos conectar. Reintenta.");
    toggleRetry(bookingsRetryBtn, true);
  } finally {
    setNoteLoading(bookingsStateEl, false);
    setNoteLoading(bookingsHistoryStateEl, false);
    setBusy(bookingsPanel, false);
  }
}

async function cancelBooking(bookingId) {
  if (!bookingId) {
    setBookingsState("Datos invalidos");
    return;
  }

  setBookingsState("Cancelando");
  setNoteLoading(bookingsStateEl, true);
  setBookingsCta(null, false);
  toggleRetry(bookingsRetryBtn, false);
  try {
    const response = await authFetch(apiEndpoint(`/bookings/${bookingId}/cancel`), {
      method: "POST",
    });
    const data = await response.json().catch(() => null);

    if (response.status === 401) {
      setBookingsState("Necesitas iniciar sesion para cancelar.");
      setBookingsCta("", true);
      toggleRetry(bookingsRetryBtn, true);
      return;
    }
    if (response.status === 404) {
      setBookingsState("No pudimos cancelar.");
      return;
    }
    if (!response.ok || !data || !data.ok) {
      setBookingsState(describeError(response, data));
      if (response.status >= 500) {
        toggleRetry(bookingsRetryBtn, true);
      }
      return;
    }

    setBookingsState("Reserva cancelada.");
    await loadBookings();
  } catch {
    setBookingsState("No pudimos conectar. Reintenta.");
    toggleRetry(bookingsRetryBtn, true);
  } finally {
    setNoteLoading(bookingsStateEl, false);
  }
}

async function loadAdminAgenda() {
  setBusy(adminPanel, true);
  setNoteLoading(adminAgendaStateEl, true);
  adminAgendaListEl.innerHTML = "";
  toggleRetry(adminAgendaRetryBtn, false);
  if (!getStoredAdminToken()) {
    setAdminAgendaState("Sin acceso.");
    if (adminPanelsEl) {
      adminPanelsEl.hidden = true;
    }
    updateAdminSummaries("agenda", 0);
    setNoteLoading(adminAgendaStateEl, false);
    setBusy(adminPanel, false);
    return;
  }
  const date = adminDateInput.value;
  if (!isValidDateString(date)) {
    setAdminAgendaState("Fecha invalida");
    updateAdminSummaries("agenda", 0);
    setNoteLoading(adminAgendaStateEl, false);
    setBusy(adminPanel, false);
    return;
  }
  setAdminAgendaState("Actualizando agenda");
  try {
    const response = await adminFetch(`${apiBaseUrl}/admin/agenda?date=${date}`);
    const data = await response.json().catch(() => null);
    if (response.status === 401) {
      setStoredAdminToken("");
      setAdminStatus("Sin acceso.");
      setAdminAgendaState("Sin acceso.");
      updateAdminSummaries("agenda", 0);
      if (adminAccessNoteEl) {
        adminAccessNoteEl.textContent = "Acceso no valido. Revisa el token.";
      }
      if (adminPanelsEl) {
        adminPanelsEl.hidden = true;
      }
      toggleRetry(adminAgendaRetryBtn, true);
      return;
    }
    if (!response.ok || !data || !data.ok) {
      setAdminAgendaState("No pudimos conectar. Reintenta.");
      updateAdminSummaries("agenda", 0);
      toggleRetry(adminAgendaRetryBtn, true);
      return;
    }
    if (adminPanelsEl && getStoredAdminMode()) {
      adminPanelsEl.hidden = false;
    }
    const bookings = data?.data?.bookings || [];
    updateAdminSummaries("agenda", bookings.length);
    if (!Array.isArray(bookings) || bookings.length === 0) {
      setAdminAgendaState("Sin reservas");
      return;
    }
    setAdminAgendaState("");
    for (const booking of bookings) {
      const item = document.createElement("div");
      item.className = "booking-item admin-item";
      item.setAttribute("role", "listitem");

      const top = document.createElement("div");
      top.className = "admin-item-top";

      const title = document.createElement("div");
      title.className = "admin-item-title";

      const main = document.createElement("span");
      main.className = "admin-item-main";
      const serviceLabel = booking.service?.name ? booking.service.name : "Servicio";
      main.textContent = `${formatDateCompact(booking.startAt)} — ${serviceLabel}`;

      const statusKey = normalizeKey(booking.status || "");
      const statusPill = document.createElement("span");
      statusPill.className = statusKey ? `pill pill-${statusKey}` : "pill";
      statusPill.textContent = formatStatus(booking.status);

      title.append(main, statusPill);

      const actions = document.createElement("div");
      actions.className = "admin-item-actions";
      if (booking.status === "PENDING") {
        const confirmBtn = document.createElement("button");
        confirmBtn.type = "button";
        confirmBtn.className = "button ghost compact";
        confirmBtn.textContent = "Confirmar";
        confirmBtn.addEventListener("click", () => adminUpdateBooking(booking.id, "confirm"));
        actions.append(confirmBtn);
      } else if (booking.status === "CONFIRMED") {
        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "button ghost compact";
        cancelBtn.textContent = "Cancelar";
        cancelBtn.addEventListener("click", () => adminUpdateBooking(booking.id, "cancel"));
        actions.append(cancelBtn);
      }

      top.append(title, actions);

      const meta = document.createElement("div");
      meta.className = "admin-item-meta";
      const userEmail = booking.user?.email || "--";
      meta.textContent = `Usuario: ${userEmail}`;

      item.append(top, meta);
      adminAgendaListEl.append(item);
    }
  } catch {
    setAdminAgendaState("No pudimos conectar. Reintenta.");
    toggleRetry(adminAgendaRetryBtn, true);
  } finally {
    setNoteLoading(adminAgendaStateEl, false);
    setBusy(adminPanel, false);
  }
}

async function loadAdminUsers() {
  setBusy(adminPanel, true);
  setNoteLoading(adminUsersStateEl, true);
  adminUsersListEl.innerHTML = "";
  toggleRetry(adminUsersRetryBtn, false);
  if (!getStoredAdminToken()) {
    setAdminUsersState("Sin acceso.");
    if (adminPanelsEl) {
      adminPanelsEl.hidden = true;
    }
    updateAdminSummaries("users", 0);
    setNoteLoading(adminUsersStateEl, false);
    setBusy(adminPanel, false);
    return;
  }
  setAdminUsersState("Actualizando usuarios");
  try {
    const response = await adminFetch(`${apiBaseUrl}/admin/users`);
    const data = await response.json().catch(() => null);
    if (response.status === 401) {
      setStoredAdminToken("");
      setAdminStatus("Sin acceso.");
      setAdminUsersState("Sin acceso.");
      updateAdminSummaries("users", 0);
      if (adminAccessNoteEl) {
        adminAccessNoteEl.textContent = "Acceso no valido. Revisa el token.";
      }
      if (adminPanelsEl) {
        adminPanelsEl.hidden = true;
      }
      toggleRetry(adminUsersRetryBtn, true);
      return;
    }
    if (!response.ok || !data || !data.ok) {
      setAdminUsersState("No pudimos conectar. Reintenta.");
      updateAdminSummaries("users", 0);
      toggleRetry(adminUsersRetryBtn, true);
      return;
    }
    if (adminPanelsEl && getStoredAdminMode()) {
      adminPanelsEl.hidden = false;
    }
    const users = data?.data?.users || [];
    updateAdminSummaries("users", Array.isArray(users) ? users.length : 0);
    if (!Array.isArray(users) || users.length === 0) {
      setAdminUsersState("Sin resultados");
      return;
    }
    setAdminUsersState("");
    for (const user of users) {
      const item = document.createElement("div");
      item.className = "booking-item admin-item admin-item-muted";
      item.setAttribute("role", "listitem");
      const title = document.createElement("div");
      title.className = "value";
      title.textContent = user.email || "--";
      const meta = document.createElement("div");
      meta.className = "admin-item-meta";
      meta.textContent = `Alta: ${formatDateOnly(user.createdAt)}`;
      item.append(title, meta);
      adminUsersListEl.append(item);
    }
  } catch {
    setAdminUsersState("No pudimos conectar. Reintenta.");
    toggleRetry(adminUsersRetryBtn, true);
  } finally {
    setNoteLoading(adminUsersStateEl, false);
    setBusy(adminPanel, false);
  }
}

function parseAdminDuration(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 10 || parsed > 240) {
    return null;
  }
  return parsed;
}

function resetAdminServiceForm() {
  adminServiceEditingId = "";
  if (adminServiceNameInput) {
    adminServiceNameInput.value = "";
  }
  if (adminServiceDurationInput) {
    adminServiceDurationInput.value = "";
  }
  if (adminServiceActiveInput) {
    adminServiceActiveInput.checked = true;
  }
  setAdminServicesMessage("");
}

function startAdminServiceEdit(service) {
  if (!service) {
    return;
  }
  adminServiceEditingId = service.id;
  if (adminServiceNameInput) {
    adminServiceNameInput.value = service.name || "";
  }
  if (adminServiceDurationInput) {
    adminServiceDurationInput.value = String(service.durationMin ?? "");
  }
  if (adminServiceActiveInput) {
    adminServiceActiveInput.checked = Boolean(service.isActive);
  }
  setAdminServicesMessage("Editando servicio.");
}

async function loadAdminServices() {
  setBusy(adminPanel, true);
  setNoteLoading(adminServicesStateEl, true);
  adminServicesListEl.innerHTML = "";
  toggleRetry(adminServicesRetryBtn, false);
  if (!getStoredAdminToken()) {
    setAdminServicesState("Sin acceso.");
    if (adminPanelsEl) {
      adminPanelsEl.hidden = true;
    }
    updateAdminSummaries("services", 0);
    setNoteLoading(adminServicesStateEl, false);
    setBusy(adminPanel, false);
    return;
  }
  setAdminServicesState("Actualizando servicios");
  try {
    const response = await adminFetch(`${apiBaseUrl}/admin/services`);
    const data = await response.json().catch(() => null);
    if (response.status === 401) {
      setStoredAdminToken("");
      setAdminStatus("Sin acceso.");
      setAdminServicesState("Sin acceso.");
      updateAdminSummaries("services", 0);
      if (adminAccessNoteEl) {
        adminAccessNoteEl.textContent = "Acceso no valido. Revisa el token.";
      }
      if (adminPanelsEl) {
        adminPanelsEl.hidden = true;
      }
      toggleRetry(adminServicesRetryBtn, true);
      return;
    }
    if (!response.ok || !data || !data.ok) {
      setAdminServicesState("No pudimos conectar. Reintenta.");
      updateAdminSummaries("services", 0);
      toggleRetry(adminServicesRetryBtn, true);
      return;
    }
    if (adminPanelsEl && getStoredAdminMode()) {
      adminPanelsEl.hidden = false;
    }
    const services = data?.data?.services || [];
    updateAdminSummaries("services", Array.isArray(services) ? services.length : 0);
    if (!Array.isArray(services) || services.length === 0) {
      setAdminServicesState("Sin servicios");
      return;
    }
    setAdminServicesState("");
    for (const service of services) {
      const item = document.createElement("div");
      item.className = "booking-item admin-item";
      item.setAttribute("role", "listitem");

      const title = document.createElement("div");
      title.className = "value";
      title.textContent = service.name || "--";

      const meta = document.createElement("div");
      meta.className = "admin-item-meta";
      const statusLabel = service.isActive ? "Activo" : "Inactivo";
      meta.textContent = `${service.durationMin} min - ${statusLabel}`;

      const actions = document.createElement("div");
      actions.className = "admin-item-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "button ghost compact";
      editBtn.textContent = "Editar";
      editBtn.addEventListener("click", () => startAdminServiceEdit(service));
      actions.append(editBtn);

      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "button ghost compact";
      toggleBtn.textContent = service.isActive ? "Desactivar" : "Activar";
      toggleBtn.addEventListener("click", async () => {
        toggleBtn.disabled = true;
        setAdminServicesMessage("Actualizando estado");
        try {
          const response = await adminFetch(`${apiBaseUrl}/admin/services/${service.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !service.isActive }),
          });
          const data = await response.json().catch(() => null);
          if (!response.ok || !data || !data.ok) {
            setAdminServicesMessage("No pudimos actualizar.");
          } else {
            setAdminServicesMessage("Estado actualizado.");
            await loadAdminServices();
            await loadServices();
          }
        } catch {
          setAdminServicesMessage("No pudimos conectar. Reintenta.");
        } finally {
          toggleBtn.disabled = false;
        }
      });
      actions.append(toggleBtn);

      item.append(title, meta, actions);
      adminServicesListEl.append(item);
    }
  } catch {
    setAdminServicesState("No pudimos conectar. Reintenta.");
    toggleRetry(adminServicesRetryBtn, true);
  } finally {
    setNoteLoading(adminServicesStateEl, false);
    setBusy(adminPanel, false);
  }
}

async function saveAdminService() {
  if (!getStoredAdminToken()) {
    setAdminServicesMessage("Sin acceso.");
    if (adminPanelsEl) {
      adminPanelsEl.hidden = true;
    }
    return;
  }
  const name = (adminServiceNameInput.value || "").trim();
  const durationMin = parseAdminDuration(adminServiceDurationInput.value);
  const isActive = adminServiceActiveInput.checked;

  if (!name || name.length < 2 || name.length > 60) {
    setAdminServicesMessage("Nombre invalido.");
    return;
  }
  if (!durationMin) {
    setAdminServicesMessage("Duracion invalida.");
    return;
  }

  setButtonLoading(adminServiceSaveBtn, true);
  setAdminServicesMessage(adminServiceEditingId ? "Guardando cambios" : "Creando servicio");
  setNoteLoading(adminServicesMessageEl, true);

  try {
    const payload = {
      name,
      durationMin,
      isActive,
    };
    const url = adminServiceEditingId
      ? `${apiBaseUrl}/admin/services/${adminServiceEditingId}`
      : `${apiBaseUrl}/admin/services`;
    const method = adminServiceEditingId ? "PATCH" : "POST";
    const response = await adminFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (response.status === 401) {
      setStoredAdminToken("");
      setAdminStatus("Sin acceso.");
      setAdminServicesMessage("Sin acceso.");
      return;
    }
    if (response.status === 409) {
      setAdminServicesMessage("Servicio ya existe.");
      return;
    }
    if (!response.ok || !data || !data.ok) {
      setAdminServicesMessage("No pudimos guardar.");
      return;
    }
    setAdminServicesMessage(adminServiceEditingId ? "Servicio actualizado." : "Servicio creado.");
    resetAdminServiceForm();
    await loadAdminServices();
    await loadServices();
  } catch {
    setAdminServicesMessage("No pudimos conectar. Reintenta.");
  } finally {
    setButtonLoading(adminServiceSaveBtn, false);
    setNoteLoading(adminServicesMessageEl, false);
  }
}

function connectAdmin() {
  const token = (adminTokenInput.value || "").trim();
  if (!token) {
    setAdminStatus("Sin acceso.");
    if (adminAccessNoteEl) {
      adminAccessNoteEl.textContent = "Ingresa el token para continuar.";
    }
    if (adminPanelsEl) {
      adminPanelsEl.hidden = true;
    }
    return;
  }
  setStoredAdminToken(token);
  adminTokenInput.value = "";
  setAdminStatus("Conectado.");
  if (adminAccessNoteEl) {
    adminAccessNoteEl.textContent = "Modo admin activo.";
  }
  if (adminPanelsEl) {
    adminPanelsEl.hidden = false;
  }
  if (getStoredAdminMode()) {
    loadAdminAgenda();
    loadAdminUsers();
    loadAdminServices();
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
adminConnectBtn.addEventListener("click", connectAdmin);
adminAgendaRetryBtn.addEventListener("click", loadAdminAgenda);
adminUsersRetryBtn.addEventListener("click", loadAdminUsers);
adminServicesRetryBtn.addEventListener("click", loadAdminServices);
adminServiceSaveBtn.addEventListener("click", saveAdminService);
adminServiceResetBtn.addEventListener("click", resetAdminServiceForm);
if (adminModeToggleBtn) {
  adminModeToggleBtn.addEventListener("click", () => {
    const next = !getStoredAdminMode();
    setAdminMode(next);
  });
}
servicesSelectEl.addEventListener("change", (event) => {
  if (rescheduleContext) {
    setBookingMessage("Elige un nuevo horario para reprogramar.");
    return;
  }
  selectedServiceId = event.target.value;
  selectedService = servicesCache.find((service) => service.id === selectedServiceId) || null;
  bookingDateEl.disabled = !selectedServiceId;
  clearAvailability();
  updateServiceHint();
  updateServiceSummary();
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
updateServiceHint();
updateServiceSummary();
setServicesState("Cargando servicios");
setBookingsState("Actualizando reservas");
setConfirmLabel();
resetAdminServiceForm();

const authHash = handleAuthHash();
const authQuery = authHash ? null : handleAuthQuery();
loadHealth();
if (authHash === "success" || authQuery === "success" || (!authHash && !authQuery)) {
  refreshSession();
}
loadServices();
loadBookings();

const todayValue = formatDateInput(new Date());
if (adminDateInput) {
  adminDateInput.value = todayValue;
  adminDateInput.addEventListener("change", loadAdminAgenda);
}
setAdminMode(getStoredAdminMode());
