// 创建路由映射表

/**
 * 构建路由信息映射表
 * @param {Array} routes 路由信息
 * @param {Array} pathMap 已有的路由映射表，可选
 */
export default function createRouteMap(routes, pathMap = {}) {

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
