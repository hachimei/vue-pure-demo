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

// 查询路径规划
export const getRoutePlan = data => {
  return axios.request({
    url: '/v1/link/pathPlan',
    method: 'post',
    data: data
  })
}

// 获取楼层列表
export const getFloorList = buildId => {
  return axios.request({
    url: '/base/floor/list/' + buildId,
    method: 'get'
  })
}
