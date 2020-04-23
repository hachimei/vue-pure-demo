<template>
  <div id="app" ref="app">
    <demo />
  </div>
</template>
<script>
import demo from '_c/mapbox-demo'

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
</style>
