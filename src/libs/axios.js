import axios from 'axios'

class HttpRequest {
  constructor (baseUrl) {
    this.baseUrl = baseUrl
    this.queue = {}
  }

  getInsideConfig () {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        // Authorization: 'Basic T1BFTl8zRF9QTEFURk9STTo0NGM3MGUwOWQ0MTY0MjUwYTQ5YzdiNWM0NTBhMmM1Zg=='
      }
    }
    return config
  }

  destroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
    }
  }

  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      if (!Object.keys(this.queue).length) {
      }
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      this.destroy(url)
      const { data, status } = res
      return { data, status }
    }, error => {
      this.destroy(url)
      return Promise.reject(error)
    })
  }

  request (options) {
    if (options.method === 'get' && options.params && typeof options.params !== 'object') {
      options.url += '/' + options.params
      options.params = {}
    }
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }
}
export default HttpRequest
