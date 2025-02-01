import { Canvas } from "fabric";

const canvasInstances = new Map();

export const initializeCanvas = (canvasElement, options = {}) => {
  if (!canvasElement) {
    throw new Error("Canvas element is required to initialize fabric.Canvas.");
  }

  // Dispose of any existing canvas tied to the element
  if (canvasInstances.has(canvasElement)) {
    const existingCanvas = canvasInstances.get(canvasElement);
    existingCanvas.dispose();
    canvasInstances.delete(canvasElement);
  }

  // Create a new fabric canvas and store it in the map
  const newCanvas = new Canvas(canvasElement, options);
  canvasInstances.set(canvasElement, newCanvas);
  return newCanvas;
};

export const disposeCanvas = (canvasElement) => {
  if (canvasInstances.has(canvasElement)) {
    const existingCanvas = canvasInstances.get(canvasElement);
    existingCanvas.dispose();
    canvasInstances.delete(canvasElement);
  }
};

export const disposeAllCanvases = () => {
  canvasInstances.forEach((canvas) => canvas.dispose());
  canvasInstances.clear();
};
