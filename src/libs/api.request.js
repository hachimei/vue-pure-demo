import HttpRequest from './axios'
import config from '../config'

const axios = new HttpRequest(config.baseURL)
export default axios
