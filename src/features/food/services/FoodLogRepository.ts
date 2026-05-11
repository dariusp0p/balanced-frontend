import type {
  DailyFoodLogEntity,
  FoodLogEntity,
  FoodLogPageEntity,
  FoodLogPayload,
  LogGroupEntity,
  LogGroupPayload,
} from "../types/foodLog";

const BACKEND_BASE_URL = (import.meta as any).env?.VITE_BACKEND_BASE_URL as
  | string
  | undefined;
const GRAPHQL_ENDPOINT = "/graphql";

let supportsClientMutationHeader = true;

function getAuthHeaders(clientMutationId?: string) {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(clientMutationId && supportsClientMutationHeader
      ? { "X-Client-Mutation-Id": clientMutationId }
      : {}),
  };
}

async function fetchWithOptionalMutationHeader(
  url: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: string;
    clientMutationId?: string;
  } = {},
) {
  const { method = "GET", body, clientMutationId } = options;

  const run = (withMutationHeader: boolean) =>
    fetch(url, {
      method,
      headers: getAuthHeaders(
        withMutationHeader ? clientMutationId : undefined,
      ),
      ...(typeof body !== "undefined" ? { body } : {}),
    });

  const shouldTryWithMutationHeader =
    Boolean(clientMutationId) && supportsClientMutationHeader;

  try {
    return await run(shouldTryWithMutationHeader);
  } catch (err) {
    if (!shouldTryWithMutationHeader) throw err;

    // Browser blocked the custom header in CORS preflight. Retry once without it.
    supportsClientMutationHeader = false;
    return await run(false);
  }
}

function createHttpError(status: number, message: string) {
  const error = new Error(message) as Error & {
    status?: number;
    code?: string;
  };
  error.status = status;
  if (status === 401 || status === 403) {
    error.code = "AUTH_REQUIRED";
  }
  return error;
}

function ensureBackendUrl() {
  if (!BACKEND_BASE_URL) {
    throw new Error("Missing VITE_BACKEND_BASE_URL");
  }
  return BACKEND_BASE_URL;
}

export async function fetchFoodLogsOnline(): Promise<FoodLogEntity[]> {
  const res = await fetchWithOptionalMutationHeader(
    `${ensureBackendUrl()}/api/food-logs?page=0&size=100`,
  );
  if (!res.ok) throw createHttpError(res.status, "Failed to fetch food logs");
  const data = await res.json();
  return data.content || [];
}

export async function fetchFoodLogsPageOnline(
  page: number,
  size: number,
): Promise<FoodLogPageEntity> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const res = await fetchWithOptionalMutationHeader(
    `${ensureBackendUrl()}/api/food-logs?${params.toString()}`,
  );
  if (!res.ok) {
    throw createHttpError(res.status, "Failed to fetch paged food logs");
  }

  const data = await res.json();

  return {
    content: (data.content || []) as FoodLogEntity[],
    page: Number(data.page ?? page),
    size: Number(data.size ?? size),
    totalElements: Number(data.totalElements ?? 0),
    totalPages: Number(data.totalPages ?? 0),
  };
}

export async function fetchFoodLogsByDateOnline(
  date: string,
): Promise<FoodLogEntity[]> {
  const params = new URLSearchParams({ date });
  const res = await fetchWithOptionalMutationHeader(
    `${ensureBackendUrl()}/api/food-logs/day?${params.toString()}`,
  );
  if (!res.ok) {
    throw createHttpError(res.status, "Failed to fetch food logs for date");
  }
  return await res.json();
}

type GraphqlFoodLog = {
  id: string | number;
  logGroupId?: string | number | null;
  name: string;
  date: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

async function runGraphqlQuery<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const res = await fetchWithOptionalMutationHeader(
    `${ensureBackendUrl()}${GRAPHQL_ENDPOINT}`,
    {
      method: "POST",
      body: JSON.stringify({ query, variables }),
    },
  );

  if (!res.ok) {
    throw createHttpError(res.status, "GraphQL request failed");
  }

  const payload = await res.json();
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    const message = String(payload.errors[0]?.message || "GraphQL error");
    if (message.toLowerCase().includes("unauthorized")) {
      throw createHttpError(401, message);
    }
    throw new Error(message);
  }

  return payload.data as T;
}

export async function fetchFoodLogsByDateGraphql(
  date: string,
): Promise<FoodLogEntity[]> {
  const query = `
    query DailyLogForFoodLogs($date: String!) {
      dailyLog(date: $date) {
        foodLogs {
          id
          logGroupId
          name
          date
          time
          calories
          protein
          carbs
          fats
        }
      }
    }
  `;

  const data = await runGraphqlQuery<{
    dailyLog: { foodLogs: GraphqlFoodLog[] };
  }>(
    query,
    { date },
  );

  return (data.dailyLog?.foodLogs || []).map((log) => ({
    id: Number(log.id),
    logGroupId:
      log.logGroupId === null || typeof log.logGroupId === "undefined"
        ? null
        : Number(log.logGroupId),
    name: log.name,
    date: log.date,
    time: log.time,
    calories: Number(log.calories),
    protein: Number(log.protein),
    carbs: Number(log.carbs),
    fats: Number(log.fats),
  }));
}

