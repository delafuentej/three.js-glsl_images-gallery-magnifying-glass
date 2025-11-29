export function useWebGLProgram() {
  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      console.error(
        `[WebGL] Shader compile error (${
          type === gl.VERTEX_SHADER ? "VERT" : "FRAG"
        }):\n`,
        info
      );
      throw new Error("Shader compile failed: " + info);
    }
    return shader;
  }

  function createProgram(gl, vertexSrc, fragmentSrc) {
    if (!gl) throw new Error("createProgram: no GL context");

    const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      console.error("[WebGL] Program link error:\n", info);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      throw new Error("Program link failed: " + info);
    }

    // Opcional: liberar shaders ya que están linkeados
    gl.detachShader(program, vs);
    gl.detachShader(program, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    return program;
  }

  return { createProgram };
}
