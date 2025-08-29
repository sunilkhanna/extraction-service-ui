import React, { useState } from "react";
import DrawingCanvas from "./DrawingCanvas";
import Toolbar from "./Toolbar";
import SaveKeyValueButton from "./SaveKeyValueButton";
import KeyValueDisplay from "./KeyValueDisplay";
import RetrainControls from "./RetrainControls"; // ✅ NEW IMPORT

export default function CanvasContainer() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [rectangles, setRectangles] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [mode, setMode] = useState("key");
  const [documentType, setDocumentType] = useState("");
  const [flatKeyValueArray, setFlatKeyValueArray] = useState([]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const imageURL = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = imageURL;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setRectangles(data.region || []);
      setSelectedIdx(null);
      setDocumentType(data.document_type);
    } catch (err) {
      alert("Inference failed");
    }
  };

  const handleGetKeyValues = async () => {
    if (!documentType) {
      alert("Please enter a document type");
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/get-key-values/${documentType}`);
      if (!res.ok) throw new Error("Failed to fetch saved key-values");

      const data = await res.json();

      const loadedRectangles = data.key_values.flatMap((kv, index) => [
        {
          x0: kv.key.x0,
          y0: kv.key.y0,
          x1: kv.key.x1,
          y1: kv.key.y1,
          type: "key",
          id: `k-${index}`,
        },
        {
          x0: kv.value.x0,
          y0: kv.value.y0,
          x1: kv.value.x1,
          y1: kv.value.y1,
          type: "value",
          id: `v-${index}`,
        },
      ]);

      setRectangles(loadedRectangles);
      setFlatKeyValueArray(data.results);

    } catch (err) {
      console.error(err);
      alert("Could not load key-value data.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter Document Type"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          style={{ padding: "5px", marginRight: "10px" }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ marginRight: "10px" }}
        />
        <Toolbar mode={mode} setMode={setMode} />
        <button
          onClick={() => {
            if (selectedIdx !== null) {
              setRectangles((prev) => prev.filter((_, i) => i !== selectedIdx));
              setSelectedIdx(null);
            }
          }}
          disabled={selectedIdx === null}
          style={{
            padding: "8px 12px",
            marginLeft: "10px",
            backgroundColor: selectedIdx === null ? "#ccc" : "#d33",
            color: "#fff",
            border: "none",
            cursor: selectedIdx === null ? "not-allowed" : "pointer",
          }}
        >
          Delete Selected
        </button>

        <SaveKeyValueButton rectangles={rectangles} documentType={documentType} />

        <button
          onClick={handleGetKeyValues}
          style={{
            padding: "8px 12px",
            marginLeft: "10px",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Get Key-Values
        </button>
      </div>

      {/* Side-by-side layout using flexbox */}
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        {image && (
          <DrawingCanvas
            image={image}
            rectangles={rectangles}
            setRectangles={setRectangles}
            selectedIdx={selectedIdx}
            setSelectedIdx={setSelectedIdx}
            mode={mode}
          />
        )}

        {flatKeyValueArray.length > 0 && (
          <div style={{ width: "35%", maxHeight: "500px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
            <KeyValueDisplay flatKeyValueArray={flatKeyValueArray} />
          </div>
        )}
      </div>

      {/* ✅ Add retraining controls below */}
      <RetrainControls onRetrainComplete={() => alert("✅ Model retrained successfully.")} />
    </div>
  );
}
