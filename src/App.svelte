<script lang="ts">
	import { onMount } from "svelte";
	import { createScene, animate } from "./scene";
	import * as THREE from "three";

	export let bumpMap: string = "textures/earth/earth-height.png";
	export let earthTexture: string = "textures/earth/satellite-earth.jpg";
	// export let earthTexture: string = "textures/earth/8k_earth_daymap.jpeg";

	export let defaultRotation = 0;
	export let controlsEnabled: boolean = true;

	export let containerWidth = "100vw";
	export let containerHeight = "100vh";

	// Should take a starting center coordinate that just focuses the center on a particular coodinate
	// Should take an array of { [lat, lng], mesh } for plotting one point shapes or { [lat, lng], [lat, lng], mesh } for arcs?

	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let width: number;
	let height: number;

	onMount(async () => {
		const settings = await createScene({
			canvas,
			bumpMap,
			earthTexture,
			controlsEnabled,
			defaultRotation,
		});

		animate(settings);
	});
</script>

<div
	class="wrapper"
	bind:this={container}
	style={`width: ${containerWidth}; height: ${containerHeight};`}
>
	<canvas
		class="three-canvas"
		bind:clientWidth={width}
		bind:clientHeight={height}
		bind:this={canvas}
	/>
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
