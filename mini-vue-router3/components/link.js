// 定义 <router-link> 全局组件
export default {
    props: {
        to: { type: String, required: true },
        tag: { type: String, default: 'a' }
    },
    methods: {
        handler() {
            // 跳转 to 对应的路由
            this.$router.push(this.to)
        }
    },
    render() {
        // this.$slots 获取到所有的插槽
        return <this.tag onClick={this.handler}>{this.$slots.default}</this.tag>
    }
}