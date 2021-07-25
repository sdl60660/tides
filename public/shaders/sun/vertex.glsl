
varying vec2 vUv;
// uniform sampler2D bumpMap;
// uniform float exaggeration;

void main() {
    vUv = uv;

    // vec4 bumpData = texture2D(bumpMap, uv);
    // float displacement = exaggeration * bumpData.r * bumpData.a;
    // vec3 newPosition = position + normal * displacement;

    // gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(1.0, 1.0, 1.0, 1.0);
}