<template>
  <button @click="brushType = 'pencil'">Pencil</button>
  <button @click="brushType = 'eraser'">Eraser</button>
  <hr />

  <div class="grid">
    <div class="box"><Draw :brushType="brushType" /></div>
    <div class="box"><Draw :brushType="brushType" /></div>
    <div class="box"><Draw :brushType="brushType" /></div>
    <div class="box"><Draw :brushType="brushType" /></div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Draw from "./components/Draw.vue";

const brushType = ref("pencil");
</script>

<style>
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
}

#app {
  width: 100%;
  height: 100%;
}

.grid {
  width: 100%;
  height: 90%;
  position: relative;
  display: flex;
  flex-wrap: wrap;
}

.box {
  width: 50%;
  height: 50%;
}

.box:nth-of-type(1) {
  background-color: aqua;
}

.box:nth-of-type(2) {
  background-color: rgb(4, 0, 255);
}

.box:nth-of-type(3) {
  background-color: rgb(0, 255, 145);
}

.box:nth-of-type(4) {
  background-color: rgb(238, 255, 0);
}
</style>
