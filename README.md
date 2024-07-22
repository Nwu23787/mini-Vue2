<p align="center">
 <img src="https://img.shields.io/badge/node-16.14.0-blue" alt="node">
 <img src="https://img.shields.io/badge/rollup-2.79.1-blue" alt="rollup">
     <img src="https://img.shields.io/badge/license-MIT-success"/>
</p>

## 系统说明

- 基于 rollup 打包，**仿照 Vue2 及其周边生态源码**实现的一款简易 JavaScript 框架
- 实现了 Vue 的数据劫持、响应式、diff等**核心原理**以及 watch、computed、$nextTick 、Vue.component 等部分 API
- 实现了 Vue Router 的 **hash 和 history 模式**，支持路由跳转以及**前置 / 后置路由守卫**
- 简化了 Vue2 冗杂难懂的源码，**以最简单的方式实现最核心的功能**，注释丰富，文档齐全，**适合新手学习**
- 个人开发，水平有限，本项目**仅限学习使用**，并不具备实际应用价值

#### 分支说明

- main：主分支
- dev：开发测试分支 

#### 配套文档

- 🔥 [mini-Vue2 配套文档（持续更新中）](https://nwu23787.github.io/vuepress-blog/miniVue2/)



## 快速开始

### 相关依赖

| 依赖    | 版本    |
| ------- | ------- |
| node.js | 16.14.0 |
| rollup  | 2.79.1  |

### 模块说明

```lua
mini-Vue2  -- https://github.com/Nwu23787/mini-Vue2

mini-Vue2
├── demo -- 测试用例文件夹
├── node_modules -- 依赖包文件夹
├── dist -- 打包出口
└── src -- 主模块
     ├── compiler -- 模版编译模块
			├── index.js -- 模版编译
			└── parse.js -- 模版解析
     ├── observe -- 响应式模块
			├── array.js -- 处理数组响应式
			├── dep.js -- dep 类及其相关操作
			├── index.js -- 数据劫持和监听
			└── watcher.js -- watcher 类及其相关操作
     ├── vdom -- 虚拟 DOM 模块
			├── index.js -- 创建 vnode
			└── patch.js -- diff 及 pitch 算法
     ├── globalAPI.js -- 全局 API
     ├── init.js -- Vue 初始化
     ├── lifecycle.js -- 生命周期相关
     ├── state.js -- 数据劫持相关
     ├── utils.js -- 工具文件
     └── index.js -- 主文件

mini-vue-router3
├── mini-vue-router3 -- 源文件
		├── components -- 路由相关组件
				├── link.js -- <router-link> 定义
				└── view.js -- <router-view> 定义
		├── history -- history 对象
				├── base.js -- history 父类
				├── html5.js -- history 模式的 history 对象
				└── hash.js -- hash 模式的 history 对象
		├── creat-matcher.js -- 创建路由匹配器
		├── create-router-map.js  -- 创建路由映射表
		├── index.js -- 主文件
		└── install.js -- 插件的 install 方法
└── test -- 测试用例项目	
```

### 快速开始

### mini-vue2

1. clone 项目到本地

2. 安装项目依赖：

   ```shell
   yarn install
   ```

   或

   ```shell
   npm install
   ```

3. 启动项目：
   ```shell
   yarn dev
   ```

   或

   ```shell
   npm run dev
   ```

4. 在 HTML文件中引入 dist 文件夹下的 vue.js 即可开始使用

### mini-vue-router3

1. clone 项目到本地

2. 引入 mini-vue-router3 文件夹到你的项目中
   ```js
   import VueRouter from '../../mini-vue-router3'
   ```

3. 使用 Vue.use 注册路由插件
   ```js
   Vue.use(VueRouter)
   ```

4. 配置你的路由 router，语法与 Vue Router 3 一致，可参考 `test/src/router/index.js` 
   ```js
   const router = new VueRouter({
     mode: 'history',
     base: process.env.BASE_URL,
     routes
   })
   ```

5. 将配置好的路由传入 Vue 根实例中：
   ```js
   new Vue({
     router,
     render: h => h(App)
   }).$mount('#app')
   ```

### 开源共建

### 开源协议

mini-Vue2 开源项目遵循[MIT License](https://opensource.org/license/mit)。
允许**个人使用、商业使用、复制、分发、修改**，但务必保留作者、Copyright 信息。

### 其他说明

1. **请注意本项目的版本**！mini-vue2 仿照 vue 2.x 实现，mini-vue-router3 仿照 Vue Router 3 实现，故不支持 Vue3，**请勿在 Vue3 项目中使用 mini-vue-router3**。

1. 欢迎提交 [pr](https://github.com/Nwu23787/mini-Vue2/pulls)，注意对应提交对应 `dev` 分支

   <details>
    <summary>代码规范说明</summary>


     1. 行结尾无`;`
     2. 字符串请优先使用`''`
     3. 命名风格良好
     4. :information_source: 请注意你的 vscode 自动格式化插件的代码风格是否与本项目一致

2. 欢迎提交 [issues](https://github.com/Nwu23787/mini-Vue2/issues)，请写清楚遇到问题的原因、复显步骤。

#### 其他项目

- 👉🏻 [HappyBlog 个人博客管理端](https://github.com/Nwu23787/happyblog-front-admin)

- 👉🏻[HappyBlog 个人博客web端](https://github.com/Nwu23787/happyblog-front-web)

- 👉🏻 [基于vuepress实现的简易博客平台](https://github.com/Nwu23787/vuepress-blog)

- :hot_pepper:更多项目参见个人主页