// src/components/SummaryCard.jsx
const SummaryCard = ({ title, amount, color }) => (
  <div className={`p-5 rounded-xl shadow-md ${color}`}>
    <h4 className="text-sm text-gray-600 font-medium">{title}</h4>
    <p className="text-2xl font-bold mt-1">₹{amount.toLocaleString()}</p>
  </div>
);

export default SummaryCard;
