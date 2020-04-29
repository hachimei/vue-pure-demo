<template>
  <div id="map">
    <Drawer
      :title="gjsonItemTitle"
      v-model="editGeojsonItem"
      :mask="false"
      :closable="true"
      :width="'23%'"
    >
      <Form
        v-if="!editPOI"
        :model="formData"
        label-position="right"
        :label-width="70"
      >
        <FormItem label="id">
          <Input v-model="formData.id" disabled></Input>
        </FormItem>
        <FormItem label="名称" v-if="!editWall">
          <Input
            v-model="formData.name"
            :disabled="formData.enableModifyType"
            @on-change="onTextNameChange"
          ></Input>
           </FormItem>
        <!-- <FormItem label="类型">
          <Input v-model="formData.type"></Input>
        </FormItem> -->
        <FormItem label="颜色">
          <ColorPicker
            v-model="formData.color"
            :editable="true"
            @on-change="onColorChange"
          />
        </FormItem>
        <FormItem label="透明度">
          <InputNumber
            v-model="formData.opacity"
            :step="0.01"
            :max="0.9"
            :min="0"
            :disabled="!formData.enableModifyType"
            @on-change="onOpacityChange"
          ></InputNumber>
        </FormItem>
        <FormItem label="高度">
          <InputNumber
            v-model="formData.height"
            :step="0.1"
            :max="100"
            :min="0"
            @on-change="onHeightChange"
          ></InputNumber>
        </FormItem>
        <FormItem label="基底高度">
          <InputNumber
            v-model="formData.baseHeight"
             :step="0.1"
            :max="100"
            :min="0"
            @on-change="onBaseHeightChange"
          ></InputNumber>
        </FormItem>
        <FormItem v-if="formData.type">
          <Checkbox v-model="formData.enableModifyType"  @on-change="onModifyTypeChange" style="fontSize:12px;">将此修改应用至相同类型上</Checkbox>
        </FormItem>
        <FormItem>
          <Button @click="cancelSubmit">取消</Button>
          <Button type="primary" style="margin-left: 18px" @click="submit"
            >确定</Button
          >
        </FormItem>
      </Form>
      <Form v-else :model="formData" label-position="right" :label-width="70">
        <FormItem label="名称" v-if="!editWall">
          <Input
            v-model="formData.name"
            :disabled="formData.enableModifyType"
            @on-change="onTextNameChange"
          ></Input>
           </FormItem>
          <!-- <FormItem label="图标">
          <Input
            v-model="formData.icon"
          ></Input>
        </FormItem> -->
        <FormItem label="文本大小">
           <InputNumber
            :max="30"
            :min="0"
            :step="1"
            v-model="formData.textSize"
            @on-change="onTextSizeChange"
          ></InputNumber>
        </FormItem>
        <FormItem label="文本颜色">
          <ColorPicker
            v-model="formData.textColor"
            :editable="true"
            @on-change="onTextColorChange"
          />
        </FormItem>
        <FormItem label="透明度">
          <InputNumber
            v-model="formData.opacity"
            :step="0.01"
            :max="0.9"
            :min="0"
            :disabled="!formData.enableModifyType"
            @on-change="onOpacityChange"
          ></InputNumber>
        </FormItem>
        <FormItem v-if="formData.type">
          <Checkbox v-model="formData.enableModifyType" @on-change="onModifyTypeChange" style="fontSize:12px;">将此修改应用至相同类型上</Checkbox>
        </FormItem>
        <FormItem>
          <Button @click="cancelSubmit">取消</Button>
          <Button type="primary" style="margin-left: 18px" @click="submit"
            >确定</Button
          >
        </FormItem>
      </Form>
    </Drawer>
  </div>
</template>

<script>
import config from '@/config'
import { getGeojson, saveGeojson } from '@/api'

const { Map, Marker } = window.mapboxgl
const { modelId, buildId } = window
// const { Map, Popup } = window.mapboxgl

