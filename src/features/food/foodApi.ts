const BACKEND_BASE_URL = (import.meta as any).env?.VITE_BACKEND_BASE_URL as
  | string
  | undefined;

const CACHE_KEY = "balanced.foodLogs.cache.v1";
const QUEUE_KEY = "balanced.foodLogs.queue.v1";
const TEMP_ID_KEY = "balanced.foodLogs.tempId.v1";
let backendReachable = true;

export type FoodLogPayload = {
  name: string;
  time: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type FoodLogEntity = FoodLogPayload & {
  id: number;
};

type OfflineOp =
  | {
      type: "add";
      tempId: number;
      payload: FoodLogPayload;
      clientMutationId: string;
    }
  | {
      type: "update";
      id: number;
      payload: FoodLogPayload;
      clientMutationId: string;
    }
  | { type: "delete"; id: number; clientMutationId: string };

function getAuthHeaders(clientMutationId?: string) {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(clientMutationId ? { "X-Client-Mutation-Id": clientMutationId } : {}),
  };
}

function createClientMutationId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `cmid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readCache() {
  return readJson<FoodLogEntity[]>(CACHE_KEY, []);
}

function writeCache(logs: FoodLogEntity[]) {
  writeJson(CACHE_KEY, logs);
}

function readQueue() {
  return readJson<OfflineOp[]>(QUEUE_KEY, []);
}

function writeQueue(queue: OfflineOp[]) {
  writeJson(QUEUE_KEY, queue);
}

function isNavigatorOnline() {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

function isOfflineLikeError(err: unknown) {
  if (!err || typeof err !== "object") return false;
  const message = "message" in err ? String(err.message) : "";
  return (
    !isNavigatorOnline() ||
    message.includes("Failed to fetch") ||
    message.includes("NetworkError") ||
    message.includes("Network request failed")
  );
}

function ensureBackendUrl() {
  if (!BACKEND_BASE_URL) {
    throw new Error("Missing VITE_BACKEND_BASE_URL");
  }
  return BACKEND_BASE_URL;
}

function setBackendReachable(value: boolean) {
  backendReachable = value;
}

export function isFoodLogBackendReachable() {
  return backendReachable;
}

function nextTempId() {
  const current = Number(localStorage.getItem(TEMP_ID_KEY) || "-1");
  const next = current - 1;
  localStorage.setItem(TEMP_ID_KEY, String(next));
  return current;
}

function upsertInCache(item: FoodLogEntity) {
  const cache = readCache();
  const idx = cache.findIndex((it) => it.id === item.id);
  if (idx >= 0) cache[idx] = item;
  else cache.push(item);
  writeCache(cache);
}

function removeFromCache(id: number) {
  writeCache(readCache().filter((it) => it.id !== id));
}

function replaceIdInCache(oldId: number, newItem: FoodLogEntity) {
  const cache = readCache().filter((it) => it.id !== oldId);
  cache.push(newItem);
  writeCache(cache);
}

async function fetchFoodLogsOnline(): Promise<FoodLogEntity[]> {
  const res = await fetch(
    `${ensureBackendUrl()}/api/food-logs?page=0&size=100`,
    {
      headers: getAuthHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to fetch food logs");
  const data = await res.json();
  setBackendReachable(true);
  return data.content || [];
}

async function fetchFoodLogsByDateOnline(
  date: string,
): Promise<FoodLogEntity[]> {
  const params = new URLSearchParams({ date });
  const res = await fetch(
    `${ensureBackendUrl()}/api/food-logs/day?${params.toString()}`,
    {
      headers: getAuthHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to fetch food logs for date");
  const data = await res.json();
  setBackendReachable(true);
  return data;
}

async function addFoodLogOnline(
  log: FoodLogPayload,
  clientMutationId?: string,
): Promise<FoodLogEntity> {
  const res = await fetch(`${ensureBackendUrl()}/api/food-logs`, {
    method: "POST",
    headers: getAuthHeaders(clientMutationId),
    body: JSON.stringify(log),
  });
  if (!res.ok) throw new Error("Failed to add food log");
  const data = await res.json();
  setBackendReachable(true);
  return data;
}

async function updateFoodLogOnline(
  id: number,
  log: FoodLogPayload,
  clientMutationId?: string,
): Promise<FoodLogEntity> {
  const res = await fetch(`${ensureBackendUrl()}/api/food-logs/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(clientMutationId),
    body: JSON.stringify(log),
  });
  if (!res.ok) throw new Error("Failed to update food log");
  const data = await res.json();
  setBackendReachable(true);
  return data;
}

