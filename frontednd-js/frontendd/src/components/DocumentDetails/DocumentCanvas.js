import React, { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from  "react-pdf"; 
import "./DocumentCanvas.css";
import { getStamps } from "../../services/stampsService";
import { saveStampedDocument } from "../../services/documentsService";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";




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
  const [pdfUrl, setPdfUrl] = useState(documentUrl); // Updated state name


  const activeStampRef = useRef(null);




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

  useEffect(() => {
    if (onApplyStamp && typeof onApplyStamp === "function") {
        onApplyStamp(handleStamp);
    }
  }, [onApplyStamp]);

  const handleLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

const handleRenderSuccess = () => {
    drawStamps();
  };





  const handleStamp = (stamp) => {
    const newStamp = {
        id: Date.now(),
        x: 50, // Default x position (adjustable)
        y: 50, // Default y position (adjustable)
        width: 100, // Stamp width
        height: 100, // Stamp height
        imgSrc: stamp.preview, // Store the image source
    };

    setPlacedStamps((prevStamps) => [...prevStamps, newStamp]);
};

  const handleApplyCanvas = () => {
    setShowStamps(true);
  };


  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
};

const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
};

const handleGoToFirstPage = () => {
    setCurrentPage(1);
};

const handleGoToLastPage = () => {
    setCurrentPage(numPages);
};

const handleJumpToPage = () => {
    const page = parseInt(prompt("Enter page number:"), 10);
    if (!isNaN(page) && page >= 1 && page <= numPages) {
        setCurrentPage(page);
    } else {
        alert("Invalid page number. Please enter a number between 1 and " + numPages);
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
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const handleFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen(); // Firefox
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(); // Chrome, Safari
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen(); // IE/Edge
    }
};

const handleResetZoomAndRotation = () => {
    setScale(1);
    setRotation(0);
};

