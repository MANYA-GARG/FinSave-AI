import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import SummaryCard from "../components/SummaryCard"; 
import ActionCard from "../components/ActionCard"; 
import LabeledInput from "../components/LabeledInput"; 

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [billType, setBillType] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [manualExpense, setManualExpense] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [monthlySummary, setMonthlySummary] = useState({});
  const [depositCategory, setDepositCategory] = useState("");
  const [sendCategory, setSendCategory] = useState("");
  const [manualExpenseCategory, setManualExpenseCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const billTypes = ["Rent", "Electricity", "Phone", "Internet", "Water", "Tuition", "Insurance", "Gas", "Maintenance"];

  useEffect(() => {
    fetchBalance();
    fetchCategories();
    fetchMonthlySummary();
  }, []);

  useEffect(() => {
  fetchMonthlySummary(); // ⬅️ Re-fetch when month/year changes
}, [selectedMonth, selectedYear]);

  const fetchBalance = async () => {
    try {
      const res = await API.get("/wallet/balance", { withCredentials: true });
      setBalance(res.data.balance);
    } catch {
      toast.error("❌ Could not fetch wallet balance");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories", { withCredentials: true });
      if (Array.isArray(res.data.categories)) {
        setCategories(res.data.categories);
      } else {
        toast.error("❌ Categories data is not in the expected format.");
      }
    } catch {
      toast.error("❌ Failed to fetch categories");
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const res = await API.get(`/wallet/summary?month=${selectedMonth}&year=${selectedYear}`, { withCredentials: true });
      setMonthlySummary(res.data);
    } catch {
      toast.error("❌ Could not fetch monthly summary");
    }
  };

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return toast.warning("⚠️ Invalid deposit amount");
    try {
      await API.post("/wallet/deposit", {
        amount: amt,
        description: depositNote || "Wallet deposit",
        category: depositCategory,
      }, { withCredentials: true });
      toast.success("✅ Deposit successful");
      setDepositAmount("");
      setDepositNote("");
      fetchBalance();
      fetchMonthlySummary();
    } catch {
      toast.error("❌ Deposit failed");
    }
  };

  const handleSend = async () => {
    const amt = parseFloat(sendAmount);
    if (!recipient || amt <= 0) return toast.warning("⚠️ Invalid input");

    // Validate that the recipient exists
    try {
     

      // Validate that the sender has enough balance
      const senderRes = await API.get("/wallet/balance", { withCredentials: true });
      const senderBalance = senderRes.data.balance;

      if (senderBalance < amt) {
        return toast.error("❌ Insufficient balance.");
      }

      // Validate transaction threshold
      /*const threshold = 5000; // Example threshold value
      if (amt > threshold) {
        return toast.error(`❌ Transaction failed. Amount exceeds the threshold of ₹${threshold}`);
      }*/

      const res = await API.post("/wallet/send", {
        toUsername: recipient,
        amount: amt,
        description: sendNote || "Sent via wallet",
        category: sendCategory,
      }, { withCredentials: true });

      if (res.data.flagged) {
        toast.warning("🚨 Transaction flagged for manual approval");
      } else {
        toast.success("✅ Money sent");
      }

      setSendAmount("");
      setRecipient("");
      setSendNote("");
      fetchBalance();
      fetchMonthlySummary();
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);  // Display error message from server
      } else {
        console.log("Transfer error:", error.response?.data || error.message);

        console.log("Transfer error:", error.response?.data || error.message);

        toast.error("❌ Transfer failed");
      }
    }
  };

  const handleManualExpense = async () => {
    const amt = parseFloat(manualExpense);
    if (!amt || amt <= 0) return toast.warning("⚠️ Invalid expense amount");
    try {
      await API.post("/wallet/manual-expense", {
        amount: amt,
        description: "Manual cash expense",
        category: manualExpenseCategory,
      }, { withCredentials: true });
      toast.success("✅ Manual expense added");
      setManualExpense("");
      fetchMonthlySummary();
    } catch {
      toast.error("❌ Failed to add manual expense");
    }
  };

  const handleBillPayment = async () => {
    const amt = parseFloat(billAmount);
    if (!billType || amt <= 0) return toast.warning("⚠️ Invalid bill info");
    try {
      await API.post("/wallet/send", {
        toUsername: "utility-bill",
        amount: amt,
        description: `Bill Payment - ${billType}`,
        category: sendCategory,
      }, { withCredentials: true });

      toast.success("✅ Bill paid successfully");
      setBillAmount("");
      setBillType("");
      fetchBalance();
      fetchMonthlySummary();
    } catch {
      toast.error("❌ Bill payment failed");
    }
  };

  const CategoryDropdown = ({ selected, onChange }) => {
    if (!Array.isArray(categories)) {
      return <div>Loading categories...</div>;
    }

    return (
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 rounded bg-indigo-100 mb-2"
        required
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-100 to-purple-100 px-6 py-10 text-gray-800">
      <ToastContainer />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-indigo-700 mb-3">💼 Wallet Dashboard</h1>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow-md border border-gray-200 p-6 rounded-xl w-full text-center">
            <p className="text-gray-500 text-sm">Wallet Balance</p>
            <h2 className="text-4xl font-bold text-green-600 mt-1">₹{balance.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <select className="p-2 rounded bg-indigo-100" value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
          {months.map((m, idx) => <option key={idx} value={idx + 1}>{m}</option>)}
        </select>
        <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="p-2 rounded bg-indigo-100 w-24" />
        <p className="text-3xl text-gray-600 mt-2">📊 Summary for {months[selectedMonth - 1]} {selectedYear}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
        <SummaryCard title="Deposits" amount={monthlySummary.totalDeposits || 0} color="bg-green-100" />
        <SummaryCard title="Expenses" amount={monthlySummary.totalExpenses || 0} color="bg-red-100" />
        <SummaryCard title="Net Savings" amount={monthlySummary.totalSavings || 0} color="bg-blue-100" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <ActionCard title="➕ Add Funds">
          <LabeledInput label="Amount" value={depositAmount} onChange={setDepositAmount} type="number" />
          <LabeledInput label="Optional note" value={depositNote} onChange={setDepositNote} type="text" />
          <CategoryDropdown selected={depositCategory} onChange={setDepositCategory} />
          <button onClick={handleDeposit} className="btn-indigo">Deposit</button>
        </ActionCard>

        <ActionCard title="📤 Send Money">
          <LabeledInput label="Recipient" value={recipient} onChange={setRecipient} type="text" />
          <LabeledInput label="Amount" value={sendAmount} onChange={setSendAmount} type="number" />
          <LabeledInput label="Optional note" value={sendNote} onChange={setSendNote} type="text" />
          <CategoryDropdown selected={sendCategory} onChange={setSendCategory} />
          <button onClick={handleSend} className="btn-indigo">Send</button>
        </ActionCard>

        <ActionCard title="💸 Manual Cash Expense">
          <LabeledInput label="Amount" value={manualExpense} onChange={setManualExpense} type="number" />
          <CategoryDropdown selected={manualExpenseCategory} onChange={setManualExpenseCategory} />
          <button onClick={handleManualExpense} className="btn-red">Record</button>
        </ActionCard>

        <ActionCard title="🧾 Pay Bills">
          <select value={billType} onChange={(e) => setBillType(e.target.value)} className="input mb-2 w-full p-2 rounded bg-indigo-100">
            <option value="">Select Bill</option>
            {billTypes.map((b) => <option key={b}>{b}</option>)}
          </select>
          <LabeledInput label="Amount" value={billAmount} onChange={setBillAmount} type="number" />
          <CategoryDropdown selected={sendCategory} onChange={setSendCategory} />
          <button onClick={handleBillPayment} className="btn-indigo">Pay</button>
        </ActionCard>
      </div>

      <footer className="mt-16 text-center text-gray-600 text-sm">
        <hr className="my-6 border-gray-300 w-1/2 mx-auto" />
        <p>© 2025 FinSave. All rights reserved.</p>
        <p className="mt-1">Built with ❤️ by Manya</p>
      </footer>
    </div>
  );
};

export default Wallet;
