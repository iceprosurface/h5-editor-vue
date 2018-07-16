<template>
    <div>
        <img class="entity-item" 
            :src="src" 
            :style="styles"
        />
    </div>
</template>

<script>

export default {
  name: 'entity',
  data () {
      return {
      }
  },
  props:[
      'x',
      'y',
      'src',
  ],
  computed: {
      styles () {
          return {
              top: this.y + 'px',
              left: this.x + 'px'
          }
      }
  }

}
</script>

<style scoped lang="less">
.entity-item {
    position: absolute;
    // pointer-events: none;
}
</style>
