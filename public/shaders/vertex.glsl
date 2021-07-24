varying vec2 vUv;

uniform sampler2D getTexture1;
void main() {
    vUv = uv;
    vec4 bumpData = texture2D(getTexture1, uv);
    float displacement = 20.0 * bumpData.r * bumpData.a;

    vec3 newPosition = position + normal * displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}