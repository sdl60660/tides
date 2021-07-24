
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

const rgb = (r, g, b) => {
    return new THREE.Vector3(r, g, b);
}

const loadFile = (filename) => {
    return new Promise((resolve, reject) => {
        const loader = new THREE.FileLoader();

        loader.load(filename, (data) => {
            resolve(data);
        });
    });
};

let renderer;
let controls;
let scene;
let camera;
let globe;

const init = async () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const shadersPromises = [
        loadFile("shaders/vertex.glsl"),
        loadFile("shaders/fragment.glsl")
    ];

    const [vertexShader, fragmentShader] = await Promise.all(shadersPromises);

    const geometry = new THREE.SphereGeometry(170, 512, 512);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            u_color1: { type: 'v3', value: rgb(61, 142, 241) },
            u_color2: { type: 'v3', value: rgb(0, 46, 76) },
            u_time: { type: 'f', value: 0 },
            getTexture1: { type: "t", value: new THREE.TextureLoader().load('images/earth-height.png') }
        },
        fragmentShader,
        vertexShader
    });

    globe = new THREE.Mesh(geometry, material);
    globe.position.set(0, 0, 0);
    scene.add(globe);

    camera.position.z = 300;

}



const animate = () => {
    requestAnimationFrame(animate);
    controls.update();

    renderer.render(scene, camera);
};

const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};

export const createScene = async (el) => {
    await init();

    renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true,
        alpha: true,
        canvas: el
    });
    renderer.setPixelRatio(window.devicePixelRatio);

    resize();

    controls = new OrbitControls(camera, el);

    animate();
}

window.addEventListener('resize', resize);