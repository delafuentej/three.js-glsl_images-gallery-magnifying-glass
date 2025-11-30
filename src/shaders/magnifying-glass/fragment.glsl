precision highp float;

uniform vec2 iResolution;   // tamaño de la textura
uniform vec2 iMouse;        // coordenadas del mouse en pixeles
uniform sampler2D iChannel0;
varying vec2 fragCoord;     // uv en 0–1

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------
vec2 flipY(vec2 uv) {
    return vec2(uv.x, 1.0 - uv.y);
}

vec2 getDistortedUv(vec2 uv, vec2 direction, float factor) {
    vec2 dir = direction;
    dir.y *= 2.0;
    return uv - dir * factor;
}

struct DistortedLens {
    vec2 uv_R;
    vec2 uv_G;
    vec2 uv_B;
    float inside;
};

DistortedLens getLensDistortion(
    vec2 uv,
    vec2 uv_m,
    float sphereRadiusUv,
    float focusFactor,
    float chromaticAberrationFactor
) {
    vec2 direction = normalize(uv - uv_m);
    float dist = distance(uv, uv_m);
    float focusRadiusUv = sphereRadiusUv * focusFactor;
    float focusSdf = dist - focusRadiusUv;
    float sphereSdf = dist - sphereRadiusUv;
    float inside = smoothstep(0.0, 1.0, -sphereSdf / (sphereRadiusUv * 0.1));
    float magnifierFactor = focusSdf / (sphereRadiusUv - focusRadiusUv);
    float mFactor = clamp(magnifierFactor * inside, 0.0, 1.0);
    mFactor = pow(mFactor, 5.0);
    float focusStrength = sphereRadiusUv * 1.5;

    vec3 distortionFactors = vec3(
        mFactor * focusStrength * (1.0 + chromaticAberrationFactor),
        mFactor * focusStrength,
        mFactor * focusStrength * (1.0 - chromaticAberrationFactor)
    );

    vec2 uv_R = getDistortedUv(uv, direction, distortionFactors.r);
    vec2 uv_G = getDistortedUv(uv, direction, distortionFactors.g);
    vec2 uv_B = getDistortedUv(uv, direction, distortionFactors.b);

    return DistortedLens(uv_R, uv_G, uv_B, inside);
}

vec2 zoomUV(vec2 uv, vec2 center, float zoom) {
    float z = 1.0 / zoom;
    vec2 cuv = uv - center;
    cuv *= z;
    return cuv + center;
}

// ------------------------------------------------------
// MAIN
// ------------------------------------------------------
void main() {
    vec2 uv = fragCoord; // ya está en 0–1
    vec2 uvMouse = iMouse / iResolution;
    float sphereRadiusUv = (iResolution.y * 0.15) / iResolution.y; // 🔥 radio reducido
    float focusFactor = 0.25;
    float chromaticAberrationFactor = 0.05;
    float zoom = 1.75;

    vec2 uvZoomed = zoomUV(uv, uvMouse, zoom);

    DistortedLens lens = getLensDistortion(
        uvZoomed,
        uvMouse,
        sphereRadiusUv,
        focusFactor,
        chromaticAberrationFactor
    );

    vec4 baseTex = texture2D(iChannel0, flipY(uv));

    vec3 distorted = vec3(
        texture2D(iChannel0, flipY(lens.uv_R)).r,
        texture2D(iChannel0, flipY(lens.uv_G)).g,
        texture2D(iChannel0, flipY(lens.uv_B)).b
    );

    vec3 finalColor = mix(baseTex.rgb, distorted, pow(lens.inside, 2.0));
    float alpha = lens.inside;

    gl_FragColor = vec4(finalColor, alpha);
}
