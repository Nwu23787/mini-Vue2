export function initLifeCycle(Vue){
    // 挂载 render 函数到实例上
    Vue.prototype._render=function(){
        console.log('render');
    }

    // 挂载 update 函数到实例上
    Vue.prototype._update=function(){
        console.log('update');
    }

}

export function mountComponent(vm, el) {
    // 1. 调用 render 方法，获得虚拟 DOM
        vm._render()

    // 2. 根据虚拟 DOM，生成真实 DOM
        vm._update()

    // 3. 将真实 DOM 插入到 el 中
}