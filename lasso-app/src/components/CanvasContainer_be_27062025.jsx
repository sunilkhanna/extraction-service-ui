import React, { useState } from "react";
import DrawingCanvas from "./DrawingCanvas";
import Toolbar from "./Toolbar";
import RectangleList from "./RectangleList";
import SaveKeyValueButton from "./SaveKeyValueButton";
import KeyValueDisplay from "./KeyValueDisplay"; //

export default function CanvasContainer() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [rectangles, setRectangles] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [mode, setMode] = useState("key");
  const [documentType, setDocumentType] = useState("");
  const [keyValues, setKeyValues] = useState([]);



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

            // Flatten key-value pairs into single rectangle list
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
            setKeyValues(data.raw_key_values || []);
          } catch (err) {
            console.error(err);
            alert("Could not load key-value data.");
          }
        };


  return (
    <div className="p-4 text-center">
      <input
        type="text"
        placeholder="Enter Document Type"
        value={documentType}
        onChange={(e) => setDocumentType(e.target.value)}
        className="border px-2 py-1 mb-2"
      />

      <input type="file" accept="image/*" onChange={handleUpload} className="mb-4" />

      <Toolbar mode={mode} setMode={setMode} />

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

      <RectangleList
        rectangles={rectangles}
        selectedIdx={selectedIdx}
        setSelectedIdx={setSelectedIdx}
      />

      <div className="mt-4 space-x-4">
        <button
          onClick={() => {
            if (selectedIdx !== null) {
              setRectangles((prev) => prev.filter((_, i) => i !== selectedIdx));
              setSelectedIdx(null);
            }
          }}
          disabled={selectedIdx === null}
          className={`px-4 py-2 rounded ${
            selectedIdx === null
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-red-600 text-white"
          }`}
        >
          Delete Selected
        </button>

        <SaveKeyValueButton rectangles={rectangles} documentType={documentType} />

        <button
          onClick={handleGetKeyValues}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Get Key-Values
        </button>
      </div>
      {keyValues.length > 0 && <KeyValueDisplay keyValues={keyValues} />}
    </div>
  );
}
