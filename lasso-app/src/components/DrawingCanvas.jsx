import React, { useEffect, useRef, useState } from "react";

import { validateBatch } from '../api/batchService';

const colors = {
  key: "green",
  value: "orange",
  table: "blue",
  header: "purple",
};

export default function DrawingCanvas({
  image,
  rectangles,
  setRectangles,
  mode,
  selectedIdx,
  setSelectedIdx,
  selectedFilePath,
  setSelectedFilePath,// ✅ NEW PROP
  documentType,
  setDocumentType,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [baseScale, setBaseScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState(null);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    if (!image) return;
    const canvas = canvasRef.current;
    const maxWidth = window.innerWidth - 40;
    const maxHeight = window.innerHeight - 150;
    const scaleFactor = Math.min(maxWidth / image.width, maxHeight / image.height);
    canvas.width = image.width * scaleFactor;
    canvas.height = image.height * scaleFactor;
    setBaseScale(scaleFactor);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    redraw(scaleFactor, 1, { x: 0, y: 0 });
  }, [image]);

  useEffect(() => {
    redraw(baseScale, zoom, offset);
  }, [rectangles, start, end, selectedIdx, baseScale, zoom, offset]);

  const redraw = (scale = baseScale, zoom = 1, offset = { x: 0, y: 0 }) => {
    if (!image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const totalScale = scale * zoom;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.drawImage(image, 0, 0, image.width * totalScale, image.height * totalScale);

    rectangles.forEach((rect, idx) => {
      ctx.strokeStyle = colors[rect.type] || "black";
      ctx.lineWidth = idx === selectedIdx ? 2 : 1;
      ctx.setLineDash(idx === selectedIdx ? [6] : []);
      ctx.strokeRect(
        rect.x0 * totalScale,
        rect.y0 * totalScale,
        (rect.x1 - rect.x0) * totalScale,
        (rect.y1 - rect.y0) * totalScale
      );
    });

    if (start && end) {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(start.x - end.x);
      const height = Math.abs(start.y - end.y);
      ctx.strokeStyle = colors[mode] || "black";
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.strokeRect(x - offset.x, y - offset.y, width, height);
    }

    ctx.restore();
  };

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left - offset.x,
      y: e.clientY - rect.top - offset.y,
    };
  };

  const handleMouseDown = (e) => {
    if (e.button === 1 || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    const pos = getMousePos(e);
    setStart(pos);
    setEnd(null);
    setIsDrawing(true);
    setSelectedIdx(null);
  };

  const handleMouseMove = (e) => {
    if (isPanning && panStart) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    if (!isDrawing) return;
    const pos = getMousePos(e);
    setEnd(pos);
  };

  const handleMouseUp = (e) => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    if (start && end && image) {
      const totalScale = baseScale * zoom;
      const x0 = Math.min(start.x, end.x) / totalScale;
      const y0 = Math.min(start.y, end.y) / totalScale;
      const x1 = Math.max(start.x, end.x) / totalScale;
      const y1 = Math.max(start.y, end.y) / totalScale;

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
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - offset.x;
    const y = e.clientY - rect.top - offset.y;
    const totalScale = baseScale * zoom;

    for (let i = rectangles.length - 1; i >= 0; i--) {
      const r = rectangles[i];
      if (
        x / totalScale >= r.x0 &&
        x / totalScale <= r.x1 &&
        y / totalScale >= r.y0 &&
        y / totalScale <= r.y1
      ) {
        setSelectedIdx(i);
        return;
      }
    }
    setSelectedIdx(null);
  };

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      setZoom((z) => Math.max(0.2, Math.min(z + delta, 5)));
    }
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleValidate = async () => {
    if (!selectedFilePath) {
          alert("Please select a file to validate.");
      return;
    }

    try {
      const { folder, file } = selectedFilePath;
      console.log('folder,file and documentType : ', folder,file,documentType);
      const result = await validateBatch(folder, file, documentType);
      alert(`Validation successful:\n${JSON.stringify(result)}`);
    } catch (err) {
      alert("Validation failed.");
    }
  };

  return (
    <div ref={containerRef} style={{ textAlign: "center", padding: "1rem" }}>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setZoom((z) => Math.min(z + 0.1, 5))}>Zoom In +</button>
        <button onClick={() => setZoom((z) => Math.max(z - 0.1, 0.2))} style={{ marginLeft: "10px" }}>
          Zoom Out -
        </button>
        <button
          onClick={resetView}
          style={{ marginLeft: "10px", backgroundColor: "#eee", border: "1px solid #aaa" }}
        >
          Reset View
        </button>
        <button
          onClick={handleValidate}
          style={{ marginLeft: "10px", backgroundColor: "#28a745", color: "#fff", border: "none" }}
        >
          ✅ Validate
        </button>
        <span style={{ marginLeft: "15px", color: "gray" }}>Hold <kbd>Alt</kbd> + drag to pan</span>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid black",
          display: "block",
          margin: "0 auto",
          cursor: isPanning ? "grabbing" : isDrawing ? "crosshair" : "default",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
      />
    </div>
  );
}
