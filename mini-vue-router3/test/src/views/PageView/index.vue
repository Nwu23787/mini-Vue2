<template>
    <div class="about">
        <h1>This is page</h1>
        <router-link to="/page/one" tag="button">page1</router-link>
        &nbsp;
        <router-link to="/page/two" tag="button">page2</router-link>
        &nbsp;
        <router-link to="/page/three" tag="button">page3</router-link>
        <router-view></router-view>
    </div>
</template>
