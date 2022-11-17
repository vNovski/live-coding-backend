import express, { Express, Request, Response } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import config from './config';

enum SocketEvents {
    connect = 'connection',
    disconnect = 'disconnect'
}

enum CommunicationEventTypes {
    shareConnections = 'share-connections',
    connect = 'client-connect',
    disconnect = 'client-disconnect',
    terminalChange = 'terminal-code-change',
    terminalMouseMove = 'terminal-mousemove',
    terminalCursorChange = 'terminal-cursor-change',
    terminalSelectionChange = 'terminal-selection-change',
    joinRoom = 'join-room',
    leaveRoom = 'leave-room',

}


class Room {
    id: string;
    socket: Socket;
    constructor(id: string, socket: Socket) {
        this.id = id;
        this.socket = socket;
    }

    emit(event: string, payload: any): void {
        this.socket.to(this.id).emit(event, payload);
    }
}

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

app.get('/', (req, res) => {
    res.send('Server Works!');
});


server.listen(config.PORT, () => {
    io.on(SocketEvents.connect, (socket: Socket) => {

        socket.on(CommunicationEventTypes.joinRoom, (roomId: string) => {
            socket.join(roomId);
            socket.broadcast.emit(CommunicationEventTypes.connect, socket.id);
        });

        socket.on(CommunicationEventTypes.leaveRoom, ({ roomId }) => {
            socket.broadcast.to(roomId).emit(CommunicationEventTypes.disconnect, socket.id);
            socket.leave(roomId);
        });

        socket.emit(CommunicationEventTypes.shareConnections, Array.from(io.sockets.sockets.keys()).filter(id => id != socket.id));
        socket.on(CommunicationEventTypes.terminalChange, ({ roomId, data }: any) => {
            socket.broadcast.to(roomId).emit(CommunicationEventTypes.terminalChange, data);
        });

        socket.on(CommunicationEventTypes.terminalMouseMove, ({ roomId, data }) => {
            socket.broadcast.to(roomId).emit(CommunicationEventTypes.terminalMouseMove, { userId: socket.id, ...data });
        });

        socket.on(CommunicationEventTypes.terminalCursorChange, ({ roomId, data }) => {
            socket.broadcast.to(roomId).emit(CommunicationEventTypes.terminalCursorChange, { userId: socket.id, ...data });
        });

        socket.on(CommunicationEventTypes.terminalSelectionChange, ({ roomId, data }) => {
            socket.broadcast.to(roomId).emit(CommunicationEventTypes.terminalSelectionChange, { userId: socket.id, ...data });
        });

        socket.on(SocketEvents.disconnect, () => {

            console.log('a user disconnected!');
        });
    });
    console.log(`⚡️[server]: Server is running at ${config.HOST}:${config.PORT}`);
});