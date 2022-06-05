<template>
  <div class="draw" ref="drawRef">
    <canvas class="draw-canvas" ref="canvasRef"></canvas>
    <div
      class="draw-eraser"
      v-if="eraserVisible"
      :style="buildEraserStyle"
    ></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import { io } from "socket.io-client";

const props = defineProps({
  serverURL: {
    type: String,
    default: "",
  },

  brushType: {
    type: String,
    default: "pencil",
  },

  pencilColor: {
    type: String,
    default: "red",
  },

  pencilWidth: {
    type: Number,
    default: 4,
  },

  eraserRadius: {
    type: Number,
    default: 50,
  },
});

const drawRef = ref(null),
  canvasRef = ref(null);

let beginPoint = null;
let trackPoints = [];

function pencilDown(event) {
  beginPoint = {
    x: event.x,
    y: event.y,
  };

  trackPoints.push({
    x: event.x,
    y: event.y,
  });
}

function pencilMove(event) {
  trackPoints.push({
    x: event.x,
    y: event.y,
  });

  if (trackPoints.length < 3) {
    return;
  }

  const lastTwoPoints = trackPoints.slice(-2);
  const controlPoint = lastTwoPoints[0];
  const endPoint = {
    x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
    y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2,
  };

  const lineRecord = {
    beginPoint,
    controlPoint,
    endPoint,
    lineColor: props.pencilColor,
    lineWidth: props.pencilWidth,
  };

  drawLine(lineRecord);

  ioClient.emit("draw:line", lineRecord);

  beginPoint = endPoint;
}

function pencilUp(event) {
  trackPoints = [];
  beginPoint = null;
}

function drawLine({
  beginPoint,
  controlPoint,
  endPoint,
  lineColor,
  lineWidth,
}) {
  canvasCtx.strokeStyle = lineColor;
  canvasCtx.lineWidth = lineWidth;
  canvasCtx.lineJoin = "round";
  canvasCtx.lineCap = "round";
  canvasCtx.beginPath();
  canvasCtx.moveTo(beginPoint.x, beginPoint.y);
  canvasCtx.quadraticCurveTo(
    controlPoint.x,
    controlPoint.y,
    endPoint.x,
    endPoint.y
  );
  canvasCtx.stroke();
}

const eraserVisible = ref(false);
const eraserCenter = reactive({
  x: 0,
  y: 0,
});

const buildEraserStyle = computed(() => {
  return {
    left: `${eraserCenter.x - props.eraserRadius}px`,
    top: `${eraserCenter.y - props.eraserRadius}px`,
    width: `${props.eraserRadius * 2}px`,
    height: `${props.eraserRadius * 2}px`,
  };
});

function eraseCircle(center, radius) {
  canvasCtx.save();
  canvasCtx.globalCompositeOperation = "destination-out";
  canvasCtx.beginPath();
  canvasCtx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  canvasCtx.fill();
  canvasCtx.restore();
}

