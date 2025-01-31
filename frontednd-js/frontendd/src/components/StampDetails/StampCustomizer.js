import React, { useEffect, useRef, useState } from "react";
import { SketchPicker } from "react-color";
import * as THREE from "three";


import './StampCustomizer.css'
import {
  Canvas,
  PencilBrush,
  Circle,
  Rect,
  Triangle,
  Ellipse,
  Line,
  Polygon,
  Path,
  Text,
  Image as FabricImage,
  } from "fabric";
import "./StampCustomizer.css";

const shapes = [
  "Circle",
  "Rectangle",
  "Triangle",
  "Ellipse",
  "Line",
  "Pentagon",
  "Hexagon",
  "Star",
  "Arrow",
  "Heart",
];

const StampCustomizer = ({ onSave }) => {
  const [selectedShape, setSelectedShape] = useState("Circle");
  const [text, setText] = useState("");
  const [textRotation, setTextRotation] = useState(0);
  const [color, setColor] = useState("#000000");
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);


  useEffect(() => {
    if (!fabricCanvasRef.current) {
      // Initialize the fabric canvas
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: 300,
        height: 300,
        backgroundColor: "#ffffff",
      });
      fabricCanvasRef.current = fabricCanvas;
    }

    return () => {
      // Cleanup the fabric canvas on component unmount
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Create a THREE.js scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      300 / 300, // Aspect ratio for the renderer
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(300, 300);
    renderer.setClearColor(0x000000, 0); // Transparent background
    canvasRef.current.appendChild(renderer.domElement);
    
    // Set the renderer's size and append its canvas to the DOM
    renderer.setSize(300, 300);
    canvasRef.current.appendChild(renderer.domElement);

    // Set up the camera position
    camera.position.z = 5;

    // Store the THREE.js scene, renderer, and camera in the ref
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.scene = scene;
      fabricCanvasRef.current.renderer = renderer;
      fabricCanvasRef.current.camera = camera;
    }

    // Animation loop for rendering the THREE.js scene
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
  }, []);

  const addShape = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;

    let shape;
    switch (selectedShape) {
      case "Circle":
        shape = new Circle({
          radius: 50,
          fill: color,
          left: 100,
          top: 100,
        });
        break;
      case "Rectangle":
        shape = new Rect({
          width: 100,
          height: 50,
          fill: color,
          left: 100,
          top: 100,
        });
        break;
      case "Triangle":
        shape = new Triangle({
          width: 100,
          height: 100,
          fill: color,
          left: 100,
          top: 100,
        });
        break;
      case "Ellipse":
        shape = new Ellipse({
          rx: 50,
          ry: 30,
          fill: color,
          left: 100,
          top: 100,
        });
        break;
      case "Line":
        shape = new Line([50, 100, 200, 100], {
          stroke: color,
          strokeWidth: 5,
        });
        break;
      case "Pentagon":
        shape = new Polygon(
          [
            { x: 0, y: -50 },
            { x: 47.55, y: -15.45 },
            { x: 29.39, y: 40.45 },
            { x: -29.39, y: 40.45 },
            { x: -47.55, y: -15.45 },
          ],
          { fill: color, left: 100, top: 100 }
        );
        break;
      case "Hexagon":
        shape = new Polygon(
          [
            { x: 0, y: -50 },
            { x: 43.3, y: -25 },
            { x: 43.3, y: 25 },
            { x: 0, y: 50 },
            { x: -43.3, y: 25 },
            { x: -43.3, y: -25 },
          ],
          { fill: color, left: 100, top: 100 }
        );
        break;
      case "Star":
        shape = new Polygon(
          [
            { x: 0, y: -50 },
            { x: 14.43, y: -15.45 },
            { x: 47.55, y: -15.45 },
            { x: 18.54, y: 6.63 },
            { x: 29.39, y: 40.45 },
            { x: 0, y: 25 },
            { x: -29.39, y: 40.45 },
            { x: -18.54, y: 6.63 },
            { x: -47.55, y: -15.45 },
            { x: -14.43, y: -15.45 },
          ],
          { fill: color, left: 100, top: 100 }
        );
        break;
      case "Arrow":
        shape = new Polygon(
          [
            { x: 0, y: -50 },
            { x: 20, y: -20 },
            { x: 10, y: -20 },
            { x: 10, y: 50 },
            { x: -10, y: 50 },
            { x: -10, y: -20 },
            { x: -20, y: -20 },
          ],
          { fill: color, left: 100, top: 100 }
        );
        break;
      case "Heart":
        shape = new Path(
          "M 0 -50 C -25 -75, -75 -50, -50 -25 C -25 0, 25 0, 50 -25 C 75 -50, 25 -75, 0 -50 Z",
          { fill: color, left: 100, top: 100 }
        );
        break;
      default:
        return;
    }
    canvas.add(shape);
  };

  const toggleDrawingMode = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const newDrawingMode = !isDrawingMode;
  
    setIsDrawingMode(newDrawingMode);
    canvas.isDrawingMode = newDrawingMode;
  
    // Initialize freeDrawingBrush if not already done
    if (!canvas.freeDrawingBrush || !(canvas.freeDrawingBrush instanceof PencilBrush)) {
      canvas.freeDrawingBrush = new PencilBrush(canvas);
    }
  
    // Set brush properties
    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = 5; // Adjust brush width as needed
  };

  const resetCanvas = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
  
    // Clear the canvas
    canvas.clear();
  
    // Set canvas background color
    canvas.backgroundColor = "#ffffff";
    canvas.renderAll();
  
    // Reset state variables
    setSelectedShape("Circle");
    setText("");
    setTextRotation(0);
    setColor("#000000");
    setIsDrawingMode(false);
  
    // Ensure drawing mode is turned off
    canvas.isDrawingMode = false;
  };
  
  
  


  const addText = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;

    const newText = new Text(text, {
      left: 100,
      top: 100,
      angle: textRotation,
      fill: color,
    });
    canvas.add(newText);
  };

  const addLogoStamp = (event) => {
    const file = event.target.files[0];
    if (!file || !fabricCanvasRef.current || !fabricCanvasRef.current.scene) return;
  
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result;
  
      // Use THREE.TextureLoader to load the image
      const loader = new THREE.TextureLoader();
      loader.load(
        imageData,
        (texture) => {
          // Create a plane geometry and apply the texture
          const geometry = new THREE.PlaneGeometry(1, 1);
          const material = new THREE.MeshBasicMaterial({ map: texture });
          const plane = new THREE.Mesh(geometry, material);
  
          // Increase the size of the plane (logo)
          const scaleFactor = 3; // Adjust this value to control the size
          plane.scale.set(scaleFactor, scaleFactor, scaleFactor); // Scale the logo
  
          // Position the plane
          plane.position.set(0, 0, 0);
  
          // Add the plane to the scene
          fabricCanvasRef.current.scene.add(plane);
        },
        undefined,
        (error) => {
          console.error("Error loading texture:", error);
        }
      );
    };
  
    reader.readAsDataURL(file);
  };
  
  
  
  

  const saveStamp = () => {
    if (!fabricCanvasRef.current) return;
  
    const canvas = fabricCanvasRef.current;
  
    // Render the Fabric.js canvas with all elements
    canvas.renderAll();
  
    // Ensure all canvas elements, including the logo stamp, are captured
    let stampData = canvas.toDataURL({
      format: "jpg",
      quality: 1,
    });
  
    // If a THREE.js renderer exists, combine its output with the Fabric.js canvas
    if (fabricCanvasRef.current.renderer) {
      const renderer = fabricCanvasRef.current.renderer;
  
      // Create a new canvas element for merging
      const combinedCanvas = document.createElement("canvas");
      combinedCanvas.width = 300; // Ensure dimensions match
      combinedCanvas.height = 300;
  
      const context = combinedCanvas.getContext("2d");
  
      // Draw the Fabric.js canvas on the combined canvas
      const fabricImage = new Image();
      fabricImage.src = stampData;
  
      fabricImage.onload = () => {
        context.drawImage(fabricImage, 0, 0);
  
        // Capture the THREE.js scene
        const threeJsImage = new Image();
        threeJsImage.src = renderer.domElement.toDataURL("image/jpg");
  
        threeJsImage.onload = () => {
          context.drawImage(threeJsImage, 0, 0);
  
          // Generate the final merged base64 image
          const finalStampData = combinedCanvas.toDataURL("image/jpg");
  
          // Pass the final base64 image to the onSave callback
          if (finalStampData) {
            onSave(finalStampData);
          }
        };
      };
    } else {
      // If no THREE.js renderer exists, pass the Fabric.js data directly
      if (stampData) {
        onSave(stampData);
      }
    }
  };
  

  return (
    <div className="stamp-customizer">
      <canvas ref={canvasRef}></canvas>
      <div className="controls">
        
        <label>Shape:</label>
        <select
          value={selectedShape}
          onChange={(e) => setSelectedShape(e.target.value)}
        >
          {shapes.map((shape) => (
            <option key={shape} value={shape}>
              {shape}
            </option>
          ))}
        </select>
        <label>Text:</label>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text"
        />
        <label>Text Rotation:</label>
        <input
          type="number"
          value={textRotation}
          onChange={(e) => setTextRotation(Number(e.target.value))}
        />
        <label>Color:</label>
        <SketchPicker
          color={color}
          onChangeComplete={(color) => setColor(color.hex)}
        />
        <button onClick={addShape}>Add Shape</button>
        <button onClick={addText}>Add Text</button>
        <button onClick={toggleDrawingMode}>
          {isDrawingMode ? "Stop Drawing" : "Draw Stamp"}
        </button>
        <button>
  <label>
    Logo Stamp
    <input
      type="file"
      accept="image/*"
      onChange={addLogoStamp}
      style={{ display: "none" }}
    />
  </label>
</button>
        
        <button onClick={resetCanvas}>Reset</button>
        <button onClick={saveStamp}>Save Stamp</button>
      </div>
    </div>
  );
};

export default StampCustomizer;
