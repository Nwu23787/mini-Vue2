// 创建匹配器

import createRouteMap from "./create-router-map";

export default function createMatcher(routes) {

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

    /**
     * 根据路由路径，返回对应的路由对象
     * @param {string} url 路由的路径
     * @returns object
     */
    function match(url) {
        return pathMap[url]
    }

    return {
        addRoutes,
        addRoute,
        match
    }
}
