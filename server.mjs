import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {});

const records = new Map();

io.on("connection", async (socket) => {
  const { query } = socket.handshake;
  socket.join(query.roomId);

  if (!records.has(query.roomId)) {
    records.set(query.roomId, []);
  }

  socket.on("draw:line", async (record) => {
    records.get(query.roomId).push(record);
    socket.in(query.roomId).emit("draw:line", record);
  });

  socket.on("draw:erase", async (record) => {
    records.get(query.roomId).push(record);
    socket.in(query.roomId).emit("draw:erase", record);
  });

  socket.on("draw:clear", async () => {
    records.set(query.roomId, []);
    socket.in(query.roomId).emit("draw:clear");
  });

  socket.on("disconnect", async () => {
    const ids = await io.in(query.roomId).allSockets();
    if (ids.size == 0) {
      records.delete(query.roomId);
    }
  });
});

httpServer.listen(3000);
