<template>
  <div id="app" @mousemove="mousemove">
    <el-menu class="el-menu-demo" mode="horizontal">
      <el-submenu index="1">
        <template slot="title">文件</template>
        <el-menu-item index="1-1">新建</el-menu-item>
        <el-menu-item index="1-2" @click="save">保存</el-menu-item>
        <el-menu-item index="1-3" @click="load">导入</el-menu-item>
      </el-submenu>
      <el-submenu index="2">
        <template slot="title">插入</template>
        <el-menu-item index="2-1" @click="addPic">图片</el-menu-item>
      </el-submenu>
      <el-submenu index="3">
        <template slot="title">运行</template>
        <el-menu-item index="3-1" @click="play">播放</el-menu-item>
        <el-menu-item index="3-2" @click="stop">停止</el-menu-item>
      </el-submenu>
    </el-menu>
    <div class="content-area" ref="contentArea">
      <div class="inner-hidden"></div>
      <div class="display-area" ref="displayArea">
        <entity v-for="entity in entities"
                :key="entity[0]"
                :value="entity[1]"
                :now="now"
                :class="{
                active: currentGuid === entity[0]
      }"
                @mousedown.native="itemFocus(entity)"
                @mouseup.native="itemBlur(entity)"
        ></entity>
      </div>
    </div>
    <editor
      :entity="currentSeletEntity"
      @data-change="dataChange"
    ></editor>
    <timeline
      :entities="entities"
      :frames="frames"
      :current.sync="now"
      :current-guid="currentGuid"
      @choose-current="chooseCurrent"
      @time-change="timeChange"
      @action="doAction"
    ></timeline>
    <!--dialog-->
    <el-dialog
      title="插入图片"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <el-upload
        action="null"
        class="upload-demo"
        ref="upload"
        :multiple="true"
        :http-request="fileOperate"
        :auto-upload="false">
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">添加</el-button>
        <el-button @click="closeUpload">取 消</el-button>
        <div slot="tip" class="el-upload__tip">只支持png文件</div>
      </el-upload>
      <!--<span slot="footer" class="dialog-footer">-->
      <!--<el-button @click="dialogVisible = false">取 消</el-button>-->
      <!--<el-button type="primary" @click="dialogVisible = false">确 定</el-button>-->
      <!--</span>-->
    </el-dialog>
    <!-- <info :entity="currentEntity"></info> -->
  </div>
</template>

