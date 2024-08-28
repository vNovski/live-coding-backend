import { Server, Socket } from "socket.io";
import registedTerminalHandlers from "./terminal";
import roomsState from "./state/rooms.state";
import { RoomEvents } from "./enums/room.events.enum";
import { TermianlEvents } from "./enums/terminal.events.enum";
import usersState from "./state/users.state";

// RoomHandlers -> TerminalHandlers
export const registedRoomHandlers = (io: Server, socket: Socket) => {
  registedTerminalHandlers(io, socket); // extend romm handlers to room handlers + terminal handlers

  const join = ({ roomId }: { roomId: string }) => {
    const userId = socket.id;
    const userData = socket.handshake.query as { username: string, color: string };
    const room = roomsState.get(roomId);

    // users in room without joined user
    const usersInRoom = room.selectUserIds().map((userId) => usersState.get(userId));

    // create user instance
    const joinedUser = usersState.add(userId, userData.color, userData.username, roomId).getBody();

    // add user to the room
    room.addUser(joinedUser.id);

    // share current connections only to joined socket
    socket.emit(RoomEvents.shareConnections, usersInRoom);

    const value = room?.snapshot(({ terminal }: any) => terminal.value);
    if (value !== undefined || value !== null) {
      socket.emit(TermianlEvents.shareState, { value });
    }
    socket.join(roomId);
    socket.broadcast.to(roomId).emit(RoomEvents.join, joinedUser);
    console.log("ROOM: user joined", joinedUser.id, socket.handshake.query);
  };

  const leave = (id: string) => {
    const deletedUser = usersState.delete(id);
    if (deletedUser && deletedUser.roomId) {
      const roomId = deletedUser.roomId;
      const room = roomsState.get(roomId);
      room.deleteUserById(id);
      if (room.isEmpty()) {
        roomsState.delete(roomId);
      }
    }

    socket.broadcast.to(id).emit(RoomEvents.leave, socket.id);
    socket.leave(id);
    console.log("ROOM: user leaved", id);
  };

  socket.on(RoomEvents.join, join);
  socket.on(RoomEvents.leave, leave);
};