const handleBookmarkPage = () => {
    setBookmarks((prev) => {
        if (!prev.includes(currentPage)) {
            return [...prev, currentPage];
        }
        return prev;
    });
    alert(`Page ${currentPage} bookmarked.`);
};

 

  useEffect(() => {
    if (onApplyStamp) {
      onApplyStamp(handleStamp);
    }
  }, [onApplyStamp]);

  const handleStampClick = async (stamp) => {
    if (!stamp || !stamp.preview) {
        console.error("Invalid stamp selected:", stamp);
        return;
    }

    try {
        // Fetch and load the current PDF
        const existingPdfBytes = await fetch(documentUrl).then((res) => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Get the current page
        const page = pdfDoc.getPages()[currentPage - 1];

        // Fetch the image and embed it into the PDF
        const imgBytes = await fetch(stamp.preview).then((res) => res.arrayBuffer());
        const pdfImage = await pdfDoc.embedPng(imgBytes);

        // Add the image to the page at the desired position
        page.drawImage(pdfImage, {
            x: 50, // Example x-coordinate
            y: page.getHeight() - 150, // Example y-coordinate (adjusted to match PDF coordinate system)
            width: 100, // Width of the stamp
            height: 100, // Height of the stamp
        });

        // Save the updated PDF
        const pdfBytes = await pdfDoc.save();

        // Convert the updated PDF into a Blob for rendering
        const updatedPdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

        // Update the document URL with the updated PDF
        const updatedPdfUrl = URL.createObjectURL(updatedPdfBlob);
        setPdfUrl(updatedPdfUrl); // Replace the current PDF with the updated one
    } catch (error) {
        console.error("Error embedding stamp into PDF:", error);
    }
};


  

  
  
const drawStamps = () => {
  if (!placedStamps.length) return;

  setPlacedStamps((prevStamps) =>
      prevStamps.map((stamp) => ({
          ...stamp,
          isRendered: true, // Mark that the stamp is displayed in the UI
      }))
  );
};


useEffect(() => {
  if (!placedStamps.length) return;

  const handleMouseMove = (e) => {
      setPlacedStamps((prevStamps) =>
          prevStamps.map((stamp) =>
              stamp.id === activeStampRef.current?.id
                  ? { ...stamp, x: e.clientX - 50, y: e.clientY - 50 }
                  : stamp
          )
      );
  };

  const handleMouseUp = () => {
      activeStampRef.current = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = (e) => {
      const clickedStamp = placedStamps.find(
          (stamp) => 
              e.clientX >= stamp.x &&
              e.clientX <= stamp.x + stamp.width &&
              e.clientY >= stamp.y &&
              e.clientY <= stamp.y + stamp.height
      );

      if (clickedStamp) {
          activeStampRef.current = clickedStamp;
          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
      }
  };

  document.addEventListener("mousedown", handleMouseDown);

  return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
  };
}, [placedStamps]);


const handleSaveStampedDocument = async () => {
  try {
      // Load the original PDF
      const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const page = pdfDoc.getPages()[currentPage - 1];

      // Embed and draw each stamp in the PDF
      for (let stamp of placedStamps) {
          const imgBytes = await fetch(stamp.imgSrc).then((res) => res.arrayBuffer());
          const pdfImage = await pdfDoc.embedPng(imgBytes);

          page.drawImage(pdfImage, {
              x: stamp.x,
              y: page.getHeight() - stamp.y - stamp.height,
              width: stamp.width,
              height: stamp.height,
          });
      }

      // Save the updated PDF
      const pdfBytes = await pdfDoc.save();
      const stampedFile = new File([pdfBytes], "stamped-document.pdf", { type: "application/pdf" });

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
  try {
      // Fetch the original PDF as an ArrayBuffer
      const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());

      // Load the PDF into pdf-lib
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const page = pdfDoc.getPages()[currentPage - 1];

      // Embed and place each stamp in the correct position
      for (let stamp of placedStamps) {
          const imgBytes = await fetch(stamp.imgSrc).then((res) => res.arrayBuffer());
          const pdfImage = await pdfDoc.embedPng(imgBytes);

          page.drawImage(pdfImage, {
              x: stamp.x,
              y: page.getHeight() - stamp.y - stamp.height, // Adjust to match PDF coordinate system
              width: stamp.width,
              height: stamp.height,
          });
      }

      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();

      // Use file-saver to trigger the download
      saveAs(new Blob([pdfBytes], { type: "application/pdf" }), `stamped_document_${documentId}.pdf`);

  } catch (error) {
      console.error("Failed to download stamped document:", error);
      alert("Failed to download the stamped document. Please try again.");
  }
};
;

  


  return (
    <div className="document-canvas">
    <Document
            file={pdfUrl}
            onLoadSuccess={handleLoadSuccess}
            error="Failed to load PDF."
            loading="Loading document..."
        >
            <Page
                pageNumber={currentPage}
                scale={scale}
                rotate={rotation}
                renderTextLayer={false} // Disable text layer for performance
                renderAnnotationLayer={false} // Disable annotation layer for performance
                onRenderSuccess={handleRenderSuccess}
                width={Math.min(window.innerWidth * 0.8, 800)} // Fit within 80% of the window width, capped at 800px
            />
    </Document>

    

    {/* Navigation Controls */}
    <div className="navigation-controls">
        <button onClick={handleGoToFirstPage} disabled={currentPage === 1}>First</button>
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
        <button onClick={handleNextPage} disabled={currentPage === numPages}>Next</button>
        <button onClick={handleGoToLastPage} disabled={currentPage === numPages}>Last</button>
        <button onClick={handleJumpToPage}>Jump to Page</button>
        <button onClick={() => setCurrentPage((current) => (current % 2 === 0 ? current : current + 1))}>
            Go to Even Page
        </button>
        <button onClick={() => setCurrentPage((current) => (current % 2 !== 0 ? current : current + 1))}>
            Go to Odd Page
        </button>
        <button onClick={() => setCurrentPage(Math.ceil(numPages / 2))}>Go to Middle Page</button>
    </div>

    {/* Interaction Controls */}
    <div className="interaction-controls">
        <button onClick={() => setScale((prev) => Math.min(prev + 0.1, 3))}>Zoom In</button>
        <button onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}>Zoom Out</button>
        <button onClick={handleRotateClockwise}>Rotate Clockwise</button>
        <button onClick={handleRotateCounterclockwise}>Rotate Counterclockwise</button>
        <button onClick={handleResetZoomAndRotation}>Reset Zoom & Rotation</button>
        <button onClick={handleDownloadPDF}>Download PDF</button>
        <button onClick={handleFullScreen}>Full Screen</button>
        <button onClick={handleBookmarkPage}>Bookmark Page</button>
        <button onClick={() => setScale(1)}>Fit to Width</button>
        <button onClick={() => setScale(1.5)}>Fit to Height</button>
        
        {/* Mirror Document */}
        <button onClick={() => document.querySelector(".document-canvas")?.classList.toggle("mirror-mode")}>
            Mirror Document
        </button>

        {/* Invert Colors */}
        <button onClick={() => {
            document.body.style.filter = document.body.style.filter === "invert(1)" ? "invert(0)" : "invert(1)";
        }}>
            Invert Colors
        </button>

        {/* Night Mode Toggle */}
        <button onClick={() => {
            const isDarkMode = document.body.style.backgroundColor === "black";
            document.body.style.backgroundColor = isDarkMode ? "white" : "black";
            document.body.style.color = isDarkMode ? "black" : "white";
        }}>
            Night Mode
        </button>

        {/* Reset All Settings */}
        <button onClick={() => {
            setScale(1);
            setRotation(0);
            document.body.style.filter = "invert(0)";
            document.body.style.backgroundColor = "white";
            document.body.style.color = "black";
        }}>
            Reset All Settings
        </button>
    </div>




    <div className="bookmarks">
      <h4>Bookmarks</h4>
      {bookmarks.length > 0 ? (
          <ul>
              {bookmarks.map((page, index) => (
                  <li key={index}>
                      <span>Page {page}</span>
                      <button onClick={() => setCurrentPage(page)}>Go</button>
                      <button onClick={() => setBookmarks((prev) => prev.filter((p) => p !== page))}>
                          ❌ Remove
                      </button>
                  </li>
              ))}
          </ul>
      ) : (
          <p>No bookmarks yet.</p>
      )}
    </div>

    <div className="actions">
    <button onClick={() => setShowStamps(!showStamps)}>
        {showStamps ? "Hide Stamps" : "Apply Stamps"}
    </button>
    <button onClick={handleSaveStampedDocument}>Save Stamped Document</button>
    <button onClick={handleDownloadStampedDocument}>Download Stamped Document</button>
</div>

{/* Stamps Preview Section */}
{showStamps && (
    <div className="stamps-preview">
        <h3>Saved Stamps</h3>
        {stamps.length > 0 ? (
            <div className="stamps-container">
                {stamps.map((stamp, index) => (
                    <div
                        key={stamp.id || index} // Prevent potential duplicate keys
                        className="stamp-item"
                        onClick={() => handleStampClick(stamp)}
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