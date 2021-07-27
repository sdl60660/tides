<script lang="ts">
    import * as THREE from "three";
    const textureloader = new THREE.TextureLoader();

    import Canvas from "./Canvas.svelte";
    import Loader from "./Loader.svelte";

    import { csv, json } from "d3-fetch";

    const dataPromises = [
        // csv("data/hourly_sealevel_data.csv"),
        // Sea levels by time and station ID for the month of June
        csv("data/hourly_sealevel_data_june2021.csv"),
        json("data/station_data.json"),
    ];

    const dataLoad = Promise.all(dataPromises).then(
        async ([tideData, stationData]) => {
            const bumpMap: THREE.Texture = textureloader.load(
                "textures/earth/earth-height.png"
            );
            const earthTexture: THREE.Texture = textureloader.load(
                "textures/earth/satellite-earth.jpg"
            );

            return {
                tideData,
                stationData,
                bumpMap,
                earthTexture,
            };
        }
    );
</script>

{#await dataLoad}
    <Loader />
{:then { tideData, stationData, bumpMap, earthTexture }}
    <Canvas {tideData} {stationData} {bumpMap} {earthTexture} />
{/await}

<style>
</style>
