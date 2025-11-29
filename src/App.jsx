import React, { useState } from "react";
import { ImagesGallery, WebGLCanvas } from "./components";

const App = () => {
  const [container, setContainer] = useState(null);
  return (
    <>
      <ImagesGallery onContainerReady={setContainer} />
      <WebGLCanvas container={container} />
    </>
  );
};

export default App;
