<script lang="ts">
	import { onMount } from "svelte";
	import { createScene, animate, resize } from "./scene";
	import * as THREE from "three";

	export let defaultRotation = 0;
	export let controlsEnabled: boolean = true;

	export let containerWidth = "100vw";
	export let containerHeight = "100vh";

	const textureloader = new THREE.TextureLoader();
	export let bumpMap: THREE.Texture = textureloader.load(
		"textures/earth/earth-height.png"
	);
	export let earthTexture: THREE.Texture = textureloader.load(
		"textures/earth/satellite-earth.jpg"
	);
	// export let earthTexture: string = "textures/earth/8k_earth_daymap.jpeg";

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
		const snapshotData = tideData
			.filter(
				(d) =>
					d.time.startsWith("2021-06-21T07:00") &&
					d.sea_level !== "NaN"
			)
			.map((d) => {
				const matchingStation = stationData[d.ssc_id];
				return {
					...d,
					sea_level: +d.sea_level,
					lat: matchingStation.lat,
					lng: matchingStation.lon,
				};
			});
		console.log(snapshotData);

		settings = await createScene({
			canvas,
			bumpMap,
			earthTexture,
			controlsEnabled,
			defaultRotation,
		});

		animate(settings);
	});

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

	canvas {
		width: 100%;
		height: 100%;
	}
</style>
