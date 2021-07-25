vec3 rgb(float r, float g, float b) {
    return vec3(r / 255., g / 255., b / 255.);
}

vec3 rgb(float c) {
    return vec3(c / 255., c / 255., c / 255.);
}

varying vec2 vUv;

uniform sampler2D moonBumpMap;
uniform sampler2D moonTexture;

uniform vec3 u_time;

void main(void) {

    vec4 bumpData = texture2D(moonBumpMap, vUv);
    vec4 satData = texture2D(moonTexture, vUv);

    gl_FragColor = satData * 0.85;
}