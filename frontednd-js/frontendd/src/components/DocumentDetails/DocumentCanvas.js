import React, { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from  "react-pdf"; 
import "./DocumentCanvas.css";
import { getStamps } from "../../services/stampsService";
import { saveStampedDocument } from "../../services/documentsService";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import { Link } from "react-router-dom";
import QRCodeGenerator from "./QRCodeGenerator"; // Import QRCodeGenerator
import SerialNumber from "./SerialNumber"; // Import SerialNumber component



pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs';

const DocumentCanvas = ({ documentUrl, onApplyStamp, documentId, onSaveSuccess}) => {
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
  const [isQrCodeEmbedded, setIsQrCodeEmbedded] = useState(false);
  const [generatedQRCode, setGeneratedQRCode] = useState(null); // Store QR before applying
  const [savedDocumentIds, setSavedDocumentIds] = useState(new Set()); 
  const [serialNumber, setSerialNumber] = useState(""); // Store the serial number
  const [isSerialVisible, setIsSerialVisible] = useState(true); // Visibility toggle
  const [serialPosition, setSerialPosition] = useState({ x: 50, y: 50 }); // Drag position
  const [isDraggingSerial, setIsDraggingSerial] = useState(false); // Dragging state


  const activeStampRef = useRef(null);
  const pdfWrapperRef = useRef(null);

  const handleSerialGenerated = (serial) => {
    setSerialNumber(serial);
  };
  const handleMouseDown = () => {
    setIsDraggingSerial(true);
  };

  const handleRemoveQRCode = () => {
    setPlacedQRCode(null);
    alert("QR Code removed from the document.");
};
  

  const handleQRGenerated = (qrCodeUrl) => {
    setGeneratedQRCode(qrCodeUrl); // Store the generated QR, but do not display it yet
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
    } else if (isDraggingSerial) {
        // Update the position of the serial number
        const x = Math.max(0, Math.min(pageWidth, e.clientX - rect.left));
        const y = Math.max(0, Math.min(pageHeight, e.clientY - rect.top));

        setSerialPosition({ x, y });
    }
};

const handleMouseUp = () => {
    setIsDraggingQRCode(false);
    setIsDraggingStamp(false);
    setActiveStamp(null);
    setIsDraggingSerial(false);
};


const handleApplyQRCodeToPDF = async () => {
    if (!generatedQRCode) {
        alert("Generate a QR Code first.");
        return;
    }

    if (!pdfWrapperRef.current) return; // Ensure PDF wrapper reference is available

    const rect = pdfWrapperRef.current.getBoundingClientRect();

    setPlacedQRCode({
        imgSrc: generatedQRCode, // Use the stored QR code
        x: rect.width - 130, 
        y: 60, 
        width: 180, 
        height: 180,
    });

    setIsQrCodeEmbedded(true);
    alert("QR Code applied to PDF.");
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
}, [isDraggingStamp, isDraggingQRCode, isDraggingSerial]);






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
            y: page.getHeight() - 90, // Adjust for PDF coordinate system (y-axis starts at the bottom)
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
        // Prevent duplicate saves
        if (savedDocumentIds.has(documentId)) {
            alert("This document has already been saved. You cannot save it again.");
            return;
        }

        // Load the original PDF
        const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const page = pdfDoc.getPages()[currentPage - 1];

        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();

        // Embed and draw each stamp in the PDF
        for (let stamp of placedStamps) {
            const imgBytes = await fetch(stamp.imgSrc).then((res) => res.arrayBuffer());
            const pdfImage = await pdfDoc.embedPng(imgBytes);

            page.drawImage(pdfImage, {
                x: Math.min(stamp.x, pageWidth - stamp.width),
                y: Math.min(pageHeight - stamp.y - stamp.height, pageHeight - stamp.height),
                width: stamp.width,
                height: stamp.height,
            });
        }

        //  Embed the QR Code (if it exists)
        if (placedQRCode) {
            try {
                const qrBlob = await convertSvgToPng(placedQRCode.imgSrc);
                const qrBytes = await qrBlob.arrayBuffer();
                const qrImage = await pdfDoc.embedPng(qrBytes);

                let qrX = Math.min(placedQRCode.x, pageWidth - placedQRCode.width);
                let qrY = Math.min(placedQRCode.y, pageHeight - placedQRCode.height);

                page.drawImage(qrImage, {
                    x: qrX,
                    y: Math.min(pageHeight - qrY - placedQRCode.height, pageHeight - placedQRCode.height),
                    width: placedQRCode.width,
                    height: placedQRCode.height,
                });

                console.log("QR Code successfully embedded in the saved document.");
            } catch (error) {
                console.error("Error converting or embedding QR Code:", error);
                alert("Failed to embed QR Code. Please try again.");
                return;
            }
        } else {
            console.warn("No QR Code found. The document will be saved without a QR Code.");
        }

        // Embed the serial number (if visible)
        if (isSerialVisible && serialNumber) {
            page.drawText(serialNumber, {
                x: Math.max(5, Math.min(serialPosition.x, pageWidth - 50)), // Ensure the serial fits within the page bounds
                y: Math.max(pageHeight - serialPosition.y - 20, 20), // Adjust position relative to the page height
                size: 10,
            });
        
            console.log("Serial number successfully embedded in the saved document.");
        }
        

        // Save the updated PDF
        const pdfBytes = await pdfDoc.save();
        const stampedFile = new File([pdfBytes], "stamped-document.pdf", { type: "application/pdf" });

        // Save the stamped document to the database
        await saveStampedDocument(documentId, stampedFile);

        // Mark this document as saved
        setSavedDocumentIds((prevIds) => new Set(prevIds).add(documentId));

        alert("Stamped document saved successfully.");

        // Notify parent to fetch the updated stamped documents
        if (onSaveSuccess) onSaveSuccess(documentId);
    } catch (error) {
        console.error("Failed to save stamped document:", error);
        alert("Failed to save the stamped document. Please try again.");
    }
};

