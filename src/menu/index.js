import util from '@/libs/util.js'
import { AccountLogin } from '@api/http'

// 菜单 侧边栏
/*let menus = [
   {path: '/index', title: '首页', icon: 'home'},
   {
      title: '系统管理员',
      icon: 'folder-o',
      path: '/demo/admin',
      children: [
         {path: '/demo/admin/index', title: '管理员管理',},
         {path: '/demo/admin/users', title: '用户组管理'},
         {path: '/demo/admin/limits', title: '权限管理'}
      ]
   },
   {
      title: '学校管理系统',
      icon: 'folder-o',
      path: '/demo/School',
      children: [
         {path: '/demo/School/region', title: '地区管理'},
         {path: '/demo/School/index', title: '学校管理'},
         {path: '/demo/School/semester', title: '学期管理'},
         {path: '/demo/School/combo', title: '套餐管理'},
         {path: '/demo/School/everyday', title: '每日实拍'}
      ]
   },
   {
      title: '用户管理',
      icon: 'folder-o',
      path: '/demo/users',
      children: [
         {path: '/demo/users/index', title: '用户列表'},
         {path: '/demo/users/pupil', title: '学生管理'},
         {path: '/demo/users/leave', title: '请假列表'}
      ]
   },
   {
      title: '订单管理',
      icon: 'folder-o',
      path: '/demo/orders',
      children: [
         {path: '/demo/orders/index', title: '订单列表'},
         {path: '/demo/orders/balance', title: '余额管理'}
      ]
   },
   {
      title: '数据报表',
      icon: 'folder-o',
      path: '/demo/diningReport',
      children: [
         {path: '/demo/diningReport/index', title: '用餐报表'}
      ]
   },
   {
      title: '信息管理',
      icon: 'folder-o',
      path: '/demo/message',
      children: [
         {path: '/demo/message/index', title: '编辑首页'},
         {path: '/demo/message/help', title: '操作指南'},
         {path: '/demo/message/vestigate', title: '问卷调查'},
         {path: '/demo/message/investigatelist', title: '调查结果'}
      ]
   }
]*/

let menus = JSON.parse(sessionStorage.getItem('menus')) || []

const login = (vm, account, pwd) => {
   return new Promise((resolve, reject) => {
      AccountLogin({account, pwd}).then(async res => {
         // 设置 cookie 一定要存 uuid 和 token 两个 cookie
         // 整个系统依赖这两个数据进行校验和存储
         // uuid 是用户身份唯一标识 用户注册的时候确定 并且不可改变 不可重复
         // token 代表用户当前登录状态 建议在网络请求中携带 token
         // 如有必要 token 需要定时更新，默认保存一天
         util.cookies.set('uuid', res.uuid)
         util.cookies.set('token', res.token)
         // 设置 vuex 用户信息
         await vm.$store.dispatch('d2admin/user/set', {
            name: account
         }, {root: true})
         // 用户登录后从持久化数据加载一系列的设置
         await vm.$store.dispatch('load')
         // 生成菜单
         let parseAccess = (lists, pid) => {
            let access = []
            lists.forEach(item => {
               if (item.pid == pid) {
                  let children = parseAccess(lists, item.id)
                  if (children.length) item.children = children
                  access.push(item)
               }
            })
            return access
         }
         sessionStorage.setItem('menus', JSON.stringify(parseAccess(res.access, 0)))

         // 设置侧边栏菜单
         vm.$store.commit('d2admin/menu/asideSet', parseAccess(res.access, 0))
         // 初始化菜单搜索功能
         vm.$store.commit('d2admin/search/init', parseAccess(res.access, 0))
         // 结束
         resolve()
      }).catch(err => {
         console.log('err: ', err)
         reject(err)
      })
   })
}

export {
   menus,
   login
}
