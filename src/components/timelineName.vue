<template>
  <div>
    <div v-contextmenu:contextmenu>
      {{name}}
    </div>
    <v-contextmenu ref="contextmenu" @contextmenu="showMenu">
      <v-contextmenu-item @click="del">删除图层</v-contextmenu-item>
      <v-contextmenu-item @click="up">上移图层</v-contextmenu-item>
      <v-contextmenu-item @click="down">下移图层</v-contextmenu-item>
    </v-contextmenu>
  </div>
</template>

<script>
  export default {
    props: ['name', 'guid'],
    methods: {
      showMenu (event) {
      },
      del () {
        this.$emit('action', 'del', this.guid)
      },
      up () {
        this.$emit('action', 'up', this.guid)
      },
      down () {
        this.$emit('action', 'down', this.guid)
      }
    }
  }
</script>

<style>

</style>
