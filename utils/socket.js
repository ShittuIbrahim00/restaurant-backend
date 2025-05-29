import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URLS?.split(",") || "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Kitchen connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Kitchen disconnected:", socket.id);
    });
  });

  return io;
};

export { io };
