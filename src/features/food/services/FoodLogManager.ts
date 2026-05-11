import type {
  FoodLogEntity,
  FoodLogPageEntity,
  FoodLogPayload,
  LogGroupEntity,
  LogGroupPayload,
} from "../types/foodLog";
import {
  addFoodLogOnline as addFoodLogRepository,
  addLogGroupOnline as addLogGroupRepository,
  deleteFoodLogOnline as deleteFoodLogRepository,
  deleteLogGroupOnline as deleteLogGroupRepository,
  fetchFoodLogsByDateGraphql as fetchFoodLogsByDateGraphqlRepository,
  fetchFoodLogsByDateOnline as fetchFoodLogsByDateRepository,
  fetchFoodLogsOnline as fetchFoodLogsRepository,
  fetchFoodLogsPageOnline as fetchFoodLogsPageRepository,
  fetchLogGroupsOnline as fetchLogGroupsRepository,
  startFoodLogGeneratorOnline,
  stopFoodLogGeneratorOnline,
  updateFoodLogOnline as updateFoodLogRepository,
  updateLogGroupOnline as updateLogGroupRepository,
} from "./FoodLogRepository";

const CACHE_KEY = "balanced.foodLogs.cache.v1";
const CACHE_BY_DATE_KEY = "balanced.foodLogs.cacheByDate.v1";
const QUEUE_KEY = "balanced.foodLogs.queue.v1";
const TEMP_ID_KEY = "balanced.foodLogs.tempId.v1";
const LOG_GROUP_CACHE_KEY = "balanced.logGroups.cache.v1";
const LOG_GROUP_QUEUE_KEY = "balanced.logGroups.queue.v1";
const LOG_GROUP_TEMP_ID_KEY = "balanced.logGroups.tempId.v1";
const API_STATE_EVENT = "balanced:foodlog-api-state-change";
let backendReachable = true;
let authRequired = false;
let syncFoodLogQueuePromise: Promise<void> | null = null;
let syncLogGroupQueuePromise: Promise<void> | null = null;

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

type LogGroupOfflineOp =
  | {
      type: "add";
      tempId: number;
      payload: LogGroupPayload;
      clientMutationId: string;
    }
  | {
      type: "update";
      id: number;
      payload: LogGroupPayload;
      clientMutationId: string;
    }
  | { type: "delete"; id: number; clientMutationId: string };

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

function readLogGroupCache() {
  return readJson<LogGroupEntity[]>(LOG_GROUP_CACHE_KEY, []);
}

function writeLogGroupCache(groups: LogGroupEntity[]) {
  writeJson(LOG_GROUP_CACHE_KEY, groups);
}

function readLogGroupQueue() {
  return readJson<LogGroupOfflineOp[]>(LOG_GROUP_QUEUE_KEY, []);
}

function writeLogGroupQueue(queue: LogGroupOfflineOp[]) {
  writeJson(LOG_GROUP_QUEUE_KEY, queue);
}

function readCacheByDate() {
  return readJson<Record<string, FoodLogEntity[]>>(CACHE_BY_DATE_KEY, {});
}

function writeCacheByDate(cacheByDate: Record<string, FoodLogEntity[]>) {
  writeJson(CACHE_BY_DATE_KEY, cacheByDate);
}

function writeDateCache(date: string, logs: FoodLogEntity[]) {
  const cacheByDate = readCacheByDate();
  cacheByDate[date] = logs;
  writeCacheByDate(cacheByDate);
}

function readDateCache(date: string) {
  return readCacheByDate()[date] || [];
}

function writeQueue(queue: OfflineOp[]) {
  writeJson(QUEUE_KEY, queue);
}

function nextLogGroupTempId() {
  const current = Number(localStorage.getItem(LOG_GROUP_TEMP_ID_KEY) || "-1");
  const next = current - 1;
  localStorage.setItem(LOG_GROUP_TEMP_ID_KEY, String(next));
  return current;
}

function isNavigatorOnline() {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

function isOfflineLikeError(err: unknown) {
  if (!err || typeof err !== "object") return false;
  const message = "message" in err ? String(err.message).toLowerCase() : "";
  return (
    !isNavigatorOnline() ||
    message.includes("failed to fetch") ||
    message.includes("fetch failed") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("load failed") ||
    message.includes("could not connect") ||
    message.includes("access control")
  );
}

function isAuthError(err: unknown) {
  if (!err || typeof err !== "object") return false;
  const maybeStatus = "status" in err ? Number(err.status) : NaN;
  const maybeCode = "code" in err ? String(err.code) : "";
  return (
    maybeStatus === 401 || maybeStatus === 403 || maybeCode === "AUTH_REQUIRED"
  );
}

function isRecoverableLocalError(err: unknown) {
  return isOfflineLikeError(err) || isAuthError(err);
}

function getHttpStatus(err: unknown) {
  if (!err || typeof err !== "object") return undefined;
  const status = "status" in err ? Number(err.status) : NaN;
  return Number.isFinite(status) ? status : undefined;
}

function emitApiStateChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(API_STATE_EVENT));
}

