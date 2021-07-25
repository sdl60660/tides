
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

const textureloader = new THREE.TextureLoader();


export const init = async ({
    canvas,
    earthTexture = "textures/satellite-earth.jpg",
    bumpMap = "textures/earth-height.png",
    controlsEnabled = true,
    defaultRotation = 0
}) => {
    let renderer;
    let controls;
    let scene;
    let camera;
    let globe;

    let satEarth;
    let earthHeights;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);

    const shadersPromises = [
        loadFile("shaders/vertex.glsl"),
        loadFile("shaders/fragment.glsl")
    ];

    const [vertexShader, fragmentShader] = await Promise.all(shadersPromises);
    earthHeights = textureloader.load(bumpMap);

    satEarth = textureloader.load(earthTexture);
    satEarth.encoding = THREE.sRGBEncoding;

    const geometry = new THREE.SphereGeometry(170, 512, 512);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            u_color1: { type: 'v3', value: rgb(61, 142, 241) },
            u_color2: { type: 'v3', value: rgb(0, 46, 76) },
            u_time: { type: 'f', value: 0 },
            earthHeights: { type: "sampler2D", value: earthHeights },
            earthSatTexture: { type: "sampler2D", value: satEarth }
        },
        fragmentShader,
        vertexShader
    });

    globe = new THREE.Mesh(geometry, material);
    globe.position.set(0, 0, 0);
    globe.rotation.y = defaultRotation;
    scene.add(globe);

    camera.position.z = 500;

    renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true,
        alpha: true,
        canvas
    });
    renderer.setPixelRatio(window.devicePixelRatio);

    controls = new OrbitControls(camera, canvas);
    controls.minDistance = 250;
    controls.maxDistance = 1100;
    controls.enabled = controlsEnabled;

    return {
        canvas,
        renderer,
        controls,
        scene,
        camera,
        globe,
        satEarth,
        earthHeights
    };
}

export const animate = ({ scene, camera, renderer, controls }) => {
    requestAnimationFrame(() => animate({ scene, camera, renderer, controls }));
    controls.update();
    renderer.render(scene, camera);
};

export const resize = ({ camera, renderer }) => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};

export const createScene = async ({ canvas, bumpMap, earthTexture, controlsEnabled, defaultRotation }) => {
    const settings = await init({ canvas, bumpMap, earthTexture, controlsEnabled, defaultRotation });

    resize(settings);
    window.addEventListener('resize', resize);

    return settings;
}