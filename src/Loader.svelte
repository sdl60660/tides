<script lang="ts">
    import { Wave } from "svelte-loading-spinners";
</script>

<div class="wrapper">
    <Wave size="80" color="#1E7ECD" unit="px" duration="1s" />
    <p>Loading data...</p>
</div>

<style>
    .wrapper {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>
