
varying vec2 vUv;
uniform sampler2D earthHeights;

void main() {
    vUv = uv;

    vec4 bumpData = texture2D(earthHeights, uv);
    float displacement = 14.0 * bumpData.r * bumpData.a;
    vec3 newPosition = position + normal * displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}