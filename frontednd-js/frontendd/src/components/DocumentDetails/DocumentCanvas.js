import React, { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from  "react-pdf"; 
import "./DocumentCanvas.css";
import { getStamps } from "../../services/stampsService";
import { saveStampedDocument } from "../../services/documentsService";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import { Link } from "react-router-dom";

import QRCodeGenerator from "./QRCodeGenerator"; // Import QRCodeGenerator


pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs';

const DocumentCanvas = ({ documentUrl, onApplyStamp, documentId, onSaveSuccess, onQRGenerated  }) => {
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
  const [activeStamp, setActiveStamp] = useState(null); 
  const [placedQRCode, setPlacedQRCode] = useState(null); // Store QR code data
  const [isDraggingQRCode, setIsDraggingQRCode] = useState(false);
  const [isDraggingStamp, setIsDraggingStamp] = useState(false);



  const activeStampRef = useRef(null);
  const pdfWrapperRef = useRef(null);

  const handleQRGenerated = (qrCodeUrl) => {
    if (!pdfWrapperRef.current) return; // Ensure the reference to the PDF wrapper is available

    const rect = pdfWrapperRef.current.getBoundingClientRect();

    setPlacedQRCode({
        imgSrc: qrCodeUrl,
        x: rect.width - 130, // Position 10px away from the right edge (120px width + 10px margin)
        y: 60, // Position 10px away from the top edge
        width: 120, // Default width
        height: 120, // Default height
    });
};


const handleMouseMove = (e) => {
    if (!pdfWrapperRef.current) return;

    const rect = pdfWrapperRef.current.getBoundingClientRect();
    const pageWidth = rect.width * scale;
    const pageHeight = rect.height * scale;

    if (isDraggingQRCode && placedQRCode) {
        // Update the position of the QR Code
        const x = Math.max(0, Math.min(pageWidth - placedQRCode.width, e.clientX - rect.left - placedQRCode.width / 2));
        const y = Math.max(0, Math.min(pageHeight - placedQRCode.height, e.clientY - rect.top - placedQRCode.height / 2));

        setPlacedQRCode((prev) => ({
            ...prev,
            x,
            y,
        }));
    } else if (isDraggingStamp && activeStamp) {
        // Update the position of the active stamp
        const x = Math.max(0, Math.min(pageWidth - activeStamp.width, e.clientX - rect.left - activeStamp.width / 2));
        const y = Math.max(0, Math.min(pageHeight - activeStamp.height, e.clientY - rect.top - activeStamp.height / 2));

        setPlacedStamps((prevStamps) =>
            prevStamps.map((stamp) =>
                stamp.id === activeStamp.id
                    ? { ...stamp, x, y }
                    : stamp
            )
        );
    }
};

const handleMouseUp = () => {
    setIsDraggingQRCode(false);
    setIsDraggingStamp(false);
    setActiveStamp(null);
};


const handleApplyQRCodeToPDF = async () => {
    if (!placedQRCode) {
        console.error("No QR Code to apply.");
        return;
    }

    console.log("Applying QR Code as SVG:", placedQRCode);

    try {
        const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const page = pdfDoc.getPages()[currentPage - 1];

        // Fetch the SVG content
        const svgResponse = await fetch(placedQRCode.imgSrc);
        const svgText = await svgResponse.text();

        // Embed the SVG directly into the PDF
        const { width, height } = page.getSize();
        const x = placedQRCode.x / scale;
        const y = height - (placedQRCode.y + placedQRCode.height) / scale;

        page.drawSvgPath(svgText, {
            x,
            y,
            scale: placedQRCode.width / scale, // Scale the SVG proportionally
        });

        const pdfBytes = await pdfDoc.save();
        const updatedPdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
        setPdfUrl(URL.createObjectURL(updatedPdfBlob));
        alert("QR Code applied to PDF successfully ");
    } catch (error) {
        console.error("Error applying QR Code to PDF:", error);
    }
};







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

  useEffect(() => {
    const handleDocumentMouseMove = (e) => handleMouseMove(e);
    const handleDocumentMouseUp = () => handleMouseUp();

    if (isDraggingStamp || isDraggingQRCode) {
        document.addEventListener("mousemove", handleDocumentMouseMove);
        document.addEventListener("mouseup", handleDocumentMouseUp);
    }

    return () => {
        document.removeEventListener("mousemove", handleDocumentMouseMove);
        document.removeEventListener("mouseup", handleDocumentMouseUp);
    };
}, [isDraggingStamp, isDraggingQRCode]);






  const handleStamp = async (stamp) => {
    try {
        // Fetch the current PDF
        const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Get the current page
        const page = pdfDoc.getPages()[currentPage - 1];

        // Fetch the stamp image and embed it into the PDF
        const imgBytes = await fetch(stamp.preview).then((res) => res.arrayBuffer());
        const pdfImage = await pdfDoc.embedPng(imgBytes);

        // Default stamp properties
        const stampProperties = {
            id: Date.now(),
            x: 50, // Default x position (adjustable)
            y: page.getHeight() - 150, // Adjust for PDF coordinate system (y-axis starts at the bottom)
            width: 100, // Default stamp width
            height: 100, // Default stamp height
            rotation: 0, // Default rotation (in degrees)
        };

        // Draw the stamp on the PDF
        page.drawImage(pdfImage, {
            x: stampProperties.x,
            y: stampProperties.y,
            width: stampProperties.width,
            height: stampProperties.height,
        });

        // Save the updated PDF
        const pdfBytes = await pdfDoc.save();

        // Convert the updated PDF to a Blob
        const updatedPdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

        // Update the PDF URL to reflect changes
        const updatedPdfUrl = URL.createObjectURL(updatedPdfBlob);
        setPdfUrl(updatedPdfUrl);

        // Add the stamp to the state for further interaction
        setPlacedStamps((prevStamps) => [
            ...prevStamps,
            { ...stampProperties, imgSrc: stamp.preview },
        ]);
    } catch (error) {
        console.error("Error placing stamp on PDF:", error);
    }
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
        const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Get the current page
        const page = pdfDoc.getPages()[currentPage - 1];

        // Fetch the image and embed it into the PDF
        const imgBytes = await fetch(stamp.preview).then((res) => res.arrayBuffer());
        const pdfImage = await pdfDoc.embedPng(imgBytes);

        // Add the image to the page at the desired position
        page.drawImage(pdfImage, {
            x: 45, // Example x-coordinate
            y: page.getHeight() - 150, // Example y-coordinate (adjusted to match PDF coordinate system)
            width: 120, // Width of the stamp
            height: 120, // Height of the stamp
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


  return (
    <div 
    className="document-canvas"
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    ref={pdfWrapperRef} style={{ position: "relative" }}    
    >
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
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onRenderSuccess={handleRenderSuccess}
            width={Math.min(window.innerWidth * 0.8, 800)}
            />
    </Document>
    {/* QR Code and Stamps */}
    {placedQRCode && (
        <div
            style={{
                position: "absolute",
                top: `${placedQRCode.y}px`,
                left: `${placedQRCode.x}px`,
                width: `${placedQRCode.width}px`,
                height: `${placedQRCode.height}px`,
                cursor: isDraggingQRCode ? "grabbing" : "grab",
                zIndex: 1000,
            }}
            onMouseDown={() => setIsDraggingQRCode(true)}
        >
            <img
                src={placedQRCode.imgSrc}
                alt="QR Code"
                style={{ width: "100%", height: "100%" }}
            />
        </div>
    )}



            <QRCodeGenerator onQRGenerated={handleQRGenerated} />    
    

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

    <div className="placed-stamps">
    {placedStamps.map((stamp) => (
        <div
            key={stamp.id}
            className="stamp-wrapper"
            style={{
                position: "absolute",
                top: `${stamp.y}px`,
                left: `${stamp.x}px`,
                width: `${stamp.width}px`,
                height: `${stamp.height}px`,
                transform: `rotate(${stamp.rotation || 0}deg)`,
                cursor: isDraggingStamp && activeStamp && activeStamp.id === stamp.id ? "grabbing" : "grab",
            }}
            onMouseDown={(e) => {
                e.stopPropagation();
                setIsDraggingStamp(true); // Enable dragging for the stamp
                setActiveStamp(stamp); // Set the active stamp
            }}
        >
            <img
                src={stamp.imgSrc}
                alt="Stamp"
                style={{ width: "100%", height: "100%", pointerEvents: "none" }}
            />
        </div>
    ))}
</div>



    <div className="actions">
    <button onClick={() => setShowStamps(!showStamps)}>
        {showStamps ? "Hide Stamps" : "Apply Stamps"}
    </button>
    <button onClick={handleApplyQRCodeToPDF}>Apply QR Code </button>
    <button>
        <Link to="/qrcode" style={{ textDecoration: "none", color: "inherit" }}>
            View QR Code
        </Link>
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