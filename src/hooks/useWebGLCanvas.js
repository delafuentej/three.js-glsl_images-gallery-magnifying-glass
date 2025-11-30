import { useEffect, useRef } from "react";
import { useShaders } from "./useShaders";
import { useWebGLProgram } from "./useWebGLProgram";
import { useMouse } from "./useMouse";
import { useTextureRenderer } from "./useTextureRenderer";

export function useWebGLCanvas(container) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  // hooks en top-level (válido)
  const { magnifyingGlass } = useShaders();
  const { vertexShader: vertexSource, fragmentShader: fragmentSource } =
    magnifyingGlass;
  const mouse = useMouse(); // expone .update()
  const { createProgram } = useWebGLProgram();
  const { updateTexture } = useTextureRenderer();

  useEffect(() => {
    if (!container) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      preserveDrawingBuffer: false,
      antialias: true,
      alpha: true,
    });
    if (!gl) {
      console.error("[WebGL] No context");
      return;
    }

    // setup blending (igual que tu setupWebGL)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let program = null;
    let texture = null;
    let mounted = true;

    // función async para inicializar (espera a que haya imágenes cargadas)
    (async () => {
      // Esperar a que haya al menos una imagen en el container y esté cargada
      function waitFirstImage() {
        return new Promise((resolve) => {
          const firstImg = container.querySelector("img");
          if (!firstImg) return resolve(); // nada que esperar
          if (firstImg.complete) return resolve();
          firstImg.onload = () => resolve();
          firstImg.onerror = () => resolve();
        });
      }
      await waitFirstImage();

      try {
        // crea y linkea programa (lanza si falla)
        program = createProgram(gl, vertexSource, fragmentSource);
      } catch (err) {
        console.error("[useWebGLCanvas] createProgram failed:", err);
        return;
      }

      // full-screen quad
      const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      // usa el programa antes de getAttribLocation
      gl.useProgram(program);

      const posLoc = gl.getAttribLocation(program, "aPosition");
      if (posLoc === -1) {
        console.warn("[WebGL] attribute aPosition not found");
      } else {
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      }

      // textura
      texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // set params básicos para evitar errores cuando texImage2D ocurra
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const iChannel0Loc = gl.getUniformLocation(program, "iChannel0");
      if (iChannel0Loc) gl.uniform1i(iChannel0Loc, 0);

      // render loop
      // function loop() {
      //    if (!mounted) return;
      //SIEMPRE actualizar el mouse al inicio
      // const m = mouse.update();

      // const w = window.innerWidth;
      // const h = window.innerHeight;

      // if (canvas.width !== w || canvas.height !== h) {
      // canvas.width = w;
      // canvas.height = h;
      // gl.viewport(0, 0, w, h);
      // }

      //

      // try {
      // updateTexture(gl, container, texture);
      // } catch (err) {
      // console.error("[useWebGLCanvas] updateTexture error:", err);
      // }

      // const resLoc = gl.getUniformLocation(program, "iResolution");
      // if (resLoc) gl.uniform2f(resLoc, w, h);

      // const mouseLoc = gl.getUniformLocation(program, "iMouse");
      // if (mouseLoc) gl.uniform2f(mouseLoc, m.x, h - m.y);

      // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // rafRef.current = requestAnimationFrame(loop);
      // }

      function loop() {
        if (!mounted) return;

        // SIEMPRE actualizar el mouse al inicio
        const m = mouse.update();
        // 2) actualizar tamaño del canvas
        const w = window.innerWidth;
        const h = window.innerHeight;

        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
        }
        // 3) actualizar textura ANTES de los uniforms
        updateTexture(gl, container, texture);

        // uniforms// 4) pasar los uniforms
        gl.uniform2f(gl.getUniformLocation(program, "iResolution"), w, h);
        gl.uniform2f(gl.getUniformLocation(program, "iMouse"), m.x, h - m.y);
        // 5) dibujar
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        rafRef.current = requestAnimationFrame(loop);
      }

      rafRef.current = requestAnimationFrame(loop);
    })();

    // window resize listener similar al original
    const onResize = () => {
      // reset pan/mouse targets como en tu original
      // si gustas puedes exponer hooks para pan; aquí mantenemos simple
    };
    window.addEventListener("resize", onResize);

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);

      try {
        if (texture) gl.deleteTexture(texture);
        // borrar buffer y programa
        // eslint-disable-next-line no-unused-vars
        if (program) gl.deleteProgram(program);
      } catch (e) {
        console.log(e);
      }
    };
  }, [
    container,
    vertexSource,
    fragmentSource,
    createProgram,
    updateTexture,
    mouse,
  ]);

  return canvasRef;
}
