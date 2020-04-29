import axios from '../libs/api.request'

/**
 * 获取geojson
 */
export const getGeojson = (params) => {
  return axios.request({
    url: '/v1/shape/geojson',
    method: 'get',
    params: params
  })
}

// 保存geojson
export const saveGeojson = data => {
  return axios.request({
    url: '/v1/style/save',
    method: 'post',
    data: data
  })
}
