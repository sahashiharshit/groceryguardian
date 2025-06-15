// public/esbuild.mjs
import * as esbuild from 'esbuild';
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

const context = await esbuild.context({
  entryPoints: [
    "src/ts/app.ts",
    "src/ts/dashboard/app.ts",    
  ],
  bundle: true,
  outdir: "dist/js",
  platform: "browser",
  format: "esm",
  target: "es2022",
  sourcemap: true,
  loader: {
    ".ts": "ts",
    ".css": "css",
  },
  logLevel: "info",
 
});

console.log("✅ Initial build complete");
copyStaticAssets();

// 🚀 Launch live-server in watch mode
if (isWatch) {
  await context.watch();

  console.log('👀 Watching for changes...');

  // Copy static assets on rebuild too
  context.rebuild = async () => {
    await context.rebuild();
    copyStaticAssets();
  };

  // Start dev server
  const server = await context.serve({
    servedir: 'dist',
    port: 3000,
  });

  console.log(`🚀 Running at http://localhost:${server.port}`);
} else {
  await context.rebuild();
  await context.dispose();
}