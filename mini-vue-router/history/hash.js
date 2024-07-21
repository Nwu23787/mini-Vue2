import history from "./base";

/**
 * hash 模式下，初始化 hash 值
 */
function ensureSlash() {
    if (!window.location.hash) {
        // # 后若无 hash 值，则给默认的 '/'
        window.location.hash = '/'
    }
}

/**
 * 
 * @returns 获取当前 hash 值
 */
function getHash() {
    return window.location.hash.slice(1) // 去除 hash 前的 #
}

// hash 路由
class hashHistory extends history {
    constructor(router) {
        super(router)

        // 初始化 hash 路径，添加初始化 hash 值
        ensureSlash()
    }

    /**
     * 创建监听器，监听hash值的变化
     */
    setupListeners() {
        window.addEventListener('hashchange', () => {
            this.transitionTo(getHash())
        })
    }

    /**
     * 获取当前的地址值（hash）
     * @returns 当前的地址值（hash）
     */
    getCurrentLocation() {
        return getHash()
    }

    /**
     * 传入 location ，对应修改地址栏
     * @param {string} location 要跳转的路由path值
     */
    push(location) {
        window.location.hash = location
    }
}

export default hashHistory