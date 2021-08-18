<script lang="ts">
	import { onMount } from "svelte";
	import { createScene, animate, resize, plotOnGlobe } from "./scene";
	import * as THREE from "three";
	import { scaleLinear } from "d3-scale";
	import { extent } from "d3-array";

	import { point, featureCollection } from "@turf/helpers";
	import interpolate from "./utils/customInterpolate";
	// import interpolate from "@turf/interpolate";

	export let bumpMap: string = "textures/earth/earth-height.png";
	export let earthTexture: string = "textures/earth/satellite-earth.jpg";
	// export let earthTexture: string = "textures/earth/8k_earth_daymap.jpeg";

	export let defaultRotation = 0;
	export let controlsEnabled: boolean = true;

	export let containerWidth = "100vw";
	export let containerHeight = "100vh";

	export let stationData;
	export let tideData;

	// Should take a starting center coordinate that just focuses the center on a particular coodinate
	// Should take an array of { [lat, lng], mesh } for plotting one point shapes or { [lat, lng], [lat, lng], mesh } for arcs?

	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let width: number;
	let height: number;
	let settings: any;

	onMount(async () => {
		settings = await createScene({
			canvas,
			bumpMap,
			earthTexture,
			controlsEnabled,
			defaultRotation,
		});

		animate(settings);

		const globeRadius = settings.globe.geometry.parameters.radius;
		const { snapshotData, heightScale } = loadData({
			dateTime: "2020-07-08T12:00:00Z",
		});

		snapshotData.forEach(({ lat, lng, sea_level }) => {
			const height = heightScale(sea_level);
			const geometry = new THREE.BoxBufferGeometry(3, 3, height);
			const material = new THREE.MeshBasicMaterial({ color: "red" });

			const mesh = plotOnGlobe({
				lat,
				lng,
				geometry,
				material,
				globeRadius,
				scene: settings.scene,
			});
		});

		// const sampleData = snapshotData.map(({ lat, lng, sea_level }) => ({
		// 	x: lng + 200,
		// 	y: lat + 200,
		// 	z: sea_level,
		// }));
		const sampleData = snapshotData.map(({ lat, lng, sea_level }) =>
			point([lng, lat], { sea_level })
		);

		// https://www.npmjs.com/package/@turf/interpolate
		const gridPieces = ["west", "east"].map((hemisphere) => {
			const interpolationOptions = {
				gridType: "points",
				property: "sea_level",
				units: "miles",
				weight: 1,
				hemisphere: "east",
			};

			// const start = performance.now();
			const grid = interpolate(
				featureCollection(sampleData),
				10,
				interpolationOptions
			);

			// console.log(grid, performance.now() - start);
			return grid;
		});

		const grid = gridPieces.map((d) => d.features).flat();
		console.log(grid);

		// https://threejs.org/docs/#api/en/textures/DataTexture2DArray

		const width = 1024;
		const height = 512;
		const depth = 100;

		const size = width * height;
		const data = new Uint8Array(3 * size * depth);

		for (let i = 0; i < depth; i++) {
			const color = new THREE.Color(
				Math.random(),
				Math.random(),
				Math.random()
			);
			const r = Math.floor(color.r * 255);
			const g = Math.floor(color.g * 255);
			const b = Math.floor(color.b * 255);

			for (let j = 0; j < size; j++) {
				const stride = (i * size + j) * 3;

				data[stride] = r;
				data[stride + 1] = g;
				data[stride + 2] = b;
			}
		}

		// used the buffer to create a DataTexture2DArray

		const texture = new THREE.DataTexture2DArray(
			data,
			width,
			height,
			depth
		);
		texture.format = THREE.RGBFormat;
		texture.type = THREE.UnsignedByteType;
	});

	const loadData = ({ dateTime }) => {
		const snapshotData = tideData
			.filter((d) => d.time.startsWith(dateTime) && d.sea_level !== "NaN")
			.map((d) => {
				const matchingStation = stationData[d.ssc_id];
				return {
					...d,
					sea_level: +d.sea_level,
					lat: matchingStation.lat,
					lng: matchingStation.lng,
				};
			});

		const heightScale = scaleLinear()
			.domain(extent(snapshotData, (d) => d.sea_level))
			.range([1, 200]);

		return { snapshotData, heightScale };
	};

	// Resize on width/height changes if scene has been initialized
	$: if (settings) {
		resize(settings, width, height);
	}
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<div
	class="wrapper"
	bind:this={container}
	style={`width: ${containerWidth}; height: ${containerHeight};`}
>
	<canvas class="three-canvas" bind:this={canvas} />
</div>

<style>
	/* .wrapper {
		width: 100vw;
		height: 100vh;
	} */

	.three-canvas {
		width: 100%;
		height: 100%;
	}
</style>
