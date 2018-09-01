<template>
  <div class="editor-wrap">
    <el-card
      class="box-card"
      v-if="istoggled"
    >
      <div slot="header" class="clearfix">
        <span>编辑框</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="toggle"
        >隐藏</el-button>
      </div>
      <div v-if="show">
        <div>
          <label>y</label>
          <el-input v-model="y" placeholder="请输入内容"></el-input>
        </div>
        <div>
          <label>x</label>
          <el-input v-model="x" placeholder="请输入内容"></el-input>
        </div>
        <div>
          <label>src</label>
          <el-input v-model="src" placeholder="请输入内容"></el-input>
        </div>
        <div>
          <label>scale</label>
          <el-input v-model="scale" placeholder="请输入内容"></el-input>
        </div>
        <div>
          <label>rotation</label>
          <el-input v-model="rotation" placeholder="请输入内容"></el-input>
        </div>
        <div>
          <label>transformOrigin</label>
          <el-input v-model="transformOrigin" placeholder="请输入内容"></el-input>
        </div>
        <div>
          <label>opacity</label>
          <el-input v-model="opacity" placeholder="请输入内容"></el-input>
        </div>
      </div>
      <div v-else>
        暂无选中内容
      </div>
    </el-card>
    <div class="toggled"
         @click="toggle"
         v-else>
      <i class="el-icon-d-arrow-left"></i>
    </div>
  </div>
</template>

<script>
  export default {
    props: [
      'entity'
    ],
    methods: {
      toggle() {
        this.istoggled = !this.istoggled;
      },
      dataChanged () {
        this.$emit('data-change', this.entity.id)
      }
    },
    computed: {
      show () {
        return Boolean(this.entity);
      },
      src: {
        set: function (src) {
          this.entity.src = src;
          this.dataChanged();
        },
        get: function () {
          return this.entity.src
        }
      },
      x: {
        set:function (x) {
          this.entity.x = Number(x);
          this.dataChanged();
        },
        get: function () {
          return this.entity.x
        }
      },
      rotation: {
        set: function (rotation) {
          this.entity.rotation = Number(rotation);
          this.dataChanged();
        },
        get: function () {
          return this.entity.rotation
        }
      },
      scale: {
        set: function (scale) {
          this.entity.scale = Number(scale);
          this.dataChanged();
        },
        get: function () {
          return this.entity.scale
        }
      },
      y: {
        set: function (y) {
          this.entity.y = Number(y);
          this.dataChanged();
        },
        get: function() {
          return this.entity.y
        }
      },
      transformOrigin: {
        set: function (transformOrigin) {
          this.entity.transformOrigin = transformOrigin;
          this.dataChanged();
        },
        get: function() {
          return this.entity.transformOrigin
        }
      },
      opacity: {
        set: function (opacity) {
          this.entity.opacity = opacity;
          this.dataChanged();
        },
        get: function() {
          return this.entity.opacity
        }
      }

    },
    data () {
      return {
        istoggled: false
      }
    }
  }

</script>

<style lang="less" scoped>
  .editor-wrap {
    position: fixed;
    right: 0;
    top: 70px;
    text-align: left;
    .box-card {
      width: 300px;
    }
    .toggled {
      cursor: pointer;
      padding: 8px;
      border: 1px solid #e3e3e3;
    }
  }
</style>
