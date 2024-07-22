// 定义 <router-view> 全局组件
export default {
    // 此组件为函数式组件
    functional: true,
    render(h, { parent, data }) {
        //标记位，标记此组件已渲染过
        data.routerView = true
        // 获取当前路由信息 
        let route = parent.$route

        // 当前渲染组件的层级
        let depth = 0

        // 计算当前需要渲染组件的层级
        while (parent) {
            if (parent.$vnode && parent.$vnode.data.routerView) {
                // 如果发现父组件上有 routerView 属性，则深度++
                depth++
            }
            // 继续递归向上查找
            parent = parent.$parent
        }

        // 获取到当前要渲染的组件信息
        let record = route.matched[depth]

        if (!record) {
            // 没匹配到组件，返回一个空节点
            return h()
        }

        // this.$slots 获取到所有的插槽
        return h(record.component, data)
    }
}