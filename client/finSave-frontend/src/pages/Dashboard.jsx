import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import dayjs from "dayjs";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import DashboardCharts from "../components/DashboardCharts";

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [totalSpending, setTotalSpending] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [monthlyProgress, setMonthlyProgress] = useState(0);
  const [manualExpense, setManualExpense] = useState("");
  const [username, setUsername] = useState("User");
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [fhsScore, setFhsScore] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [chartRange, setChartRange] = useState("30");

  const currentMonth = currentTime.format("MMMM YYYY");
  const currentYear = currentTime.year();

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = () => {
    fetchBalance();
    fetchTransactions();
    fetchBadges();
    fetchFHS();
    fetchGoals();
    fetchUsername();
    fetchNotifications();
  };

  const fetchManualFHS = async () => {
    try {
      const res = await axios.get("/wallet/fhs-manual", { withCredentials: true });
      setFhsScore(res.data.fhs);
    } catch (err) {
      console.error("Error fetching manual FHS:", err);
    }
  };

  const fetchUsername = async () => {
    try {
      const res = await axios.get("/auth/status", { withCredentials: true });
      setUsername(res.data.username || "User");
    } catch (err) {
      console.error("Failed to fetch username", err);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await axios.get("/wallet/balance", { withCredentials: true });
      setBalance(res.data.balance);
    } catch (err) {
      console.error("Failed to fetch balance", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get("/wallet/transactions", { withCredentials: true });
      const txns = res.data.filter(txn => {
        const txnDate = dayjs(txn.timestamp);
        return txnDate.month() === currentTime.month() && txnDate.year() === currentTime.year();
      });

      const spending = txns
        .filter((txn) => txn.transactionType.includes("debit") || txn.transactionType === "manual")
        .reduce((acc, txn) => acc + txn.amount, 0);

      const income = txns
        .filter((txn) => txn.transactionType === "deposit" || txn.transactionType === "income")
        .reduce((acc, txn) => acc + txn.amount, 0);

      setTotalSpending(spending);
      setMonthlyProgress(income - spending);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  };

  const fetchBadges = async () => {
    try {
      const res = await axios.get("/badges/my", { withCredentials: true });
      setBadgeCount(res.data.badges.length);
    } catch (err) {
      console.error("Failed to fetch badges", err);
    }
  };

  const fetchFHS = async () => {
    try {
      const res = await axios.get("/ai/fhs", { withCredentials: true });
      const scoreMatch = res.data.result.match(/(\d{1,3})\s*\/\s*100/);
      if (scoreMatch && scoreMatch[1]) {
        setFhsScore(Number(scoreMatch[1]));
        return;
      } else {
        console.warn("❗ AI FHS score not found in text. Falling back to manual.");
      }
    } catch (err) {
      console.warn("⚠️ AI FHS fetch failed. Falling back to manual.");
    }

    try {
      const manualRes = await axios.get("/wallet/fhs-manual", { withCredentials: true });
      setFhsScore(manualRes.data.fhs || 70);
    } catch (err) {
      console.error("❌ Manual FHS fetch failed", err);
      setFhsScore("N/A");
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await axios.get("/goals/my", { withCredentials: true });
      const monthGoal = res.data.goals.find(
        (g) => g.month === currentTime.month() + 1 && g.year === currentYear
      );
      setMonthlyGoal(monthGoal?.goalAmount || 0);
    } catch (err) {
      console.error("Failed to fetch saving goals");
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/goals/set",
        {
          month: currentTime.month() + 1,
          year: currentYear,
          goalAmount: Number(monthlyGoal),
        },
        { withCredentials: true }
      );
      fetchGoals();
    } catch (err) {
      console.error("Goal set failed", err);
    }
  };

  const handleManualExpense = async () => {
    try {
      await axios.post(
        "/wallet/manual-expense",
        {
          amount: Number(manualExpense),
          description: "Manual cash expense",
          transactionType: "manual",
          status: "success",
        },
        { withCredentials: true }
      );
      setManualExpense("");
      fetchTransactions();
    } catch (err) {
      console.error("Manual expense failed", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/notifications/my", { withCredentials: true });
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const goalPercentage =
    monthlyGoal > 0 ? Math.min((monthlyProgress / monthlyGoal) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8ecf4] via-[#d8e2f0] to-[#cbd9ec] px-6 py-10 text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome back, {username} 👋</h1>
        <p className="text-sm text-indigo-700 mt-2 md:mt-0 font-medium">
          🗕️ <span className="font-semibold">{currentTime.format("dddd, MMMM D, YYYY h:mm A")}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 max-w-7xl mx-auto">
        <Card title="Wallet Balance" value={`₹${balance.toLocaleString()}`} color="bg-yellow-100" subtitle="Your current funds" />
        <Card title="FHS Score" value={`${fhsScore} / 100`} color="bg-green-100" subtitle="Financial health score" />
        <Card title="Badges Earned" value={`🏅 ${badgeCount}`} color="bg-indigo-100" subtitle="Total achievements" />
        <Card title="This Month's Spend" value={`₹${totalSpending.toLocaleString()}`} color="bg-red-100" subtitle="Digital + Manual" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto mb-10">
        <div className="bg-white/70 backdrop-blur-lg p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">🌟 Saving Goal for {currentMonth}</h2>
          <form onSubmit={handleGoalSubmit} className="flex flex-col sm:flex-row items-center gap-4">
            <input type="number" className="p-2 border rounded w-full sm:w-auto" placeholder="Enter goal amount" value={monthlyGoal} onChange={(e) => setMonthlyGoal(e.target.value)} />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Set Goal</button>
          </form>
          <div className="mt-4 text-center text-sm text-green-600 font-medium">
            {monthlyGoal > 0 && `✅ Goal set to ₹${monthlyGoal}`}
          </div>
          <div className="mt-4 w-24 mx-auto">
            <CircularProgressbar value={goalPercentage} text={`${Math.round(goalPercentage)}%`} styles={buildStyles({ textColor: "#111", pathColor: "#4ade80", trailColor: "#ddd" })} />
          </div>
          <p className="text-center mt-2 text-sm">Saved ₹{monthlyProgress} / ₹{monthlyGoal}</p>
        </div>

        <div className="bg-white/70 backdrop-blur-lg p-6 rounded-xl max-h-64 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">📌 Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">You're all caught up! 🎉</p>
          ) : (
            <ul className="text-sm space-y-2">
              {notifications.map((note, idx) => (
                <li key={idx} className="bg-indigo-50 px-4 py-2 rounded shadow text-gray-700">
                  {note.message}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(note.date).toLocaleDateString()} • {note.type.toUpperCase()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">📊 Financial Insights</h2>

        <div className="flex justify-end mb-4">
          <select
            value={chartRange}
            onChange={(e) => setChartRange(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-300 text-sm shadow-sm"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>

        <DashboardCharts rangeDays={parseInt(chartRange)} />
      </div>

      <footer className="mt-16 text-center text-gray-600 text-sm">
        <hr className="my-6 border-gray-300 w-1/2 mx-auto" />
        <p>© 2025 FinSave. All rights reserved.</p>
        <p className="mt-1">Built with ❤️ by Manya | <a href="/about" className="underline hover:text-indigo-600">About</a></p>
      </footer>
    </div>
  );
};

const Card = ({ title, value, color, subtitle }) => (
  <div className={`p-6 rounded-xl shadow-md ${color} transition-all`}>
    <h2 className="text-sm font-medium">{title}</h2>
    <p className="text-3xl font-bold mt-1">{value}</p>
    <p className="text-xs text-gray-600 mt-2">{subtitle}</p>
  </div>
);

export default Dashboard;
