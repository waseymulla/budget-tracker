// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopBar from "../components/TopBar.jsx";
import SummaryCards from "../components/SummaryCards.jsx";
import FilterBar from "../components/FilterBar.jsx";
import RecentTransactions from "../components/RecentTransactions.jsx";
import AddTransactionModal from "../components/AddTransactionModal.jsx";
import { fetchPieChart, fetchBarChart } from "../services/dashboardService.js";

import { getAuthToken } from "../services/authService.js";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "../services/transactionsService.js";

import "../styles/Dashboard.css";

// ----- small helper: authenticated GET that returns JSON or throws -----
async function fetchJson(url, token, signal) {
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

// ----- build query string for backend filtering (Option A) -----
function buildTransactionsQuery({ month, type, category }) {
  const params = new URLSearchParams();

  // your backend expects month in YYYY-MM
  if (month) params.set("month", month);

  if (type) params.set("type", type);
  if (category) params.set("category", category);

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// summary supports month in your helper.
function buildSummaryQuery({ month }) {
  const params = new URLSearchParams();
  if (month) params.set("month", month);

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const chartColors = [
  "#2563eb",
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#14b8a6",
  "#e11d48",
];

function normalizePieBreakdown(breakdown = []) {
  if (!Array.isArray(breakdown) || breakdown.length === 0) return [];
  const hasPercent = breakdown.every((b) => b.percent !== undefined);
  if (hasPercent) return breakdown;
  const total = breakdown.reduce(
    (sum, b) => sum + Number(b.totalAmount || 0),
    0,
  );
  if (!total) return breakdown.map((b) => ({ ...b, percent: 0 }));
  return breakdown.map((b) => ({
    ...b,
    percent: Number(((Number(b.totalAmount || 0) / total) * 100).toFixed(2)),
  }));
}

function buildConicGradient(breakdown = []) {
  const normalized = normalizePieBreakdown(breakdown);
  if (!Array.isArray(normalized) || normalized.length === 0) {
    return "conic-gradient(#e2e8f0 0% 100%)";
  }
  let acc = 0;
  const stops = normalized.map((b, i) => {
    const start = acc;
    acc += Number(b.percent || 0);
    const end = acc;
    return `${chartColors[i % chartColors.length]} ${start}% ${end}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function renderBarChart(monthly = []) {
  const max = Math.max(
    1,
    ...monthly.map((m) =>
      Math.max(Number(m.expense || 0), Number(m.income || 0)),
    ),
  );
  return (
    <>
      <div className="dash-bar__legend">
        <span className="dash-bar__legend-item">
          <span className="dash-bar__swatch dash-bar__swatch--income" />
          Income
        </span>
        <span className="dash-bar__legend-item">
          <span className="dash-bar__swatch dash-bar__swatch--expense" />
          Expense
        </span>
      </div>
      <div className="dash-bar__grid">
        {monthly.map((m) => {
          const incomeVal = Number(m.income || 0);
          const expenseVal = Number(m.expense || 0);
          const incomeHeight = Math.round((incomeVal / max) * 100);
          const expenseHeight = Math.round((expenseVal / max) * 100);
          return (
            <div className="dash-bar__item" key={m.month}>
              <div className="dash-bar__col">
                <div className="dash-bar__pair">
                  <div
                    className="dash-bar__fill dash-bar__fill--income"
                    style={{ height: `${incomeHeight}%` }}
                    title={`Income: $${incomeVal.toFixed(2)}`}
                  />
                  <div
                    className="dash-bar__fill dash-bar__fill--expense"
                    style={{ height: `${expenseHeight}%` }}
                    title={`Expense: $${expenseVal.toFixed(2)}`}
                  />
                </div>
              </div>
              <span className="dash-bar__label">{m.month}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  // ---- auth token ----
  const token = useMemo(() => getAuthToken(), []);

  // ---- data ----
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [recent, setRecent] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState([]);

  // ---- filters (Option A: backend filtering) ----
  // month format expected: "YYYY-MM" (ex: "2026-02")
  const [filters, setFilters] = useState({
    month: "",
    type: "",
    category: "",
  });

  // ---- UI ----
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  // Add modal state
  const [addOpen, setAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [editForm, setEditForm] = useState(null);

  // Trigger refetch
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [pieMonth, setPieMonth] = useState("");
  const [barYear, setBarYear] = useState(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [pieData, setPieData] = useState({ totalExpenses: 0, breakdown: [] });
  const [barData, setBarData] = useState({ year: null, monthly: [] });
  const [chartsLoading, setChartsLoading] = useState(false);
  const [chartsError, setChartsError] = useState(null);

  useEffect(() => {
    const maxPage = Math.max(0, Math.floor((totalCount - 1) / pageSize));
    if (page > maxPage) setPage(maxPage);
  }, [totalCount, page, pageSize]);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const loadCharts = async () => {
      setChartsLoading(true);
      setChartsError(null);
      try {
        const pie = await fetchPieChart(pieMonth ? { month: pieMonth } : {}, {
          signal: controller.signal,
        });
        const bar = await fetchBarChart(barYear ? { year: barYear } : {}, {
          signal: controller.signal,
        });
        setPieData(pie || { totalExpenses: 0, breakdown: [] });
        setBarData(bar || { year: barYear, monthly: [] });
      } catch (err) {
        if (err?.name !== "AbortError") {
          setChartsError(err?.message || "Failed to load charts");
        }
      } finally {
        setChartsLoading(false);
      }
    };
    loadCharts();
    return () => controller.abort();
  }, [token, pieMonth, barYear]);

  useEffect(() => {
    // route guard
    if (!token) {
      navigate("/login");
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      setPageLoading(true);
      setPageError(null);

      try {
        // 1) summary totals (supports month/year/all-time)
        const summaryQs = buildSummaryQuery({
          month: filters.month,
        });
        const summaryData = await fetchJson(
          `/api/dashboard/summary${summaryQs}`,
          token,
          controller.signal,
        );

        const apiSummary = {
          totalIncome: Number(summaryData?.totalIncome ?? 0),
          totalExpense: Number(
            summaryData?.totalExpenses ?? summaryData?.totalExpense ?? 0,
          ),
          balance: Number(summaryData?.balance ?? 0),
        };

        // 2) transactions (backend filtering via query params)
        const txQs = buildTransactionsQuery({
          month: filters.month,
          type: filters.type,
          category: filters.category,
        });
        const txData = await fetchJson(
          `/api/transactions${txQs}`,
          token,
          controller.signal,
        );

        const safe = Array.isArray(txData) ? txData : [];

        const mapped = safe.map((t) => ({
          id: t._id,
          type: t.type,
          category: t.category,
          amount: Number(t.amount),
          date: (t.date || "").slice(0, 10),
          description: t.description || "",
        }));

        setTotalCount(mapped.length);
        setRecent(mapped);
        setCategories(
          Array.from(new Set(mapped.map((t) => t.category))).sort(),
        );

        const years = Array.from(
          new Set(
            mapped
              .map((t) => {
                const d = new Date(t.date);
                return Number.isNaN(d.getTime()) ? null : d.getFullYear();
              })
              .filter((y) => y !== null),
          ),
        ).sort((a, b) => b - a);

        const months = Array.from(
          new Set(
            mapped
              .map((t) => {
                const d = new Date(t.date);
                if (Number.isNaN(d.getTime())) return null;
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, "0");
                return `${y}-${m}`;
              })
              .filter(Boolean),
          ),
        ).sort((a, b) => (a > b ? -1 : 1));

        setAvailableYears(years);
        setAvailableMonths(months);

        if (years.length > 0 && !years.includes(Number(barYear))) {
          setBarYear(String(years[0]));
        }
        if (!pieMonth && months.length > 0) {
          setPieMonth(months[0]);
        }

        const shouldComputeFallback =
          !summaryData ||
          (apiSummary.totalIncome === 0 &&
            apiSummary.totalExpense === 0 &&
            mapped.length > 0);

        if (shouldComputeFallback) {
          const computed = mapped.reduce(
            (acc, t) => {
              if (t.type === "income") acc.totalIncome += Number(t.amount || 0);
              if (t.type === "expense")
                acc.totalExpense += Number(t.amount || 0);
              return acc;
            },
            { totalIncome: 0, totalExpense: 0 },
          );
          setSummary({
            totalIncome: computed.totalIncome,
            totalExpense: computed.totalExpense,
            balance: computed.totalIncome - computed.totalExpense,
          });
        } else {
          setSummary(apiSummary);
        }
      } catch (err) {
        // ignore abort errors
        if (err?.name !== "AbortError") {
          setPageError(err?.message || "Failed to load dashboard");
        }
      } finally {
        setPageLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [
    navigate,
    token,
    filters.month,
    filters.type,
    filters.category,
    refreshKey,
  ]);

  const handleAddTransaction = () => setAddOpen(true);

  const handleCreateTransaction = async (payload) => {
    setCreating(true);
    try {
      await createTransaction(payload);
      setAddOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      throw err; // allow modal to show backend error message
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (tx) => {
    setEditingTx(tx);
    setEditForm({
      type: tx.type || "expense",
      amount: tx.amount ?? "",
      category: tx.category || "",
      date: (tx.date || "").slice(0, 10),
      description: tx.description || "",
    });
  };

  const handleUpdateTransaction = async (payload) => {
    if (!editingTx?.id) return;
    setCreating(true);
    try {
      await updateTransaction(editingTx.id, payload);
      setEditingTx(null);
      setEditForm(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = async (tx) => {
    if (!tx?.id) return;
    const ok = window.confirm("Delete this transaction?");
    if (!ok) return;
    try {
      await deleteTransaction(tx.id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to delete transaction");
    }
  };

  const handleEditField = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditCancel = () => {
    setEditingTx(null);
    setEditForm(null);
  };

  const handleFiltersChange = (next) => {
    setFilters({
      month: next?.month || "",
      type: next?.type || "",
      category: next?.category || "",
    });
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({ month: "", type: "", category: "" });
    setPage(0);
  };

  const pagedItems = recent.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="dash-page">
      <TopBar title="Dashboard" />

      <main className="dash-main">
        {pageLoading ? (
          <div className="dash-empty">Loading dashboard…</div>
        ) : pageError ? (
          <div className="dash-empty dash-empty--error">{pageError}</div>
        ) : (
          <>
            {/* Summary cards */}
            <SummaryCards summary={summary} />

            <div className="dash-section">
              <div className="dash-section__header">
                <h2 className="dash-section__title">Filters</h2>
              </div>
              <FilterBar
                value={filters}
                onChange={handleFiltersChange}
                onReset={handleResetFilters}
                categories={categories}
              />
              <div className="dash-filter__footer">
                <button
                  type="button"
                  className="dash-btn dash-btn--primary"
                  onClick={handleAddTransaction}
                >
                  + Add transaction
                </button>
              </div>
            </div>

            {/* Recent transactions */}
            <RecentTransactions
              items={pagedItems}
              loading={pageLoading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              onNext={() =>
                setPage((p) =>
                  Math.min(p + 1, Math.floor((totalCount - 1) / pageSize)),
                )
              }
              onPrev={() => setPage((p) => Math.max(p - 1, 0))}
            />

            {editingTx && editForm && (
              <section className="dash-section dash-edit">
                <div className="dash-section__header">
                  <h2 className="dash-section__title">Edit transaction</h2>
                  <p className="dash-section__muted">
                    {editingTx.category} • {editingTx.date}
                  </p>
                </div>

                <form
                  className="dash-edit__form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateTransaction({
                      type: String(editForm.type).trim().toLowerCase(),
                      amount: Number(editForm.amount),
                      category: String(editForm.category).trim().toLowerCase(),
                      date: editForm.date,
                      description: String(editForm.description || "").trim(),
                    });
                  }}
                >
                  <div className="dash-edit__grid">
                    <label className="dash-edit__field">
                      <span className="dash-filter__label">Type</span>
                      <select
                        className="dash-filter__input"
                        value={editForm.type}
                        onChange={(e) =>
                          handleEditField("type", e.target.value)
                        }
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </label>

                    <label className="dash-edit__field">
                      <span className="dash-filter__label">Amount</span>
                      <input
                        className="dash-filter__input"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={editForm.amount}
                        onChange={(e) =>
                          handleEditField("amount", e.target.value)
                        }
                      />
                    </label>

                    <label className="dash-edit__field">
                      <span className="dash-filter__label">Category</span>
                      <input
                        className="dash-filter__input"
                        type="text"
                        value={editForm.category}
                        onChange={(e) =>
                          handleEditField("category", e.target.value)
                        }
                      />
                    </label>

                    <label className="dash-edit__field">
                      <span className="dash-filter__label">Date</span>
                      <input
                        className="dash-filter__input"
                        type="date"
                        value={editForm.date}
                        onChange={(e) =>
                          handleEditField("date", e.target.value)
                        }
                      />
                    </label>
                  </div>

                  <label className="dash-edit__field dash-edit__field--full">
                    <span className="dash-filter__label">Description</span>
                    <input
                      className="dash-filter__input"
                      type="text"
                      value={editForm.description}
                      onChange={(e) =>
                        handleEditField("description", e.target.value)
                      }
                    />
                  </label>

                  <div className="dash-edit__actions">
                    <button
                      type="button"
                      className="dash-btn dash-btn--ghost"
                      onClick={handleEditCancel}
                      disabled={creating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="dash-btn dash-btn--primary"
                      disabled={creating}
                    >
                      {creating ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Charts */}
            <section className="dash-section">
              <div className="dash-section__header">
                <h2 className="dash-section__title">Charts</h2>
                {chartsError ? (
                  <p className="dash-section__muted">{chartsError}</p>
                ) : null}
              </div>

              <div className="dash-charts">
                <div className="dash-chart-card">
                  <div className="dash-chart-header">
                    <h3 className="dash-chart-title">Expenses by category</h3>
                    <div className="dash-chart-filter">
                      <label className="dash-filter__label">Month</label>
                      {availableMonths.length ? (
                        <select
                          className="dash-filter__input"
                          value={pieMonth}
                          onChange={(e) => setPieMonth(e.target.value)}
                        >
                          {availableMonths.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className="dash-filter__input"
                          type="month"
                          value={pieMonth}
                          onChange={(e) => setPieMonth(e.target.value)}
                        />
                      )}
                    </div>
                  </div>

                  {chartsLoading ? (
                    <div className="dash-empty">Loading chart…</div>
                  ) : pieData?.breakdown?.length ? (
                    <div className="dash-pie">
                      <div
                        className="dash-pie__chart"
                        style={{
                          background: buildConicGradient(pieData.breakdown),
                        }}
                      />
                      <div className="dash-pie__legend">
                        {normalizePieBreakdown(pieData.breakdown).map(
                          (b, i) => (
                            <div className="dash-pie__item" key={b.category}>
                              <span
                                className="dash-pie__swatch"
                                style={{
                                  background:
                                    chartColors[i % chartColors.length],
                                }}
                              />
                              <span className="dash-pie__label">
                                {b.category} — {b.percent}%
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="dash-empty">
                      No expense data for this period.
                    </div>
                  )}
                </div>

                <div className="dash-chart-card">
                  <div className="dash-chart-header">
                    <h3 className="dash-chart-title">Monthly expenses</h3>
                    <div className="dash-chart-filter">
                      <label className="dash-filter__label">Year</label>
                      {availableYears.length ? (
                        <select
                          className="dash-filter__input"
                          value={barYear}
                          onChange={(e) => setBarYear(e.target.value)}
                        >
                          {availableYears.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className="dash-filter__input"
                          type="number"
                          inputMode="numeric"
                          value={barYear}
                          onChange={(e) => setBarYear(e.target.value)}
                        />
                      )}
                    </div>
                  </div>

                  {chartsLoading ? (
                    <div className="dash-empty">Loading chart…</div>
                  ) : barData?.monthly?.length ? (
                    <div className="dash-bar">
                      {renderBarChart(barData.monthly)}
                    </div>
                  ) : (
                    <div className="dash-empty">
                      No expense data for this year.
                    </div>
                  )}
                </div>
              </div>

            </section>
          </>
        )}
      </main>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreateTransaction}
        loading={creating}
      />
    </div>
  );
}
