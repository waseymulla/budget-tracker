import { getAuthToken } from "./authService.js";

const BASE_URL = "/api/dashboard";

function buildQuery(params = {}) {
  const qp = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (!s) return;
    qp.set(k, s);
  });

  const qs = qp.toString();
  return qs ? `?${qs}` : "";
}

async function authedFetch(path, { method = "GET", body, signal } = {}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated (missing token). Please login again.");
  }

  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}

/**
 * GET /api/dashboard/summary
 * Supports: month=YYYY-MM OR year=YYYY (or no filter => all time)
 */
export function fetchDashboardSummary(filters = {}, options = {}) {
  return authedFetch(`${BASE_URL}/summary${buildQuery(filters)}`, options);
}

/**
 * GET /api/dashboard/pie-chart
 * Supports: month OR year (or no filter => all time)
 * Your backend returns expense categories only.
 */
export function fetchPieChart(filters = {}, options = {}) {
  return authedFetch(`${BASE_URL}/pie-chart${buildQuery(filters)}`, options);
}

/**
 * GET /api/dashboard/bar-chart?year=YYYY
 * If you want default year behavior on backend, you can omit year here.
 */
export function fetchBarChart(filters = {}, options = {}) {
  return authedFetch(`${BASE_URL}/bar-chart${buildQuery(filters)}`, options);
}
