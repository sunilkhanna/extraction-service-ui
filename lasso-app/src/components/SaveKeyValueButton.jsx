import React, { useState } from "react";

export default function SaveKeyValueButton({ rectangles, documentType }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    // Group rectangles into key-value pairs (assuming each key is followed by its value)
    const filteredRects = rectangles.filter(
      (r) => r.type !== "table" && r.label !== "table"
    );

    const keyValues = [];
    for (let i = 0; i < filteredRects.length; i += 2) {
      if (i + 1 < filteredRects.length) {
        keyValues.push({
          key: {
            x0: filteredRects[i].x0,
            y0: filteredRects[i].y0,
            x1: filteredRects[i].x1,
            y1: filteredRects[i].y1,
          },
          value: {
            x0: filteredRects[i + 1].x0,
            y0: filteredRects[i + 1].y0,
            x1: filteredRects[i + 1].x1,
            y1: filteredRects[i + 1].y1,
          },
        });
      }
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/save-key-values", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_type: documentType,
          key_values: keyValues,
        }),
      });

      if (!res.ok) throw new Error("Failed to save key-values");
      alert("Key-value pairs saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save key-values.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      className="bg-blue-600 text-white px-4 py-2 rounded"
      disabled={isSaving}
    >
      {isSaving ? "Saving..." : "Save Key-Values"}
    </button>
  );
}
