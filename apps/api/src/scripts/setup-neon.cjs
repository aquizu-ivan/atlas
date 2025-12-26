const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");
const { spawnSync } = require("node:child_process");

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function stripQuotes(value) {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === "\"" && last === "\"") || (first === "'" && last === "'")) {
      return value.slice(1, -1);
    }
  }
  return value;
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: true });
  if (result.error || result.status !== 0) {
    console.error(`Command failed: ${command} ${args.join(" ")}`);
    process.exit(1);
  }
}

function readEnvLines(envPath) {
  if (!fs.existsSync(envPath)) {
    return [];
  }
  const raw = fs.readFileSync(envPath, "utf8");
  return raw.split(/\r?\n/);
}

function writeEnvFile(envPath, databaseUrl) {
  const lines = readEnvLines(envPath);
  const nextLines = [];
  let hasDb = false;
  let hasNodeEnv = false;

  for (const line of lines) {
    if (line.startsWith("DATABASE_URL=")) {
      nextLines.push(`DATABASE_URL=${databaseUrl}`);
      hasDb = true;
      continue;
    }
    if (line.startsWith("NODE_ENV=")) {
      nextLines.push(line);
      hasNodeEnv = true;
      continue;
    }
    if (line !== "") {
      nextLines.push(line);
    }
  }

  if (!hasDb) {
    nextLines.push(`DATABASE_URL=${databaseUrl}`);
  }
  if (!hasNodeEnv) {
    nextLines.push("NODE_ENV=development");
  }

  fs.writeFileSync(envPath, `${nextLines.join("\n")}\n`, { encoding: "utf8" });
}

async function main() {
  const raw = await prompt("DATABASE_URL (postgres://...): ");
  const trimmed = (raw || "").trim();
  const value = stripQuotes(trimmed);

  if (!/^(postgresql|postgres):\/\//.test(value)) {
    console.error("Invalid DATABASE_URL. Expected postgresql:// or postgres://");
    process.exit(1);
  }

  const envPath = path.resolve(process.cwd(), ".env");
  writeEnvFile(envPath, value);

  run("pnpm", ["exec", "--", "prisma", "validate"]);
  run("pnpm", ["exec", "--", "prisma", "generate"]);
  run("pnpm", ["exec", "--", "prisma", "db", "push"]);

  console.log("NEON OK: schema aplicado");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});