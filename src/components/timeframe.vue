<template>
  <div>
    <canvas
      class="frame-canvas"
      :style="{
        width: width + 'px'
      }"
      :width="width"
      height="20"
      ref="canvas"
      @mousedown="startChoose"
      @mousemove="movePlay"
      @mouseout="stopChoose"
      @mouseup="stopChoose"
    ></canvas>
    <!--@click="chooseCurrent"-->
    <div class="box" :style="{
      left: current * 10 + 'px'
    }">
      <div class="box-icon"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'timeframe',
    props: ['current', 'frames'],
    data () {
      return {
        ctx: null,
        frameWidth: 10,
        downtime: null
      }
    },
    computed: {
      width () {
        return this.frames * this.frameWidth;
      }
    },
    methods: {
      startChoose () {
        this.downtime = new Date().getTime()
      },
      movePlay () {
        if (this.downtime) {
          this.chooseCurrent()
        }
      },
      stopChoose () {
        if (new Date().getTime() - this.downtime <= 120) {
          this.chooseCurrent();
        } else {
          // do nothing
        }
        this.downtime = null;
      },
      chooseCurrent () {
        let x = event.clientX;
        let y = event.clientY;
        let frame = parseInt(event.offsetX / this.frameWidth);
        this.$emit('time-change', frame);
      }
    },
    mounted () {
      let canvas = this.$refs.canvas;
      let ctx = (this.ctx = canvas.getContext('2d'));
      // 需要绘制 max frame个三角形
      for (let i = 0; i < this.frames; i++) {
        let offset = (i + 1) * this.frameWidth;
        ctx.fillStyle = '#e3e3e3';
        ctx.fillRect(offset - 1, 0, 1, 20);
      }
    }
  }

</script>

<style scoped lang="less">
  .frame-canvas {
    height: 19px;
    background: #fff;

  }

  .box {
    width: 10px;
    height: 9999px;
    position: absolute;
    pointer-events: none;
    top: 0;
    .box-icon {
      height: 20px;
      background: #555;
    }
    .line {
      left: 4px;
      width: 2px;
      background: #555;
      height: 100%;
      position: absolute;
    }
  }
</style>
