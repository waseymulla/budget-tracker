import TransactionRow from "./TransactionRow.jsx";

export default function TransactionsList({ items = [] }) {
  return (
    <div className="dash-table">
      <div className="dash-table__head">
        <span>Date</span>
        <span>Category</span>
        <span>Type</span>
        <span className="dash-table__amount">Amount</span>
      </div>

      {items.length === 0 ? (
        <div className="dash-table__row">
          <span className="dash-muted">No transactions yet</span>
          <span />
          <span />
          <span />
        </div>
      ) : (
        items.map((t) => <TransactionRow key={t.id || t._id} t={t} />)
      )}
    </div>
  );
}
