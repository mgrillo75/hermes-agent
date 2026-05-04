import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = process.cwd();

const copies = [
  ["node_modules/@nous-research/ui/dist/fonts", "public/fonts"],
  ["node_modules/@nous-research/ui/dist/assets", "public/ds-assets"],
];

for (const [, destination] of copies) {
  rmSync(resolve(root, destination), { force: true, recursive: true });
}

for (const [source, destination] of copies) {
  const sourcePath = resolve(root, source);
  const destinationPath = resolve(root, destination);

  if (!existsSync(sourcePath)) {
    throw new Error(`Missing asset source: ${source}`);
  }

  mkdirSync(dirname(destinationPath), { recursive: true });
  cpSync(sourcePath, destinationPath, { recursive: true });
}
