import React from "react";

export default function RectangleList({ rectangles, selectedIdx, setSelectedIdx }) {
  const colorMap = {
    key: "🟩",
    value: "🟧",
    table: "🟦",
    header: "🟪",
  };

  return (
    <ul
      style={{
        maxHeight: "150px",
        overflowY: "auto",
        marginTop: "1rem",
        fontFamily: "monospace",
        textAlign: "left",
        width: "fit-content",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {rectangles.map((rect, idx) => (
        <li
          key={idx}
          onClick={() => setSelectedIdx(idx)}
          style={{
            cursor: "pointer",
            backgroundColor: idx === selectedIdx ? "#d3d3d3" : "transparent",
            padding: "4px",
            borderRadius: "4px",
            marginBottom: "2px",
            userSelect: "none",
          }}
          title={`Select rectangle #${idx + 1}`}
        >
          {colorMap[rect.type] || "⬜"}
          {rect.type.charAt(0).toUpperCase() + rect.type.slice(1)} —
          x0: {rect.x0}, y0: {rect.y0}, x1: {rect.x1}, y1: {rect.y1}
        </li>
      ))}
    </ul>
  );
}
