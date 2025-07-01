import React, { useState } from "react";
import DrawingCanvas from "./DrawingCanvas";
import Toolbar from "./Toolbar";
import RectangleList from "./RectangleList";

export default function CanvasContainer() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [rectangles, setRectangles] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [mode, setMode] = useState("key");

  // Handle image upload + backend call
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    const imageURL = URL.createObjectURL(file);
    console.log(imageURL)
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

      if (!res.ok) {
        throw new Error("Backend error");
      }

      const data = await res.json();
      console.log("Full Response:", data);

        // Access table_region
      const tableRegion = data.region;
      console.log("Table Region:--", tableRegion);
      console.log("FirstRegion : ",tableRegion[0])
      setRectangles(tableRegion.rectangles || []);
      setSelectedIdx(null);
    } catch (err) {
      console.error("Upload or inference failed:", err);
      alert("Failed to upload image or get predictions from backend.");
    }
  };


   return (
       <div className="p-4 text-center">
         <div className="mb-4">
           <input type="file" accept="image/*" onChange={handleUpload} />
         </div>

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

