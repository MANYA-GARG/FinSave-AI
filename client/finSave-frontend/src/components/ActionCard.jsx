// src/components/ActionCard.jsx
import React from 'react';

const ActionCard = ({ title, children }) => (
  <div className="bg-gray-50 shadow-md border border-gray-200 p-6 rounded-xl flex flex-col gap-3">
    <h3 className="text-lg font-semibold text-indigo-600 mb-2">{title}</h3>
    {children}
  </div>
);

export default ActionCard;
