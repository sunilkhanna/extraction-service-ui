import React, { useRef, useState, useEffect } from "react";

export default function KeyValueLassoCanvas() {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rectangles, setRectangles] = useState([]);
  const [mode, setMode] = useState("key"); // "key" or "value"

  const [selectedRectIndex, setSelectedRectIndex] = useState(null);

  const imageUrl = "/bs1.png"; // Place image in /public folder

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const maxWidth = window.innerWidth - 40;
      const maxHeight = window.innerHeight - 100;
      const scaleFactor = Math.min(maxWidth / img.width, maxHeight / img.height);
      const scaledWidth = img.width * scaleFactor;
      const scaledHeight = img.height * scaleFactor;

      const canvas = canvasRef.current;
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

      setImage({ obj: img, width: img.width, height: img.height });
      setScale(scaleFactor);
    };
  }, []);

  const redraw = () => {
    if (!image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image.obj, 0, 0, canvas.width, canvas.height);

   rectangles.forEach((rect, idx) => {
     let color = "black";
     switch (rect.type) {
       case "key":
         color = "green";
         break;
       case "value":
         color = "orange";
         break;
       case "table":
         color = "blue";
         break;
       case "header":
         color = "purple";
         break;
     }

     ctx.lineWidth = idx === selectedRectIndex ? 4 : 2; // thicker border if selected
     ctx.strokeStyle = idx === selectedRectIndex ? "red" : color; // red highlight if selected

     ctx.strokeRect(
       rect.x0 * scale,
       rect.y0 * scale,
       (rect.x1 - rect.x0) * scale,
       (rect.y1 - rect.y0) * scale
     );
   });



    if (start && end) {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(start.x - end.x);
      const height = Math.abs(start.y - end.y);

      ctx.strokeStyle = mode === "key" ? "green" : "orange";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    }
  };

  useEffect(redraw, [image, rectangles, start, end, mode]);

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    setStart(getMousePos(e));
    setEnd(null);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    setEnd(getMousePos(e));
  };

  const handleMouseUp = () => {
    if (start && end && image) {
      const x1 = Math.min(start.x, end.x) / scale;
      const y1 = Math.min(start.y, end.y) / scale;
      const x2 = Math.max(start.x, end.x) / scale;
      const y2 = Math.max(start.y, end.y) / scale;

//       const newRect_old = {
//         type: mode, // "key" or "value"
//         x: Math.round(x1),
//         y: Math.round(y1),
//         width: Math.round(x2 - x1),
//         height: Math.round(y2 - y1),
//       };

    const newRect = {
      type: mode, // "key" or "value"
      x0: Math.round(x1),
      y0: Math.round(y1),
      x1: Math.round(x2),
      y1: Math.round(y2),
    };


      setRectangles((prev) => [...prev, newRect]);
    }
    setStart(null);
    setEnd(null);
    setIsDrawing(false);
  };

const handleClick = (e) => {
  if (!image) return;
  const mousePos = getMousePos(e);

  // Find index of rectangle under mouse (reverse order to select topmost first)
  const clickedIndex = rectangles
    .map((rect, idx) => {
      // Check if mousePos is inside rectangle bounds (scaled coords)
      const x0 = rect.x0 * scale;
      const y0 = rect.y0 * scale;
      const x1 = rect.x1 * scale;
      const y1 = rect.y1 * scale;
      if (
        mousePos.x >= x0 &&
        mousePos.x <= x1 &&
        mousePos.y >= y0 &&
        mousePos.y <= y1
      ) {
        return idx;
      }
      return -1;
    })
    .filter((idx) => idx !== -1)
    .pop(); // get last matching (topmost)

  setSelectedRectIndex(clickedIndex !== undefined ? clickedIndex : null);
};



  return (
    <div className="p-4 text-center">
      <div className="mb-3">
        <button
          onClick={() => setMode("key")}
          className={`px-4 py-2 mx-2 rounded ${
            mode === "key" ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          Draw Key
        </button>
        <button
          onClick={() => setMode("value")}
          className={`px-4 py-2 mx-2 rounded ${
            mode === "value" ? "bg-orange-600 text-white" : "bg-gray-200"
          }`}
        >
          Draw Value
        </button>

        <button
            onClick={() => setMode("table")}
            className={`px-4 py-2 mx-2 rounded ${
              mode === "table" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Draw Table
          </button>
          <button
            onClick={() => setMode("header")}
            className={`px-4 py-2 mx-2 rounded ${
              mode === "header" ? "bg-purple-600 text-white" : "bg-gray-200"
            }`}
          >
            Draw Header
          </button>

        <button
          onClick={() => {
            if (selectedRectIndex === null) return;
            setRectangles((prev) =>
              prev.filter((_, idx) => idx !== selectedRectIndex)
            );
            setSelectedRectIndex(null);
          }}
          disabled={selectedRectIndex === null}
          className={`px-4 py-2 rounded ml-4 ${
            selectedRectIndex !== null
              ? "bg-red-600 text-white"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Delete Selected
        </button>

      </div>

      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid black",
          display: "block",
          margin: "0 auto",
          cursor: "crosshair",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
      />

    <div className="mt-6 max-w-4xl mx-auto text-left">
      <h2 className="text-lg font-semibold mb-2">📦 Bounding Boxes:</h2>
      <ul className="text-sm font-mono bg-gray-100 p-4 rounded max-h-60 overflow-auto border">
        {rectangles.map((rect, idx) => {
          let label = "❓ Unknown";
          if (rect.type === "key") label = "🟩 Key";
          else if (rect.type === "value") label = "🟧 Value";
          else if (rect.type === "table") label = "🔵 Table";
          else if (rect.type === "header") label = "🟣 Header";

          return (
            <li key={idx} className="mb-1">
              {label} — x0: {rect.x0}, y0: {rect.y0}, x1: {rect.x1}, y1: {rect.y1}
            </li>
          );
        })}
      </ul>

    </div>

    <button
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      onClick={() => {
        const json = JSON.stringify(rectangles, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "rectangles.json";
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      ⬇️ Export BBoxes
    </button>

      <div className="mt-4 text-sm font-mono">
        🟩 Keys: {rectangles.filter((r) => r.type === "key").length} | 🟧 Values:{" "}
        {rectangles.filter((r) => r.type === "value").length}
      </div>
    </div>
  );
}
