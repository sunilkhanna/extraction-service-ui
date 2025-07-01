import React, { useEffect, useRef, useState } from "react";

const colors = {
  key: "green",
  value: "orange",
  table: "blue",
  header: "purple",
};

export default function DrawingCanvas({
  image,            // image passed from CanvasContainer (uploaded)
  rectangles,
  setRectangles,
  mode,
  selectedIdx,
  setSelectedIdx,
}) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Scale image and initialize canvas dimensions
  useEffect(() => {
    if (!image) return;
    const canvas = canvasRef.current;
    const maxWidth = window.innerWidth - 40;
    const maxHeight = window.innerHeight - 150;
    const scaleFactor = Math.min(maxWidth / image.width, maxHeight / image.height);

    canvas.width = image.width * scaleFactor;
    canvas.height = image.height * scaleFactor;
    setScale(scaleFactor);

    redraw(); // draw right away
  }, [image]);

  // Redraw whenever something changes
  useEffect(() => {
    redraw();
  }, [rectangles, start, end, selectedIdx]);

  const redraw = () => {
    if (!image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw stored rectangles
    rectangles.forEach((rect, idx) => {
      ctx.strokeStyle = colors[rect.type] || "black";
      ctx.lineWidth = idx === selectedIdx ? 2 : 1;
      ctx.setLineDash(idx === selectedIdx ? [6] : []);
      ctx.strokeRect(
        rect.x0 * scale,
        rect.y0 * scale,
        (rect.x1 - rect.x0) * scale,
        (rect.y1 - rect.y0) * scale
      );
    });

    // Draw current (temporary) rectangle
    if (start && end) {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(start.x - end.x);
      const height = Math.abs(start.y - end.y);

      ctx.strokeStyle = colors[mode] || "black";
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.strokeRect(x, y, width, height);
    }
  };

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
    setSelectedIdx(null); // clear selection when starting new
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    setEnd(getMousePos(e));
  };

  const handleMouseUp = () => {
    if (start && end && image) {
      const x0 = Math.min(start.x, end.x) / scale;
      const y0 = Math.min(start.y, end.y) / scale;
      const x1 = Math.max(start.x, end.x) / scale;
      const y1 = Math.max(start.y, end.y) / scale;

      const newRect = {
        type: mode,
        x0: Math.round(x0),
        y0: Math.round(y0),
        x1: Math.round(x1),
        y1: Math.round(y1),
      };

      setRectangles((prev) => [...prev, newRect]);
    }
    setStart(null);
    setEnd(null);
    setIsDrawing(false);
  };

  const handleCanvasClick = (e) => {
    const pos = getMousePos(e);
    for (let i = rectangles.length - 1; i >= 0; i--) {
      const r = rectangles[i];
      if (
        pos.x / scale >= r.x0 &&
        pos.x / scale <= r.x1 &&
        pos.y / scale >= r.y0 &&
        pos.y / scale <= r.y1
      ) {
        setSelectedIdx(i);
        return;
      }
    }
    setSelectedIdx(null);
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: "1px solid black",
        display: "block",
        margin: "0 auto",
        cursor: isDrawing ? "crosshair" : "default",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
    />
  );
}