<script>
  import entity from './components/entity.vue';
  import timeline from './components/timeline.vue';
  import info from './components/info.vue';
  import {guid} from './utils/guid.js';
  import {build} from './utils/download.js';
  import bus from './utils/eventBus.js';
  import editor from './components/editor.vue';

  var TWEEN = require('@tweenjs/tween.js');
  const Time = 1000 / 24;

  export default {
    name: 'App',
    components: {
      entity,
      timeline,
      editor,
      info,
    },
    created () {
      bus.$on('refresh', this.refresh)
    },
    mounted () {
      this.$refs.contentArea.scrollLeft = parseInt(1120);
    },
    data () {
      return {
        chooseId: '',
        chooseOffsetX: 0,
        chooseOffsetY: 0,
        entitiesMap: new Map(),
        frames: 1200,
        now: 0,
        currentGuid: null,
        animationFrame: null,
        ddt: 0,
        dialogVisible: false,
      };
    },
    methods: {
      load () {

      },
      save () {
        let data = [];
        // 取出里面的image数据封装为images
        let images = []
        this.entitiesMap.forEach(value => {
          let imageName = value.id + value._file.name;
          images.push({
            name: imageName,
            data: value._file
          });
          data.push(
            [
              value.id,
              {
                ...value,
                src: '/images/' + imageName
              }
            ]
          )
        });
        build({
          data,
          images
        });
      },
      doAction (type, guid) {
        let {index, arr} = this.cleanUp(guid);
        switch (type) {
          case 'del':
            this.entitiesMap.delete(guid);
            break;
          case 'up':
            if (index > 0) {
              this.entitiesMap.get(arr[index].guid).zindex = index - 1;
              this.entitiesMap.get(arr[index - 1].guid).zindex = index;
            }
            break;
          case 'down':
            if (index < arr.length - 1) {
              this.entitiesMap.get(arr[index].guid).zindex = index + 1;
              this.entitiesMap.get(arr[index + 1].guid).zindex = index;
            }
            break;
          default:
        }
        this.entitiesMap = new Map(this.entitiesMap);
      },
      cleanUp (guid) {
        let currentIndex = -1;
        let arr = Array.from(this.entitiesMap)
          .map(value => {
            return {
              guid: value[0],
              zindex: value[1].zindex
            }
          });
        arr.sort(function (a, b) {
          return a.zindex - b.zindex
        });
        arr.forEach(function (value, index) {
          if (value.guid === guid) {
            currentIndex = index
          }
          value.zindex = index
        });
        return {arr, index: currentIndex}
      },
      closeUpload () {
        this.dialogVisible = false;
        this.$refs.upload.clearFiles();
      },
      submitUpload () {
        this.$refs.upload.submit();
      },
      fileOperate (item) {
        let type = 'img';
        this.addNewEntity(type, {file: item.file});
        return Promise.resolve({url: 'aaa'})
      },
      addPic () {
        this.dialogVisible = true
      },
      stop () {
        if (this.animationFrame) {
          cancelAnimationFrame(this.animationFrame);
        }
      },
      play () {
        this.ddt = 0;
        this.animationFrame = requestAnimationFrame(this.loop);
      },
      loop (dt) {
        if (this.now >= this.frames) {
          this.stop();
          return
        }
        this.ddt = this.ddt + dt;
        if (this.ddt > Time) {
          this.now = this.now + 1;
          this.timeChange(this.now);
          this.ddt = this.ddt - Time;
        }
        this.animationFrame = requestAnimationFrame(this.loop);
      },
      chooseCurrent (guid) {
        let value = this.entitiesMap.get(guid);
        let frame = value.frames[this.now];
        //校验是不是关键帧，不是就阻止
        if (!frame) {
          this.$notify({
            title: '系统提示',
            message: '无法编辑非关键帧对象',
            duration: 1500
          });
          return
        }
        this.currentGuid = guid
      },
      chooseEntity (entity) {
        this.chooseCurrent(entity[0]);
      },
      refresh () {
        this.entitiesMap = new Map(this.entitiesMap);
      },
      dataChange (guid) {
        let value = this.entitiesMap.get(guid);
        let frame = value.frames[this.now];
        this.$set(value.frames, this.now, {
          next: frame.next,
          property: {
            x: value.x,
            y: value.y,
            rotation: value.rotation,
            opacity: value.opacity,
            transformOrigin: value.transformOrigin,
            scale: value.scale,
            // width: 100,
            // height: 100,
          }
        });
        this.entitiesMap.set(guid, {
          ...value
        });
        this.entitiesMap = new Map(this.entitiesMap);
      },
      timeChange (nowFrame) {
        this.now = nowFrame;
        this.currentGuid = null
        this.entitiesMap.forEach((entity, key) => {
          let item = entity
          let frames = item.frames;
          let frame = frames[this.now];
          if (frame) {
            // frame 存在, 代表是关键帧
            for (let key in frame.property) {
              item[key] = frame.property[key]
            }
          } else {
            // frame 不存在，代表不是关键正
            let keys = Object.keys(item.frames).map(key => Number(key));
            keys.sort((a, b) => a - b);
            // 检查是否是补间帧
            let pre = -1;
            let next = -1;
            for (let key of keys) {
              if (nowFrame > key) {
                pre = key;
              } else if (nowFrame < key) {
                // 不可能出现等于因为上面过滤掉了
                next = key;
                break;
              }
            }
            if (pre >= 0) {
              let preFrame = item.frames[pre];
              let nextFrame = item.frames[next];
              // 代表存在上一帧，检查当前帧是否是补间动画
              if (preFrame && preFrame.next) {
                // 是补间动画
                let duration = next - pre;
                // 创建补间对象
                let pos = {
                  ...preFrame.property
                };
                let tween = new TWEEN.Tween(pos)
                  .to({
                    ...nextFrame.property
                  }, Time * duration)
                  .easing(TWEEN.Easing.Cubic.InOut);
                tween.start(0);

                let nowTime = nowFrame - pre;
                tween.update(nowTime * Time);
                for (let key in pos) {
                  item[key] = pos[key];
                }
              }
            }
          }
          this.entitiesMap.set(key, {
            ...item
          })
        })
        this.entitiesMap = new Map(this.entitiesMap)
      },
      itemFocus (entity) {
        // 判断当前选中元素是否是一个关键正
        let value = entity[1];
        let frame = value.frames[this.now];
        if (!frame) {
          this.$notify({
            title: '系统提示',
            message: '无法编辑非关键帧对象',
            duration: 1500
          });
          return
        }
        let target = event.target;
        let {left, top} = target.getBoundingClientRect();
        let {pageX, pageY} = event;
        this.chooseOffsetX = pageX - left;
        this.chooseOffsetY = pageY - top;
        this.chooseId = entity[0];
        this.chooseEntity(entity);
        event.preventDefault();
      },
      itemBlur (entity) {
        this.chooseId = null;
      },
      mousemove () {
        if (this.chooseId) {
          let e = event;
          let item = this.entitiesMap.get(this.chooseId);
          let x = e.pageX;
          let y = e.pageY;
          let frame = item.frames[this.now];
          let stop = this.$refs.contentArea.scrollTop;
          let sleft = this.$refs.contentArea.scrollLeft;
          let dleft = this.$refs.displayArea.offsetLeft;
          item.x = x - this.chooseOffsetX + sleft - dleft;
          item.y = y - this.chooseOffsetY + stop - 60 - 20;
          if (frame) {
            frame.property.x = item.x
            frame.property.y = item.y
          }
          this.entitiesMap.set(this.chooseId, {
            ...item
          });
          this.entitiesMap = new Map(this.entitiesMap);
        }
      },
      addNewEntity (type, {file}) {
        let id = guid();
        let size = this.entitiesMap.size;
        let src = window.URL.createObjectURL(file);
        let img = new Image();
        img.onload = () => {
          this.entitiesMap.set(id, {
            _file: file,
            type: type,
            x: 120,
            y: 120,
            rotation: 0,
            opacity: 1,
            transformOrigin: 'center center',
            scale: 1,
            width: img.width,
            height: img.height,
            src: src ||
            'https://bbs.xd.com/ucenter/avatar.php?uid=30967885&size=middle&random=true',
            id: id,
            frames: {
              // key: index,
              // property: {x, y, rotation}
              // next: null? index (存在则触发补间)
            },
            zindex: size
          });
          this.entitiesMap = new Map(this.entitiesMap);
        }
        img.src = src;
      }
    },
    computed: {
      entities () {
        let _entities = Array.from(this.entitiesMap);
        _entities.sort(function (a, b) {
          return a[1].zindex - b[1].zindex
        });
        _entities.forEach(function (value, index) {
          value[1].zindex = index
        });
        return _entities
      },
      currentSeletEntity () {
        return this.entitiesMap.get(this.currentGuid);
      },
      currentEntity () {
        if (this.chooseId) {
          return [this.chooseId, this.entitiesMap.get(this.chooseId)];
        }
        return [null, {}];
      }
    }
  };
</script>

<style lang="less">
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

  .content-area {
    position: fixed;
    top: 60px;
    bottom: 250px;
    width: 100%;
    height: auto;
    overflow: auto;
    .inner-hidden {
      width: 1280px * 3;
      height: 1px;
    }
    .display-area {
      border: 1px solid #34d366;
      position: absolute;
      top: 20px;
      width: 1280px;
      height: 720px;
      left: (1280px * 3 / 2 );
      margin-left: -1280px * 0.5;
    }
  }

  body {
    margin: 0;
  }
</style>