function clearAll() {
  const canvas = canvasRef.value;
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function eraserDown(event) {
  eraserVisible.value = true;
  eraserCenter.x = event.x;
  eraserCenter.y = event.y;
}

function eraserMove(event) {
  eraserCenter.x = event.x;
  eraserCenter.y = event.y;
  eraseCircle(eraserCenter, props.eraserRadius);

  ioClient.emit("draw:erase", {
    center: eraserCenter,
    radius: props.eraserRadius,
  });
}

function eraserUp(event) {
  eraserVisible.value = false;
}

let canvasCtx = null;
onMounted(() => {
  const draw = drawRef.value;
  const canvas = canvasRef.value;
  canvas.width = draw.offsetWidth;
  canvas.height = draw.offsetHeight;
  canvasCtx = canvas.getContext("2d");
  canvasCtx.lineCap = "round";
  canvasCtx.lineJoin = "round";
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
});

function pointerDown(event) {
  if (props.brushType == "pencil") {
    pencilDown(event);
  } else if (props.brushType == "eraser") {
    eraserDown(event);
  }
}

function pointerMove(event) {
  if (props.brushType == "pencil") {
    pencilMove(event);
  } else if (props.brushType == "eraser") {
    eraserMove(event);
  }
}

function pointerUp(event) {
  if (props.brushType == "pencil") {
    pencilUp(event);
  } else if (props.brushType == "eraser") {
    eraserUp(event);
  }
}

const listeners = new Map();

listeners.set("mousedown", (event) => {
  event.preventDefault();

  const listeners = new Map();

  const { left: clientX, top: clientY } = drawRef.value.getBoundingClientRect();

  pointerDown({
    x: event.clientX - clientX,
    y: event.clientY - clientY,
  });

  listeners.set("mousemove", (event) => {
    event.preventDefault();

    pointerMove({
      x: event.clientX - clientX,
      y: event.clientY - clientY,
    });
  });

  listeners.set("mouseup", (event) => {
    event.preventDefault();

    pointerUp({
      x: event.clientX - clientX,
      y: event.clientY - clientY,
    });

    listeners.forEach((listener, event) => {
      drawRef.value.removeEventListener(event, listener);
    });
  });

  listeners.set("mouseout", (event) => {
    event.preventDefault();

    pointerUp({
      x: event.clientX - clientX,
      y: event.clientY - clientY,
    });

    listeners.forEach((listener, event) => {
      drawRef.value.removeEventListener(event, listener);
    });
  });

  listeners.forEach((listener, event) => {
    drawRef.value.addEventListener(event, listener);
  });
});

let pointerId = -1;
listeners.set("touchstart", (event) => {
  event.preventDefault();

  if (pointerId != -1) {
    return;
  }

  const listeners = new Map();
  const { left: clientX, top: clientY } = drawRef.value.getBoundingClientRect();

  const pointer = event.targetTouches[0];
  pointerId = pointer.identifier;

  pointerDown({
    x: pointer.clientX - clientX,
    y: pointer.clientY - clientY,
  });

  listeners.set("touchmove", (event) => {
    event.preventDefault();

    const pointer = event.targetTouches[0];
    pointerMove({
      x: pointer.clientX - clientX,
      y: pointer.clientY - clientY,
    });
  });

  listeners.set("touchend", (event) => {
    event.preventDefault();

    if (event.targetTouches.length == 0) {
      const pointer = event.changedTouches[0];
      pointerUp({
        x: pointer.clientX - clientX,
        y: pointer.clientY - clientY,
      });

      pointerId = -1;
      listeners.forEach((listener, event) => {
        drawRef.value.removeEventListener(event, listener);
      });
    }
  });

  listeners.forEach((listener, event) => {
    drawRef.value.addEventListener(event, listener);
  });
});

onMounted(() => {
  listeners.forEach((listener, event) => {
    drawRef.value.addEventListener(event, listener);
  });
});

onBeforeUnmount(() => {
  listeners.forEach((listener, event) => {
    drawRef.value.removeEventListener(event, listener);
  });
});

let ioClient = null;
onMounted(() => {
  ioClient = io(props.serverURL, {
    transports: ["websocket"],
  });

  ioClient.on("draw:line", (record) => {
    drawLine(record);
  });

  ioClient.on("draw:erase", ({ center, radius }) => {
    eraseCircle(center, radius);
  });

  ioClient.on("draw:clear", () => {
    clearAll();
  });
});

onBeforeUnmount(() => {
  ioClient.disconnect();
});

defineExpose({
  clear() {
    clearAll();
    ioClient.emit("draw:clear");
  },
});
</script>

<style scoped>
.draw {
  width: 100%;
  height: 100%;
  position: relative;
}

.draw-canvas {
  width: 100%;
  height: 100%;
  position: absolute;
}

.draw-eraser {
  position: absolute;
  background-color: rgba(231, 224, 224, 0.5);
  pointer-events: none;
  user-select: none;
  border-radius: 50%;
  border: 4px solid white;
}
</style>
