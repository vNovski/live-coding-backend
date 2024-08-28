import { Server, Socket } from "socket.io";
import { TermianlEvents } from "./enums/terminal.events.enum";
import { TerminalChange } from "./interfaces/terminal/change.interface";
import roomsState from "./state/rooms.state";
import usersState from "./state/users.state";

export default (io: Server, socket: Socket) => {
  const change = ({
    roomId,
    data: terminalState,
  }: {
    roomId: string;
    data: { value: string; change: TerminalChange };
  }) => {
    roomsState.get(roomId)?.dispach((state: any) => {
      return {
        ...state,
        terminal: {
          ...state.terminal,
          value: terminalState.value,
        },
      };
    });
    socket.broadcast
      .to(roomId)
      .emit(TermianlEvents.change, terminalState.change);
  };

  const mouseMove = ({ roomId, position }: { roomId: string; position: { x: number, y: number } }) => {
    const user = usersState.get(socket.id);
    if (!user) {
      return;
    }
    socket.broadcast.to(roomId).emit(TermianlEvents.mouseMove, {
      userId: user.id,
      position,
    });
  };

  const cursorChange = ({ roomId, position }: { roomId: string; position: any }) => {
    const user = usersState.get(socket.id);

    if (!user) {
      return;
    }

    socket.broadcast
      .to(roomId)
      .emit(TermianlEvents.cursorChange, {
        userId: user.id,
        position,
      });
  };

  const selectionChange = ({ roomId, position }: { roomId: string; position: any }) => {
    const user = usersState.get(socket.id);

    if (!user) {
      return;
    }

    socket.broadcast
      .to(roomId)
      .emit(TermianlEvents.selectionChange, {
        userId: user.id,
        position,
      });
  };

  const executionLog = ({
    roomId,
    data,
  }: {
    roomId: string;
    data: { type: string; data: any[] };
  }) => {
    socket.broadcast.to(roomId).emit(TermianlEvents.executionLog, data);
  };

  socket.on(TermianlEvents.change, change);
  socket.on(TermianlEvents.mouseMove, mouseMove);
  socket.on(TermianlEvents.cursorChange, cursorChange);
  socket.on(TermianlEvents.selectionChange, selectionChange);
  socket.on(TermianlEvents.executionLog, executionLog);
};
