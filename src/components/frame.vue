<template>
    <canvas 
        class="frame-canvas" 
        :id="entity[0]"
        :style="{
            width: width + 'px'
        }"
        height="20"
        :width="width"
        ref="canvas"
        @mousemove="mousemove"
        @mouseout="mouseout"
        @dblclick="addKeyFrame"
    ></canvas>
</template>
<script>
function drawArrow(ctx, fromX, fromY, toX, toY, theta, headlen, width, color) {
  theta = typeof theta != "undefined" ? theta : 30;
  headlen = typeof theta != "undefined" ? headlen : 10;
  width = typeof width != "undefined" ? width : 1;
  color = typeof color != "color" ? color : "#000"; 
  // 计算各角度和对应的P2,P3坐标
  var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
    angle1 = (angle + theta) * Math.PI / 180,
    angle2 = (angle - theta) * Math.PI / 180,
    topX = headlen * Math.cos(angle1),
    topY = headlen * Math.sin(angle1),
    botX = headlen * Math.cos(angle2),
    botY = headlen * Math.sin(angle2);
  ctx.save();
  ctx.beginPath();
  var arrowX = fromX - topX,
    arrowY = fromY - topY;
  ctx.moveTo(arrowX, arrowY);
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  arrowX = toX + topX;
  arrowY = toY + topY;
  ctx.moveTo(arrowX, arrowY);
  ctx.lineTo(toX, toY);
  arrowX = toX + botX;
  arrowY = toY + botY;
  ctx.lineTo(arrowX, arrowY);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.restore();
}

export default {
  name: "frame",
  props: ["entity", "maxFrame"],
  data() {
    return {
      ctx: null,
      frameWidth: 10,
      lastHover: 0
    };
  },
  computed: {
    value() {
      return this.entity[1];
    },
    width() {
      return this.maxFrame * this.frameWidth;
    }
  },
  methods: {
    mouseout() {
      let ctx = this.ctx;
      ctx.clearRect(this.lastHover, 0, this.frameWidth - 1, 20);
      this.renderFrame(this.lastHover);
      this.lastHover = 0;
    },
    addKeyFrame() {
      let e = event;
      let x = e.offsetX;
      let frame = Math.floor(x / this.frameWidth);
      let ctx = this.ctx;
      ctx.beginPath();
      ctx.arc(frame * this.frameWidth + 5, 10, 3, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fillStyle = "#999";
      ctx.fill();
      // 创建关键帧
      this.value.frames[frame] = {
        property: {
          x: this.value.x,
          y: this.value.y
        },
        next: null
      };
      console.log(frame);
    },
    mousemove() {
      let e = event;
      let x = e.offsetX;
      let y = e.offsetY;
      let ctx = this.ctx;
      if (y < 20) {
        ctx.clearRect(this.lastHover, 0, this.frameWidth - 1, 20);
        this.renderFrame(this.lastHover);
        let offset = Math.floor(x / this.frameWidth) * this.frameWidth;
        this.renderRect(offset, "#e3e3e3");
        this.lastHover = offset;
        this.renderFrame(offset);
      }
    },
    renderRect(offset, color) {
      let ctx = this.ctx;
      ctx.fillStyle = color;
      ctx.fillRect(offset, 0, this.frameWidth - 1, 20);
    },
    renderFrame(offset) {
      let frame = parseInt(offset / this.frameWidth);
      let keys = Object.keys(this.value.frames).map(key=>Number(key));
      let ctx = this.ctx;
      // 排序
      keys.sort();
      if (keys.indexOf(frame) >= 0) {

        // 说明是关键帧,画上关键帧标记
        ctx.beginPath();
        ctx.arc(frame * this.frameWidth + 5, 10, 3, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = "#999";
        ctx.fill();
      } else {
        // 说明不是关键帧
        // 检查是否是补间帧
        let pre = -1;
        let next = -1;
        for (let key of keys) {
          if (frame > key) {
            pre = key;
          } else if (frame < key) {
            // 不可能出现等于因为上面过滤掉了
            next = key;
            break;
          }
        }
        if (pre >= 0 && next >= 0) {
          // 是补间
          if (Number(next) === Number(frame) + 1) {
            // 下一帧是关键帧
            drawArrow(ctx, offset, 10, this.frameWidth + offset, 10, 30, 5, 1, '#999')
          } else {
            ctx.fillStyle = "#999";
            ctx.fillRect(offset, 10, this.frameWidth, 1);
          }
        }
      }
    }
  },
  mounted() {
    let canvas = this.$refs.canvas;
    let ctx = (this.ctx = canvas.getContext("2d"));
    // 需要绘制 max frame个三角形
    for (let i = 0; i < this.maxFrame; i++) {
      let offset = (i + 1) * this.frameWidth;
      ctx.fillStyle = "#e3e3e3";
      ctx.fillRect(offset - 1, 0, 1, 20);
      this.renderFrame(i * this.frameWidth);
    }
  }
};
</script>
<style lang="less">
canvas.frame-canvas {
  height: 20px;
  background: #fff;
  border-bottom: 1px solid #bbb;
}
</style>


