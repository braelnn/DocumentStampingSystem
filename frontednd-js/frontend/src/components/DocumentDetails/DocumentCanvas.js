import React, { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from  "react-pdf"; 
import "./DocumentCanvas.css";
import { getStamps } from "../../services/stampsService";
import { saveStampedDocument } from "../../services/documentsService";
import { jsPDF } from "jspdf";




pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs';

const DocumentCanvas = ({ documentUrl, onApplyStamp, documentId, onSaveSuccess }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1); // Zoom level
  const [rotation, setRotation] = useState(0); // Rotation angle
  const [bookmarks, setBookmarks] = useState([]);
  const canvasRef = useRef(null);
  const [stamps, setStamps] = useState([]); // Store stamps from the backend
  const [showStamps, setShowStamps] = useState(false); // Toggle stamp previews
  const [placedStamps, setPlacedStamps] = useState([]); // Track stamps placed on the canvas

  const activeStampRef = useRef(null);




  // Fetch stamps from the backend
  useEffect(() => {
    const fetchStamps = async () => {
      try {
        const fetchedStamps = await getStamps();
        setStamps(fetchedStamps);
      } catch (error) {
        console.error("Error fetching stamps:", error);
      }
    };

    fetchStamps();
  }, []);

  const handleLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleRenderSuccess = () => {
    drawStamps();
  };





  const handleStamp = (stamp) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = stamp;
      img.onload = () => {
        ctx.drawImage(img, 50, 50, 100, 100); // Example position and size
      };
    }
  };

  const handleApplyCanvas = () => {
    setShowStamps(true);
  };


  const handleNextPage = () => {
    if (currentPage < numPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleGoToFirstPage = () => {
    setCurrentPage(1);
  };

  const handleGoToLastPage = () => {
    setCurrentPage(numPages);
  };

  const handleJumpToPage = () => {
    const page = parseInt(prompt("Enter page number:"), 10);
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page);
    } else {
      alert("Invalid page number.");
    }
  };

  const handleRotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRotateCounterclockwise = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    link.href = documentUrl;
    link.download = `Document-${new Date().toISOString()}.pdf`;
    link.click();
  };

  const handleFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  };

  const handleResetZoomAndRotation = () => {
    setScale(1);
    setRotation(0);
  };

 

  const handleBookmarkPage = () => {
    setBookmarks((prev) => [...new Set([...prev, currentPage])]);
    alert(`Bookmarked page ${currentPage}`);
  };

 

  useEffect(() => {
    if (onApplyStamp) {
      onApplyStamp(handleStamp);
    }
  }, [onApplyStamp]);

  const handleStampClick = (stamp) => {
    if (!stamp || !stamp.preview) {
      console.error("Invalid stamp selected:", stamp);
      return;
    }
  
    const canvas = canvasRef.current;
if (!canvas) return;

const img = new Image();
img.src = stamp.preview;

img.onload = () => {
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const newStamp = {
    id: Date.now(), // Unique ID
    x: 0, // Left alignment (0 is the left side of the canvas)
    y: canvasHeight - 200, // Bottom alignment (canvas height minus stamp height)
    width: 200, // Width of the stamp
    height: 200, // Height of the stamp
    angle: 0, // No rotation initially
    img: img, // Image to be placed
  };

  setPlacedStamps((prevStamps) => {
    const updatedStamps = [...prevStamps, newStamp];
    requestAnimationFrame(() => drawStamps(updatedStamps)); // Redraw the canvas
    return updatedStamps;
  });


  
      setPlacedStamps((prevStamps) => {
        // 🔹 Prevent duplicate stamps by checking if the stamp is already in the state
        if (prevStamps.find((s) => s.id === newStamp.id)) return prevStamps;
        
        const updatedStamps = [...prevStamps, newStamp];
        requestAnimationFrame(() => drawStamps(updatedStamps)); // Redraw
        return updatedStamps;
      });
    };
  
    img.onerror = () => {
      console.error("Failed to load stamp image:", stamp.preview);
    };
  };
  

  
  
  const drawStamps = (stamps = placedStamps) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext("2d");
  
    // Do NOT clear the canvas to preserve the PDF rendering
    stamps.forEach((stamp) => {
      ctx.save();
      ctx.translate(stamp.x + stamp.width / 2, stamp.y + stamp.height / 2);
      ctx.rotate((stamp.angle * Math.PI) / 180);
  
      // Draw the stamp image with a transparent background
      ctx.drawImage(stamp.img, -stamp.width / 2, -stamp.height / 2, stamp.width, stamp.height);
  
      ctx.restore();
    });
  };

  useEffect(() => {
    requestAnimationFrame(() => drawStamps());
  }, [placedStamps]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("mousedown", handleMouseDown);
      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
      };
    }
  }, [placedStamps]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    const clickedStamp = placedStamps.find(
      (stamp) =>
        x >= stamp.x &&
        x <= stamp.x + stamp.width &&
        y >= stamp.y &&
        y <= stamp.y + stamp.height
    );
  
    console.log("MouseDown Position:", { x, y });
    console.log("Clicked Stamp:", clickedStamp);
  
    if (clickedStamp) {
      const isResizeHandle =
        x >= clickedStamp.x + clickedStamp.width - 10 &&
        x <= clickedStamp.x + clickedStamp.width &&
        y >= clickedStamp.y + clickedStamp.height - 10 &&
        y <= clickedStamp.y + clickedStamp.height;
  
      const isRotateHandle =
        x >= clickedStamp.x + clickedStamp.width / 2 - 10 &&
        x <= clickedStamp.x + clickedStamp.width / 2 + 10 &&
        y >= clickedStamp.y - 20 &&
        y <= clickedStamp.y;
  
      activeStampRef.current = {
        ...clickedStamp,
        action: isResizeHandle ? "resize" : isRotateHandle ? "rotate" : "move",
      };
  
      console.log("Active Stamp Action:", activeStampRef.current.action);
  
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
    }
  };
  
  
  const handleMouseMove = (e) => {
    if (!activeStampRef.current) return;
  
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    // Update the position, size, or angle of the active stamp
    setPlacedStamps((prevStamps) =>
      prevStamps.map((stamp) => {
        if (stamp.id === activeStampRef.current.id) {
          if (activeStampRef.current.action === "move") {
            return { ...stamp, x: x - stamp.width / 2, y: y - stamp.height / 2 };
          } else if (activeStampRef.current.action === "resize") {
            const newWidth = Math.max(20, x - stamp.x);
            const newHeight = Math.max(20, y - stamp.y);
            return { ...stamp, width: newWidth, height: newHeight };
          } else if (activeStampRef.current.action === "rotate") {
            const centerX = stamp.x + stamp.width / 2;
            const centerY = stamp.y + stamp.height / 2;
            const angle =
              (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI + 90;
            return { ...stamp, angle: angle };
          }
        }
        return stamp;
      })
    );
  
    // Redraw the canvas after updating the state
    requestAnimationFrame(() => drawStamps());
  };
  
  
  const handleMouseUp = () => {
    activeStampRef.current = null;
    const canvas = canvasRef.current;
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mouseup", handleMouseUp);
  };


  const handleSaveStampedDocument = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        alert("Error: No document to save.");
        return;
      }
  
      // Scale up the canvas resolution for better quality
      const scale = 2.5; // Adjust the scale factor for higher resolution
      const width = canvas.width * scale;
      const height = canvas.height * scale;
  
      // Create a high-resolution offscreen canvas
      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;
  
      const offscreenCtx = offscreenCanvas.getContext("2d");
      offscreenCtx.scale(scale, scale); // Scale the context for high-resolution rendering
  
      // Draw the original canvas onto the offscreen canvas
      offscreenCtx.drawImage(canvas, 0, 0);
  
      // Convert the offscreen canvas content to a high-quality PNG image
      const highQualityPng = offscreenCanvas.toDataURL("image/png", 1.0); // 1.0 for the best quality
  
      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height], // Match the original canvas dimensions
      });
  
      // Add the high-quality PNG image to the PDF
      pdf.addImage(highQualityPng, "PNG", 0, 0, canvas.width, canvas.height);
  
      // Convert PDF to Blob
      const pdfBlob = pdf.output("blob");
  
      // Create a File object for the PDF
      const stampedFile = new File([pdfBlob], "stamped-document.pdf", {
        type: "application/pdf",
      });
  
      // Save the stamped document to the database
      await saveStampedDocument(documentId, stampedFile);
  
      alert("Stamped document saved successfully.");
  
      // Notify parent to fetch the updated stamped documents
      if (onSaveSuccess) onSaveSuccess(documentId);
    } catch (error) {
      console.error("Failed to save stamped document:", error);
      alert("Failed to save the stamped document. Please try again.");
    }
  };
  

  const handleDownloadStampedDocument = async (documentId = "document") => {
    const canvases = document.querySelectorAll(".react-pdf__Page canvas"); // Select all canvases rendered in the viewer
  
    if (canvases.length === 0) {
      alert("Error: No document available to download.");
      return;
    }
  
    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  
      canvases.forEach((canvas, index) => {
        const imgData = canvas.toDataURL("image/png"); // Convert each page (canvas) into an image
  
        if (index !== 0) {
          pdf.addPage(); // Add new page after the first one
        }
  
        pdf.addImage(imgData, "PNG", 10, 10, 190, 0); // Add image of each page
      });
  
      // Save the final stamped PDF with or without documentId
      pdf.save(`stamped_document_${documentId}_${new Date().toISOString()}.pdf`);
    } catch (error) {
      console.error("Failed to download stamped document:", error);
      alert("Failed to download the stamped document. Please try again.");
    }
  };

  return (
    <div className="document-canvas">
      <Document
        file={documentUrl} // Ensure this URL is accessible
        onLoadSuccess={handleLoadSuccess}
        error="Failed to load PDF."
        >
        <Page
          canvasRef={canvasRef}
          pageNumber={currentPage}
          scale={scale * 1.5} // Increase the scale factor for higher resolution
          rotate={rotation}
          // height={canvasRef.current ? canvasRef.current.height * 0.5 : undefined}
          // width={canvasRef.current ? canvasRef.current.width * 0.8 : undefined}
          renderTextLayer={false} // Disable text layer for performance
          renderAnnotationLayer={false} // Disable annotation layer for performance
          onRenderSuccess={handleRenderSuccess}
        />
      </Document>

      <div className="navigation-controls">
        <button onClick={handleGoToFirstPage}>First</button>
        <button onClick={handlePreviousPage} disabled={currentPage <= 1}>
          Previous
        </button>
        <button onClick={handleNextPage} disabled={currentPage >= numPages}>
          Next
        </button>
        <button onClick={handleGoToLastPage}>Last</button>
        <button onClick={handleJumpToPage}>Jump to Page</button>
        <button onClick={() => setCurrentPage((current) => (current % 2 === 0 ? current : current + 1))}>
          Go to Even Page
        </button>
        <button onClick={() => setCurrentPage((current) => (current % 2 !== 0 ? current : current + 1))}>
          Go to Odd Page
        </button>
        <button onClick={() => setCurrentPage(Math.ceil(numPages / 2))}>Go to Middle Page</button>
      </div>


      <div className="interaction-controls">
    <button onClick={() => setScale((prev) => prev + 0.1)}>Zoom In</button>
    <button onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}>
      Zoom Out
    </button>
    <button onClick={handleRotateClockwise}>Rotate Clockwise</button>
    <button onClick={handleRotateCounterclockwise}>Rotate Counterclockwise</button>
    <button onClick={handleResetZoomAndRotation}>Reset Zoom & Rotation</button>
    <button onClick={handleDownloadPDF}>Download PDF</button>
    <button onClick={handleFullScreen}>Full Screen</button>
    <button onClick={handleBookmarkPage}>Bookmark Page</button>
    <button onClick={() => setScale(1)}>Fit to Width</button>
    <button onClick={() => setScale(1.5)}>Fit to Height</button>
    <button
      onClick={() => {
        const documentCanvas = document.querySelector(".document-canvas");
        if (documentCanvas) {
          documentCanvas.classList.toggle("mirror-mode");
        }
      }}>
      Mirror Document
    </button>

    <button
      onClick={() =>
        document.body.style.filter === "invert(1)"
          ? (document.body.style.filter = "invert(0)")
          : (document.body.style.filter = "invert(1)")
      }
    >
      Invert Colors
    </button>
    <button
      onClick={() => {
        document.body.style.backgroundColor =
          document.body.style.backgroundColor === "black" ? "white" : "black";
        document.body.style.color =
          document.body.style.color === "white" ? "black" : "white";
      }}
    >
      Night Mode
    </button>
    <button
      onClick={() => {
        setScale(1);
        setRotation(0);
        document.body.style.filter = "invert(0)";
        document.body.style.backgroundColor = "white";
        document.body.style.color = "black";
      }}
    >
      Reset All Settings
    </button>
  </div>


      <div className="bookmarks">
        <h4>Bookmarks:</h4>
        {bookmarks.length > 0 ? (
          <ul>
            {bookmarks.map((page) => (
              <li key={page}>
                Page {page}{" "}
                <button onClick={() => setCurrentPage(page)}>Go</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No bookmarks yet.</p>
        )}
      </div>
      

      <div className="actions">
      <button onClick={() => setShowStamps(!showStamps)}>Apply Stamps</button>

      <button onClick={handleSaveStampedDocument}>Save Stamped Document</button>
      <button onClick={handleDownloadStampedDocument}>Download Current Page</button>

      

      </div>
      {showStamps && (
        <div className="stamps-preview">
          <h3>Saved Stamps</h3>
          {stamps.length > 0 ? (
            <div className="stamps-container">
              {stamps.map((stamp) => (
                <div
                  key={stamp.id || Date.now()} // Ensure a unique key is provided
                  className="stamp-item"
                  onClick={() => handleStampClick(stamp)} // Use handleStampClick to place the stamp
                  style={{ cursor: "pointer" }}
                >
                  {stamp.preview ? (
                    <img
                      src={stamp.preview}
                      alt={stamp.name || "Stamp"}
                      title={stamp.name || "Stamp"}
                      className="stamp-image"
                    />
                  ) : (
                    <p>Invalid Stamp</p>
                  )}
                  <p>{stamp.name || "Unnamed Stamp"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No stamps found.</p>
          )}
        </div>
                )}



      
       </div>
  );
};

export default DocumentCanvas;