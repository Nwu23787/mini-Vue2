// 基础路由
class history {
    constructor(router) {
        this.router = router
    }

    transitionTo(location, callback) {

        let record = this.router.match(location)

        if (callback) callback()
        // 查找与路径匹配的路由
        console.log(record);
    }
}

export default history