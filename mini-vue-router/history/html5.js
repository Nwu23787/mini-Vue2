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
}

export default HTML5History