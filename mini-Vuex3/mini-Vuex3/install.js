export let Vue

export default (_Vue) => {
    Vue = _Vue
    Vue.mixin({
        // 保证每一个实例上都挂载上 $store，让每个组件共享
        beforeCreate() {
            if (this.$options.store) {
                // 如果 vue 实例上的选项中传入了 store，那一定是根实例
                this.$store = this.$options.store
            } else {
                if (this.$parent && this.$parent.$store) {
                    // 若当前 vue 实例没有被传入 store，则非根节点
                    this.$store = this.$parent.$store // 向父节点取 $store
                }
            }
        }
    })
}