async function deleteFoodLogOnline(id: number, clientMutationId?: string) {
  const res = await fetch(`${ensureBackendUrl()}/api/food-logs/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(clientMutationId),
  });
  if (!res.ok) throw new Error("Failed to delete food log");
  setBackendReachable(true);
}

function enqueue(op: OfflineOp) {
  const queue = readQueue();

  if (op.type === "delete" && op.id < 0) {
    const nextQueue = queue.filter(
      (q) =>
        !(q.type === "add" && q.tempId === op.id) &&
        !("id" in q && q.id === op.id),
    );
    writeQueue(nextQueue);
    return;
  }

  if (op.type === "update") {
    const idx = queue.findIndex((q) => q.type === "update" && q.id === op.id);
    if (idx >= 0) {
      queue[idx] = op;
      writeQueue(queue);
      return;
    }
  }

  queue.push(op);
  writeQueue(queue);
}

export function getPendingFoodLogSyncCount() {
  return readQueue().length;
}

export async function syncFoodLogQueue() {
  if (!isNavigatorOnline()) return;

  let queue = readQueue();
  if (queue.length === 0) return;

  for (let i = 0; i < queue.length; i += 1) {
    const op = queue[i];

    try {
      if (op.type === "add") {
        const created = await addFoodLogOnline(op.payload, op.clientMutationId);
        replaceIdInCache(op.tempId, created);

        queue = queue.map((queuedOp) => {
          if (queuedOp.type === "update" && queuedOp.id === op.tempId) {
            return { ...queuedOp, id: created.id };
          }
          if (queuedOp.type === "delete" && queuedOp.id === op.tempId) {
            return { ...queuedOp, id: created.id };
          }
          return queuedOp;
        });
        writeQueue(queue);
      }

      if (op.type === "update") {
        if (op.id >= 0) {
          const updated = await updateFoodLogOnline(
            op.id,
            op.payload,
            op.clientMutationId,
          );
          upsertInCache(updated);
        }
      }

      if (op.type === "delete") {
        if (op.id >= 0) {
          await deleteFoodLogOnline(op.id, op.clientMutationId);
        }
        removeFromCache(op.id);
      }

      queue = queue.slice(1);
      writeQueue(queue);
      i -= 1;
    } catch (err) {
      if (isOfflineLikeError(err)) {
        setBackendReachable(false);
        writeQueue(queue);
        return;
      }
      throw err;
    }
  }

  try {
    const logs = await fetchFoodLogsOnline();
    writeCache(logs);
  } catch {
    // Keep local cache as-is if a final refresh fails.
  }
}

export async function fetchFoodLogs() {
  try {
    await syncFoodLogQueue();
    const logs = await fetchFoodLogsOnline();
    writeCache(logs);
    return logs;
  } catch (err) {
    if (!isOfflineLikeError(err)) throw err;
    setBackendReachable(false);
    return readCache();
  }
}

export async function fetchFoodLogsByDate(date: string) {
  try {
    await syncFoodLogQueue();
    const logs = await fetchFoodLogsByDateOnline(date);
    const cache = readCache().filter((log) => log.date !== date || log.id < 0);
    writeCache([...cache, ...logs]);
    return logs;
  } catch (err) {
    if (!isOfflineLikeError(err)) throw err;
    setBackendReachable(false);
    return readCache().filter((log) => log.date === date);
  }
}

export async function addFoodLogApi(log: FoodLogPayload) {
  const clientMutationId = createClientMutationId();

  try {
    await syncFoodLogQueue();
    const created = await addFoodLogOnline(log, clientMutationId);
    upsertInCache(created);
    return created;
  } catch (err) {
    if (!isOfflineLikeError(err)) throw err;
    setBackendReachable(false);

    const tempId = nextTempId();
    const tempLog: FoodLogEntity = { id: tempId, ...log };
    upsertInCache(tempLog);
    enqueue({ type: "add", tempId, payload: log, clientMutationId });
    return tempLog;
  }
}

export async function updateFoodLogApi(id: number, log: FoodLogPayload) {
  const clientMutationId = createClientMutationId();

  try {
    await syncFoodLogQueue();
    const updated = await updateFoodLogOnline(id, log, clientMutationId);
    upsertInCache(updated);
    return updated;
  } catch (err) {
    if (!isOfflineLikeError(err)) throw err;
    setBackendReachable(false);

    upsertInCache({ id, ...log });
    enqueue({ type: "update", id, payload: log, clientMutationId });
    return { id, ...log };
  }
}

export async function deleteFoodLogApi(id: number) {
  const clientMutationId = createClientMutationId();

  try {
    await syncFoodLogQueue();
    await deleteFoodLogOnline(id, clientMutationId);
    removeFromCache(id);
    return true;
  } catch (err) {
    if (!isOfflineLikeError(err)) throw err;
    setBackendReachable(false);

    removeFromCache(id);
    enqueue({ type: "delete", id, clientMutationId });
    return true;
  }
}

export async function startFoodLogGenerator(
  date: string,
  batchSize = 5,
  intervalMs = 2000,
) {
  const res = await fetch(
    `${ensureBackendUrl()}/api/food-logs/generator/start`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ date, batchSize, intervalMs }),
    },
  );
  if (!res.ok) throw new Error("Failed to start food log generator");
  return await res.json();
}

export async function stopFoodLogGenerator() {
  const res = await fetch(
    `${ensureBackendUrl()}/api/food-logs/generator/stop`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to stop food log generator");
  return await res.json();
}
