import React, { useState } from "react";
import DrawingCanvas from "./DrawingCanvas";
import Toolbar from "./Toolbar";
import RectangleList from "./RectangleList";

export default function CanvasContainer() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [rectangles, setRectangles] = useState([]);
  const [mode, setMode] = useState("key");
  const [selectedIdx, setSelectedIdx] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      setUploadedImage(img);
      setRectangles([]); // clear previous drawings
      setSelectedIdx(null);
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="p-4 text-center">
      <div className="mb-4">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      <Toolbar mode={mode} setMode={setMode} />

      {uploadedImage && (
        <DrawingCanvas
          image={uploadedImage}
          mode={mode}
          rectangles={rectangles}
          setRectangles={setRectangles}
          selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx}
        />
      )}

      <RectangleList
        rectangles={rectangles}
        selectedIdx={selectedIdx}
        setSelectedIdx={setSelectedIdx}
      />

      <button
        onClick={() => {
          if (selectedIdx !== null) {
            setRectangles((prev) => prev.filter((_, i) => i !== selectedIdx));
            setSelectedIdx(null);
          }
        }}
        disabled={selectedIdx === null}
        className={`mt-4 px-4 py-2 rounded ${
          selectedIdx === null ? "bg-gray-300 cursor-not-allowed" : "bg-red-600 text-white"
        }`}
      >
        Delete Selected
      </button>
    </div>
  );
}
