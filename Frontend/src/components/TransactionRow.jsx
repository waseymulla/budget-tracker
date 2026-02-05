function formatDate(iso) {
  if (!iso) return "";
  // If backend sends ISO string, keep it simple:
  return String(iso).slice(0, 10);
}

function formatMoney(n) {
  const num = Number(n || 0);
  const sign = num >= 0 ? "" : "-";
  const abs = Math.abs(num);
  return `${sign}$${abs.toFixed(2)}`;
}

export default function TransactionRow({ t }) {
  const type = t.type; // "income" | "expense"
  const amount = Number(t.amount || 0);

  // For UI: income shows +, expense shows -
  const displayAmount =
    type === "income" ? `+${formatMoney(amount)}` : `-${formatMoney(amount)}`;

  return (
    <div className="dash-table__row">
      <span>{formatDate(t.date)}</span>

      <span className="dash-pill">{t.category}</span>

      <span className={`dash-pill dash-pill--${type}`}>{type}</span>

      <span className={`dash-table__amount dash-table__amount--${type}`}>
        {displayAmount}
      </span>
    </div>
  );
}