export async function fetchDailyFoodLogGraphql(
  date: string,
): Promise<DailyFoodLogEntity> {
  const query = `
    query DailyLog($date: String!) {
      dailyLog(date: $date) {
        date
        foodLogs {
          id
          logGroupId
          name
          date
          time
          calories
          protein
          carbs
          fats
        }
        logGroups {
          id
          name
          mealType
          date
          computeFromFoodLogs
          totalCalories
          totalProtein
          totalCarbs
          totalFats
        }
      }
    }
  `;

  const data = await runGraphqlQuery<{ dailyLog: DailyFoodLogEntity }>(query, {
    date,
  });

  return {
    date: data.dailyLog.date,
    foodLogs: (data.dailyLog.foodLogs || []).map((log) => ({
      id: Number(log.id),
      logGroupId:
        log.logGroupId === null || typeof log.logGroupId === "undefined"
          ? null
          : Number(log.logGroupId),
      name: log.name,
      date: log.date,
      time: log.time,
      calories: Number(log.calories),
      protein: Number(log.protein),
      carbs: Number(log.carbs),
      fats: Number(log.fats),
    })),
    logGroups: (data.dailyLog.logGroups || []).map((group) => ({
      id: Number(group.id),
      name: group.name,
      mealType: group.mealType,
      date: group.date,
      computeFromFoodLogs: Boolean(group.computeFromFoodLogs),
      totalCalories: Number(group.totalCalories),
      totalProtein: Number(group.totalProtein),
      totalCarbs: Number(group.totalCarbs),
      totalFats: Number(group.totalFats),
    })),
  };
}

export async function addFoodLogOnline(
  log: FoodLogPayload,
  clientMutationId?: string,
): Promise<FoodLogEntity> {
  const res = await fetchWithOptionalMutationHeader(
    `${ensureBackendUrl()}/api/food-logs`,
    {
      method: "POST",
      body: JSON.stringify(log),
      clientMutationId,
    },
  );
  if (!res.ok) throw createHttpError(res.status, "Failed to add food log");
  return await res.json();
}

export async function updateFoodLogOnline(
  id: number,
  log: FoodLogPayload,
  clientMutationId?: string,
): Promise<FoodLogEntity> {
  const res = await fetchWithOptionalMutationHeader(
    `${ensureBackendUrl()}/api/food-logs/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(log),
      clientMutationId,
    },
  );
  if (!res.ok) throw createHttpError(res.status, "Failed to update food log");
  return await res.json();
}

export async function deleteFoodLogOnline(
  id: number,
  clientMutationId?: string,
) {
  const res = await fetchWithOptionalMutationHeader(
    `${ensureBackendUrl()}/api/food-logs/${id}`,
    {
      method: "DELETE",
      clientMutationId,
    },
  );
  if (!res.ok) throw createHttpError(res.status, "Failed to delete food log");
}

export async function fetchLogGroupsOnline(): Promise<LogGroupEntity[]> {
  const res = await fetchWithOptionalMutationHeader(
    `${ensureBackendUrl()}/api/log-groups?page=0&size=100`,
  );
  if (!res.ok) {
    throw createHttpError(res.status, "Failed to fetch log groups");
  }
  const data = await res.json();
  return data.content || [];
}

export async function addLogGroupOnline(
  payload: LogGroupPayload,
  clientMutationId?: string,
): Promise<LogGroupEntity> {
  const res = await fetchWithOptionalMutationHeader(
    `${ensureBackendUrl()}/api/log-groups`,
    {
      method: "POST",
      body: JSON.stringify(payload),
      clientMutationId,
    },
  );
  if (!res.ok) {
    throw createHttpError(res.status, "Failed to create log group");
  }
  return (await res.json()) as LogGroupEntity;
}

export async function updateLogGroupOnline(
  id: number,
  payload: LogGroupPayload,
  clientMutationId?: string,
): Promise<LogGroupEntity> {
  const res = await fetchWithOptionalMutationHeader(
    `${ensureBackendUrl()}/api/log-groups/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
      clientMutationId,
    },
  );
  if (!res.ok) {
    throw createHttpError(res.status, "Failed to update log group");
  }
  return (await res.json()) as LogGroupEntity;
}

export async function deleteLogGroupOnline(
  id: number,
  clientMutationId?: string,
) {
  const res = await fetchWithOptionalMutationHeader(
    `${ensureBackendUrl()}/api/log-groups/${id}`,
    {
      method: "DELETE",
      clientMutationId,
    },
  );
  if (!res.ok) {
    throw createHttpError(res.status, "Failed to delete log group");
  }
}

export async function startFoodLogGeneratorOnline(
  date: string,
  batchSize = 5,
  intervalMs = 2000,
) {
  const res = await fetchWithOptionalMutationHeader(
    `${ensureBackendUrl()}/api/food-logs/generator/start`,
    {
      method: "POST",
      body: JSON.stringify({ date, batchSize, intervalMs }),
    },
  );
  if (!res.ok) throw new Error("Failed to start food log generator");
  return await res.json();
}

export async function stopFoodLogGeneratorOnline() {
  const res = await fetchWithOptionalMutationHeader(
    `${ensureBackendUrl()}/api/food-logs/generator/stop`,
    {
      method: "POST",
    },
  );
  if (!res.ok) throw new Error("Failed to stop food log generator");
  return await res.json();
}
