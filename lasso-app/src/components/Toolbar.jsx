import React from "react";

export default function Toolbar({ mode, setMode }) {
  const types = [
    { key: "key", label: "Key", color: "green" },
    { key: "value", label: "Value", color: "orange" },
    { key: "table", label: "Table", color: "blue" },
    { key: "header", label: "Header", color: "purple" },
  ];

  return (
    <div className="mb-3">
      {types.map(({ key, label, color }) => (
        <button
          key={key}
          onClick={() => setMode(key)}
          className={`px-4 py-2 mx-2 rounded ${
            mode === key
              ? `bg-[${color}] text-white`
              : "bg-gray-200 text-black"
          }`}
          style={{
            backgroundColor: mode === key ? color : "#ddd",
            color: mode === key ? "white" : "black",
          }}
        >
          Draw {label}
        </button>
      ))}
    </div>
  );
}
