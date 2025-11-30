import React, { useState } from "react";
import { WebGLCanvas, ImagesGallery } from "./components";

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
