import { install, Vue } from "./install"

/**
 * 构建路由信息映射表
 * @param {Array} routes 路由信息
 * @param {Array} pathMap 已有的路由映射表，可选
 */
function createRouteMap(routes, pathMap = {}) {

    routes.forEach(route => {
        addRouteRecord(route, pathMap)
    })

    return { pathMap }
}

/**
 * 
 * @param {object} route 具体某个路由信息对象
 * @param {object} pathMap 映射表
 * @param {object} parentRecord 父路由信息对象
 */
function addRouteRecord(route, pathMap, parentRecord) {
    let path = route.path
    // 拼接路径
    if (parentRecord?.path) {
        path = parentRecord.path === '/' ? `/${route.path}` : `${parentRecord.path}/${route.path}`
    }
    let record = {
        path,
        component: route.component,
        props: route.props,
        meta: route.meta,
        name: route.name
    }
    // 路径 对应 路由信息 
    // 如果路径相同，后面的路由会覆盖前面的路由
    pathMap[path] = record

    // 递归处理子节点
    if (route.children) {
        route.children.forEach(cld => {
            addRouteRecord(cld, pathMap, record)
        })
    }
}

function createMatcher(routes) {

    // 创建映射表
    let { pathMap } = createRouteMap(routes)


    /**
     * 
     * @param {Array} routes 动态添加多个路由
     */
    function addRoutes(routes) {
        createRouteMap(routes, pathMap)
        console.log(pathMap);
    }

    /**
     * 
     * @param {object} route 动态添加一个路由
     */
    function addRoute(route) {
        createRouteMap([route], pathMap)
        console.log(pathMap);

    }

    function match() {

    }

    return {
        addRoutes,
        addRoute,
        match
    }
}

class VueRouter {
    constructor(options) {
        console.log(options);
        let routes = options.routes || []

        // 创建路由匹配器与路由映射表，即相关方法
        this.mathcer = createMatcher(routes)
    }
}

/**
 * 供 Vue.use 调用，Vue.use 会调用插件的 install 方法
 *  @params _Vue 传入的 Vue 构造函数
 */
VueRouter.install = install

export default VueRouter