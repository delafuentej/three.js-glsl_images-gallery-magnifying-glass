// src/hooks/useTextureRenderer.
// devuelve función pura updateTexture(gl, container, texture)
export function useTextureRenderer() {
  function updateTexture(gl, container, texture) {
    if (!container) return;

    const tempCanvas = document.createElement("canvas");
    const scale = 4;
    tempCanvas.width = Math.floor(window.innerWidth * scale);
    tempCanvas.height = Math.floor(window.innerHeight * scale);
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = "high";
    tempCtx.fillStyle = "white";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    const viewportRect = container.getBoundingClientRect();
    const matrix = new DOMMatrix(getComputedStyle(container).transform);

    tempCtx.setTransform(
      matrix.a,
      matrix.b,
      matrix.c,
      matrix.d,
      matrix.e * scale,
      matrix.f * scale
    );

    const images = container.getElementsByTagName("img");
    for (let img of images) {
      const parent = img.parentElement.getBoundingClientRect();
      tempCtx.drawImage(
        img,
        (parent.left - viewportRect.left) * scale,
        (parent.top - viewportRect.top) * scale,
        parent.width * scale,
        parent.height * scale
      );
    }

    tempCtx.setTransform(1, 0, 0, 1, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      tempCanvas
    );

    // parámetros (asegúrate de setear estos siempre)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  return { updateTexture };
}
