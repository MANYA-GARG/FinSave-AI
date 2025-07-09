import React, { useState, useEffect } from "react";
import API from "../api/axios";

const SplitExpense = () => {
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUsernames, setSelectedUsernames] = useState([]);
  const [customSplits, setCustomSplits] = useState({});
  const [splitType, setSplitType] = useState("even");
  const [totalAmount, setTotalAmount] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchInput.trim().length === 0) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await API.get(`/auth/search-users?q=${searchInput}`);
        setSuggestions(res.data.users || []);
      } catch {
        setSuggestions([]);
      }
    };
    fetchUsers();
  }, [searchInput]);

  const handleAddUser = (username) => {
    if (!selectedUsernames.includes(username)) {
      setSelectedUsernames((prev) => [...prev, username]);
      if (splitType === "custom") {
        setCustomSplits((prev) => ({ ...prev, [username]: "" }));
      }
    }
    setSearchInput("");
    setSuggestions([]);
  };

  const handleCustomChange = (username, value) => {
    setCustomSplits({ ...customSplits, [username]: value });
  };

  const handleSubmit = async () => {
    if (!totalAmount || !description || selectedUsernames.length === 0) {
      setMessage("⚠️ Fill all fields and add users.");
      return;
    }

    const payload = {
      totalAmount: parseFloat(totalAmount),
      description,
      participantUsernames: selectedUsernames,
      splitType,
      ...(splitType === "custom" && { customSplits }),
    };

    try {
      await API.post("/split/initiate", payload);
      setMessage("✅ Expense shared successfully!");
    } catch {
      setMessage("❌ Error creating expense.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 text-gray-800 px-6 py-10">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-10">
        🤝 Split an Expense
      </h1>

      <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-md space-y-6 border border-gray-200">
        <input
          type="text"
          placeholder="Expense Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 rounded border bg-white border-gray-300 focus:ring-2 focus:ring-indigo-300"
        />

        <input
          type="number"
          placeholder="Total Amount"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          className="w-full p-2 rounded border bg-white border-gray-300 focus:ring-2 focus:ring-indigo-300"
        />

        {/* User Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Type username and press ➕"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full p-2 rounded border bg-white border-gray-300 focus:ring-2 focus:ring-indigo-300"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white border rounded shadow-lg z-10 max-h-40 overflow-y-auto">
              {suggestions.map((user) => (
                <div
                  key={user}
                  className="px-3 py-2 hover:bg-indigo-100 cursor-pointer flex justify-between items-center"
                >
                  <span>{user}</span>
                  <button
                    onClick={() => handleAddUser(user)}
                    className="bg-indigo-500 text-white px-2 py-1 rounded text-sm hover:bg-indigo-600"
                  >
                    ➕ Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Users */}
        <div className="flex flex-wrap gap-2">
          {selectedUsernames.map((uname) => (
            <span
              key={uname}
              className="bg-indigo-200 px-3 py-1 rounded-full text-sm font-medium text-indigo-800"
            >
              {uname}
            </span>
          ))}
        </div>

        {/* Split Type */}
        <div className="flex space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="even"
              checked={splitType === "even"}
              onChange={(e) => setSplitType(e.target.value)}
            />
            <span>Even Split</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="custom"
              checked={splitType === "custom"}
              onChange={(e) => setSplitType(e.target.value)}
            />
            <span>Custom Split</span>
          </label>
        </div>

        {/* Custom Inputs */}
        {splitType === "custom" && selectedUsernames.length > 0 && (
          <div className="space-y-2">
            {selectedUsernames.map((uname) => (
              <div
                key={uname}
                className="flex justify-between items-center"
              >
                <span className="text-gray-700 font-medium">{uname}</span>
                <input
                  type="number"
                  placeholder="Amount"
                  value={customSplits[uname] || ""}
                  onChange={(e) =>
                    handleCustomChange(uname, e.target.value)
                  }
                  className="w-32 p-1 rounded border bg-white border-gray-300 focus:ring-2 focus:ring-purple-300"
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white font-semibold py-2 rounded hover:bg-indigo-700 transition"
        >
          Submit Split
        </button>

        {message && (
          <div className="text-center text-sm text-indigo-600 mt-4 font-medium">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitExpense;
