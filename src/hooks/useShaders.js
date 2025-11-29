import magnifyingGlassFragmentShader from "../shaders/magnifying-glass/fragment.glsl";
import magnifyingGlassVertexShader from "../shaders/magnifying-glass/vertex.glsl";

export function useShaders() {
  return {
    magnifyingGlass: {
      vertexShader: magnifyingGlassVertexShader,
      fragmentShader: magnifyingGlassFragmentShader,
    },
  };
}
