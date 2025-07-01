import React, { useState } from "react";
import DrawingCanvas from "./DrawingCanvas";
import Toolbar from "./Toolbar";
import RectangleList from "./RectangleList";

export default function CanvasContainer() {
  const [rectangles, setRectangles] = useState([]);
  const [mode, setMode] = useState("key"); // key, value, table, header
  const [selectedIdx, setSelectedIdx] = useState(null);

  return (
    <div className="p-4 text-center">
      <Toolbar mode={mode} setMode={setMode} />

      <DrawingCanvas
        rectangles={rectangles}
        setRectangles={setRectangles}
        mode={mode}
        selectedIdx={selectedIdx}
        setSelectedIdx={setSelectedIdx}
      />

      <RectangleList
        rectangles={rectangles}
        selectedIdx={selectedIdx}
        setSelectedIdx={setSelectedIdx}
      />

      <button
        onClick={() => {
          if (selectedIdx !== null) {
            setRectangles(rectangles.filter((_, i) => i !== selectedIdx));
            setSelectedIdx(null);
          }
        }}
        disabled={selectedIdx === null}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: selectedIdx === null ? "#ccc" : "#e53935",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: selectedIdx === null ? "not-allowed" : "pointer",
        }}
      >
        Delete Selected
      </button>
    </div>
  );
}
