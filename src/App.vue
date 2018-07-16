<template>
  <div id="app" @mousemove="mousemove">
    <el-menu class="el-menu-demo" mode="horizontal">
      <el-submenu index="1">
        <template slot="title">文件</template>
        <el-menu-item index="1-1">新建</el-menu-item>
        <el-menu-item index="1-2">保存</el-menu-item>
        <el-menu-item index="1-3">导入</el-menu-item>
      </el-submenu>
      <el-submenu index="2">
        <template slot="title">插入</template>
        <el-menu-item index="2-1" @click="addNewEntity">图片</el-menu-item>
      </el-submenu>
    </el-menu>
    <entity v-for="entity in entities" 
      :x="entity[1].x"
      :y="entity[1].y"
      :src="entity[1].src"
      :key="entity[0]"
      @mousedown.native="itemFocus(entity)"
      @mouseup.native="itemBlur(entity)"
    ></entity>
    <timeline 
      :entities="entities" 
      :frames="frames"
      :now="now"></timeline>
    <!-- <info :entity="currentEntity"></info> -->
  </div>
</template>

<script>
import entity from "./components/entity.vue";
import timeline from "./components/timeline.vue";
import info from "./components/info.vue";
import { guid } from "./utils/guid.js";
import bus from './utils/eventBus.js';

export default {
  name: "App",
  components: {
    entity,
    timeline,
    info
  },
  created () {
    bus.$on('refresh', this.refresh)
  },
  data() {
    return {
      chooseId: "",
      chooseOffsetX: 0,
      chooseOffsetY: 0,
      entitiesMap: new Map(),
      frames: 1200,
      now: 0,
    };
  },
  methods: {
    refresh () {
      this.entitiesMap = new Map(this.entitiesMap);
    },
    itemFocus(entity) {
      let target = event.target;
      let { left, top } = target.getBoundingClientRect();
      let { pageX, pageY } = event;
      this.chooseOffsetX = pageX - left;
      this.chooseOffsetY = pageY - top;
      this.chooseId = entity[0];
      event.preventDefault();
    },
    itemBlur(entity) {
      this.chooseId = null;
    },
    mousemove() {
      if (this.chooseId) {
        let e = event;
        let item = this.entitiesMap.get(this.chooseId);
        let x = e.pageX;
        let y = e.pageY;
        item.x = x - this.chooseOffsetX;
        item.y = y - this.chooseOffsetY;
        this.entitiesMap = new Map(this.entitiesMap);
      }
    },
    addNewEntity() {
      let id = guid()
      this.entitiesMap.set(id, {
        x: 120,
        y: 120,
        src:
          "https://bbs.xd.com/ucenter/avatar.php?uid=30967885&size=middle&random=true",
        id: id,
        frames: {
          // key: index,
          // property: {x, y, rotate}
          // next: null? index (存在则触发补间)
        }
      });
      this.entitiesMap = new Map(this.entitiesMap);
    }
  },
  computed: {
    entities() {
      return Array.from(this.entitiesMap);
    },
    currentEntity() {
      if (this.chooseId) {
        return [this.chooseId, this.entitiesMap.get(this.chooseId)];
      }
      return [null, {}];
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  position: absolute;
}
body {
  margin: 0;
}
</style>
