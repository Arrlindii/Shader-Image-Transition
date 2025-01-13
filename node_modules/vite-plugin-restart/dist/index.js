// src/index.ts
import path from "node:path";
import process from "node:process";
import micromatch from "micromatch";
var i = 0;
function toArray(arr) {
  if (!arr)
    return [];
  if (Array.isArray(arr))
    return arr;
  return [arr];
}
function VitePluginRestart(options = {}) {
  const {
    delay = 500,
    glob: enableGlob = true
  } = options;
  let root = process.cwd();
  let reloadGlobs = [];
  let restartGlobs = [];
  let timerState = "reload";
  let timer;
  function clear() {
    clearTimeout(timer);
  }
  function schedule(fn) {
    clear();
    timer = setTimeout(fn, delay);
  }
  return {
    name: `vite-plugin-restart:${i++}`,
    apply: "serve",
    config(c) {
      if (!enableGlob)
        return;
      if (!c.server)
        c.server = {};
      if (!c.server.watch)
        c.server.watch = {};
      c.server.watch.disableGlobbing = false;
    },
    configResolved(config) {
      root = config.root;
      restartGlobs = toArray(options.restart).map((i2) => path.posix.join(root, i2));
      reloadGlobs = toArray(options.reload).map((i2) => path.posix.join(root, i2));
    },
    configureServer(server) {
      server.watcher.add([
        ...restartGlobs,
        ...reloadGlobs
      ]);
      server.watcher.on("add", handleFileChange);
      server.watcher.on("change", handleFileChange);
      server.watcher.on("unlink", handleFileChange);
      function handleFileChange(file) {
        if (micromatch.isMatch(file, restartGlobs)) {
          timerState = "restart";
          schedule(() => {
            server.restart();
          });
        } else if (micromatch.isMatch(file, reloadGlobs) && timerState !== "restart") {
          timerState = "reload";
          schedule(() => {
            server.ws.send({ type: "full-reload" });
            timerState = "";
          });
        }
      }
    }
  };
}
var src_default = VitePluginRestart;
export {
  src_default as default
};
