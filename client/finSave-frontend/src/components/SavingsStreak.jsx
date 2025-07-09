import React, { useState } from "react";
import dayjs from "dayjs";

// Simulated saved dates
const mockSavedDates = [
  "2025-07-05",
  "2025-07-04",
  "2025-07-03",
  "2025-06-30",
  "2025-06-25",
  "2025-06-20",
  "2025-06-19",
  "2025-06-01",
  "2025-05-20",
  "2025-05-15",
];

const RANGE_OPTIONS = {
  "30 Days": 30,
  "90 Days": 90,
  "6 Months": 180,
  "1 Year": 365,
};

const SavingsStreak = () => {
  const [range, setRange] = useState("90 Days");

  const savedSet = new Set(mockSavedDates);
  const daysToShow = RANGE_OPTIONS[range];
  const today = dayjs();

  const daysArray = Array.from({ length: daysToShow }, (_, i) =>
    today.subtract(daysToShow - i - 1, "day")
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-300">📅 Your Savings Streak</h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm"
        >
          {Object.keys(RANGE_OPTIONS).map((label) => (
            <option key={label} value={label}>{label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-7 gap-1 text-sm text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-gray-400">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-1">
        {daysArray.map((date, idx) => {
          const dateStr = date.format("YYYY-MM-DD");
          const saved = savedSet.has(dateStr);

          return (
            <div
              key={idx}
              title={date.format("MMM DD, YYYY")}
              className={`w-6 h-6 rounded-sm ${
                saved ? "bg-green-500 hover:bg-green-600" : "bg-gray-600"
              }`}
            ></div>
          );
        })}
      </div>

      <div className="flex justify-center gap-4 mt-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
          Saved
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
          No Save
        </div>
      </div>
    </div>
  );
};

export default SavingsStreak;
