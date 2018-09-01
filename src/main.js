import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import contentmenu from 'v-contextmenu'
import 'v-contextmenu/dist/index.css'

Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(contentmenu)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
