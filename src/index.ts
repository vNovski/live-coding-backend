import express, { Express, Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import config from "./config";
import { RoomEvents } from "./core/enums/room.events.enum";
import { SocketEvents } from "./core/enums/socket-events.enum";
import { TermianlEvents } from "./core/enums/terminal.events.enum";
import { registedRoomHandlers } from "./core/rooms";
import roomsState from "./core/state/rooms.state";
import usersState from "./core/state/users.state";

const app: Express = express();
const server = http.createServer(app);
const io: Server = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (_, res) => {
  res.send("Server Works!");
});

const onConnection = (socket: Socket) => {
  registedRoomHandlers(io, socket);

  socket.on("disconnecting", function () {
    const room = [...socket.rooms][1];
    if (room) {
      socket.broadcast.to(room).emit(TermianlEvents.selectionChange, {
        userId: socket.id,
        position: { from: null, to: null, head: null },
      });
      socket.broadcast.to(room).emit(TermianlEvents.cursorChange, {
        userId: socket.id,
        position: { outside: 0 },
      });
      socket.broadcast.to(room).emit(RoomEvents.leave, socket.id);
    }
  });

  socket.on(SocketEvents.disconnect, () => {
    const deletedUser = usersState.delete(socket.id);
    if (deletedUser && deletedUser.roomId) {
      roomsState.get(deletedUser.roomId).deleteUserById(socket.id);
    }
    console.log("user disconnected", socket.id);
  });
};

server.listen(config.PORT, () => {
  io.on(SocketEvents.connect, onConnection);
  console.log(
    `⚡️[server]: Server is running at ${config.HOST}:${config.PORT}`
  );
});
