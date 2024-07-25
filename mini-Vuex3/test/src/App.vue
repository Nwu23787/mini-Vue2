<template>
    <div id="app">
        <p>count:{{ $store.state.baseCount }}</p>
        <p>numberGetter:{{ $store.getters.numberGetter }}</p>

        <p><span>mutation内修改basecount</span><button @click="$store.commit('increment', 1)">baseCount + 1</button></p>
        <p><span>dispatch内直接修改state，严格模式下会报错：</span><button @click="$store.dispatch('add', 5)">直接修改</button></p>
        <hr/>
        <hr/>

        a、c模块开启了命名空间，需要携带命名空间前缀访问：
        <p>cname:{{ $store.state.a.c.name }}</p>
        <p><span>1秒后cname末尾追加一个'c''</span><button @click="$store.dispatch('a/c/add', 'c')">点击</button></p>

        <hr/>
        <hr/>
        e 是通过 registerModule 动态添加的模块，不会被持久化
        <p>bnumber:{{ $store.state.b.bnumber }}</p>
        <p>enumber:{{ $store.state.b.e.enumber }}</p>
        <!-- b 没有开启命名空间，所以命名空间前缀中不带b -->
        <p><span>enumber+10：</span><button @click="$store.commit('e/increment', 10)">点击</button></p>
        
    </div>
</template>

<script>
export default {
    mounted() {
        // console.log(this.$store)
    },
}
</script>

<style scoped>
#app button{
    margin-left: 20px;
}
</style>
