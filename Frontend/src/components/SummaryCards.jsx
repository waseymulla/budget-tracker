import SummaryCard from "./SummaryCard.jsx";

function formatMoney(n) {
  const num = Number(n || 0);
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
}

export default function SummaryCards({ summary }) {
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;
  const balance = summary?.balance ?? 0;

  return (
    <section className="dash-summary">
      <SummaryCard label="Balance" value={formatMoney(balance)} variant="default" />
      <SummaryCard label="Income" value={formatMoney(totalIncome)} variant="income" />
      <SummaryCard label="Expenses" value={formatMoney(totalExpense)} variant="expense" />
    </section>
  );
}
