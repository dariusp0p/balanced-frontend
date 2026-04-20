const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchFoodLogs() {
  const res = await fetch(`${BACKEND_BASE_URL}/api/food-logs?page=0&size=100`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch food logs");
  const data = await res.json();
  return data.content || [];
}

export async function addFoodLogApi(log) {
  const res = await fetch(`${BACKEND_BASE_URL}/api/food-logs`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(log),
  });
  if (!res.ok) throw new Error("Failed to add food log");
  return await res.json();
}

export async function updateFoodLogApi(id, log) {
  const res = await fetch(`${BACKEND_BASE_URL}/api/food-logs/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(log),
  });
  if (!res.ok) throw new Error("Failed to update food log");
  return await res.json();
}

export async function deleteFoodLogApi(id) {
  const res = await fetch(`${BACKEND_BASE_URL}/api/food-logs/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete food log");
  return true;
}
