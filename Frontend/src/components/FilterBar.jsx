export default function FilterBar({
  value,              // { month, type, category }
  onChange,           // (nextValue) => void
  onReset,            // () => void
  categories = [],    // optional: ["food","rent",...]
}) {
  const { month = "", type = "", category = "" } = value || {};

  const setField = (field, newValue) => {
    onChange?.({ ...value, [field]: newValue });
  };

  return (
    <section className="dash-filter">
      <div className="dash-filter__row">
        {/* Month (YYYY-MM) */}
        <div className="dash-filter__field">
          <label className="dash-filter__label">Month</label>
          <input
            className="dash-filter__input"
            type="month"
            value={month}
            onChange={(e) => {
              // if month is set, clear year so month "wins"
              const next = e.target.value;
              onChange?.({ ...value, month: next, year: "" });
            }}
          />
        </div>

        {/* Type */}
        <div className="dash-filter__field">
          <label className="dash-filter__label">Type</label>
          <select
            className="dash-filter__input"
            value={type}
            onChange={(e) => setField("type", e.target.value)}
          >
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Category */}
        <div className="dash-filter__field">
          <label className="dash-filter__label">Category</label>
          <select
            className="dash-filter__input"
            value={category}
            onChange={(e) => setField("category", e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="dash-filter__actions">
          <button type="button" className="dash-btn dash-btn--ghost" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>

      <p className="dash-filter__hint">
        Tip: Month filter includes both month and year.
      </p>
    </section>
  );
}
