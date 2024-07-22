import Vue from 'vue'
// import VueRouter from 'vue-router'
import VueRouter from '../../mini-vue-router3'

import HomeView from '../views/HomeView/index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    children: [
      {
        path: 'img',
        component: () => import('../views/HomeView/components/showImg.vue')
      },
      {
        path: 'name',
        component: () => import('../views/HomeView/components/showName.vue')
      }
    ]
  },
  {
    path: '/page',
    name: 'page',
    component: () => import('../views/PageView/index.vue'),
    children: [
      {
        path: 'one',
        component: () => import('../views/PageView/components/page1.vue'),
      },
      {
        path: 'two',
        component: () => import('../views/PageView/components/page2.vue'),
      },
      {
        path: 'three',
        component: {
          render: () => <h3>not allowed to access</h3>
        }
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path == '/page/three') {
    alert('You are not allowed to access page3, click confirm button to the page1 !')
    next('/page/one')
  } else {
    console.log(`前置路由守卫触发，路由来自 ${from.path}，去往 ${to.path}`);
    next()
  }
})


router.afterEach((to, from) => {
  console.log(`后置路由守卫触发，路由来自 ${from.path}，去往 ${to.path}`);
})


export default router
