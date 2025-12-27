const https = require("node:https");
const http = require("node:http");
const { URL } = require("node:url");

const DEFAULT_PAGES_URL = "https://aquizu-ivan.github.io/atlas/";
const DEFAULT_API_ORIGIN = "https://atlas-atlas.up.railway.app";

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {};
  for (const arg of args) {
    if (arg.startsWith("--pages=")) {
      config.pagesUrl = arg.slice("--pages=".length);
    } else if (arg.startsWith("--api=")) {
      config.apiOrigin = arg.slice("--api=".length);
    }
  }
  return config;
}

function normalizeBaseUrl(value) {
  if (!value) return "";
  return String(value).trim().replace(/\/+$/, "");
}

function getOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

function request(method, url, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const transport = parsed.protocol === "https:" ? https : http;
    const options = {
      method,
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: `${parsed.pathname}${parsed.search}`,
      headers,
    };

    const req = transport.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode || 0,
          headers: res.headers || {},
          body,
        });
      });
    });

    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

function headerValue(headers, name) {
  const value = headers[name];
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value || "";
}

function formatHeaderEvidence(headers) {
  const allowOrigin = headerValue(headers, "access-control-allow-origin") || "(absent)";
  const allowCredentials = headerValue(headers, "access-control-allow-credentials") || "(absent)";
  const vary = headerValue(headers, "vary") || "(absent)";
  return `access-control-allow-origin=${allowOrigin}; access-control-allow-credentials=${allowCredentials}; vary=${vary}`;
}

function isCorsAllowed(headers, expectedOrigin) {
  const allowOrigin = headerValue(headers, "access-control-allow-origin");
  const allowCredentials = headerValue(headers, "access-control-allow-credentials");
  return allowOrigin === expectedOrigin && allowCredentials === "true";
}

function hasCorsHeader(headers) {
  return Boolean(headerValue(headers, "access-control-allow-origin"));
}

function extractDevToken(location) {
  if (!location) {
    return "";
  }
  const hashIndex = location.indexOf("#");
  if (hashIndex === -1) {
    return "";
  }
  const hash = location.slice(hashIndex + 1);
  const params = new URLSearchParams(hash);
  return params.get("devToken") || "";
}

