
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
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 15000);

    const shadersPromises = [
        loadFile("shaders/earth/vertex.glsl"),
        loadFile("shaders/earth/fragment.glsl")
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
            exaggeration: { type: 'f', value: 10.0 },
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

    const moon = await addMoon({ scene });
    const sun = await addSun({ scene });

    return {
        canvas,
        renderer,
        controls,
        scene,
        camera,
        globe,
        moon,
        sun,
        satEarth,
        earthHeights
    };
}

const addSun = async ({ scene }) => {
    const sunTextureMap = textureloader.load("textures/2k_sun.jpeg");

    const shadersPromises = [
        loadFile("shaders/sun/vertex.glsl"),
        loadFile("shaders/sun/fragment.glsl")
    ];
    const [vertexShader, fragmentShader] = await Promise.all(shadersPromises);

    const geometry = new THREE.SphereGeometry(2000, 512, 512);
    // const material = new THREE.ShaderMaterial({
    //     uniforms: {
    //         u_time: { type: 'f', value: 0 },
    //         sunTexture: { type: "sampler2D", value: sunTextureMap }
    //     },
    //     fragmentShader,
    //     vertexShader
    // });
    const material = new THREE.MeshBasicMaterial({
        map: sunTextureMap
    });

    const sunMesh = new THREE.Mesh(geometry, material);
    sunMesh.position.set(0, 0, -8000);
    scene.add(sunMesh);

    return sunMesh;
}


const addMoon = async ({ scene }) => {
    const moonTexture = textureloader.load("textures/moonmap4k.jpg");
    const moonBumpMap = textureloader.load("textures/moonbump4k.jpg");

    const shadersPromises = [
        loadFile("shaders/moon/vertex.glsl"),
        loadFile("shaders/moon/fragment.glsl")
    ];
    const [vertexShader, fragmentShader] = await Promise.all(shadersPromises);

    const geometry = new THREE.SphereGeometry(40, 512, 512);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            u_time: { type: 'f', value: 0 },
            exaggeration: { type: 'f', value: 0.7 },
            moonBumpMap: { type: "sampler2D", value: moonBumpMap },
            moonTexture: { type: "sampler2D", value: moonTexture }
        },
        fragmentShader,
        vertexShader
    });

    const moonMesh = new THREE.Mesh(geometry, material);
    moonMesh.position.set(0, 20, 400);
    scene.add(moonMesh);

    return moonMesh;
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