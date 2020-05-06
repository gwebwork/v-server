import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import { Message } from 'element-ui'
import { MessageBox } from 'element-ui'
Vue.prototype.$message=Message
import axios from 'axios'
//请求根路径
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config=>{
  console.log(config);
  config.headers.Authorization=window.sessionStorage.getItem('token');
  return config;
})
Vue.prototype.$http=axios
Vue.prototype.$confirm=MessageBox.confirm

Vue.use(ElementUI);
Vue.config.productionTip = false


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