async function main() {
  const args = parseArgs();
  const pagesUrl = normalizeBaseUrl(args.pagesUrl || process.env.PAGES_URL || DEFAULT_PAGES_URL);
  const apiOrigin = normalizeBaseUrl(args.apiOrigin || process.env.API_ORIGIN || DEFAULT_API_ORIGIN);
  const pagesOrigin = getOrigin(pagesUrl);

  if (!pagesOrigin || !apiOrigin) {
    console.error("FAIL: invalid PAGES_URL or API_ORIGIN");
    process.exitCode = 1;
    return;
  }

  const results = [];
  let serviceIdForAvailability = "svc_basic";
  let slotForBooking = "";

  // Check A: Health ok
  try {
    const res = await request("GET", `${apiOrigin}/api/health`);
    let ok = false;
    try {
      const data = JSON.parse(res.body);
      ok = res.status === 200 && data && data.ok === true;
    } catch {
      ok = false;
    }
    results.push({
      name: "health",
      ok,
      status: res.status,
      headers: res.headers,
      reason: ok ? "" : "Expected 200 and ok:true",
    });
  } catch {
    results.push({
      name: "health",
      ok: false,
      status: 0,
      headers: {},
      reason: "Network error",
    });
  }

  // Check B: Session with allowed Origin
  try {
    const res = await request("GET", `${apiOrigin}/api/auth/session`, {
      Origin: pagesOrigin,
    });
    const statusOk = res.status === 200 || res.status === 401;
    const noServerError = res.status !== 500;
    const corsOk = isCorsAllowed(res.headers, pagesOrigin);
    const ok = statusOk && noServerError && corsOk;
    results.push({
      name: "session-origin",
      ok,
      status: res.status,
      headers: res.headers,
      reason: ok ? "" : "Expected 200/401, no 500, and CORS headers",
    });
  } catch {
    results.push({
      name: "session-origin",
      ok: false,
      status: 0,
      headers: {},
      reason: "Network error",
    });
  }

  // Check C: Preflight OPTIONS
  try {
    const res = await request("OPTIONS", `${apiOrigin}/api/auth/logout`, {
      Origin: pagesOrigin,
      "Access-Control-Request-Method": "POST",
    });
    const statusOk = res.status === 200 || res.status === 204 || res.status === 401;
    const noServerError = res.status !== 500;
    const corsOk = isCorsAllowed(res.headers, pagesOrigin);
    const ok = statusOk && noServerError && corsOk;
    results.push({
      name: "preflight",
      ok,
      status: res.status,
      headers: res.headers,
      reason: ok ? "" : "Expected 200/204/401, no 500, and CORS headers",
    });
  } catch {
    results.push({
      name: "preflight",
      ok: false,
      status: 0,
      headers: {},
      reason: "Network error",
    });
  }

  // Check D: Invalid Origin
  try {
    const res = await request("GET", `${apiOrigin}/api/health`, {
      Origin: "https://invalid.example",
    });
    const ok = res.status === 200 && !hasCorsHeader(res.headers) && res.status !== 500;
    results.push({
      name: "invalid-origin",
      ok,
      status: res.status,
      headers: res.headers,
      reason: ok ? "" : "Expected 200 and no CORS header",
    });
  } catch {
    results.push({
      name: "invalid-origin",
      ok: false,
      status: 0,
      headers: {},
      reason: "Network error",
    });
  }

  // Check E: Services catalog
  try {
    const res = await request("GET", `${apiOrigin}/api/services`, {
      Origin: pagesOrigin,
    });
    let ok = res.status === 200 && isCorsAllowed(res.headers, pagesOrigin);
    try {
      const data = JSON.parse(res.body);
      const services = data?.data?.services || [];
      if (Array.isArray(services) && services.length > 0 && services[0].id) {
        serviceIdForAvailability = services[0].id;
      }
      ok = ok && Array.isArray(services);
    } catch {
      ok = false;
    }
    results.push({
      name: "services",
      ok,
      status: res.status,
      headers: res.headers,
      reason: ok ? "" : "Expected 200, CORS headers, and services list",
    });
  } catch {
    results.push({
      name: "services",
      ok: false,
      status: 0,
      headers: {},
      reason: "Network error",
    });
  }

  // Check F: Availability
  try {
    const date = "2025-12-27";
    const url = `${apiOrigin}/api/availability?serviceId=${encodeURIComponent(serviceIdForAvailability)}&date=${date}`;
    const res = await request("GET", url, {
      Origin: pagesOrigin,
    });
    let ok = res.status === 200 && isCorsAllowed(res.headers, pagesOrigin);
    try {
      const data = JSON.parse(res.body);
      const slots = data?.data?.slots || [];
      ok = ok && Array.isArray(slots);
      if (Array.isArray(slots) && slots.length > 0) {
        slotForBooking = slots[0]?.startAt || slots[0] || "";
      }
    } catch {
      ok = false;
    }
    results.push({
      name: "availability",
      ok,
      status: res.status,
      headers: res.headers,
      reason: ok ? "" : "Expected 200, CORS headers, and slots list",
    });
  } catch {
    results.push({
      name: "availability",
      ok: false,
      status: 0,
      headers: {},
      reason: "Network error",
    });
  }

  // Check G: Bookings/me without session
  try {
    const res = await request("GET", `${apiOrigin}/api/bookings/me`, {
      Origin: pagesOrigin,
    });
    const ok = res.status === 401 && isCorsAllowed(res.headers, pagesOrigin);
    results.push({
      name: "bookings-me",
      ok,
      status: res.status,
      headers: res.headers,
      reason: ok ? "" : "Expected 401 and CORS headers",
    });
  } catch {
    results.push({
      name: "bookings-me",
      ok: false,
      status: 0,
      headers: {},
      reason: "Network error",
    });
  }

  // Check H: Bookings POST without session (should be 401, not 404)
  try {
    const startAt = slotForBooking || new Date().toISOString();
    const payload = JSON.stringify({
      serviceId: serviceIdForAvailability,
      startAt,
    });
    const res = await request("POST", `${apiOrigin}/api/bookings`, {
      Origin: pagesOrigin,
      "Content-Type": "application/json",
    }, payload);
    const ok = res.status === 401 && isCorsAllowed(res.headers, pagesOrigin);
    results.push({
      name: "bookings-post-unauth",
      ok,
      status: res.status,
      headers: res.headers,
      reason: ok ? "" : "Expected 401 (not 404) with CORS headers",
    });
  } catch {
    results.push({
      name: "bookings-post-unauth",
      ok: false,
      status: 0,
      headers: {},
      reason: "Network error",
    });
  }

  // Check I: Dev token auth + bookings POST
  try {
    const requestPayload = JSON.stringify({ email: "demo@atlas.local" });
    const requestRes = await request("POST", `${apiOrigin}/api/auth/request-link`, {
      "Content-Type": "application/json",
    }, requestPayload);
    let devLink = "";
    try {
      const data = JSON.parse(requestRes.body);
      devLink = data?.data?.devLink || "";
    } catch {
      devLink = "";
    }

    if (!devLink) {
      results.push({
        name: "bookings-post-auth",
        ok: true,
        status: requestRes.status,
        headers: requestRes.headers,
        skipped: true,
        reason: "Skipped (devLink not available)",
      });
    } else {
      const consumeRes = await request("GET", devLink, {
        Accept: "text/html",
      });
      const location = headerValue(consumeRes.headers, "location");
      const devToken = extractDevToken(location);

      if (!devToken) {
        results.push({
          name: "bookings-post-auth",
          ok: false,
          status: consumeRes.status,
          headers: consumeRes.headers,
          reason: "Missing devToken in redirect",
        });
      } else {
        const startAt = slotForBooking || new Date().toISOString();
        const payload = JSON.stringify({
          serviceId: serviceIdForAvailability,
          startAt,
        });
        const res = await request("POST", `${apiOrigin}/api/bookings`, {
          Origin: pagesOrigin,
          "Content-Type": "application/json",
          Authorization: `Bearer ${devToken}`,
        }, payload);
        const ok = [200, 201, 409].includes(res.status) && isCorsAllowed(res.headers, pagesOrigin);
        results.push({
          name: "bookings-post-auth",
          ok,
          status: res.status,
          headers: res.headers,
          reason: ok ? "" : "Expected 200/201/409 with CORS headers",
        });
      }
    }
  } catch {
    results.push({
      name: "bookings-post-auth",
      ok: false,
      status: 0,
      headers: {},
      reason: "Network error",
    });
  }

  let passCount = 0;
  let skipCount = 0;
  for (const result of results) {
    const tag = result.skipped ? "SKIP" : result.ok ? "PASS" : "FAIL";
    if (result.skipped) {
      skipCount += 1;
    } else if (result.ok) {
      passCount += 1;
    }
    console.log(`[${tag}] ${result.name} status=${result.status}`);
    console.log(`  headers: ${formatHeaderEvidence(result.headers)}`);
    if (!result.ok && result.reason) {
      console.log(`  reason: ${result.reason}`);
    }
    if (result.skipped && result.reason) {
      console.log(`  reason: ${result.reason}`);
    }
  }

  const failed = results.length - passCount - skipCount;
  console.log(`Summary: ${passCount} passed, ${failed} failed, ${skipCount} skipped`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("[FAIL] qa:exhibicion");
  console.error(err && err.message ? err.message : String(err));
  process.exitCode = 1;
});
