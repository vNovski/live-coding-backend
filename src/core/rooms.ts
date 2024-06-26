import { Server, Socket } from "socket.io";
import registedTerminalHandlers from "./terminal";
import roomsState from "./state/rooms.state";
import { RoomEvents } from "./enums/room.events.enum";
import { TermianlEvents } from "./enums/terminal.events.enum";
import { IUser } from "./interfaces/user.interface";
import usersState from "./state/users.state";

// RoomHandlers -> TerminalHandlers
export const registedRoomHandlers = (io: Server, socket: Socket) => {
  registedTerminalHandlers(io, socket); // extend romm handlers to room handlers + terminal handlers

  const join = ({ roomId, user }: { roomId: string; user: IUser }) => {
    const room = roomsState.get(roomId);

    // users in room without joined user
    const usersInRoom = room.selectUserIds().map((userId) => usersState.get(userId));

    // create user instance
    const joinedUser = usersState.add(user.id, user.color, user.username, roomId).getBody();

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
    if(deletedUser && deletedUser.roomId) {
      roomsState.get(deletedUser.roomId).deleteUserById(id);
    }
    
    socket.broadcast.to(id).emit(RoomEvents.leave, socket.id);
    socket.leave(id);
    console.log("ROOM: user leaved", id);
  };

  socket.on(RoomEvents.join, join);
  socket.on(RoomEvents.leave, leave);
};
