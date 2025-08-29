import React, { useState, useEffect } from "react";
import DrawingCanvas from "./DrawingCanvas";
import Toolbar from "./Toolbar";
import SaveKeyValueButton from "./SaveKeyValueButton";
import KeyValueDisplay from "./KeyValueDisplay";
import "./../App.css";

export default function CanvasContainer() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [rectangles, setRectangles] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [mode, setMode] = useState("key");
  const [documentType, setDocumentType] = useState("");
  const [flatKeyValueArray, setFlatKeyValueArray] = useState([]);
  const [folders, setFolders] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [openFolders, setOpenFolders] = useState({});

  useEffect(() => {
    fetch("http://127.0.0.1:8000/list-processed")
      .then((res) => res.json())
      .then((data) => setFolders(data))
      .catch((err) => console.error("Error fetching processed list:", err));
  }, []);

  const handleThumbnailClick = async (imagePath, folderName) => {
    try {
      setFlatKeyValueArray([]);
      setDrawerOpen(false);
      const encodedPath = encodeURIComponent(imagePath);
      const res = await fetch(`http://127.0.0.1:8000/processed/${encodedPath}`);
      const blob = await res.blob();

      const imageUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = imageUrl;

      const [folder, file] = imagePath.split("/");
      const predictRes = await fetch(
        `http://127.0.0.1:8000/predict-existing/${folder}/${file}`
      );
      if (!predictRes.ok) throw new Error("Prediction failed");

      const data = await predictRes.json();
      setRectangles(data.region || []);
      setDocumentType(data.document_type || "");

      setFlatKeyValueArray(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      console.error("Error loading or predicting:", err);
      alert("Prediction failed");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const isPDF = file.type === "application/pdf";
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const regionData = Array.isArray(data.region) ? data.region : [];
      setRectangles(regionData);
      setDocumentType(data.document_type);

      const previewImage = new Image();
      previewImage.onload = () => setImage(previewImage);

      if (isPDF) {
        previewImage.src = `data:image/png;base64,${data.preview_base64}`;
      } else {
        const imageURL = URL.createObjectURL(file);
        previewImage.src = imageURL;
      }
    } catch (err) {
      console.error(err);
      alert("Inference failed");
    }
  };

  const handleGetKeyValues = async () => {
    if (!documentType) {
      alert("Please enter a document type");
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/get-key-values/${documentType}`
      );
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
      setDrawerOpen(true);
    } catch (err) {
      console.error(err);
      alert("Could not load key-value data.");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header Controls */}
      <div style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <input
          type="text"
          placeholder="Enter Document Type"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          style={{ padding: "5px", marginRight: "10px" }}
        />
        <input
          type="file"
          accept=".pdf,image/*"
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
        <SaveKeyValueButton
          rectangles={rectangles}
          documentType={documentType}
        />
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

      {/* Main Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Thumbnails */}
        <div
          style={{
            width: "250px",
            overflowY: "auto",
            borderRight: "1px solid #ccc",
            backgroundColor: "#f9f9f9",
            padding: "5px",
            fontSize: "12px",
          }}
        >
        {/*   {folders.map((folder) => (
            <div key={folder.folder}>
              <strong>{folder.folder}</strong>
              {folder.files.map((file) => (
                <img
                  key={file}
                  src={`http://127.0.0.1:8000/processed/${encodeURIComponent(
                    file
                  )}`}
                  alt="thumbnail"
                  onClick={() => handleThumbnailClick(file, folder.folder)}
                  style={{
                    width: "100%",
                    height: "100px",
                    objectFit: "cover",
                    marginBottom: "5px",
                    cursor: "pointer",
                    border: "1px solid #999",
                    borderRadius: "4px",
                  }}
                />
              ))}
            </div>
          ))} */}

       <div
         style={{
           width: "250px",
           overflowY: "auto",
           borderRight: "1px solid #ccc",
           backgroundColor: "#f9f9f9",
           padding: "10px",
            fontSize: "12px",
         }}
       >
         {folders.map((folder) => {
           const isOpen = openFolders[folder.folder] || false;

           return (
             <div key={folder.folder} style={{ marginBottom: "10px" }}>
               <div
                 onClick={() =>
                   setOpenFolders((prev) => ({
                     ...prev,
                     [folder.folder]: !prev[folder.folder],
                   }))
                 }
                 style={{
                   cursor: "pointer",
                   fontWeight: "bold",
                   color: "#333",
                   marginBottom: "4px",
                    fontSize: "12px",
                 }}
               >
                 {isOpen ? "📂" : "📁"} {folder.folder}
               </div>
               {isOpen && (
                 <ul style={{ paddingLeft: "20px", listStyle: "none" }}>
                   {folder.files.map((file) => (
                     <li key={file}>
                       <button
                         onClick={() => handleThumbnailClick(file, folder.folder)}
                         style={{
                           background: "none",
                           border: "none",
                           color: "#007BFF",
                           cursor: "pointer",
                           padding: 0,
                           textAlign: "left",
                            fontSize: "12px",
                         }}
                       >
                         📄 {file.split("/").pop()}
                       </button>
                     </li>
                   ))}
                 </ul>
               )}
             </div>
           );
         })}
       </div>




        </div>

        {/* Canvas */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            transition: "height 0.3s ease",
            height: drawerOpen ? "calc(100% - 200px)" : "100%",
          }}
        >
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
        </div>
      </div>

      {/* Expandable Drawer */}
      <div
        style={{
          height: drawerOpen ? "200px" : "0",
          overflow: "hidden",
          transition: "height 0.3s ease",
          backgroundColor: "#f2f2f2",
          borderTop: drawerOpen ? "1px solid #ccc" : "none",
        }}
      >
        {drawerOpen && (
          <div style={{ padding: "10px", height: "100%", boxSizing: "border-box", fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
{/*               <strong>Extracted Key-Value Pairs</strong> */}
              <button onClick={() => setDrawerOpen(false)}>Close</button>
            </div>
            <div style={{ overflowY: "auto", height: "calc(100% - 30px)" , fontSize: "12px"}}>
              <KeyValueDisplay flatKeyValueArray={flatKeyValueArray} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
