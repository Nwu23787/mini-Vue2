import history from "./base";

/**
 * 
 * @returns 获取当前 路由 值
 */
function getPathName() {
    return window.location.pathname
}


// history 路由
class HTML5History extends history {
    constructor(router) {
        super(router)
    }

    /**
    * 创建监听器，监听hash值的变化
    */
    setupListeners() {
        window.addEventListener('popstate', function () {
        })
    }

    /**
     * 获取当前的地址值（hash）
     * @returns 当前的地址值（hash）
     */
    getCurrentLocation() {
        return getPathName()
    }

    /**
     * 传入 location ，对应修改地址栏
     * @param {string} location 要跳转的路由path值
     */
    push(location) {
        window.location.pathname = location
    }
}

export default HTML5History