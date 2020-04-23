import Vue from 'vue'
import 'view-design/dist/styles/iview.css'
import App from './App.vue'
import ViewUI from 'view-design'
// import './index.less'
import '@/assets/mapbox/mapbox-gl.css'

Vue.use(ViewUI)

Vue.prototype.$Message.config({
  top: 50,
  duration: 2
})

new Vue({
  render: h => h(App)
}).$mount('#app')
