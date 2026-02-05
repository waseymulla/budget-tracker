import { getAuthToken } from "./authService.js";

const BASE_URL = "/api/transactions";

// Helper to attach auth header
function authHeaders() {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// CREATE
export async function createTransaction(payload) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || "Failed to create transaction");
  }
  return data;
}

// READ (with optional query params like limit, month, etc.)
export async function getTransactions(query = "") {
  const res = await fetch(`${BASE_URL}${query}`, {
    headers: authHeaders(),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch transactions");
  }
  return data;
}

// UPDATE
export async function updateTransaction(id, payload) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || "Failed to update transaction");
  }
  return data;
}

// DELETE
export async function deleteTransaction(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || "Failed to delete transaction");
  }
  return data;
}
