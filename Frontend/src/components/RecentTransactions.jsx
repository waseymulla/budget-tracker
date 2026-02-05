import { useState } from "react";

function formatDate(iso) {
  if (!iso) return "";
  // Handles both "2026-02-01" and full ISO timestamps
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function formatMoney(n) {
  const num = Number(n || 0);
  const sign = num >= 0 ? "" : "-";
  const abs = Math.abs(num);
  return `${sign}$${abs.toFixed(2)}`;
}

export default function RecentTransactions({
  items = [],
  loading = false,
  onEdit,
  onDelete,
  page = 0,
  pageSize = 10,
  totalCount = 0,
  onNext,
  onPrev,
}) {
  const [activeId, setActiveId] = useState(null);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageLabel = `${Math.min(page + 1, totalPages)} / ${totalPages}`;
  return (
    <section className="dash-section">
      <div className="dash-section__header">
        <h2 className="dash-section__title">Recent transactions</h2>
        <p className="dash-section__muted">{totalCount} total</p>
      </div>

      <div className="dash-table dash-table--actions">
        <div className="dash-table__head">
          <span>Date</span>
          <span>Category</span>
          <span>Type</span>
          <span className="dash-table__amount">Amount</span>
          <span style={{ textAlign: "right" }}>Actions</span>
        </div>

        {loading ? (
          <>
            <div className="dash-table__row">
              <span className="dash-skeleton" />
              <span className="dash-skeleton" />
              <span className="dash-skeleton" />
              <span className="dash-skeleton" />
              <span className="dash-skeleton" />
            </div>
            <div className="dash-table__row">
              <span className="dash-skeleton" />
              <span className="dash-skeleton" />
              <span className="dash-skeleton" />
              <span className="dash-skeleton" />
              <span className="dash-skeleton" />
            </div>
          </>
        ) : items.length === 0 ? (
          <div style={{ padding: "0.75rem", color: "#64748b" }}>
            No transactions found for the current filters.
          </div>
        ) : (
          items.map((t) => {
            const id = t._id || t.id;
            const type = (t.type || "").toLowerCase();
            const isActive = id === activeId;
            const amount = Number(t.amount || 0);
            const displayAmount =
              type === "income"
                ? `+${formatMoney(amount)}`
                : `-${formatMoney(amount)}`;
            return (
              <div
                className="dash-table__row dash-table__row--clickable"
                key={id}
                onClick={() => setActiveId((prev) => (prev === id ? null : id))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveId((prev) => (prev === id ? null : id));
                  }
                }}
              >
                <span>{formatDate(t.date)}</span>

                <span className="dash-pill">{t.category || "—"}</span>

                <span className={`dash-pill dash-pill--${type}`}>
                  {type || "—"}
                </span>

                <span className="dash-table__amount">
                  {displayAmount}
                </span>
                <div className="dash-actions">
                  {isActive ? (
                    <>
                      <button
                        type="button"
                        className="dash-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(t);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="dash-action-btn dash-action-btn--danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(t);
                        }}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <span className="dash-actions__hint">Click for actions</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="dash-pagination">
        <button
          type="button"
          className="dash-btn dash-btn--ghost"
          onClick={onPrev}
          disabled={page <= 0}
        >
          ← Newer
        </button>
        <span className="dash-pagination__label">{pageLabel}</span>
        <button
          type="button"
          className="dash-btn dash-btn--ghost"
          onClick={onNext}
          disabled={(page + 1) * pageSize >= totalCount}
        >
          Older →
        </button>
      </div>
    </section>
  );
}
