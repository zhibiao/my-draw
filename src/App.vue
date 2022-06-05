<template>
  <button @click="brushType = 'pencil'">Pencil</button>
  <button @click="brushType = 'eraser'">Eraser</button>
  <button @click="drawRef.clear">Clear</button>
  <hr />

  <div class="grid">
    <div class="box">
      <Draw
        ref="drawRef"
        :brushType="brushType"
        pencilColor="red"
        serverURL="http://127.0.0.1:3000?roomId=chat"
      />
    </div>
    <div class="box">
      <Draw
        :brushType="brushType"
        pencilColor="green"
        serverURL="http://127.0.0.1:3000?roomId=chat"
      />
    </div>
    <div class="box">
      <Draw
        :brushType="brushType"
        pencilColor="black"
        serverURL="http://127.0.0.1:3000?roomId=chat"
      />
    </div>
    <div class="box">
      <Draw
        :brushType="brushType"
        pencilColor="yellow"
        serverURL="http://127.0.0.1:3000?roomId=chat"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Draw from "./components/Draw.vue";

const brushType = ref("pencil");

const drawRef = ref(null);
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
  background-color: rgb(76, 78, 78);
}

.box {
  width: 45%;
  height: 45%;
  margin: 10px;
}

.box:nth-of-type(1) {
  background-color: aliceblue;
}

.box:nth-of-type(2) {
  background-color: aliceblue;
}

.box:nth-of-type(3) {
  background-color: aliceblue;
}

.box:nth-of-type(4) {
  background-color: aliceblue;
}
</style>
