<template>
  <div>
    <img class="entity-item"
         :src="src"
         :style="style"
    />
    <div class="real-item" :style="styleWithoutOrigin">

    </div>
  </div>
</template>

<script>

  export default {
    name: 'entity',
    data () {
      return {
        tween: null,
        frame: -1,
        next: -1,
        pre: -1,
        pos: {
          x: 0,
          y: 0,
        }
      }
    },
    props: [
      'value',
      'now'
    ],
    methods: {
      buildCompatible (key, value) {
        return {
          ['-ms-' + key]: value,
          ['-webkit-' + key]: value,
          ['-o-' + key]: value,
          ['-moz-' + key]: value,
          [key]: value,
        }
      }
    },
    computed: {
      styleWithoutOrigin () {
        let transform = `translate(${this.value.x}px,${this.value.y}px)`;
        return {
          width: this.value.width * this.value.scale + 'px',
          height: this.value.height * this.value.scale + 'px',
          top: 0,//this.y + 'px',
          left: 0,//this.x + 'px',
          opacity: 1,
          zIndex: this.index,
          ...this.buildCompatible('transform', transform),
        }
      },
      style () {
        return {
          width: this.value.width * this.value.scale + 'px',
          height: this.value.height * this.value.scale + 'px',
          top: 0,//this.y + 'px',
          left: 0,//this.x + 'px',
          zIndex: this.index,
          opacity: 1,
          ...this.buildCompatible('transformOrigin', this.value.transformOrigin),
          ...this.transform
        }
      },
      x () {
        return this.value.x
      },
      y () {
        return this.value.y
      },
      index () {
        return this.value.index
      },
      src () {
        return this.value.src
      },
      transform () {
        let transform = '';
        transform += ` translate(${this.value.x}px,${this.value.y}px)`;
        if (this.value.rotation!==0) {
          transform += ` rotate(${this.value.rotation}deg)`;
        }
        return {
          ...this.buildCompatible('transform', transform)
        }
      }
    }
  }
</script>
<style lang="less">

  .active .real-item {
    border: 1px solid #657ad7;
    position: absolute;
  }
</style>
<style scoped lang="less">
  .entity-item {
    position: absolute;
    // pointer-events: none;
  }
</style>
