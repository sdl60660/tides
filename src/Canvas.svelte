<script lang="ts">
	import { onMount } from "svelte";
	import { createScene, animate, resize } from "./scene";
	import * as THREE from "three";
	import { scaleLinear } from "d3-scale";
	import { extent } from "d3-array";

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

		const snapshotData = tideData
			.filter(
				(d) =>
					d.time.startsWith("2021-06-08T12:00:00Z") &&
					d.sea_level !== "NaN"
			)
			.map((d) => {
				const matchingStation = stationData[d.ssc_id];
				return {
					...d,
					sea_level: +d.sea_level,
					lat: matchingStation.lat,
					lng: matchingStation.lng,
				};
			});

		console.log(snapshotData);

		const heightScale = scaleLinear()
			.domain(extent(snapshotData, (d) => d.sea_level))
			.range([1, 100]);

		snapshotData.forEach(({ lat, lng, sea_level }) => {
			const height = heightScale(sea_level);
			const bar = plotBar({ lat, lng, height }, globeRadius);
			settings.scene.add(bar);
		});
	});

	const plotBar = (
		{ lat, lng, height, barWidth = 3, color = "red" },
		globeRadius
	) => {
		// const geometry = new THREE.CylinderGeometry( 1, 1, height, 35 );
		const geometry = new THREE.BoxBufferGeometry(
			barWidth,
			barWidth,
			height
		);
		const material = new THREE.MeshBasicMaterial({ color });
		const bar = new THREE.Mesh(geometry, material);

		const phi = (90 - lat) * (Math.PI / 180);
		const theta = (180 + lng) * (Math.PI / 180);

		bar.position.x = -(globeRadius * Math.sin(phi) * Math.cos(theta));
		bar.position.y = globeRadius * Math.cos(phi);
		bar.position.z = globeRadius * Math.sin(phi) * Math.sin(theta);

		bar.lookAt(new THREE.Vector3());

		return bar;
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

	canvas {
		width: 100%;
		height: 100%;
	}
</style>
