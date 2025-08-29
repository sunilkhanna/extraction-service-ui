import React, { useState } from "react";

function Classification() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [isEdited, setIsEdited] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setStatusMessage("");
  };

  const handleClassify = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/classify", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      let resultText = "";

      if (!response.ok) {
        resultText = await response.text();
        throw new Error(resultText);
      }

      if (contentType && contentType.includes("application/json")) {
        const json = await response.json();
        resultText = json.document_type || "";
      } else {
        resultText = await response.text();
      }

      setDocumentType(resultText);
      setIsEdited(false);
      setStatusMessage("Classification completed.");
    } catch (error) {
      console.error("Error:", error);
      setDocumentType("");
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const handleTypeChange = (event) => {
    setDocumentType(event.target.value);
    setIsEdited(true);
  };

  const handleLearn = async () => {
    if (!selectedFile || !documentType) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("document_type", documentType);

    try {
      const response = await fetch("http://127.0.0.1:8000/learn", {
        method: "POST",
        body: formData,
      });

      const resultText = await response.text();

      if (!response.ok) {
        throw new Error(resultText);
      }

      setStatusMessage(`Learned: ${resultText}`);
      setIsEdited(false);
    } catch (error) {
      console.error("Learn error:", error);
      setStatusMessage(`Learn failed: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>Document Classification</h2>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleClassify} disabled={!selectedFile} style={{ marginLeft: "10px" }}>
        Upload
      </button>

      <div style={{ marginTop: "20px" }}>
        <label>Document Type:</label>
        <input
          type="text"
          value={documentType}
          onChange={handleTypeChange}
          style={{ width: "100%", padding: "5px", marginTop: "5px" }}
        />
      </div>

      <button onClick={handleLearn} disabled={!isEdited || !documentType} style={{ marginTop: "10px" }}>
        Learn
      </button>

      {statusMessage && (
        <div style={{ marginTop: "15px", color: statusMessage.startsWith("Error") || statusMessage.startsWith("Learn failed") ? "red" : "green" }}>
          {statusMessage}
        </div>
      )}
    </div>
  );
}

export default Classification;
