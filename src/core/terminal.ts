import { Server, Socket } from "socket.io";
import { TermianlEvents } from "./enums/terminal.events.enum";
import roomsState from "./state/rooms.state";


export default (io: Server, socket: Socket) => {

    const change = ({ roomId, data }: { roomId: string, data: string }) => {
        roomsState.get(roomId)?.dispach((state: any) => {
            return {
                ...state,
                terminal: {
                    ...state.terminal,
                    code: data
                }
            }
        });
        socket.broadcast.to(roomId).emit(TermianlEvents.change, data);
    }

    const mouseMove = ({ roomId, data }: { roomId: string, data: any }) => {
        socket.broadcast.to(roomId).emit(TermianlEvents.mouseMove, { userId: socket.id, ...data });
    }

    const cursorChange = ({ roomId, data }: { roomId: string, data: any }) => {
        socket.broadcast.to(roomId).emit(TermianlEvents.cursorChange, { userId: socket.id, ...data });
    }

    const selectionChange = ({ roomId, data }: { roomId: string, data: any }) => {
        socket.broadcast.to(roomId).emit(TermianlEvents.selectionChange, { userId: socket.id, ...data });
    }

    const executionLog = ({ roomId, data }: { roomId: string, data: { type: string, data: any[] } }) => {
        socket.broadcast.to(roomId).emit(TermianlEvents.executionLog, data);
    }


    socket.on(TermianlEvents.change, change);
    socket.on(TermianlEvents.mouseMove, mouseMove);
    socket.on(TermianlEvents.cursorChange, cursorChange);
    socket.on(TermianlEvents.selectionChange, selectionChange);
    socket.on(TermianlEvents.executionLog, executionLog);
}