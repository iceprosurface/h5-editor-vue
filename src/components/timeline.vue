<template>
  <div class="timeline"
       @mouseup="blur"
       @mousemove="scrollmove"
  >
    <div class="timeline-name" v-contextmenu:contextmenu>
      <timeline-name class="name"
           :class="currentGuid===entity[0]?'active':''"
           v-for="entity in entities"
           :key="entity[0]"
           @mousedown.native="chooseCurrent(entity[0])"
           :name="entity[0]"
           @action="doAction"
           :guid="entity[0]"
      ></timeline-name>
    </div>
    <div class="timeline-item" ref="timelineItem">
      <div class="frame"
           v-for="entity in entities"
           :key="entity[0]">
        <frame :entity="entity" :max-frame="frames"/>
      </div>
    </div>
    <div class="timer">
      <div class="time-count">
        <div>{{now}}/{{second}}({{current}})</div>
      </div>
      <div class="time-box"
           ref="timescroll"
      >
        <div class="wrap">
          <timeframe
            :current.sync="current"
            :frames="frames"
            @time-change="timeChange"
          ></timeframe>
        </div>
      </div>
    </div>
    <div class="progress"
         ref="scrollbar">
      <div class="button"
           @mousedown="focus"
           :style="{
                    left: this.offsetleft + 'px'
                }"></div>
    </div>
  </div>
</template>

<script>
  import frame from './frame';
  import timeframe from './timeframe';
  import timelineName from './timelineName'
  import moment from 'moment';

  export default {
    props: [
      'entities',
      'frames',
      'current',
      'currentGuid'
    ],
    components: {
      frame,
      timeframe,
      timelineName
    },
    data () {
      return {
        offsetleft: 0,
        offsetX: 0,
        isFocus: false
      }
    },
    computed: {
      second () {
        return moment(this.frames / 24 * 1000).format('mm:ss');
      },
      now () {
        return moment(this.current / 24 * 1000).format('mm:ss');
      }
    },
    methods: {
      doAction(type, guid) {
        this.$emit('action', type, guid);
      },
      timeChange (frame) {
        this.$emit('time-change', frame)
      },
      chooseCurrent (guid) {
        this.$emit('choose-current', guid)
      },
      scrollmove () {
        let timelineItem = this.$refs.timelineItem
        let scrollbar = this.$refs.scrollbar
        let timescroll = this.$refs.timescroll
        if (this.isFocus) {
          let tlWidth = timelineItem.scrollWidth
          let tsWidth = timescroll.scrollWidth
          let e = event
          let x = e.clientX - this.offsetX - 120
          let width = scrollbar.clientWidth * 0.95
          if (x > width) {
            this.offsetleft = width
          } else if (x < 0) {
            this.offsetleft = 0
          } else {
            this.offsetleft = x
          }
          // 最多只能动95%
          let per = x / width
          timelineItem.scrollLeft = Math.floor(per * tlWidth)
          timescroll.scrollLeft = Math.floor(per * tsWidth)
        }
      },
      focus () {
        let target = event.target;
        let {left} = target.getBoundingClientRect();
        let {clientX} = event;
        this.offsetX = clientX - left;
        this.isFocus = true
      },
      blur () {
        this.isFocus = false
      }
    }
  }
</script>

<style lang="less">
  .timeline {
    user-select: none;
    position: fixed;
    height: 200px;
    left: 0;
    right: 0;
    width: auto;
    overflow-x: auto;
    overflow-y: auto;
    background: #e2e2e2;
    border: 1px solid #bbb;
    bottom: 20px;
    .timer {
      height: 20px;
      position: fixed;
      width: 100%;
      bottom: 221px;
      border-top: 1px solid #e3e3e3;
      font-size: 12px;
      text-align: left;
      display: flex;
      .time-count {
        border-right: 1px solid #e3e3e3;
        width: 119px;
        line-height: 20px;
        flex: 0 0 119px;
      }
      .time-box {
        flex: 1;
        position: relative;
        overflow-x: hidden;
        overflow-y: hidden;
        .wrap {
          height: 20px;
        }
      }
    }
    .timeline-name {
      position: absolute;
      height: 100%;
      width: 120px;
      z-index: 999;
      background: #e2e2e2;
      .name {
        width: 120px;
        height: 20px;
        line-height: 20px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        border-bottom: 1px solid #bbb;
        position: relative;
        font-size: 12px;
        &.active {
          background: #aaa;
        }
      }
    }
    .timeline-item {
      position: absolute;
      min-height: 100%;
      overflow-x: hidden;
      overflow-y: hidden;
      left: 120px;
      right: 0;
      .frame {
        position: relative;
        height: 20px;
        min-width: auto;
        background: #fff;
        border-bottom: 1px solid #bbb;
      }
    }
    .progress {
      position: fixed;
      left: 120px;
      right: 0;
      bottom: 0;
      height: 20px;
      .button {
        border-radius: 10px;
        background: #888;
        width: 5%;
        height: 100%;
        position: absolute;
      }
    }
  }
</style>

