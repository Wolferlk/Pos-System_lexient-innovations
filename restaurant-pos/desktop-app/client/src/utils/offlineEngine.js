import axios from "axios";

const CACHE_KEY = "pos_offline_get_cache_v1";
const QUEUE_KEY = "pos_offline_write_queue_v1";
const MAX_CACHE_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const safeJsonParse = (v, fallback) => {
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
};

const getStore = (key, fallback) => safeJsonParse(localStorage.getItem(key), fallback);
const setStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const getQueueStore = () => {
  const value = getStore(QUEUE_KEY, []);
  if (Array.isArray(value)) return value;
  setStore(QUEUE_KEY, []);
  return [];
};
const getCacheStore = () => {
  const value = getStore(CACHE_KEY, {});
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  setStore(CACHE_KEY, {});
  return {};
};

const normalizePath = (url = "") => {
  try {
    if (url.startsWith("http")) return new URL(url).pathname;
    if (url.startsWith("/")) return url;
    const i = url.indexOf("/api/");
    return i >= 0 ? url.slice(i) : url;
  } catch {
    return url;
  }
};

const stableKey = (config) => {
  const path = normalizePath(config.url || "");
  const params = config.params ? JSON.stringify(config.params) : "";
  return `${(config.method || "get").toLowerCase()}::${path}::${params}`;
};

const shouldOfflineFallback = (error) => {
  if (!error.response) return true; // network / timeout / no server
  if (error.code === "ERR_NETWORK") return true;
  return false;
};

const getCachedGetResponse = (config) => {
  const cache = getCacheStore();
  const key = stableKey(config);
  const hit = cache[key];
  if (!hit) return null;
  if (Date.now() - hit.at > MAX_CACHE_AGE_MS) return null;
  return {
    data: hit.data,
    status: 200,
    statusText: "OK",
    headers: {},
    config,
    request: { offline: true, source: "cache" },
  };
};

const cacheGetResponse = (config, response) => {
  const method = (config.method || "get").toLowerCase();
  if (method !== "get") return;
  const cache = getCacheStore();
  cache[stableKey(config)] = { at: Date.now(), data: response.data };
  setStore(CACHE_KEY, cache);
};

const enqueueWrite = (config) => {
  const queue = getQueueStore();
  queue.push({
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
    method: (config.method || "post").toLowerCase(),
    url: config.url,
    data: config.data,
    params: config.params,
    headers: {
      Authorization: config.headers?.Authorization || `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });
  setStore(QUEUE_KEY, queue);
};

let syncing = false;
export const syncQueuedWrites = async () => {
  if (syncing) return;
  const queue = getQueueStore();
  if (!queue.length) return;
  syncing = true;
  try {
    const remaining = [];
    for (const item of queue) {
      try {
        await axios.request({
          method: item.method,
          url: item.url,
          data: item.data,
          params: item.params,
          headers: item.headers,
          _offlineSyncReplay: true,
          timeout: 10000,
        });
      } catch {
        remaining.push(item);
      }
    }
    setStore(QUEUE_KEY, remaining);
  } finally {
    syncing = false;
  }
};

let initialized = false;
export const initOfflineEngine = () => {
  if (initialized) return;
  initialized = true;

  axios.interceptors.response.use(
    (response) => {
      cacheGetResponse(response.config, response);
      return response;
    },
    async (error) => {
      const config = error.config || {};
      if (!config || config._offlineSyncReplay) {
        return Promise.reject(error);
      }

      if (!shouldOfflineFallback(error)) {
        return Promise.reject(error);
      }

      const method = (config.method || "get").toLowerCase();

      if (method === "get") {
        const cached = getCachedGetResponse(config);
        if (cached) return cached;
      }

      if (method === "post" && normalizePath(config.url || "") === "/api/auth/login") {
        // Login should never be cached/queued in client.
        return Promise.reject(error);
      }

      if (["post", "put", "patch", "delete"].includes(method)) {
        enqueueWrite(config);
        return {
          data: {
            offlineQueued: true,
            message: "Request queued offline. It will sync automatically when online.",
          },
          status: 202,
          statusText: "Accepted",
          headers: {},
          config,
          request: { offline: true, source: "queue" },
        };
      }

      return Promise.reject(error);
    }
  );

  window.addEventListener("online", () => {
    syncQueuedWrites();
  });

  setInterval(() => {
    syncQueuedWrites();
  }, 15000);
};
