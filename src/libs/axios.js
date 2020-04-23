import axios from 'axios'
import config from '@/config/index'

axios.defaults.baseURL = config.baseURL
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('x-auth-token')
    if (token) { // 判断是否存在token，如果存在的话，则每个http header都加上token
      config.headers.token = token
    }
    if (config.url.indexOf(config.baseURL) === -1) {
      config.url = config.baseURL + config.url // 拼接完整请求路径
    }
    return config
  },
  err => {
    return Promise.reject(err)
  })
// http://192.168.10.78:8080/v1/shape/geojson?modelId=102158760782400&buildId=100158754713900&floorId=101158754716400

export default { axios }
