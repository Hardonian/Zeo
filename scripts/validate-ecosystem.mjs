import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function validatePacks() {
  const root = resolve("packs");
  if (!existsSync(root)) return;
  const packs = readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  for (const pack of packs) {
    const base = join(root, pack);
    const manifestPath = join(base, "pack.json");
    if (!existsSync(manifestPath)) {
      fail(`Pack missing manifest: ${pack}`);
      continue;
    }
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    for (const key of ["id", "version", "author"]) {
      if (typeof manifest[key] !== "string" || manifest[key].length === 0) fail(`Pack ${pack} invalid ${key}`);
    }
    if (!Array.isArray(manifest.tags)) fail(`Pack ${pack} invalid tags`);
    if (!existsSync(join(base, "policies"))) fail(`Pack ${pack} missing policies/`);
    if (!existsSync(join(base, "templates"))) fail(`Pack ${pack} missing templates/`);
  }
}

function validatePlugins() {
  const root = resolve("plugins");
  if (!existsSync(root)) return;
  const plugins = readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  for (const plugin of plugins) {
    const manifestPath = join(root, plugin, "plugin.json");
    if (!existsSync(manifestPath)) fail(`Plugin missing manifest: ${plugin}`);
    else {
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      if (manifest.apiVersion !== "1.0.0") fail(`Plugin ${plugin} apiVersion mismatch`);
      if (manifest.deterministic !== true) fail(`Plugin ${plugin} must set deterministic=true`);
      if (manifest?.permissions?.network !== false) fail(`Plugin ${plugin} network must be false by default`);
      if (!Array.isArray(manifest.capabilities) || manifest.capabilities.length === 0) fail(`Plugin ${plugin} capabilities required`);
    }
  }
}

validatePacks();
validatePlugins();
if (process.exitCode) process.exit(process.exitCode);
console.log("ecosystem validation passed");
