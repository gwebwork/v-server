import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/Users.vue'
import Roles from './components/power/Roles.vue'
import Rights from './components/power/Rights.vue'
import Cate from './components/goods/Cate.vue'
import Params from './components/params/Params.vue'
Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/login', component: Login },
    { path: '/home', component: Home,redirect:'/welcome',
      children:[
        {path:'/welcome',component:Welcome},
        {path:'/users',component:Users},
        {path:'/rights',component:Rights},
        {path:'/roles',component:Roles},
        {path:'/categories',component:Cate},
        {path:'/params',component:Params}
      ]
  
    },
    { path: '/', redirect: 'login' }
  ]
})

//路有导航守卫，如果没登录强行地址栏访问首页home，直接跳转到登录页
//如果登录了，就可以访问
router.beforeEach((to, from, next) => {
  //to代表要访问的路径，from从哪个路径跳转而来，next表示放行
  if (to.path === '/login') {
    return next(); //如果访问登录页直接放行
  } else { //如果访问其他页面，判断有没有token值，没有直接跳转到登录页，否则直接放行
    const tokenStr = sessionStorage.getItem('token');
    if (!tokenStr) {
      return next('/login');
    } else {
      next();
    }
  }



})

export default router;


