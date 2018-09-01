<template>
  <div>
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
      v-contextmenu:contextmenu
    ></canvas>
    <v-contextmenu ref="contextmenu" @contextmenu="showMenu">
      <v-contextmenu-item @click="createKeyFrame" v-if="!menusProperty.isKeyFrame">创建关键帧</v-contextmenu-item>
      <v-contextmenu-item @click="delKeyFrame" v-else="!menusProperty.isKeyFrame">删除关键帧</v-contextmenu-item>
      <v-contextmenu-item @click="createTween" v-if="!menusProperty.isTween">创建补间动画</v-contextmenu-item>
      <v-contextmenu-item @click="delTween" v-else="!menusProperty.isTween">删除补间动画</v-contextmenu-item>
    </v-contextmenu>
  </div>
</template>
<script>
  function drawArrow (ctx, fromX, fromY, toX, toY, theta, headlen, width, color) {
    theta = typeof theta != 'undefined' ? theta : 30;
    headlen = typeof theta != 'undefined' ? headlen : 10;
    width = typeof width != 'undefined' ? width : 1;
    color = typeof color != 'color' ? color : '#000';
    // 计算各角度和对应的P2,P3坐标
    var angle  = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
        angle1 = (angle + theta) * Math.PI / 180,
        angle2 = (angle - theta) * Math.PI / 180,
        topX   = headlen * Math.cos(angle1),
        topY   = headlen * Math.sin(angle1),
        botX   = headlen * Math.cos(angle2),
        botY   = headlen * Math.sin(angle2);
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
    name: 'frame',
    props: ['entity', 'maxFrame'],
    data () {
      return {
        ctx: null,
        frameWidth: 10,
        lastHover: 0,
        menusProperty: {
          isKeyFrame: false,
          isTween: false
        },
        contextmenu: {
          x: 0,
          y: 0,
          event: {
            clientX: 0,
            clientY: 0,
            pageX: 0,
            pageY: 0,
            offsetX: 0,
            offsetY: 0
          },
          frame: -1,
          next: -1,
          pre: -1
        }
      };
    },
    computed: {
      value () {
        return this.entity[1];
      },
      width () {
        return this.maxFrame * this.frameWidth;
      }
    },
    methods: {
      frameSet (index, key, value) {
        this.$set(this.entity[1].frames, index, {
          ...this.value.frames[index],
          key: value,
        })
      },
      frameSetAll (index, value) {
        this.$set(this.entity[1].frames, index, {
          ...this.value.frames[index],
          ...value
        })
      },
      delTween () {
        let next = this.contextmenu.next;
        let pre = this.contextmenu.pre;
        this.frameSet(pre, 'next', null)
        this.value.frames[pre].next = null;
        this.reRender(pre, next);
      },
      reRender (pre, next) {
        let ctx = this.ctx
        // 渲染补间动画
        for (let i = pre; i < next + 1; i++) {
          let offset = i * this.frameWidth;
          ctx.clearRect(offset, 0, this.frameWidth - 1, 20);
          ctx.fillStyle = '#e3e3e3';
          ctx.fillRect(offset - 1, 0, 1, 20);
          this.renderFrame(i * this.frameWidth);
        }
      },
      delKeyFrame () {
        let frame = this.contextmenu.frame;
        let next = this.contextmenu.next;
        let pre = this.contextmenu.pre;
        delete this.value.frames[frame];
        this.value.frames = {
          ...this.value.frames
        }
        this.reRender(pre, next);
      },
      createTween () {
        let ctx = this.ctx
        let next = this.contextmenu.next
        let pre = this.contextmenu.pre
        // 查找到两项，检查两帧是否存在关键帧
        if (pre >= 0 && next >= 0) {
          // 是补间,并创建补间动画
          let preFrame = this.value.frames[pre];
          preFrame.next = next
        }
        this.reRender(pre, next);
      },
      createKeyFrame () {
        this.addKeyFrame(this.contextmenu.event);
      },
      showMenu () {
        let x = event.clientX;
        let y = event.clientY;
        this.contextmenu = {
          ...this.contextmenu,
          x,
          y,
          event:
            {
              clientX: event.clientX,
              clientY: event.clientY,
              offsetX: event.offsetX,
              offsetY: event.offsetY,
              pageX: event.pageX,
              pageY: event.pageY,
            }
        }
        ;
        let frame = this.contextmenu.frame = parseInt(this.contextmenu.event.offsetX / this.frameWidth);
        // 首先查找上下两个端点是否存在补间动画
        let keys = Object.keys(this.value.frames).map(key => Number(key));
        keys.sort((a,b) => a-b);
        let pre = -1;
        let next = -1;
        for (let key of keys) {
          if (frame > key) {
            pre = key;
          } else if (frame <= key) {
            // 不可能出现等于因为上面过滤掉了
            next = key;
            break;
          }
        }
        this.menusProperty.isKeyFrame = Boolean(this.value.frames[frame]);
        let hasNext = this.value.frames[pre] && this.value.frames[pre].next;
        this.menusProperty.isTween = Boolean(hasNext);
        this.contextmenu.next = next
        this.contextmenu.pre = pre
      },
      mouseout () {
        let ctx = this.ctx;
        ctx.clearRect(this.lastHover, 0, this.frameWidth - 1, 20);
        this.renderFrame(this.lastHover);
        this.lastHover = 0;
      },
      addKeyFrame (arg) {
        let e = arg || event;
        let x = e.offsetX;
        let frame = Math.floor(x / this.frameWidth);
        let next = this.contextmenu.next;
        let pre = this.contextmenu.pre;
        // 创建关键帧
        let hasNext = this.value.frames[pre] && this.value.frames[pre].next;
        // 如果有 Next 的话 ，更新上一关键帧的 next
        if (this.value.frames[pre] && hasNext) {
          this.value.frames[pre].next = frame;
        }
        this.frameSetAll(frame, {
          property: {
            x: this.value.x,
            y: this.value.y,
            rotation: this.value.rotation,
          },
          next: hasNext && next >= 0 ? next : null
        });
        // 渲染上一帧
        this.reRender(frame - 1, frame);
      },
      mousemove () {
        let e = event;
        let x = e.offsetX;
        let y = e.offsetY;
        let ctx = this.ctx;
        if (y < 20) {
          ctx.clearRect(this.lastHover, 0, this.frameWidth - 1, 20);
          this.renderFrame(this.lastHover);
          let offset = Math.floor(x / this.frameWidth) * this.frameWidth;
          this.renderRect(offset, '#e3e3e3');
          this.lastHover = offset;
          this.renderFrame(offset);
        }
      },
      renderRect (offset, color) {
        let ctx = this.ctx;
        ctx.fillStyle = color;
        ctx.fillRect(offset, 0, this.frameWidth - 1, 20);
      },
      renderFrame (offset) {
        let frame = parseInt(offset / this.frameWidth);
        let keys = Object.keys(this.value.frames).map(key => Number(key));
        let ctx = this.ctx;
        // 排序
        keys.sort((a,b) => a-b);
        if (keys.indexOf(frame) >= 0) {
          // 说明是关键帧,画上关键帧标记
          ctx.beginPath();
          ctx.arc(frame * this.frameWidth + 5, 10, 3, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.fillStyle = '#999';
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

          let preFrame = this.value.frames[pre];
          if (preFrame && preFrame.next && pre >= 0 && next >= 0) {
            // 是补间
            if (Number(next) === Number(frame) + 1) {
              // 下一帧是关键帧
              drawArrow(ctx, offset, 10, this.frameWidth + offset, 10, 30, 5, 1, '#999')
            } else {
              ctx.fillStyle = '#999';
              ctx.fillRect(offset, 10, this.frameWidth, 1);
            }
          }
        }
      }
    },
    mounted () {
      let canvas = this.$refs.canvas;
      let ctx = (this.ctx = canvas.getContext('2d'));
      // 需要绘制 max frame个三角形
      for (let i = 0; i < this.maxFrame; i++) {
        let offset = (i + 1) * this.frameWidth;
        ctx.fillStyle = '#e3e3e3';
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


