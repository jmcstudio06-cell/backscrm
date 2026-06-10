globalThis.__nitro_main__ = import.meta.url;
import { N as NodeResponse, s as serve } from "./_libs/srvx.mjs";
import { d as defineHandler, H as HTTPError, t as toEventHandler, a as defineLazyEventHandler, b as H3Core } from "./_libs/h3.mjs";
import { d as decodePath, w as withLeadingSlash, a as withoutTrailingSlash, j as joinURL } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "./_libs/rou3.mjs";
function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./_ssr/index.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
const headers = ((m) => function headersRouteRule(event) {
  for (const [key2, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key2, value);
  }
});
const assets = {
  "/assets/cadastro-j12OzSpF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eaf-KQfWREhew8CUaMZ1m+T7ZTbd2sk"',
    "mtime": "2026-06-10T02:05:56.828Z",
    "size": 3759,
    "path": "../public/assets/cadastro-j12OzSpF.js"
  },
  "/assets/check-C8_tR7fr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7e-dzf6AXsN61iWhuLs2AUGqAo1x9Y"',
    "mtime": "2026-06-10T02:05:56.829Z",
    "size": 126,
    "path": "../public/assets/check-C8_tR7fr.js"
  },
  "/assets/download-Ca3DPFys.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ef-C/LxVmiqVHuHltM9TTqKZNNYSqY"',
    "mtime": "2026-06-10T02:05:56.829Z",
    "size": 239,
    "path": "../public/assets/download-Ca3DPFys.js"
  },
  "/assets/index-CcQSPDiu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"44b3-uD04HfDa22Rn46Gvpt52YAL+2ng"',
    "mtime": "2026-06-10T02:05:56.829Z",
    "size": 17587,
    "path": "../public/assets/index-CcQSPDiu.js"
  },
  "/assets/index-CK2BG7Sx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"217-LpQl2ZewxXQDFvWwlxklL35mcLE"',
    "mtime": "2026-06-10T02:05:56.829Z",
    "size": 535,
    "path": "../public/assets/index-CK2BG7Sx.js"
  },
  "/assets/index-D_EgvJHH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"18ae-h/bVzase7odFqJv/bzvQLaK3rNE"',
    "mtime": "2026-06-10T02:05:56.829Z",
    "size": 6318,
    "path": "../public/assets/index-D_EgvJHH.js"
  },
  "/assets/label-CTqvORWd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"cb1-nTcOVJ/6RwSKS8/T1P/1U179svo"',
    "mtime": "2026-06-10T02:05:56.829Z",
    "size": 3249,
    "path": "../public/assets/label-CTqvORWd.js"
  },
  "/assets/login-D4nxpljV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a94-BMzaSVGty5Eo9C6wck0vRluIgts"',
    "mtime": "2026-06-10T02:05:56.825Z",
    "size": 2708,
    "path": "../public/assets/login-D4nxpljV.js"
  },
  "/assets/site-footer-DdSIYuG2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"95f2-9pWoO/UdPfsCk3n88K9zSAAK0uM"',
    "mtime": "2026-06-10T02:05:56.830Z",
    "size": 38386,
    "path": "../public/assets/site-footer-DdSIYuG2.js"
  },
  "/assets/styles-B3umSPvN.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"13c4a-xyNmom6K9n2lUznnq+mIxAkw2bs"',
    "mtime": "2026-06-10T02:05:56.829Z",
    "size": 80970,
    "path": "../public/assets/styles-B3umSPvN.css"
  },
  "/assets/types-By9teAtI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ceb8-Lc3OTKYFmaHqSNtj8IViR08Fb4E"',
    "mtime": "2026-06-10T02:05:56.829Z",
    "size": 52920,
    "path": "../public/assets/types-By9teAtI.js"
  },
  "/assets/_admin-BLxv135d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5f-K7qzWbtk1KH2H04qbU0+8OSjy44"',
    "mtime": "2026-06-10T02:05:56.829Z",
    "size": 95,
    "path": "../public/assets/_admin-BLxv135d.js"
  },
  "/assets/index-BqZL2tP2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5eca4-iLHluAqBDGt3WOB/nOphaUAQFl0"',
    "mtime": "2026-06-10T02:05:56.829Z",
    "size": 388260,
    "path": "../public/assets/index-BqZL2tP2.js"
  },
  "/assets/_authenticated-BLxv135d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5f-K7qzWbtk1KH2H04qbU0+8OSjy44"',
    "mtime": "2026-06-10T02:05:56.829Z",
    "size": 95,
    "path": "../public/assets/_authenticated-BLxv135d.js"
  },
  "/assets/_authenticated.app-nOiJci-K.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"daf-GnL9haxOze5r+CdaV+83CSA3PjU"',
    "mtime": "2026-06-10T02:05:56.829Z",
    "size": 3503,
    "path": "../public/assets/_authenticated.app-nOiJci-K.js"
  },
  "/assets/_admin.dashboard-CIQ5gxD9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"17172-fOvmd4xgXbahw7N/ckZm6LbR2ww"',
    "mtime": "2026-06-10T02:05:56.829Z",
    "size": 94578,
    "path": "../public/assets/_admin.dashboard-CIQ5gxD9.js"
  },
  "/assets/useQuery-3eEXhclT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"227b-CjJ8aSrHXD0f27HNdCNV227VyYA"',
    "mtime": "2026-06-10T02:05:56.829Z",
    "size": 8827,
    "path": "../public/assets/useQuery-3eEXhclT.js"
  },
  "/assets/badge-CeAGw-Ud.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2f8-lhNvX2B6EM7TTiIku5fcQmZD/9Q"',
    "mtime": "2026-06-10T02:05:56.830Z",
    "size": 760,
    "path": "../public/assets/badge-CeAGw-Ud.js"
  }
};
function readAsset(id) {
  const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
  return promises.readFile(resolve(serverDir, assets[id].path));
}
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
function getAsset(id) {
  return assets[id];
}
const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = {
  gzip: ".gz",
  br: ".br",
  zstd: ".zst"
};
const _k9n4J4 = defineHandler((event) => {
  if (event.req.method && !METHODS.has(event.req.method)) {
    return;
  }
  let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
  let asset;
  const encodingHeader = event.req.headers.get("accept-encoding") || "";
  const encodings = [...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      event.res.headers.delete("Cache-Control");
      throw new HTTPError({ status: 404 });
    }
    return;
  }
  if (encodings.length > 1) {
    event.res.headers.append("Vary", "Accept-Encoding");
  }
  const ifNotMatch = event.req.headers.get("if-none-match") === asset.etag;
  if (ifNotMatch) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  const ifModifiedSinceH = event.req.headers.get("if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  if (asset.type) {
    event.res.headers.set("Content-Type", asset.type);
  }
  if (asset.etag && !event.res.headers.has("ETag")) {
    event.res.headers.set("ETag", asset.etag);
  }
  if (asset.mtime && !event.res.headers.has("Last-Modified")) {
    event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !event.res.headers.has("Content-Encoding")) {
    event.res.headers.set("Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !event.res.headers.has("Content-Length")) {
    event.res.headers.set("Content-Length", asset.size.toString());
  }
  return readAsset(id);
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "assets") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _lazy_4Etly7 = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_4Etly7 };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_k9n4J4)
].filter(Boolean);
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
function createNitroApp() {
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({ error, context: errorCtx });
      }
    }
  };
  const h3App = createH3App({
    onError(error, event) {
      return errorHandler(error, event);
    }
  });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  return {
    fetch: appHandler,
    h3: h3App,
    hooks: void 0,
    captureError
  };
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~middleware"].push(...globalMiddleware);
  h3App["~getMiddleware"] = (event, route) => {
    const pathname = event.url.pathname;
    const method = event.req.method;
    const middleware = [];
    const routeRules = getRouteRules(method, pathname);
    event.context.routeRules = routeRules?.routeRules;
    if (routeRules?.routeRuleMiddleware.length) {
      middleware.push(...routeRules.routeRuleMiddleware);
    }
    middleware.push(...h3App["~middleware"]);
    if (route?.data?.middleware?.length) {
      middleware.push(...route.data.middleware);
    }
    return middleware;
  };
  return h3App;
}
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
  process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
  process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
const tracingSrvxPlugins = [];
const _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
const port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
const host = process.env.NITRO_HOST || process.env.HOST;
const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
serve({
  port,
  hostname: host,
  tls: cert && key ? {
    cert,
    key
  } : void 0,
  fetch: nitroApp.fetch,
  plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
const nodeServer = {};
export {
  nodeServer as default
};
