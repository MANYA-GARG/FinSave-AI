// src/components/LabeledInput.jsx
import React from 'react';

const LabeledInput = ({ label, value, onChange, type }) => (
  <div className="mb-2">
    <label className="text-sm text-gray-600">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 rounded bg-indigo-100"
    />
  </div>
);

export default LabeledInput;
