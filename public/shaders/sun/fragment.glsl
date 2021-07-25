varying vec2 vUv;
uniform sampler2D sunTexture;
uniform vec3 u_time;

void main(void) {

    vec4 satData = texture2D(sunTexture, vUv);

    gl_FragColor = satData * 0.85;
}