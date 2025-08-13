// public/esbuild.mjs
import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";

const isWatch = process.argv.includes("--watch");


// 🍱 Copy static assets
const copyStaticAssets = () => {
  const assetsToCopy = [
    { from: "src/index.html", to: "dist/index.html" },
    { from: "src/css", to: "dist/css" },
    { from: "src/assets", to: "dist/assets" },
  ];

  assetsToCopy.forEach(({ from, to }) => {
    const fromPath = path.resolve(from);
    const toPath = path.resolve(to);

    if (fs.existsSync(fromPath)) {
      const stats = fs.statSync(fromPath);
      if (stats.isDirectory()) {
        fs.cpSync(fromPath, toPath, { recursive: true });
      } else {
        fs.mkdirSync(path.dirname(toPath), { recursive: true });
        fs.copyFileSync(fromPath, toPath);
      }
      console.log(`📦 Copied: ${from} → ${to}`);
    } else {
      console.warn(`⚠️ File or folder not found: ${from}`);
    }
  });
};

//Auto-discover view modules
const discoverViewFiles = () => {
  const viewDir = "src/ts/dashboard/views";
  if (!fs.existsSync(viewDir)) return [];
  return fs
    .readdirSync(viewDir)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => `${viewDir}/${file}`);
};
const entryPoints = [
  "src/ts/app.ts",
  "src/ts/dashboard/app.ts",
  ...discoverViewFiles(),
];
// 🌐 Start esbuild context
const buildOptions = {
  entryPoints,
  entryNames: "[dir]/[name]",
  bundle: true,
  outdir: "dist/js",
  platform: "browser",
  minify: false,
  format: "esm",
  target: "es2022",
  sourcemap: true,
  loader: {
    ".ts": "ts",
    ".css": "css",
  },
  logLevel: "info",
  ignoreAnnotations: true,
  supported: {
    "import-meta": true,
    "dynamic-import": true,
  },
};

if (isWatch) {

  const context = await esbuild.context(buildOptions);
  await context.watch();
  console.log("👀 Watching for changes...");

}
else {
  await esbuild.build(buildOptions);

}
copyStaticAssets();
console.log("✅ Initial build complete");