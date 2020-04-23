<template>
  <div id="map">
    <Drawer
      :title="gjsonItemTitle"
      v-model="editGeojsonItem"
      :mask="false"
      :closable="true"
      :width="'23%'"
    >
      <Form :model="formData" label-position="right" :label-width="70">
        <FormItem label="id">
          <Input v-model="formData.id"></Input>
        </FormItem>
        <FormItem label="类型">
          <Input v-model="formData.type"></Input>
        </FormItem>
        <FormItem label="颜色">
          <ColorPicker v-model="formData.color" :editable="true"  @on-change="onColorChange" />
        </FormItem>
        <FormItem label="高度">
          <InputNumber
            v-model="formData.height"
            :max="500"
            :min="0"
            @on-change="onHeightChange"
          ></InputNumber>
        </FormItem>
        <FormItem label="基底高度">
          <InputNumber
            v-model="formData.baseHeight"
            :max="500"
            :min="0"
            @on-change="onBaseHeightChange"
          ></InputNumber>
        </FormItem>
        <FormItem>
          <Button @click="editGeojsonItem = false">取消</Button>
          <Button type="primary" style="margin-left: 18px" @click="submit"
            >确定</Button
          >
        </FormItem>
      </Form>
    </Drawer>
  </div>
</template>

<script>
const { Map } = window.mapboxgl

export default {
  name: 'device-factory',
  data () {
    return {
      gjsonItemTitle: '',
      source: '',
      baseLayerId: 'baseLayerId',
      editGeojsonItem: false,
      /* maskStyle: {
        opacity: 0
      }, */
      formData: {
        id: '',
        type: '',
        color: '',
        height: 0,
        baseHeight: 0
      }
    }
  },
  beforeMount () {
    this.selectedFeature = null
    this.map = null
    this.source = 'gjsonSource'
  },
  mounted () {
    const simple = {
      version: 8,
      name: 'Bright',
      sources: {},
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
      center: [-87.61694, 41.86625], // 经度在先，纬度在后
      zoom: 17, // 初始缩放级别
      pitch: 40, // 地图的初始俯仰角（倾斜度），以距屏幕平面（0-60）的度数为单位，默认是0
      bearing: 20, // 地图的初始方位（旋转），从北方逆时针为正方向，以度为单位，默认是0
      // maxBounds ： 地图将限制在给定范围内
      // trackResize 如果为 true ，则将在调整浏览器窗口大小时自动调整地图大小。
      antialias: true // 如果为 true ，则将使用MSAA抗锯齿创建gl上下文，这对于自定义图层的抗锯齿很有用 默认情况下是false，有性能优化的作用。
    })

    this.map.on('load', this.mapLoaded)
  },
  methods: {
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
    onBaseHeightChange (height) {
      this.map.setFeatureState(
        { source: this.selectedFeature.source, id: this.selectedFeature.id },
        { FSBaseHeight: height }
      )
    },
    submit () {
      // this.selectedFeature.properties = { id: formData.id, color: formData.color, type: formData.type, height: formData.height, base_height: formData.baseHeight }
    },
    mapLoaded () {
      this.map.addSource(this.source, {
        // GeoJSON Data source used in vector tiles, documented at
        // https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d
        type: 'geojson',
        data: '/static/mb-local/3dMap.json'
      })
      this.map.addLayer({
        id: this.baseLayerId,
        type: 'fill-extrusion', // 拉伸成3D
        source: this.source,
        sprite: '/static/mb-local/sprites/sprite.json',
        glyphs: '/static/mb-local/fonts/hwxk/{fontstack}/{range}.pbf',
        paint: {
          // See the Mapbox Style Specification for details on data expressions.
          // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions

          // Get the fill-extrusion-color from the source 'color' property.
          'fill-extrusion-color': [
            'match',
            ['to-string', ['feature-state', 'FSColor']], // 用to-string作判空处理
            '', ['to-string', ['get', 'color']],
            ['to-string', ['feature-state', 'FSColor']]
          ],

          // Get fill-extrusion-height from the source 'height' property.
          'fill-extrusion-height': [
            'match',
            ['to-string', ['feature-state', 'FSHeight']], // 用to-string作判空处理
            '', ['to-number', ['get', 'height']],
            ['to-number', ['feature-state', 'FSHeight']]
          ],

          // Get fill-extrusion-base from the source 'base_height' property.
          // 'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-base': [
            'match',
            ['to-string', ['feature-state', 'FSBaseHeight']], // 用to-string作判空处理
            '', ['to-number', ['get', 'base_height']],
            ['to-number', ['feature-state', 'FSBaseHeight']]
          ],

          // Make extrusions slightly opaque for see through indoor walls.
          'fill-extrusion-opacity': 0.5
        }
      })

      this.map.addLayer({
        id: 'pointlayerhighlight',
        type: 'fill-extrusion',
        source: this.source,
        sprite: '/static/mb-local/sprites/sprite.json',
        glyphs: '/static/mb-local/fonts/hwxk/{fontstack}/{range}.pbf',
        filter: ['==', 'name', ''],
        paint: {
          // See the Mapbox Style Specification for details on data expressions.
          // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions

          // Get the fill-extrusion-color from the source 'color' property.
          'fill-extrusion-color': [
            'match',
            ['to-string', ['feature-state', 'FSColor']], // 用to-string作判空处理
            '', ['to-string', ['get', 'color']],
            ['to-string', ['feature-state', 'FSColor']]
          ],

          // Get fill-extrusion-height from the source 'height' property.
          'fill-extrusion-height': [
            'match',
            ['to-string', ['feature-state', 'FSHeight']], // 用to-string作判空处理
            '', ['to-number', ['get', 'height']],
            ['to-number', ['feature-state', 'FSHeight']]
          ],

          // Get fill-extrusion-base from the source 'base_height' property.
          // 'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-base': [
            'match',
            ['to-string', ['feature-state', 'FSBaseHeight']], // 用to-string作判空处理
            '', ['to-number', ['get', 'base_height']],
            ['to-number', ['feature-state', 'FSBaseHeight']]
          ],

          // Make extrusions slightly opaque for see through indoor walls.
          'fill-extrusion-opacity': 1
        }
      })

      this.map.on('click', this.baseLayerId, this.mapClickHandler)

      this.map.resize() // 首次加载地图后resize，否则canvas高度不合适
    },
    mapClickHandler (e) {
      const feature = e.features[0]
      if (!feature) return

      console.log('feature formdata ')
      this.selectedFeature = feature
      const item = feature.properties
      this.gjsonItemTitle = item.name
      this.formData = {
        id: item.id,
        color: item.color,
        type: item.type,
        height: item.height,
        baseHeight: item.base_height
      }
      this.map.setFilter('pointlayerhighlight', ['in', 'name', item.name])

      /* let popup = new Popup({
        closeButton: false
      })
      popup
        .setLngLat(e.lngLat)
        .setText(feature.properties.name)
        .addTo(this.map) */

      if (!this.editGeojsonItem) {
        this.editGeojsonItem = true
      }
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
