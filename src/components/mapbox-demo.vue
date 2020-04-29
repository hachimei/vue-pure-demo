<template>
  <div id="map" ref="map"></div>
</template>

<script>
import IndoorMap from '../libs/indoorMap/indoorMap'
const Stats = window.Stats

export default {
  name: 'demo',
  data () {
    return {}
  },
  beforeMount () {
    this.map = null
  },
  mounted () {
    const params = {
      //, dim:"2d"
    }
    this.map = IndoorMap(params)
    this.map.load('/static/Indoor3D/data/testMapData.json', this.mapLoaded)
  },
  methods: {
    mapLoaded () {
      this.map.showFloor(1)
      this.map.setSelectable(false)
      this.map.showPubPoints(true)
      this.map.setSelectable(true)

      var ul = IndoorMap.getUI(this.map)
      this.$refs.map.appendChild(ul)

      this.stats = new Stats()
      this.stats.domElement.style.position = 'absolute'
      this.stats.domElement.style.top = '0px'
      document.body.appendChild(this.stats.domElement)
      this.animate()
    },
    animate () {
      requestAnimationFrame(this.animate)
      this.stats.update()
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
