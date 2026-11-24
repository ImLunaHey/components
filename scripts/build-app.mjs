import { fileURLToPath } from "node:url";
import { cp, mkdir, readdir } from "node:fs/promises";
const root = fileURLToPath(new URL("../", import.meta.url));
const name = process.argv[2];
if (!["gallery", "projects", "catalogue", "account", "cardlattice", "fleet"].includes(name))
  throw Error("Unknown demo");
process.chdir(root);
process.env.DEMO_OUTPUT = `apps/${name}/dist`;
await import("../build.mjs");
await mkdir(process.env.DEMO_OUTPUT, { recursive: true });
for (const file of await readdir("design"))
  if (file.endsWith(".css")) await cp("design/" + file, process.env.DEMO_OUTPUT + "/" + file);
await cp("design/assets/examples", process.env.DEMO_OUTPUT + "/assets/examples", {
  recursive: true,
});

await cp("design/assets/flags", process.env.DEMO_OUTPUT + "/assets/flags", { recursive: true });
