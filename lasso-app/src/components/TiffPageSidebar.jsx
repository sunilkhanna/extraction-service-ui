import React from "react";

export default function TiffPageSidebar({ tiffPages, selectedIndex, onSelect }) {
  return (
    <div style={{ width: "120px", overflowY: "auto", borderRight: "1px solid #ccc" }}>
      {tiffPages.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Page ${index + 1}`}
          style={{
            width: "100%",
            cursor: "pointer",
            border: selectedIndex === index ? "2px solid #007BFF" : "1px solid #ccc",
            marginBottom: "8px",
          }}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}
