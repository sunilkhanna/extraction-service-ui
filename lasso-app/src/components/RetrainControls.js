import React, { useState } from "react";

export default function RetrainControls({ onRetrainComplete }) {
  const [retrainFile, setRetrainFile] = useState(null);
  const [label, setLabel] = useState("");
  const [isRetraining, setIsRetraining] = useState(false);
  const [message, setMessage] = useState("");

  const acceptedTypes = ["image/jpeg", "image/png", "image/tiff", "image/bmp", "image/jpg"];

  const handleRetrainFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setMessage("⚠️ No file selected.");
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      setMessage("⚠️ Invalid image file type.");
      return;
    }

    if (!label.trim()) {
      setMessage("⚠️ Please enter a label.");
      return;
    }

    setRetrainFile(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("label", label);

    try {
      const res = await fetch("http://127.0.0.1:8000/retrain/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      setMessage("📁 File uploaded successfully for retraining.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed.");
    }
  };

  const handleRetrain = async () => {
    if (!retrainFile) {
      alert("Please upload a file for retraining first.");
      return;
    }

    setIsRetraining(true);
    setMessage("⏳ Retraining in progress...");

    try {
      const res = await fetch("http://127.0.0.1:8000/retrain", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Retraining failed");

      setMessage("✅ Retraining complete.");
      onRetrainComplete?.();
    } catch (err) {
      console.error(err);
      setMessage("❌ Retraining failed.");
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h4>🔁 Retrain Model</h4>
      <input
        type="text"
        placeholder="Enter label (e.g., invoice)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        style={{ marginBottom: "10px", display: "block" }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleRetrainFileUpload}
      />
      <button
        onClick={handleRetrain}
        disabled={isRetraining || !retrainFile}
        style={{
          padding: "8px 12px",
          marginLeft: "10px",
          backgroundColor: isRetraining ? "#aaa" : "#28a745",
          color: "#fff",
          border: "none",
          cursor: isRetraining ? "not-allowed" : "pointer",
        }}
      >
        {isRetraining ? "Retraining..." : "Start Retraining"}
      </button>
      <p>{message}</p>
    </div>
  );
}
