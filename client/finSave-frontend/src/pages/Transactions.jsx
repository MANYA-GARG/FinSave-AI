import React, { useState, useEffect } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTxns, setFilteredTxns] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const txnsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await API.get("/wallet/transactions");
      setTransactions(res.data || []);
      setFilteredTxns(res.data || []);
    } catch (err) {
      toast.error("❌ Failed to load transactions");
    }
  };

  const fetchCategories = async () => {
    try {
     const res = await API.get("/categories", { withCredentials: true });
   const catNames = res.data.categories.map((cat) => cat.name);
   setCategories(["All", ...catNames]);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      toast.error("❌ Failed to load categories");
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (selectedCategory !== "All") {
      filtered = filtered.filter((txn) => txn.category === selectedCategory);
    }

    if (fromDate) {
      const from = new Date(fromDate);
      filtered = filtered.filter((txn) => new Date(txn.timestamp) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((txn) => new Date(txn.timestamp) <= to);
    }

    if (filtered.length === 0) {
      toast.info("⚠️ No transactions found for the selected filters.");
    }

    setFilteredTxns(filtered);
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const csvHeader = ["Date,Description,Amount,Category,Type"];
    const rows = filteredTxns.map((txn) => {
      return [
        new Date(txn.timestamp).toLocaleDateString(),
        txn.description,
        txn.amount,
        txn.category || "Uncategorized",
        txn.transactionType.includes("credit") ? "Credit" : "Debit",
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [csvHeader, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startIdx = (currentPage - 1) * txnsPerPage;
  const currentTxns = filteredTxns.slice(startIdx, startIdx + txnsPerPage);
  const totalPages = Math.ceil(filteredTxns.length / txnsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 via-blue-50 to-purple-100 text-gray-800 px-6 py-10 font-sans">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-indigo-700 mb-2">
          📒 Transaction History
        </h1>
      </div>

      <div className="flex justify-end max-w-6xl mx-auto mt-4">
        <button
          onClick={exportCSV}
          className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 font-semibold shadow"
        >
          ⬇️ Download CSV
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6 max-w-6xl mx-auto">
        <div>
          <label className="block text-sm text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 rounded border border-gray-300 shadow-sm text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 rounded border border-gray-300 shadow-sm text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded border border-gray-300 shadow-sm text-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            onClick={applyFilters}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded mt-1 md:mt-0 shadow"
          >
            🔍 Apply
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-300 bg-white max-w-6xl mx-auto">
        <table className="w-full text-sm">
          <thead className="bg-indigo-200 text-indigo-800 text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Type</th>
            </tr>
          </thead>
          <tbody>
            {currentTxns.length > 0 ? (
              currentTxns.map((txn) => (
                <tr key={txn._id} className="border-t border-gray-200 hover:bg-indigo-50 transition">
                  <td className="px-4 py-3">{new Date(txn.timestamp).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {txn.transactionType === "transfer_debit" && txn.receiver?.username
                      ? `Sent to @${txn.receiver.username}`
                      : txn.transactionType === "transfer_credit" && txn.sender?.username
                      ? `Received from @${txn.sender.username}`
                      : txn.description}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 font-semibold">
                    ₹{txn.amount.toLocaleString()}
                  </td>
               <td className="px-4 py-3">
  {typeof txn.category === "string" && /^[a-f\d]{24}$/i.test(txn.category)
    ? "Uncategorized"
    : txn.category || "Uncategorized"}
</td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      txn.transactionType.includes("credit") ||
                      txn.transactionType === "deposit" ||
                      txn.transactionType === "transfer_credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {txn.transactionType.includes("credit") ||
                    txn.transactionType === "deposit" ||
                    txn.transactionType === "transfer_credit"
                      ? "Credit"
                      : "Debit"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded-full font-medium ${
              currentPage === i + 1
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Transactions;
