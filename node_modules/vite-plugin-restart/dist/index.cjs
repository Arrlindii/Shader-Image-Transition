"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_node_path = __toESM(require("path"), 1);
var import_node_process = __toESM(require("process"), 1);
var import_micromatch = __toESM(require("micromatch"), 1);
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
  let root = import_node_process.default.cwd();
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
      restartGlobs = toArray(options.restart).map((i2) => import_node_path.default.posix.join(root, i2));
      reloadGlobs = toArray(options.reload).map((i2) => import_node_path.default.posix.join(root, i2));
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
        if (import_micromatch.default.isMatch(file, restartGlobs)) {
          timerState = "restart";
          schedule(() => {
            server.restart();
          });
        } else if (import_micromatch.default.isMatch(file, reloadGlobs) && timerState !== "restart") {
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
