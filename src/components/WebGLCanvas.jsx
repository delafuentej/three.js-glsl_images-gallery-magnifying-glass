import { useWebGLCanvas } from "../hooks";

const WebGLCanvas = ({ container }) => {
  const canvasRef = useWebGLCanvas(container);
  return <canvas ref={canvasRef} className="webgl-canvas" />;
};

export default WebGLCanvas;
