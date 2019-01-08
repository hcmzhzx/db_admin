// polyfill
import 'babel-polyfill'
// Vue
import Vue from 'vue'
import App from './App'
// store
import store from '@/store/index'
// 多国语
import i18n from './i18n'
// 核心插件
import d2Admin from '@/plugin/d2admin'
// [ 可选插件组件 ]D2-Crud
import D2Crud from '@d2-projects/d2-crud'
// [ 可选插件组件 ] UEditor
import VueUeditorWrap from 'vue-ueditor-wrap'

// 菜单和路由设置
import router from './router'
import {menus} from '@/menu/index'
import {frameInRoutes} from '@/router/routes'

// 核心插件
Vue.use(d2Admin)
Vue.use(D2Crud)
Vue.component('VueUeditorWrap', VueUeditorWrap)

Vue.mixin({
  methods: {
    // 时间格式
    formatDate(date, fmt) {
      date = date.toString().length == 10 ? new Date(date * 1000) : date
      let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
      }
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + ''))
      }
      for (var k of Object.keys(o)) {
        if (new RegExp(`(${k})`).test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length != 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
        }
      }
      return fmt
    }
  }
})

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
  created() {
    // 处理路由 得到每一级的路由设置
    this.$store.commit('d2admin/page/init', frameInRoutes)
    // 设置顶栏菜单
    // this.$store.commit('d2admin/menu/headerSet', menus)
    // 设置侧边栏菜单
    this.$store.commit('d2admin/menu/asideSet', menus)
    // 初始化菜单搜索功能
    this.$store.commit('d2admin/search/init', menus)
  },
  mounted() {
    // 展示系统信息
    this.$store.commit('d2admin/releases/versionShow')
    // 用户登录后从数据库加载一系列的设置
    this.$store.dispatch('d2admin/account/load')
    // 获取并记录用户 UA
    this.$store.commit('d2admin/ua/get')
    // 初始化全屏监听
    this.$store.dispatch('d2admin/fullscreen/listen')
  }
}).$mount('#app')
