import { mkdir } from "node:fs/promises";
const output = process.env.DEMO_OUTPUT || "design";
await mkdir(output, { recursive: true });
import { readdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { compileComponents } from "../packages/components/src/compile.mjs";
for (const directory of ["packages/components/src/templates", "src/pages"]) {
  for (const file of await readdir(directory)) {
    if (!file.endsWith(".html")) continue;
    await writeFile(
      output + "/" + file,
      compileComponents(await readFile(directory + "/" + file, "utf8")),
    );
  }
}
await copyFile("packages/components/src/pickers.js", output + "/pickers.js");
await copyFile("packages/components/src/language-picker.js", output + "/language-picker.js");
await copyFile("packages/components/src/custom-controls.js", output + "/custom-controls.js");

// Generate prototype flag assets from the npm dependency, never a vendored copy.
import { US, JP, FR, DE } from "country-flag-icons/string/3x2";
await mkdir(output + "/assets/flags", { recursive: true });
for (const [country, svg] of Object.entries({ US, JP, FR, DE }))
  await writeFile(output + "/assets/flags/" + country + ".svg", svg);
