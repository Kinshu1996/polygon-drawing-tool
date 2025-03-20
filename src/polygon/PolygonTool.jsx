import React, { useRef, useState, useEffect } from "react";
import "./style.css";

const PolygonTool = () => {
  const canvasRef = useRef(null);
  const [polygons, setPolygons] = useState([]);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const closePolygonThreshold = 10;
  const colors = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6"];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    drawCanvas(ctx);
  }, [polygons, currentPolygon, backgroundImage]);

//   const drawCanvas = (ctx) => {
//     ctx.clearRect(0, 0, 800, 600);
//     if (backgroundImage) ctx.drawImage(backgroundImage, 0, 0);
//     drawPolygons(ctx);
//     drawCurrentPolygon(ctx);
//   };

const drawCanvas = (ctx) => {
    ctx.clearRect(0, 0, 800, 600);
    if (backgroundImage) {
      const { image } = backgroundImage;
      const canvas = ctx.canvas;
  
      // Calculate scale ratio to fit image in canvas
      const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
      const imgWidth = image.width * scale;
      const imgHeight = image.height * scale;
      const xOffset = (canvas.width - imgWidth) / 2;
      const yOffset = (canvas.height - imgHeight) / 2;
  
      ctx.drawImage(image, xOffset, yOffset, imgWidth, imgHeight);
    }
    drawPolygons(ctx);
    drawCurrentPolygon(ctx);
  };

//   const drawPolygons = (ctx) => {
//     polygons.forEach((polygon, index) => {
//       if (!polygon.points || polygon.points.length === 0) return;
//       ctx.fillStyle = colors[index % colors.length] + "33";
//       ctx.strokeStyle = colors[index % colors.length];
//       ctx.lineWidth = 2;
//       ctx.beginPath();
//       ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
//       polygon.points.forEach((point) => ctx.lineTo(point.x, point.y));
//       ctx.closePath();
//       ctx.fill();
//       ctx.stroke();
//     });
//   };

//   const drawCurrentPolygon = (ctx) => {
//     if (!isDrawing || currentPolygon.length === 0) return;
//     ctx.strokeStyle = colors[polygons.length % colors.length];
//     ctx.lineWidth = 2;
//     ctx.beginPath();
//     ctx.moveTo(currentPolygon[0].x, currentPolygon[0].y);
//     currentPolygon.forEach((point) => ctx.lineTo(point.x, point.y));
//     ctx.stroke();
//   };

  
const drawPolygons = (ctx) => {
    polygons.forEach((polygon, index) => {
      if (!polygon.points || polygon.points.length === 0) return;
      ctx.fillStyle = colors[index % colors.length] + "33";
      ctx.strokeStyle = colors[index % colors.length];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
      
      polygon.points.forEach((point, i) => {
        ctx.lineTo(point.x, point.y);
        ctx.fill();
        ctx.font = "14px Arial";
        ctx.fillText(String.fromCharCode(65 + i), point.x + 5, point.y - 5);
      });
  
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  };
  
  const drawCurrentPolygon = (ctx) => {
    if (!isDrawing || currentPolygon.length === 0) return;
    ctx.strokeStyle = colors[polygons.length % colors.length];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentPolygon[0].x, currentPolygon[0].y);
  
    currentPolygon.forEach((point, i) => {
      ctx.lineTo(point.x, point.y);
  
      // Draw point label (A, B, C...)
      ctx.fillStyle = "#000";
      ctx.font = "14px Arial";
      ctx.fillText(String.fromCharCode(65 + i), point.x + 5, point.y - 5);
    });
  
    ctx.stroke();
  };
  

const handleCanvasClick = (e) => {
    if (!backgroundImage) {
      alert("Please upload an image before drawing polygons.");
      return;
    }
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    if (!isDrawing) {
      setIsDrawing(true);
      setCurrentPolygon([{ x, y }]);
    } else {
      const firstPoint = currentPolygon[0];
      const distance = Math.hypot(x - firstPoint.x, y - firstPoint.y);
      if (distance < closePolygonThreshold && currentPolygon.length >= 3) {
        completePolygon();
      } else {
        setCurrentPolygon([...currentPolygon, { x, y }]);
      }
    }
  };

  const completePolygon = () => {
    const tagInput = prompt("Add tags for this ROI (comma separated):");
    const tagList = tagInput ? tagInput.split(",").map((t) => t.trim()) : [];
    setPolygons([...polygons, { points: [...currentPolygon], tags: tagList }]);
    setCurrentPolygon([]);
    setIsDrawing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setBackgroundImage({
            image: img,
            width: img.width,
            height: img.height,
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCanvas = () => {
    setPolygons([]);
    setCurrentPolygon([]);
    setIsDrawing(false);
  };

  return (
    <div className="polygon-tool">
      <h1>Polygon Drawing Tool</h1>
      <div className="controls">
        <input type="file" id="imageUpload" accept="image/*" onChange={handleImageUpload} />
        <button onClick={resetCanvas} className="reset-btn">Reset</button>
      </div>
      <canvas ref={canvasRef} width={800} height={600} onClick={handleCanvasClick}></canvas>
      
      <div className="polygon-coordinates">
        <h2>Polygon Coordinates</h2>
        {polygons.length === 0 ? (
          <p>Click on the canvas to start drawing polygons.</p>
        ) : (
          polygons.map((polygon, index) => (
            <div key={index} className="polygon-data">
              <h3 style={{ color: colors[index % colors.length] }}>Polygon {index + 1}</h3>
              <table>
                <thead>
                  <tr><th>Point</th><th>X</th><th>Y</th></tr>
                </thead>
                <tbody>
                  {polygon.points.map((point, i) => (
                    <tr key={i}><td>{String.fromCharCode(65 + i)}</td><td>{point.x}</td><td>{point.y}</td></tr>
                  ))}
                </tbody>
              </table>
              <p><strong>Tags:</strong> {polygon.tags.length ? polygon.tags.join(", ") : "None"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PolygonTool;
