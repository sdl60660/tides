<script lang="ts">
    import Canvas from "./Canvas.svelte";
    import { csv, json } from "d3-fetch";

    const dataPromises = [
        // csv("data/hourly_sealevel_data.csv"),
        // Sea levels by time and station ID for the month of June
        csv("data/hourly_sealevel_data_june2021.csv"),
        json("data/station_data.json"),
    ];

    const dataLoad = Promise.all(dataPromises).then(async (data) => {
        return data;
    });
</script>

{#await dataLoad}
    <p>Loading...</p>
{:then data}
    <Canvas tideData={data[0]} stationData={data[1]} />
{/await}

<style>
</style>
