import Vue from 'vue'
import 'view-design/dist/styles/iview.css'
import App from './App.vue'
import ViewUI from 'view-design'
import axios from '_libs/axios'
// import VueAxios from 'vue-axios'

// import './index.less'
import '@/assets/mapbox/mapbox-gl.css'

Vue.use(ViewUI)
// Vue.use(VueAxios, axios)
Vue.prototype.$axios = axios // this.$axios.post

Vue.prototype.$Message.config({
  top: 50,
  duration: 2
})

new Vue({
  render: h => h(App)
}).$mount('#app')
