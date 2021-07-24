<script lang="ts">
	import { onMount } from 'svelte';
	import { createScene } from './scene';

	import * as THREE from "three";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

	let container;
    let canvas;
	let width;
	let height;

	onMount(async () => {
		createScene(canvas);
	})
</script>


<div class="wrapper" bind:this={container}>
	<canvas
        class="three-canvas"
        bind:clientWidth={width}
        bind:clientHeight={height}
        bind:this={canvas}
    />
</div>


<style>
	canvas {
		width: 100vw;
		height: 100vh;
	}
</style>