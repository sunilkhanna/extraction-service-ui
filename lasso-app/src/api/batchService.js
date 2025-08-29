export const runBatch = async (folderName) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/run-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: folderName }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Run Batch Error:', error);
    throw error;
  }
};


export const validateBatch = async (folder, file, documentType) => {
console.log("Selected document of Type :: "+documentType);
  if (!folder || !file) {

    alert("Please select a file to validate bsxxx");
    return;
  }
      const encodedFolder = encodeURIComponent(folder);
      const encodedFile = encodeURIComponent(file);
      const encodedDocType = encodeURIComponent(documentType);

      const res = await fetch(`http://127.0.0.1:8000/validate-file/${encodedFolder}/${encodedFile}/${encodedDocType}`, {
        method: "POST",
      });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Validation failed: ${errorText}`);
  }

  return await res.json();
};

