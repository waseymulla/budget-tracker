import { useEffect, useMemo, useState } from "react";

const defaultForm = {
  type: "expense",
  amount: "",
  category: "",
  date: "",
  description: "",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddTransactionModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  title = "Add transaction",
  submitLabel = "Add",
  initialData = null,
}) {
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState(null);

  const canSubmit = useMemo(() => {
    const amountNum = Number(form.amount);
    return (
      form.type &&
      form.category.trim().length > 0 &&
      form.date &&
      Number.isFinite(amountNum) &&
      amountNum > 0
    );
  }, [form]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          type: initialData.type || "expense",
          amount: initialData.amount ?? "",
          category: initialData.category || "",
          date: (initialData.date || "").slice(0, 10) || todayISO(),
          description: initialData.description || "",
        });
      } else {
        setForm((prev) => ({
          ...prev,
          date: prev.date || todayISO(),
        }));
      }
      setError(null);
    }
  }, [open, initialData]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Please fill type, category, date, and a valid amount.");
      return;
    }

    try {
      await onSubmit?.({
        type: String(form.type).trim().toLowerCase(),
        amount: Number(form.amount),
        category: String(form.category).trim().toLowerCase(),
        date: form.date, // backend expects a Date; ISO string is OK
        description: String(form.description || "").trim(),
      });

      // reset + close
      setForm({ ...defaultForm, date: todayISO() });
      onClose?.();
    } catch (err) {
      setError(err?.message || "Failed to add transaction");
    }
  };

  return (
    <div className="dash-modal__overlay" onMouseDown={onClose}>
      <div
        className="dash-modal__card"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Add transaction"
      >
        <div className="dash-modal__header">
          <h2 className="dash-modal__title">{title}</h2>
          <button
            type="button"
            className="dash-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && <div className="dash-modal__error">{error}</div>}

        <form className="dash-modal__form" onSubmit={handleSubmit}>
          <div className="dash-modal__grid">
            <label className="dash-modal__field">
              <span className="dash-modal__label">Type</span>
              <select
                className="dash-modal__input"
                value={form.type}
                onChange={update("type")}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>

            <label className="dash-modal__field">
              <span className="dash-modal__label">Amount</span>
              <input
                className="dash-modal__input"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={update("amount")}
              />
            </label>

            <label className="dash-modal__field">
              <span className="dash-modal__label">Category</span>
              <input
                className="dash-modal__input"
                type="text"
                placeholder="food, rent, salary…"
                value={form.category}
                onChange={update("category")}
              />
            </label>

            <label className="dash-modal__field">
              <span className="dash-modal__label">Date</span>
              <input
                className="dash-modal__input"
                type="date"
                value={form.date}
                onChange={update("date")}
              />
            </label>
          </div>

          <label className="dash-modal__field">
            <span className="dash-modal__label">Description (optional)</span>
            <input
              className="dash-modal__input"
              type="text"
              placeholder="notes…"
              value={form.description}
              onChange={update("description")}
            />
          </label>

          <div className="dash-modal__actions">
            <button
              type="button"
              className="dash-btn dash-btn--ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="dash-btn dash-btn--primary"
              disabled={loading || !canSubmit}
            >
              {loading ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