export default {
  name: 'mapbox-demo',
  data () {
    return {
      gjsonItemTitle: '',
      source: '',
      baseLayerId: 'Cell_Function',
      wallLayerId: 'Cell_Bound',
      wallLayerHighLightId: 'Cell_Bound_Highlight',
      symbolLayerId: 'POI',
      baseLayerHighlightId: 'Cell_Function_Highlight',
      baseLayerSource: 'Cell_Function_Source',
      wallLayerSource: 'Cell_Bound_Source',
      symbolLayerSource: 'symbolSource',
      editGeojsonItem: false,
      editPOI: false,
      editWall: false,
      isRoutePlan: false,
      isDraw: false,
      points: [], // 路径规则坐标的集合
      /* maskStyle: {
        opacity: 0
      }, */
      formData: { color: '' }, // 表单对象
      oldFormData: {} // 为了取消编辑时能还原至未编辑时的样式
    }
  },
  beforeMount () {
    this.gjsonObj = null
    this.selectedFeature = null
    this.map = null
  },
  beforeDestroy () {
    this.removeMap()
  },
  mounted () {
    // test fectch gjson
    this.fetchGeojson()
    console.log('modelId:' + modelId + ', buildId:' + buildId)
  },
  methods: {
    loadedGeojson () {
      const simple = {
        version: 8,
        name: 'Bright',
        sources: {},
        sprite: config.baseURL + '/static/mb-local/sprites/sprite.json', // 自定义图标 sprite.json@2x.json sprite.json@2x.png
        glyphs:
          config.baseURL + '/static/mb-local/fonts/{fontstack}/{range}.pbf', // 自定义字体
        light: {
          anchor: 'map',
          color: '#ffffff',
          intensity: 0.1
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#FFFFFF'
            },
            interactive: true
          }
        ]
      }

      this.map = new Map({
        // minZoom,maxZoom 范围在 0-24
        // minPitch，maxPitch : 俯仰角 范围在(0-60).
        // interactive : If false , no mouse, touch, or keyboard listeners will be attached to the map, so it will not respond to interaction.
        container: 'map',
        style: simple, // This must be an a JSON object conforming to the schema described in the Mapbox Style Specification , or a URL to such JSON
        center: [113.445616534, 23.166618683], // 经度在先，纬度在后
        zoom: 20, // 初始缩放级别
        pitch: 40, // 地图的初始俯仰角（倾斜度），以距屏幕平面（0-60）的度数为单位，默认是0
        bearing: 20, // 地图的初始方位（旋转），从北方逆时针为正方向，以度为单位，默认是0
        // maxBounds ： 地图将限制在给定范围内
        // trackResize 如果为 true ，则将在调整浏览器窗口大小时自动调整地图大小。
        antialias: true // 如果为 true ，则将使用MSAA抗锯齿创建gl上下文，这对于自定义图层的抗锯齿很有用 默认情况下是false，有性能优化的作用。
      })

      this.map.on('load', this.mapLoaded)
    },
    reloadedGeojsons () {
      this.map.getSource(this.baseLayerSource).setData(this.gjsonObj[this.baseLayerId])
      this.map.getSource(this.symbolLayerSource).setData(this.gjsonObj[this.symbolLayerId])
      this.map.getSource(this.wallLayerSource).setData(this.gjsonObj[this.wallLayerId])
    },
    cancelSubmit () {
      this.editGeojsonItem = false
      if (this.editPOI) {
        this.onTextSizeChange(this.oldFormData.textSize)
        this.onTextColorChange(this.oldFormData.textColor)
        this.onTextNameChange(this.oldFormData.name)
      } else {
        this.onHeightChange(this.oldFormData.height)
        this.onBaseHeightChange(this.oldFormData.baseHeight)
        this.onColorChange(this.oldFormData.color)
      }
    },
    // 获取Geojson数据
    async fetchGeojson () {
      const option = {
        modelId: modelId || 102158797443300,
        buildId: buildId || 100158754713900,
        floorId: 101158754716400
      }
      // const self = this
      try {
        const res = await getGeojson(option)
        console.log('response status' + res.status)
        console.log('response' + res.data)
        this.gjsonObj = res.data
        if (this.map) {
          this.reloadedGeojsons()
        } else {
          this.loadedGeojson()
        }
      } catch (err) {
        console.error('error:' + err)
        this.$Message.error(err)
      }
    },
    // 提交geojson数据
    async fetchSaveGeojson (option) {
      try {
        await saveGeojson(option)
        this.$Message.success('保存成功')
        this.editGeojsonItem = false
        this.fetchGeojson()
      } catch (err) {
        console.error('error:' + err)
        this.$Message.error(err)
      }
    },
    // 获取路径规划
    async getRoute () {
      this.isDraw = false
      this.isRoutePlan = false
      this.map.getCanvas().style.cursor = ''
      const url = 'https://restapi.amap.com/v3/direction/walking'
      const start = this.points[0].map(res => {
        return res.toFixed(5)
      })
      const end = this.points[1].map(res => {
        return res.toFixed(5)
      })
      const params = {
        key: this.key,
        origin: start.join(','),
        destination: end.join(',')
      }
      try {
        const res = await this.$axios.axios.get(url, { params: params })
        this.paths = res.route.paths
        const geojson = {
          type: 'FeatureCollection',
          features: []
        }
        for (let i = 0; i < this.paths.length; i++) {
          const steps = this.paths[i].steps
          for (let j = 0; j < steps.length; j++) {
            const step = steps[j]
            let polyline = step.polyline
            polyline = polyline.split(';')
            polyline = polyline.map(p => {
              return p.split(',').map(Number)
            })
            const feat = {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: polyline
              }
            }
            geojson.features.push(feat)
          }
        }
        this.map.getSource('path').setData(geojson)
      } catch (err) {
        console.error('error:' + err)
        this.$Message.error(err)
      }
    },
    drawPoints () {
      const geojson = {
        type: 'FeatureCollection',
        features: []
      }
      for (let i = 0; i < this.points.length; i++) {
        const type = i === 0 ? '起' : '终'
        const p = this.points[i]
        geojson.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: p
          },
          properties: {
            type: type
          }
        })
      }
      this.map.getSource('points').setData(geojson)
    },
    removeMap () {
      this.map.remove()
      this.map = null
    },
    // 通过 mapbox的api： setFeatureState 设置 FeatureState 可动态更新feature的属性，FeatureState中命名前缀统一用 FS.(FSHeight ... )
    onColorChange (color) {
      this.map.setFeatureState(
        { source: this.selectedFeature.source, id: this.selectedFeature.id },
        { FSColor: color }
      )
    },
    onHeightChange (height) {
      this.map.setFeatureState(
        { source: this.selectedFeature.source, id: this.selectedFeature.id },
        { FSHeight: height }
      )
    },
    onModifyTypeChange (isModify) {
      this.formData.name = isModify ? this.oldFormData.name : this.formData.name
    },
    onBaseHeightChange (height) {
      this.map.setFeatureState(
        { source: this.selectedFeature.source, id: this.selectedFeature.id },
        { FSBaseHeight: height }
      )
    },
    onTextSizeChange (val) {
      for (const item of this.gjsonObj[this.symbolLayerId].features) {
        if (item.id === '' + this.selectedFeature.id) {
          item.properties.textSize = val
          break
        }
      }
      this.map.getSource(this.symbolLayerSource).setData(this.gjsonObj[this.symbolLayerId])
    },
    onTextColorChange (val) {
      this.map.setFeatureState(
        { source: this.selectedFeature.source, id: this.selectedFeature.id },
        { FSTextColor: val }
      )
    },
    onOpacityChange (val) {
      const layerId = this.editPOI ? this.symbolLayerId : this.editWall ? this.wallLayerId : this.baseLayerId
      this.map.setPaintProperty(layerId, 'fill-extrusion-opacity', val)
    },
    onTextNameChange (val) {

    },
    submit () {
      const option = {
        modelId: modelId || 102158797443300,
        buildId: buildId || 100158754713900,
        styleType: this.formData.enableModifyType ? 0 : 1, // 0设施类型样式 1具体数据样式
        layerType: this.editPOI ? this.symbolLayerId : this.editWall ? this.wallLayerId : this.baseLayerId // 图层类型 POI或Cell_Function
      }
      if (this.formData.enableModifyType) {
        option.code = this.formData.type // styleType为0时有值
      } else {
        option.geoId = this.selectedFeature.id // 图形id
      }
      if (this.editPOI) { // 编辑POI
        option.styleJsonBO = {
          textColor: this.formData.textColor,
          textSize: this.formData.textSize,
          opacity: this.formData.opacity,
          name: this.formData.name
          // icon: this.formData.icon
        }
      } else { // 编辑图形样式
        option.styleJsonBO = {
          baseHeight: this.formData.baseHeight,
          height: this.formData.height,
          opacity: this.formData.opacity,
          color: this.formData.color
        }
        if (!this.editWall) {
          option.styleJsonBO.name = this.formData.name
        }
      }
      this.fetchSaveGeojson(option)
    },
    mapLoaded () {
      this.addRoutePlanSourceAndLayer()

      // 添加基本图层
      if (this.gjsonObj[this.baseLayerId]) {
        this.addBaseSourceAndLayer()
      }

      // 添加墙体图层
      if (this.gjsonObj[this.wallLayerId]) {
        this.addWallSourceAndLayer()
      }

      // 添加POI需要的symbol图层
      if (this.gjsonObj[this.symbolLayerId]) {
        this.addPOISourceAndLayer()
      }

      this.map.on('click', this.baseLayerId, this.mapClickHandler)
      this.map.on('click', this.wallLayerId, this.wallClickHandler)
      this.map.on('click', this.symbolLayerId, this.poiClickHandler)

      this.map.resize() // 首次加载地图后resize，否则canvas高度不合适
    },
    addRoutePlanSourceAndLayer () {
      const geojson = {
        type: 'FeatureCollection',
        features: []
      }
      this.map.addSource('path', {
        type: 'geojson',
        data: geojson
      })
      this.map.addSource('points', {
        type: 'geojson',
        data: geojson
      })
      this.map.addLayer({
        id: 'path',
        type: 'line',
        source: 'path',
        paint: {
          'line-color': '#4ddc26',
          'line-width': 5
        }
      })
      this.map.addLayer({
        id: 'points',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-color': [
            'match',
            ['get', 'type'],
            '起', '#62b500',
            '#f54336' // 无匹配值
          ],
          'circle-radius': 13
        }
      })
      this.map.addLayer({
        id: 'label',
        type: 'symbol',
        source: 'points',
        layout: {
          'text-field': ['get', 'type'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      })
    },
    addWallSourceAndLayer () {
      this.map.addSource(this.wallLayerSource, {
        // GeoJSON Data source used in vector tiles, documented at
        // https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d
        type: 'geojson',
        // data: '/static/mb-local/3dMap.json' // 更改geojson后要更改map的center位置！！！！
        // data: '/static/mb-local/demo.json'
        data: this.gjsonObj[this.wallLayerId]
      })

      this.map.addLayer({
        id: this.wallLayerId,
        type: 'fill-extrusion', // 拉伸成3D
        source: this.wallLayerSource,
        paint: {
          // See the Mapbox Style Specification for details on data expressions.
          // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions

          // Get the fill-extrusion-color from the source 'color' property.
          'fill-extrusion-color': [
            'match',
            ['to-string', ['feature-state', 'FSColor']], // 用to-string作判空处理
            '',
            ['to-string', ['get', 'color']],
            ['to-string', ['feature-state', 'FSColor']]
          ],

          // Get fill-extrusion-height from the source 'height' property.
          'fill-extrusion-height': [
            'match',
            ['to-string', ['feature-state', 'FSHeight']], // 用to-string作判空处理
            '',
            ['to-number', ['match', ['get', 'Height'], 0, 5, ['get', 'Height']]],
            ['to-number', ['feature-state', 'FSHeight']]
          ],

          // Get fill-extrusion-base from the source 'base_height' property.
          // 'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-base': [
            'match',
            ['to-string', ['feature-state', 'FSBaseHeight']], // 用to-string作判空处理
            '',
            ['to-number', ['get', 'BaseHeight']],
            ['to-number', ['feature-state', 'FSBaseHeight']]
          ],

          // Make extrusions slightly opaque for see through indoor walls.
          'fill-extrusion-opacity': 0.8
        }
      })

      this.map.addLayer({
        id: this.wallLayerHighLightId,
        type: 'fill-extrusion',
        source: this.wallLayerSource,
        filter: ['==', 'ID', ''],
        paint: {
          // See the Mapbox Style Specification for details on data expressions.
          // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions

          // Get the fill-extrusion-color from the source 'color' property.
          'fill-extrusion-color': [
            'match',
            ['to-string', ['feature-state', 'FSColor']], // 用to-string作判空处理
            '',
            ['to-string', ['get', 'color']],
            ['to-string', ['feature-state', 'FSColor']]
          ],

          // Get fill-extrusion-height from the source 'height' property.
          'fill-extrusion-height': [
            'match',
            ['to-string', ['feature-state', 'FSHeight']], // 用to-string作判空处理
            '',
            ['to-number', ['match', ['get', 'Height'], 0, 5, ['get', 'Height']]],
            ['to-number', ['feature-state', 'FSHeight']]
          ],

          // Get fill-extrusion-base from the source 'base_height' property.
          // 'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-base': [
            'match',
            ['to-string', ['feature-state', 'FSBaseHeight']], // 用to-string作判空处理
            '',
            ['to-number', ['get', 'BaseHeight']],
            ['to-number', ['feature-state', 'FSBaseHeight']]
          ],

          // Make extrusions slightly opaque for see through indoor walls.
          'fill-extrusion-opacity': 1
        }
      })
    },
    // 添加POI需要的symbol图层
    addPOISourceAndLayer () {
      this.map.addSource(this.symbolLayerSource, {
        type: 'geojson',
        data: this.gjsonObj[this.symbolLayerId]
        // data: '/static/mb-local/symbol-demo.json' // 更改geojson后要更改map的center位置！！！！
      })

      this.map.addLayer({
        id: this.symbolLayerId,
        type: 'symbol',
        source: this.symbolLayerSource,
        layout: { // "feature-state" data expressions are not supported with layout properties.
          'symbol-placement': 'point',
          // 'icon-size': 2,
          // 'icon-image': 'marker-11',
          // 'icon-image': '{icon}-11',
          // 'icon-allow-overlap': true,
          'text-font': ['hwxk'],
          'text-field': '{Name}',
          'text-size': ['get', 'textSize'],
          // 'text-size': [
          //   'match',
          //   ['to-string', ['feature-state', 'FSTextSize']], // 用to-string作判空处理
          //   '',
          //   ['to-string', ['get', 'textSize']],
          //   ['to-string', ['feature-state', 'FSTextSize']]
          // ]
          // 'text-size': ['interpolate', ['linear'], ['zoom'], 15, 12, 16, 12, 17, 12, 18, 12, 19, 12, 20, 12, 21, 12, 22, 12]
          // 'text-transform': 'uppercase',
          // 'text-letter-spacing': 0.05,
          'text-offset': [0, 0],
          'text-anchor': 'center'
        },
        paint: {
          // 'icon-color': 'yellow', // 无效？
          'text-color': [
            'match',
            ['to-string', ['feature-state', 'FSTextColor']], // 用to-string作判空处理
            '',
            ['to-string', ['get', 'textColor']],
            ['to-string', ['feature-state', 'FSTextColor']]
          ]
        }
      })
    },
    // 添加基本图层
    addBaseSourceAndLayer () {
      this.map.addSource(this.baseLayerSource, {
        // GeoJSON Data source used in vector tiles, documented at
        // https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d
        type: 'geojson',
        // data: '/static/mb-local/3dMap.json' // 更改geojson后要更改map的center位置！！！！
        // data: '/static/mb-local/demo.json'
        data: this.gjsonObj[this.baseLayerId]
      })

      this.map.addLayer({
        id: this.baseLayerId,
        type: 'fill-extrusion', // 拉伸成3D
        source: this.baseLayerSource,
        paint: {
          // See the Mapbox Style Specification for details on data expressions.
          // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions

          // Get the fill-extrusion-color from the source 'color' property.
          'fill-extrusion-color': [
            'match',
            ['to-string', ['feature-state', 'FSColor']], // 用to-string作判空处理
            '',
            ['to-string', ['get', 'color']],
            ['to-string', ['feature-state', 'FSColor']]
          ],

          // Get fill-extrusion-height from the source 'height' property.
          'fill-extrusion-height': [
            'match',
            ['to-string', ['feature-state', 'FSHeight']], // 用to-string作判空处理
            '',
            ['to-number', ['get', 'Height']],
            ['to-number', ['feature-state', 'FSHeight']]
          ],

          // Get fill-extrusion-base from the source 'base_height' property.
          // 'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-base': [
            'match',
            ['to-string', ['feature-state', 'FSBaseHeight']], // 用to-string作判空处理
            '',
            ['to-number', ['get', 'BaseHeight']],
            ['to-number', ['feature-state', 'FSBaseHeight']]
          ],

          // Make extrusions slightly opaque for see through indoor walls. it is not data-driven,must be constant
          'fill-extrusion-opacity': 0.5
        }
      })

      this.map.addLayer({
        id: this.baseLayerHighlightId,
        type: 'fill-extrusion',
        source: this.baseLayerSource,
        filter: ['==', 'ID', ''],
        paint: {
          // See the Mapbox Style Specification for details on data expressions.
          // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions

          // Get the fill-extrusion-color from the source 'color' property.
          'fill-extrusion-color': [
            'match',
            ['to-string', ['feature-state', 'FSColor']], // 用to-string作判空处理
            '',
            ['to-string', ['get', 'color']],
            ['to-string', ['feature-state', 'FSColor']]
          ],

          // Get fill-extrusion-height from the source 'height' property.
          'fill-extrusion-height': [
            'match',
            ['to-string', ['feature-state', 'FSHeight']], // 用to-string作判空处理
            '',
            ['to-number', ['get', 'Height']],
            ['to-number', ['feature-state', 'FSHeight']]
          ],

          // Get fill-extrusion-base from the source 'base_height' property.
          // 'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-base': [
            'match',
            ['to-string', ['feature-state', 'FSBaseHeight']], // 用to-string作判空处理
            '',
            ['to-number', ['get', 'BaseHeight']],
            ['to-number', ['feature-state', 'FSBaseHeight']]
          ],

          // Make extrusions slightly opaque for see through indoor walls.
          'fill-extrusion-opacity': 1
        }
      })
    },
    createMarker () {
      // create a HTML element for each feature
      const el = document.createElement('div')
      el.className = 'marker'

      // make a marker for each feature and add to the map
      return new Marker(el)
    },
    poiClickHandler (e) {
      const feature = e.features[0]
      if (!feature) return

      console.log('poi feature formdata ')
      this.selectedFeature = feature
      const item = feature.properties
      this.gjsonItemTitle = 'POI编辑-' + item.Name
      this.formData = {
        // icon: item.icon,
        name: item.Name,
        type: item.Type,
        opacity: item.opacity,
        textColor: item.textColor,
        textSize: item.textSize
      }
      // 为了取消编辑时能还原至未编辑时的样式
      this.oldFormData = Object.assign({}, this.formData)
      // this.map.setFilter(this.baseLayerHighlightId, ['==', 'ID', item.ID])

      // this.createMarker()
      //   .setLngLat(e.lngLat)
      //   .addTo(this.map)

      /* let popup = new Popup({
        closeButton: false
      })
      popup
        .setLngLat(e.lngLat)
        .setText(feature.properties.name)
        .addTo(this.map) */

      this.editGeojsonItem = this.editPOI = true
      this.editWall = false
    },
    wallClickHandler (e) {
      const feature = e.features[0]
      if (!feature) return

      console.log('feature formdata ')
      this.selectedFeature = feature
      const item = feature.properties
      this.gjsonItemTitle = '编辑-' + item.Name
      this.formData = {
        id: item.ID,
        // name: item.Name, // 暂时不允许修改名称
        color: item.color,
        opacity: item.opacity,
        type: item.Type,
        height: item.Height,
        baseHeight: item.BaseHeight
      }
      this.map.setFilter(this.baseLayerHighlightId, ['==', 'ID', item.ID])
      this.map.setFilter(this.wallLayerHighLightId, ['==', 'ID', item.ID])

      // 为了取消编辑时能还原至未编辑时的样式
      this.oldFormData = Object.assign({}, this.formData)

      // this.createMarker()
      //   .setLngLat(e.lngLat)
      //   .addTo(this.map)

      /* let popup = new Popup({
        closeButton: false
      })
      popup
        .setLngLat(e.lngLat)
        .setText(feature.properties.name)
        .addTo(this.map) */

      this.editGeojsonItem = this.editWall = true
      this.editPOI = false
    },
    mapClickHandler (e) {
      if (this.isRoutePlan) { // 路径规划
        this.mapClickForRouteHandler(e)
        return
      }

      const feature = e.features[0]
      if (!feature) return

      console.log('feature formdata ')
      this.selectedFeature = feature
      const item = feature.properties
      this.gjsonItemTitle = '编辑-' + item.Name
      this.formData = {
        id: item.ID,
        name: item.Name,
        color: item.color,
        opacity: item.opacity,
        type: item.Type,
        height: item.Height,
        baseHeight: item.BaseHeight
      }
      this.map.setFilter(this.baseLayerHighlightId, ['==', 'ID', item.ID])
      this.map.setFilter(this.wallLayerHighLightId, ['==', 'ID', item.ID])

      // 为了取消编辑时能还原至未编辑时的样式
      this.oldFormData = Object.assign({}, this.formData)

      // this.createMarker()
      //   .setLngLat(e.lngLat)
      //   .addTo(this.map)

      /* let popup = new Popup({
        closeButton: false
      })
      popup
        .setLngLat(e.lngLat)
        .setText(feature.properties.name)
        .addTo(this.map) */

      this.editGeojsonItem = true
      this.editPOI = this.editWall = false
    },
    mapClickForRouteHandler (e) {
      const lngLat = e.lngLat
      this.points.push([lngLat.lng, lngLat.lat])
      this.drawPoints()
      if (this.points.length === 2) {
        this.getRoute()
      }
    },
    startRoutePlan () {
      this.isDraw = true
      this.points = []
      this.map.getCanvas().style.cursor = 'crosshair'
      const geojson = {
        type: 'FeatureCollection',
        features: []
      }
      this.map.getSource('path').setData(geojson)
      this.map.getSource('points').setData(geojson)
    }
  }
}
</script>

<style lang="less" scoped>
#map {
  position: relative;
  padding: 18px;
  height: 100%;
}
</style>
