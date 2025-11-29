import React, { useState } from "react";
import { ImagesGallery } from "./components";

const App = () => {
  const [container, setContainer] = useState(null);
  return (
    <>
      <ImagesGallery onContainerReady={setContainer} />
    </>
  );
};

export default App;
