<template>
    <div class="home">
        This is home
        <br />
        <br/>
        <router-link to="/img" tag="button">Show Image</router-link>
        &nbsp;
        <router-link to="/name" tag="button">Show Name</router-link>
        <router-view></router-view>
    </div>
</template>

<script>
// @ is an alias to /src

export default {}
</script>

<style>
    .home{
        margin: 10px;
    }
</style>
