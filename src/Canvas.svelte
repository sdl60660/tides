<script lang="ts">
	import { onMount } from "svelte";
	import { createScene, animate, resize, plotOnGlobe } from "./scene";
	import * as THREE from "three";
	import { scaleLinear } from "d3-scale";
	import { extent } from "d3-array";
	// import interpolateArray from "2d-bicubic-interpolate";
	// import { geoEquirectangular } from "d3-geo";

	import { point, featureCollection } from "@turf/helpers";
	import interpolate from "@turf/interpolate";

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
	let dummyCanvas: HTMLCanvasElement;
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
		const interpolationOptions = {
			gridType: "points",
			property: "sea_level",
			units: "miles",
		};

		const start = performance.now();
		const grid = interpolate(
			featureCollection(sampleData),
			20,
			interpolationOptions
		);

		console.log(grid, performance.now() - start);

		const ctx = dummyCanvas.getContext("2d");
		ctx.canvas.width = 1024;
		ctx.canvas.height = 512;
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		console.log(imageData);

		// console.log(sampleData);
		// console.log(interpolateArray(sampleData, 1));

		// const interpolatedData = interpolateArray(sampleData, 5);

		// console.log({ sampleData, interpolatedData });
		// const projection = geoEquirectangular();
		// snapshotData.map(({ lat, lng }) => {
		// 	console.log(projection(lng, lat));
		// });
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
	<canvas class="dummy-canvas" bind:this={dummyCanvas} />
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

	.dummy-canvas {
		position: absolute;
		z-index: -100;
		visibility: hidden;
		height: 512px;
		width: 1024px;
	}
</style>
