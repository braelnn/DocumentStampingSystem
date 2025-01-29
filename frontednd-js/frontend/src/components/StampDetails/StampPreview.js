import React, { useEffect, useRef } from "react";
import { Canvas } from "fabric";
import { Image as FabricImage } from "fabric";
import "./StampPreview.css";

const StampPreview = ({ stampData }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  useEffect(() => {
    // Dispose existing canvas before creating a new one
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    // Initialize a new fabric canvas
    const canvas = new Canvas(canvasRef.current, { width: 300, height: 300 });
    fabricCanvasRef.current = canvas;

    // Add image to the canvas
    FabricImage.fromURL(stampData, (img) => {
      canvas.clear(); // Clear any existing objects on the canvas
      canvas.add(img);
      canvas.renderAll(); // Ensure the canvas is rendered after adding the image
    });

    // Cleanup function to dispose of the canvas when the component unmounts
    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [stampData]);

  return (
    <div className="stamp-preview">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default StampPreview;
