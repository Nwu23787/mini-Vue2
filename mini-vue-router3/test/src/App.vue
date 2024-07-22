<template>
    <div id="app">
        <nav>
            <router-link to="/" tag="a">Click to Home</router-link> |
            <router-link to="/page">Click to Page</router-link>
        </nav>
        <router-view />
    </div>
</template>

<script>
export default {
    name: 'App',
    mounted() {
        console.log('$router',this.$router);
        console.log('$route',this.$route);
    },
}
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}

nav {
    padding: 30px;
}

nav a {
    font-weight: bold;
    color: #2c3e50;
}

nav a.router-link-exact-active {
    color: #42b983;
}
</style>