const convertSvgToPng = async (svgUrl) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Prevent CORS issues
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Failed to convert SVG to PNG."));
                }
            }, "image/png");
        };
        img.onerror = reject;
        img.src = svgUrl;
    });
};

const handleDownloadStampedDocument = async (documentId = "document") => {
    try {
        const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const page = pdfDoc.getPages()[currentPage - 1];

        const pageWidth = page.getWidth(); // Get the actual PDF width
        const pageHeight = page.getHeight(); // Get the actual PDF height

        // Embed and place each stamp
        for (let stamp of placedStamps) {
            const imgBytes = await fetch(stamp.imgSrc).then((res) => res.arrayBuffer());
            const pdfImage = await pdfDoc.embedPng(imgBytes);

            page.drawImage(pdfImage, {
                x: Math.min(stamp.x, pageWidth - stamp.width), // Ensure it stays within bounds
                y: pageHeight - stamp.y - stamp.height,
                width: stamp.width,
                height: stamp.height,
            });
        }

        // Ensure the QR code is converted and embedded properly
        if (placedQRCode) {
            try {
                // Convert SVG to PNG
                const qrBlob = await convertSvgToPng(placedQRCode.imgSrc);
                const qrBytes = await qrBlob.arrayBuffer();
                const qrImage = await pdfDoc.embedPng(qrBytes); // Embed PNG instead of SVG

                // Ensure the QR Code is within PDF bounds
                let qrX = Math.max(0, Math.min(placedQRCode.x, pageWidth - placedQRCode.width));
                let qrY = Math.max(0, Math.min(placedQRCode.y, pageHeight - placedQRCode.height));

                // Draw the QR code in the PDF
                page.drawImage(qrImage, {
                    x: qrX,
                    y: pageHeight - qrY - placedQRCode.height, // Adjust for PDF coordinate system
                    width: placedQRCode.width,
                    height: placedQRCode.height,
                });

                console.log("QR Code successfully converted and embedded into the PDF.");
            } catch (error) {
                console.error("Error converting or embedding QR Code:", error);
                alert("Failed to embed QR Code. Please try again.");
                return;
            }
        } else {
            alert("QR Code is not placed on the document. Please apply the QR Code before downloading.");
            return;
        }

        // Embed the serial number (if visible)
        if (isSerialVisible && serialNumber) {
            page.drawText(serialNumber, {
                x: Math.max(5, Math.min(serialPosition.x, pageWidth - 50)), // Ensure the serial fits within the page bounds
                y: Math.max(pageHeight - serialPosition.y - 20, 20), // Adjust position relative to the page height
                size: 10,
            });

            console.log("Serial number successfully embedded in the document.");
        }

        // Save and download the updated PDF
        const pdfBytes = await pdfDoc.save();
        saveAs(new Blob([pdfBytes], { type: "application/pdf" }), `stamped_document_${documentId}.pdf`);

        alert("Download started: The stamped document with the QR Code and Serial Number is ready.");
    } catch (error) {
        console.error("Failed to download stamped document:", error);
        alert(error.message || "Failed to download the stamped document. Please try again.");
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

    {/* Serial Number Display */}
    {isSerialVisible && serialNumber && (
        <div
          className="serial-number"
          style={{
            position: "absolute",
            top: `${serialPosition.y}px`,
            left: `${serialPosition.x}px`,
            backgroundColor: "white",
            padding: "5px",
            border: "1px solid black",
            cursor: isDraggingSerial ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
        >
          {serialNumber}
        </div>
      )}

      {/* SerialNumber Component */}
      <SerialNumber documentId={documentId} onSerialGenerated={handleSerialGenerated} />


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
    <button onClick={handleRemoveQRCode} disabled={!placedQRCode}>
                Remove QR Code
            </button>
    <button>
        <Link to="/qrcode" style={{ textDecoration: "none", color: "inherit" }}>
            View QR Code
        </Link>
    </button>
    <button onClick={handleSaveStampedDocument}>Save Final Document</button>
    <button onClick={handleDownloadStampedDocument}>Download Final Document</button>
    
    
    </div>

    <div className="toggle-visibility">
        <label>
          <input
            type="checkbox"
            checked={isSerialVisible}
            onChange={(e) => setIsSerialVisible(e.target.checked)}
          />
          {isSerialVisible ? "Hide Serial Number" : "Show Serial Number"}
        </label>
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