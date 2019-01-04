import Vue from 'vue'
import VueRouter from 'vue-router'

// 进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import store from '@/store/index'
import util from '@/libs/util.js'
import { menu } from '@/menu/index'

// 路由数据
import routes from './routes'

Vue.use(VueRouter)

// 导出路由 在 main.js 里使用
const router = new VueRouter({
  routes
})

/**
 * 路由拦截
 * 权限验证
 */
router.beforeEach((to, from, next) => {
   // 进度条
   NProgress.start()
   // 关闭搜索面板
   store.commit('d2admin/search/set', false)

   const token = util.cookies.get('token')
   if (to.name != 'login' && to.name != 'refresh' && (!token || menu.indexOf(to.path) == -1)) {
      next({ name: 'login', query: { redirect: document.URL } })
      NProgress.done()
      util.cookies.remove('token')
      util.cookies.remove('uuid')
      // 删除菜单
      sessionStorage.removeItem('menus')
   } else {
      next()
   }
})

router.afterEach(to => {
  // 进度条
  NProgress.done()
  // 需要的信息
  const app = router.app
  const { name, params, query, fullPath } = to
  // 多页控制 打开新的页面
  app.$store.dispatch('d2admin/page/open', { name, params, query, fullPath })
  // 更改标题
  util.title(to.meta.title)
})

export default router
