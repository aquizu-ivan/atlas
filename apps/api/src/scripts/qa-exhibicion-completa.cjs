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

function request(method, url, headers = {}) {
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

async function run() {
  const args = parseArgs();
  const pagesUrl = normalizeBaseUrl(args.pagesUrl || process.env.PAGES_URL || DEFAULT_PAGES_URL);
  const apiOrigin = normalizeBaseUrl(args.apiOrigin || process.env.API_ORIGIN || DEFAULT_API_ORIGIN);
  const pagesOrigin = getOrigin(pagesUrl);

  if (!pagesOrigin || !apiOrigin) {
    console.error("FAIL: invalid PAGES_URL or API_ORIGIN");
    process.exit(1);
  }

  const results = [];

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
  } catch (error) {
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

  let passCount = 0;
  for (const result of results) {
    const tag = result.ok ? "PASS" : "FAIL";
    if (result.ok) passCount += 1;
    console.log(`[${tag}] ${result.name} status=${result.status}`);
    console.log(`  headers: ${formatHeaderEvidence(result.headers)}`);
    if (!result.ok && result.reason) {
      console.log(`  reason: ${result.reason}`);
    }
  }

  const failed = results.length - passCount;
  console.log(`Summary: ${passCount} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

run().catch(() => {
  console.error("FAIL: unexpected error");
  process.exit(1);
});
