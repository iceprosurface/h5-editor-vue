<template>
    <div class="timeline"
        @mouseup="blur"
        @mousemove="scrollmove"
    >
        <div class="timeline-name">
            <div class="name"  v-for="entity in entities" :key="entity[0]">{{entity[0]}}</div>
        </div>
        <div class="timeline-item" ref="timelineItem">
            <div class="frame" v-for="entity in entities" :key="entity[0]">
                <frame :entity="entity" :max-frame="frames"></frame>
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
export default {
    props:['entities', 'frames'],
    components: {
        frame
    },
    data () {
        return {
            offsetleft: 0,
            offsetX: 0,
            isFocus: false
        }
    },
    methods: {
        scrollmove () {
            let timelineItem = this.$refs.timelineItem
            let scrollbar = this.$refs.scrollbar
            if (this.isFocus) {
                let tWidth = timelineItem.scrollWidth
                let e = event
                let x = e.clientX - this.offsetX - 120
                let width  = scrollbar.clientWidth * 0.95
                if (x > width) {
                    this.offsetleft = width
                } else if (x < 0) {
                    this.offsetleft = 0
                } else {
                    this.offsetleft = x
                }
                // 最多只能动95%
                let per = x / width
                timelineItem.scrollLeft = Math.floor(per * tWidth)
            }
        },
        focus () {
            let target = event.target;
            let { left } = target.getBoundingClientRect();
            let { clientX } = event;
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
    bottom: 0;
    right: 0;
    width: auto;
    overflow-x: auto;
    overflow-y: auto; 
    background: #e2e2e2;
    border: 1px solid #bbb;
    bottom: 20px;
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

