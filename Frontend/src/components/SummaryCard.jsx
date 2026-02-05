export default function SummaryCard({ label, value, variant = "default" }) {
  // variant can be: "default" | "income" | "expense" (useful later for colors/icons)
  return (
    <div className={`dash-card dash-card--${variant}`}>
      <p className="dash-card__label">{label}</p>
      <p className="dash-card__value">{value}</p>
    </div>
  );
}
