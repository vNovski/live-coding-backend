import { Server, Socket } from "socket.io";
import registedTerminalHandlers from "./terminal";
import roomsState from "./state/rooms.state";
import { RoomEvents } from "./enums/room.events.enum";
import { TermianlEvents } from "./enums/terminal.events.enum";

// RoomHandlers -> TerminalHandlers
export const registedRoomHandlers = (io: Server, socket: Socket) => {
    socket.emit(RoomEvents.shareConnections, Array.from(io.sockets.sockets.keys()).filter(id => id != socket.id));

    registedTerminalHandlers(io, socket); // extend romm handlers to room handlers + terminal handlers 

    const join = (id: string) => {
        const value = roomsState.get(id)?.snapshot(({ terminal }: any) => terminal.value);
        if(value !== undefined || value !== null) {
            socket.emit(TermianlEvents.shareState, { value });
        }
        socket.join(id);
        socket.broadcast.to(id).emit(RoomEvents.join, socket.id);
        console.log('ROOM: user joined', socket.id, socket.rooms);
    }

    const leave = (id: string) => {
        console.log('ROOM: user leaved', id);
        socket.broadcast.to(id).emit(RoomEvents.leave, socket.id);
        socket.leave(id);
    }
    
    socket.on(RoomEvents.join, join);
    socket.on(RoomEvents.leave, leave);
}