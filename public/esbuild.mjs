// public/esbuild.mjs
import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { WebSocketServer } from "ws";

const isWatch = process.argv.includes("--watch");

const LIVE_RELOAD_PORT = 35729;
let reloadServer;

if (isWatch) {
  reloadServer = new WebSocketServer({port:LIVE_RELOAD_PORT});
  console.log(
    `🔌 Live reload server running on ws://localhost:${LIVE_RELOAD_PORT}`
  );
}
const broadcastReload = () => {
  console.log("🔁 Broadcasting reload to clients");
  reloadServer?.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send("reload");
    }
  });
};

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
// 🌐 Start esbuild context
const context = await esbuild.context({
  entryPoints: ["src/ts/hmr.ts"],
  ignoreAnnotations:true,
  supported:{
    "import-meta":true,
    "dynamic-import":true,
  },
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


copyStaticAssets();
console.log("✅ Initial build complete");
// 🚀 Launch live-server in watch mode
if (isWatch) {
   // Start dev server
  const server = await context.serve({
    servedir: "dist",
    port: 3000,
  });
  console.log(`🚀 Running at http://localhost:${server.port}`);

 

  // You can optionally watch your static files separately
  fs.watch("src", { recursive: true }, async(eventType, filename) => {
  if(!filename) return;
  console.log(`📝 Change detected in: ${filename}`);
  
  try {
    await context.rebuild();
    copyStaticAssets();
    broadcastReload();
    
  } catch (error) {
    console.error("Rebuild error:", error)
  }
  
  });

 
} else {
  await context.rebuild();
  await context.dispose();
}
