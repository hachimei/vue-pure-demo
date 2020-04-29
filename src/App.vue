<template>
  <div id="app" ref="app">
    <demo />
  </div>
</template>
<script>
import demo from '_c/map/mapbox-demo'

export default {
  components: { demo },
  data () {
    return {}
  },
  mounted () {
  }
}
</script>
<style lang="less">
  .size {
    width: 100%;
    height: 100%;
  }

  html, body {
    .size;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }

  #app {
    .size;
  }

  .marker {
  background-image: url('./assets/mapbox/img/map_icon.jpg');
  background-size: cover;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
}
</style>
