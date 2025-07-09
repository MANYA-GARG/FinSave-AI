// src/components/DashboardCharts.jsx
import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import axios from "../api/axios";

Chart.register(...registerables);

const DashboardCharts = () => {
  const [transactions, setTransactions] = useState([]);
  const [timeframe, setTimeframe] = useState("30"); // default last 30 days

  useEffect(() => {
    const fetchTxns = async () => {
      try {
        const res = await axios.get("/wallet/transactions", { withCredentials: true });
        setTransactions(res.data);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      }
    };
    fetchTxns();
  }, []);

  const filterByDays = (txns, days) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(days));
    return txns.filter(txn => new Date(txn.timestamp) >= cutoff);
  };

  const filteredTxns = filterByDays(transactions, timeframe);

  const expenseTxns = filteredTxns.filter(txn => txn.transactionType.includes("debit"));
  const depositTxns = filteredTxns.filter(txn => txn.transactionType === "deposit" || txn.transactionType === "income");

  const categoryTotals = {};
  expenseTxns.forEach((txn) => {
    const cat = txn.category || "Others";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + txn.amount;
  });

  const expenseData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: "Expenses by Category",
        data: Object.values(categoryTotals),
        backgroundColor: ["#e57373", "#64b5f6", "#81c784", "#ffb74d", "#ba68c8"],
      },
    ],
  };

  const depositData = {
    labels: depositTxns.map((txn) => new Date(txn.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: "Deposits",
        data: depositTxns.map((txn) => txn.amount),
        borderColor: "#4caf50",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const savingsTrend = {
    labels: filteredTxns.map((txn) => new Date(txn.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: "Saving = Deposit - Expenses",
        data: filteredTxns.map((txn) =>
          txn.transactionType === "deposit" || txn.transactionType === "income"
            ? txn.amount
            : txn.transactionType.includes("debit")
            ? -txn.amount
            : 0
        ),
        borderColor: "#1976d2",
        backgroundColor: "rgba(25, 118, 210, 0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Filter Toggle */}
      <div className="col-span-1 md:col-span-2 mb-2 text-center">
        <label className="text-sm text-gray-600 mr-2">📅 Show last:</label>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="7">7 days</option>
          <option value="30">30 days</option>
          <option value="90">90 days</option>
        </select>
      </div>

      {/* Pie Chart */}
      <div className="bg-white/80 p-4 rounded-xl shadow-md h-72">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">📊 Expenses by Category</h3>
        <div className="h-56">
          <Pie data={expenseData} options={options} />
        </div>
      </div>

      {/* Line Chart for Deposits */}
      <div className="bg-white/80 p-4 rounded-xl shadow-md h-72">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">💸 Deposits Over Time</h3>
        <div className="h-56">
          <Line data={depositData} options={options} />
        </div>
      </div>

      {/* Line Chart for Savings */}
      <div className="bg-white/80 p-4 rounded-xl shadow-md col-span-1 md:col-span-2 h-80">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">📈 Savings Trend</h3>
        <div className="h-64">
          <Line data={savingsTrend} options={options} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
