import React from "react";
import "./KeyValueDisplay.css"; // Import the CSS file

export default function KeyValueDisplay({ flatKeyValueArray }) {
  const rows = [];

  for (let i = 0; i < flatKeyValueArray.length; i += 2) {
    const key = Array.isArray(flatKeyValueArray[i])
      ? flatKeyValueArray[i].join(" ").replace(/:$/, "")
      : "";
    const value = Array.isArray(flatKeyValueArray[i + 1])
      ? flatKeyValueArray[i + 1].join(" ")
      : "";
    rows.push({ key, value });
  }

  return (
    <div className="kv-container">
      <h2>Extracted Key-Value Pairs</h2>
      <table className="kv-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td className="key-cell">{row.key}</td>
              <td className="value-cell">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
