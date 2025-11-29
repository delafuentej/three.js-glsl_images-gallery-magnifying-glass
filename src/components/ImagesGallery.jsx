import React, { useEffect, useRef } from "react";

const ImagesGallery = ({ onContainerReady }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    const imgSources = Array.from(
      { length: 50 },
      (_, i) => `/images/${i + 1}.webp`
    );

    function getRandomImage() {
      return imgSources[Math.floor(Math.random() * imgSources.length)];
    }

    // Crear las 300 celdas
    for (let i = 0; i < 300; i++) {
      const wrapper = document.createElement("div");
      wrapper.className = "img-wrapper";

      const img = document.createElement("img");
      img.src = getRandomImage();
      wrapper.appendChild(img);

      container.appendChild(wrapper);
    }

    // Entregamos el contenedor al componente WebGL
    onContainerReady(container);
  }, []);
  return (
    <div className="viewport">
      <div ref={containerRef} className="container"></div>
    </div>
  );
};

export default ImagesGallery;
