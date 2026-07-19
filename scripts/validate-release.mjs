import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const manifest = JSON.parse(await readFile("release-manifest.json", "utf8"));
const pkg = JSON.parse(await readFile("package.json", "utf8"));
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

if (manifest.schema_version !== 1 || manifest.component !== "ejixhole-frontend") throw new Error("Manifiesto incompatible");
if (!semver.test(manifest.version)) throw new Error("Versión inválida");
if (manifest.version !== pkg.version) throw new Error("package.json y manifiesto no coinciden");
if (process.env.GITHUB_REF_TYPE === "tag" && process.env.GITHUB_REF_NAME !== `v${manifest.version}`) throw new Error("Etiqueta y versión no coinciden");

if (process.argv.includes("--evidence")) {
  const hash = async (path) => createHash("sha256").update(await readFile(path)).digest("hex");
  const evidence = {
    schema_version: 1,
    component: manifest.component,
    version: manifest.version,
    ecosystem_release: manifest.ecosystem_release,
    commit: process.env.GITHUB_SHA ?? "local",
    files: {
      "release-manifest.json": await hash("release-manifest.json"),
      "package-lock.json": await hash("package-lock.json"),
    },
  };
  await mkdir("release-evidence", { recursive: true });
  await writeFile("release-evidence/frontend.json", JSON.stringify(evidence, null, 2));
}

console.log(`release válido: ${manifest.component} v${manifest.version}`);
