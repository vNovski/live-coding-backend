import express, { Express, Request, Response } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import config from './config';
import { RoomEvents } from './core/enums/room.events.enum';
import { SocketEvents } from './core/enums/socket-events.enum';
import { registedRoomHandlers } from './core/rooms';

const app: Express = express();
const server = http.createServer(app);
const io: Server = new Server(server, {
    cors: {
        origin: "*",
    }
});

app.get('/', (_, res) => {
    res.send('Server Works!');
});

const onConnection = (socket: Socket) => {
    registedRoomHandlers(io, socket);

    socket.on('disconnecting', function () {
        const room = [...socket.rooms][1];
        if (room) {
            socket.broadcast.to(room).emit(RoomEvents.leave, socket.id);
        }
    });

    socket.on(SocketEvents.disconnect, () => {
        console.log('user disconnected!');
    });
}

server.listen(config.PORT, () => {
    io.on(SocketEvents.connect, onConnection);
    console.log(`⚡️[server]: Server is running at ${config.HOST}:${config.PORT}`);
});