function setBackendReachable(value: boolean) {
  if (backendReachable === value) return;
  backendReachable = value;
  emitApiStateChange();
}

function setAuthRequired(value: boolean) {
  if (authRequired === value) return;
  authRequired = value;
  emitApiStateChange();
}

export function onFoodLogApiStateChange(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => listener();
  window.addEventListener(API_STATE_EVENT, handler);
  return () => {
    window.removeEventListener(API_STATE_EVENT, handler);
  };
}

export function isFoodLogBackendReachable() {
  return backendReachable;
}

export function isFoodLogAuthRequired() {
  return authRequired;
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

function upsertLogGroupInCache(group: LogGroupEntity) {
  const cache = readLogGroupCache();
  const idx = cache.findIndex((it) => it.id === group.id);
  if (idx >= 0) cache[idx] = group;
  else cache.push(group);
  writeLogGroupCache(cache);
}

function removeLogGroupFromCache(id: number) {
  writeLogGroupCache(readLogGroupCache().filter((it) => it.id !== id));
}

function replaceLogGroupIdInCache(oldId: number, newItem: LogGroupEntity) {
  const cache = readLogGroupCache().filter((it) => it.id !== oldId);
  cache.push(newItem);
  writeLogGroupCache(cache);
}

function remapFoodLogGroupIdReferences(oldGroupId: number, newGroupId: number) {
  const logs = readCache().map((log) =>
    log.logGroupId === oldGroupId ? { ...log, logGroupId: newGroupId } : log,
  );
  writeCache(logs);

  const cacheByDate = readCacheByDate();
  Object.keys(cacheByDate).forEach((date) => {
    cacheByDate[date] = cacheByDate[date].map((log) =>
      log.logGroupId === oldGroupId ? { ...log, logGroupId: newGroupId } : log,
    );
  });
  writeCacheByDate(cacheByDate);

  const queue = readQueue().map((op) => {
    if (op.type === "add" || op.type === "update") {
      if (op.payload.logGroupId === oldGroupId) {
        return {
          ...op,
          payload: { ...op.payload, logGroupId: newGroupId },
        };
      }
    }
    return op;
  });
  writeQueue(queue);
}

function removeLogsForDeletedGroup(groupId: number) {
  const logsToDelete = readCache().filter((log) => log.logGroupId === groupId);
  const idsToDelete = new Set(logsToDelete.map((log) => log.id));

  if (idsToDelete.size === 0) return;

  writeCache(readCache().filter((log) => !idsToDelete.has(log.id)));

  const cacheByDate = readCacheByDate();
  Object.keys(cacheByDate).forEach((date) => {
    cacheByDate[date] = cacheByDate[date].filter(
      (log) => !idsToDelete.has(log.id),
    );
  });
  writeCacheByDate(cacheByDate);

  const queue = readQueue().filter((op) => {
    if (op.type === "add") {
      return !idsToDelete.has(op.tempId);
    }
    return !idsToDelete.has(op.id);
  });
  writeQueue(queue);
}

function markBackendHealthy() {
  setBackendReachable(true);
  setAuthRequired(false);
}

async function runOnline<T>(operation: () => Promise<T>) {
  const result = await operation();
  markBackendHealthy();
  return result;
}

async function fetchFoodLogsOnline() {
  return runOnline(fetchFoodLogsRepository);
}

export async function fetchFoodLogsPageApi(
  page: number,
  size: number,
): Promise<FoodLogPageEntity> {
  return runOnline(() => fetchFoodLogsPageRepository(page, size));
}

async function fetchFoodLogsByDateOnline(date: string) {
  return runOnline(() => fetchFoodLogsByDateRepository(date));
}

async function fetchFoodLogsByDateGraphql(date: string) {
  return runOnline(() => fetchFoodLogsByDateGraphqlRepository(date));
}

async function addFoodLogOnline(
  log: FoodLogPayload,
  clientMutationId?: string,
) {
  return runOnline(() => addFoodLogRepository(log, clientMutationId));
}

async function updateFoodLogOnline(
  id: number,
  log: FoodLogPayload,
  clientMutationId?: string,
) {
  return runOnline(() => updateFoodLogRepository(id, log, clientMutationId));
}

async function deleteFoodLogOnline(id: number, clientMutationId?: string) {
  return runOnline(() => deleteFoodLogRepository(id, clientMutationId));
}

async function fetchLogGroupsOnline() {
  return runOnline(fetchLogGroupsRepository);
}

async function addLogGroupOnline(
  payload: LogGroupPayload,
  clientMutationId?: string,
) {
  return runOnline(() => addLogGroupRepository(payload, clientMutationId));
}

async function updateLogGroupOnline(
  id: number,
  payload: LogGroupPayload,
  clientMutationId?: string,
) {
  return runOnline(() =>
    updateLogGroupRepository(id, payload, clientMutationId),
  );
}

async function deleteLogGroupOnline(id: number, clientMutationId?: string) {
  return runOnline(() => deleteLogGroupRepository(id, clientMutationId));
}

function enqueueLogGroup(op: LogGroupOfflineOp) {
  const queue = readLogGroupQueue();

  if (op.type === "delete" && op.id < 0) {
    const nextQueue = queue.filter(
      (q) =>
        !(q.type === "add" && q.tempId === op.id) &&
        !(q.type === "update" && q.id === op.id),
    );
    writeLogGroupQueue(nextQueue);
    return;
  }

  if (op.type === "update") {
    const idx = queue.findIndex((q) => q.type === "update" && q.id === op.id);
    if (idx >= 0) {
      queue[idx] = op;
      writeLogGroupQueue(queue);
      return;
    }
  }

  queue.push(op);
  writeLogGroupQueue(queue);
}

async function syncLogGroupQueue() {
  if (syncLogGroupQueuePromise) {
    await syncLogGroupQueuePromise;
    return;
  }

  syncLogGroupQueuePromise = (async () => {
    if (!isNavigatorOnline()) return;

    let queue = readLogGroupQueue();
    if (queue.length === 0) return;

    for (let i = 0; i < queue.length; i += 1) {
      const op = queue[i];

      try {
        if (op.type === "add") {
          const created = await addLogGroupOnline(
            op.payload,
            op.clientMutationId,
          );
          replaceLogGroupIdInCache(op.tempId, created);
          remapFoodLogGroupIdReferences(op.tempId, created.id);

          queue = queue.map((queuedOp) => {
            if (queuedOp.type === "update" && queuedOp.id === op.tempId) {
              return { ...queuedOp, id: created.id };
            }
            if (queuedOp.type === "delete" && queuedOp.id === op.tempId) {
              return { ...queuedOp, id: created.id };
            }
            return queuedOp;
          });
          writeLogGroupQueue(queue);
        }

        if (op.type === "update") {
          if (op.id >= 0) {
            const updated = await updateLogGroupOnline(
              op.id,
              op.payload,
              op.clientMutationId,
            );
            upsertLogGroupInCache(updated);
          }
        }

        if (op.type === "delete") {
          if (op.id >= 0) {
            await deleteLogGroupOnline(op.id, op.clientMutationId);
          }
          removeLogsForDeletedGroup(op.id);
          removeLogGroupFromCache(op.id);
        }

        queue = queue.slice(1);
        writeLogGroupQueue(queue);
        i -= 1;
      } catch (err) {
        const status = getHttpStatus(err);

        if (status === 404 && op.type === "delete") {
          removeLogsForDeletedGroup(op.id);
          removeLogGroupFromCache(op.id);
          queue = queue.slice(1);
          writeLogGroupQueue(queue);
          i -= 1;
          continue;
        }

        if (status === 404 && op.type === "update") {
          try {
            const recreated = await addLogGroupOnline(
              op.payload,
              op.clientMutationId,
            );
            upsertLogGroupInCache(recreated);

            queue = queue.map((queuedOp) => {
              if (queuedOp.type === "update" && queuedOp.id === op.id) {
                return { ...queuedOp, id: recreated.id };
              }
              if (queuedOp.type === "delete" && queuedOp.id === op.id) {
                return { ...queuedOp, id: recreated.id };
              }
              return queuedOp;
            });

            queue = queue.slice(1);
            writeLogGroupQueue(queue);
            i -= 1;
            continue;
          } catch (recreateErr) {
            if (isRecoverableLocalError(recreateErr)) {
              setBackendReachable(false);
              setAuthRequired(isAuthError(recreateErr));
              writeLogGroupQueue(queue);
              return;
            }
            throw recreateErr;
          }
        }

        if (isRecoverableLocalError(err)) {
          setBackendReachable(false);
          setAuthRequired(isAuthError(err));
          writeLogGroupQueue(queue);
          return;
        }
        throw err;
      }
    }

    try {
      const groups = await fetchLogGroupsOnline();
      writeLogGroupCache(groups);
    } catch {
      // Keep local group cache if final refresh fails.
    }
  })();

  try {
    await syncLogGroupQueuePromise;
  } finally {
    syncLogGroupQueuePromise = null;
  }
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
  return readQueue().length + readLogGroupQueue().length;
}

export async function syncFoodLogQueue() {
  await syncLogGroupQueue();

  if (syncFoodLogQueuePromise) {
    await syncFoodLogQueuePromise;
    return;
  }

  syncFoodLogQueuePromise = (async () => {
    if (!isNavigatorOnline()) return;

    let queue = readQueue();
    if (queue.length === 0) return;

    for (let i = 0; i < queue.length; i += 1) {
      const op = queue[i];

      try {
        if (op.type === "add") {
          const created = await addFoodLogOnline(
            op.payload,
            op.clientMutationId,
          );
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
        const status = getHttpStatus(err);

        // When backend restarts without persistence, old ids can disappear.
        // Resolve these queue items instead of getting stuck in endless syncing.
        if (status === 404 && op.type === "delete") {
          removeFromCache(op.id);
          queue = queue.slice(1);
          writeQueue(queue);
          i -= 1;
          continue;
        }

        if (status === 404 && op.type === "update") {
          try {
            const recreated = await addFoodLogOnline(
              op.payload,
              op.clientMutationId,
            );
            upsertInCache(recreated);

            queue = queue.map((queuedOp) => {
              if (queuedOp.type === "update" && queuedOp.id === op.id) {
                return { ...queuedOp, id: recreated.id };
              }
              if (queuedOp.type === "delete" && queuedOp.id === op.id) {
                return { ...queuedOp, id: recreated.id };
              }
              return queuedOp;
            });

            queue = queue.slice(1);
            writeQueue(queue);
            i -= 1;
            continue;
          } catch (recreateErr) {
            if (isRecoverableLocalError(recreateErr)) {
              setBackendReachable(false);
              setAuthRequired(isAuthError(recreateErr));
              writeQueue(queue);
              return;
            }
            throw recreateErr;
          }
        }

        if (isRecoverableLocalError(err)) {
          setBackendReachable(false);
          setAuthRequired(isAuthError(err));
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
  })();

  try {
    await syncFoodLogQueuePromise;
  } finally {
    syncFoodLogQueuePromise = null;
  }
}

export async function fetchFoodLogs() {
  try {
    await syncFoodLogQueue();
    const logs = await fetchFoodLogsOnline();
    writeCache(logs);
    return logs;
  } catch (err) {
    if (!isRecoverableLocalError(err)) throw err;
    setBackendReachable(false);
    setAuthRequired(isAuthError(err));
    return readCache();
  }
}

export async function fetchFoodLogsByDate(date: string) {
  try {
    await syncFoodLogQueue();
    let logs: FoodLogEntity[];

    try {
      logs = await fetchFoodLogsByDateGraphql(date);
    } catch (graphqlErr) {
      if (isRecoverableLocalError(graphqlErr)) {
        throw graphqlErr;
      }
      logs = await fetchFoodLogsByDateOnline(date);
    }

    const cache = readCache().filter((log) => log.date !== date || log.id < 0);
    writeCache([...cache, ...logs]);
    writeDateCache(date, logs);
    return logs;
  } catch (err) {
    if (!isRecoverableLocalError(err)) throw err;
    setBackendReachable(false);
    setAuthRequired(isAuthError(err));

    const dateCache = readDateCache(date);
    if (dateCache.length > 0) return dateCache;
    return readCache().filter((log) => log.date === date);
  }
}

export async function addFoodLogApi(log: FoodLogPayload) {
  const clientMutationId = createClientMutationId();

  try {
    await syncFoodLogQueue();
    const created = await addFoodLogOnline(log, clientMutationId);
    upsertInCache(created);
    writeDateCache(created.date, [
      ...readDateCache(created.date).filter((item) => item.id !== created.id),
      created,
    ]);
    return created;
  } catch (err) {
    if (!isRecoverableLocalError(err)) throw err;
    setBackendReachable(false);
    setAuthRequired(isAuthError(err));

    const tempId = nextTempId();
    const tempLog: FoodLogEntity = { id: tempId, ...log };
    upsertInCache(tempLog);
    writeDateCache(log.date, [
      ...readDateCache(log.date).filter((item) => item.id !== tempId),
      tempLog,
    ]);
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
    writeDateCache(updated.date, [
      ...readDateCache(updated.date).filter((item) => item.id !== updated.id),
      updated,
    ]);
    return updated;
  } catch (err) {
    if (!isRecoverableLocalError(err)) throw err;
    setBackendReachable(false);
    setAuthRequired(isAuthError(err));

    const localUpdated = { id, ...log };
    upsertInCache(localUpdated);
    writeDateCache(log.date, [
      ...readDateCache(log.date).filter((item) => item.id !== id),
      localUpdated,
    ]);
    enqueue({ type: "update", id, payload: log, clientMutationId });
    return localUpdated;
  }
}

export async function deleteFoodLogApi(id: number) {
  const clientMutationId = createClientMutationId();

  try {
    await syncFoodLogQueue();
    await deleteFoodLogOnline(id, clientMutationId);
    removeFromCache(id);

    const cacheByDate = readCacheByDate();
    Object.keys(cacheByDate).forEach((date) => {
      cacheByDate[date] = cacheByDate[date].filter((item) => item.id !== id);
    });
    writeCacheByDate(cacheByDate);
    return true;
  } catch (err) {
    if (!isRecoverableLocalError(err)) throw err;
    setBackendReachable(false);
    setAuthRequired(isAuthError(err));

    removeFromCache(id);

    const cacheByDate = readCacheByDate();
    Object.keys(cacheByDate).forEach((date) => {
      cacheByDate[date] = cacheByDate[date].filter((item) => item.id !== id);
    });
    writeCacheByDate(cacheByDate);

    enqueue({ type: "delete", id, clientMutationId });
    return true;
  }
}

export async function startFoodLogGenerator(
  date: string,
  batchSize = 5,
  intervalMs = 2000,
) {
  return runOnline(() =>
    startFoodLogGeneratorOnline(date, batchSize, intervalMs),
  );
}

export async function stopFoodLogGenerator() {
  return runOnline(stopFoodLogGeneratorOnline);
}

export async function fetchLogGroupsApi() {
  try {
    await syncLogGroupQueue();
    const groups = await fetchLogGroupsOnline();
    writeLogGroupCache(groups);
    return groups;
  } catch (err) {
    if (!isRecoverableLocalError(err)) throw err;
    setBackendReachable(false);
    setAuthRequired(isAuthError(err));
    return readLogGroupCache();
  }
}

export async function createLogGroupApi(payload: LogGroupPayload) {
  const clientMutationId = createClientMutationId();

  try {
    await syncLogGroupQueue();
    const created = await addLogGroupOnline(payload, clientMutationId);
    upsertLogGroupInCache(created);
    return created;
  } catch (err) {
    if (!isRecoverableLocalError(err)) throw err;
    setBackendReachable(false);
    setAuthRequired(isAuthError(err));

    const tempId = nextLogGroupTempId();
    const tempGroup: LogGroupEntity = { id: tempId, ...payload };
    upsertLogGroupInCache(tempGroup);
    enqueueLogGroup({
      type: "add",
      tempId,
      payload,
      clientMutationId,
    });
    return tempGroup;
  }
}

export async function updateLogGroupApi(id: number, payload: LogGroupPayload) {
  const clientMutationId = createClientMutationId();

  try {
    await syncLogGroupQueue();
    const updated = await updateLogGroupOnline(id, payload, clientMutationId);
    upsertLogGroupInCache(updated);
    return updated;
  } catch (err) {
    if (!isRecoverableLocalError(err)) throw err;
    setBackendReachable(false);
    setAuthRequired(isAuthError(err));

    const localUpdated: LogGroupEntity = { id, ...payload };
    upsertLogGroupInCache(localUpdated);
    enqueueLogGroup({ type: "update", id, payload, clientMutationId });
    return localUpdated;
  }
}

export async function deleteLogGroupApi(id: number) {
  const clientMutationId = createClientMutationId();

  try {
    await syncLogGroupQueue();
    await deleteLogGroupOnline(id, clientMutationId);
    removeLogsForDeletedGroup(id);
    removeLogGroupFromCache(id);
    return true;
  } catch (err) {
    if (!isRecoverableLocalError(err)) throw err;
    setBackendReachable(false);
    setAuthRequired(isAuthError(err));

    removeLogsForDeletedGroup(id);
    removeLogGroupFromCache(id);
    enqueueLogGroup({ type: "delete", id, clientMutationId });
    return true;
  }
}
