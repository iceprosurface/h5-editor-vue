<template>
    <div class="info">
        <div v-for="key in keys" :key="key">
            {{key}}: {{info[key]}}
        </div>
    </div>
</template>

<script>
export default {
    props: ['entity'],
    computed: {
        info() {
            return {
                ...this.entity[1],
                id: this.entity[0]
            }
        },
        keys () {
            return Object.keys(this.info);
        }
    }
}
</script>

<style lang="less">
.info {
    position: fixed;
    right: 0;
    height: 200px;
    width: 120px;
    overflow: auto;
    background: #e3e3e3;
    border: 1px solid #bbb;
    top: 0;
    font-size: 12px;
    text-align: left;
    white-space: normal;
}
</style>

