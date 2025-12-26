const apiBaseUrl = (process.env.API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");
const serviceId = process.env.SERVICE_ID;
const sessionToken = process.env.ATLAS_SESSION;
const rawStartAt = process.env.START_AT;
const rawN = process.env.N;

if (!serviceId) {
  console.error("SERVICE_ID is required");
  process.exit(1);
}

if (!sessionToken) {
  console.error("ATLAS_SESSION is required");
  process.exit(1);
}

const n = Number.parseInt(rawN || "10", 10);
const total = Number.isFinite(n) && n > 0 ? n : 10;

let startAt = rawStartAt;
if (!startAt) {
  const date = new Date(Date.now() + 60000);
  date.setMilliseconds(0);
  startAt = date.toISOString();
} else {
  const parsed = new Date(startAt);
  if (Number.isNaN(parsed.getTime())) {
    console.error("START_AT must be a valid ISO date string");
    process.exit(1);
  }
  parsed.setMilliseconds(0);
  startAt = parsed.toISOString();
}

const payload = { serviceId, startAt };
const url = `${apiBaseUrl}/api/bookings`;
const cookieHeader = `atlas_session=${sessionToken}`;

async function run() {
  const requests = Array.from({ length: total }, () => {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.status)
      .catch(() => "error");
  });

  const results = await Promise.all(requests);
  const counts = results.reduce((acc, status) => {
    const key = String(status);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const success201 = counts["201"] || 0;
  const conflict409 = counts["409"] || 0;
  const errors = counts["error"] || 0;
  const ok = success201 === 1 && conflict409 === total - 1;

  console.log(JSON.stringify({
    total,
    startAt,
    counts,
    success201,
    conflict409,
    errors,
    ok,
  }, null, 2));

  process.exit(ok ? 0 : 1);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
