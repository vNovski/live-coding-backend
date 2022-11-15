import express, { Express, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import config from './config';

enum SokcketEvents {
    connect = 'connection',
    disconnect = 'disconnect'
}

enum CommunicationEventTypes {
    connect = 'client-connect',
    disconnect = 'client-disconnect',
    terminalChange = 'terminal-code-change',
    terminalMouseMove = 'terminal-mousemove',
    terminalCursorChange = 'terminal-cursor-change',
    terminalSelectionChange = 'terminal-selection-change',
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
    io.on(SokcketEvents.connect, (socket) => {
        console.log('a user connected');
        socket.broadcast.emit(CommunicationEventTypes.connect, socket.id);
        socket.on(CommunicationEventTypes.terminalChange, (message: any) => {
            socket.broadcast.emit(CommunicationEventTypes.terminalChange, message);
        });

        socket.on(CommunicationEventTypes.terminalMouseMove, (mouse: { x: number, y: number, color: string  }) => {
            socket.broadcast.emit(CommunicationEventTypes.terminalMouseMove, { userId: socket.id, ...mouse });
        });

        socket.on(CommunicationEventTypes.terminalCursorChange, (cursor: any) => {
            socket.broadcast.emit(CommunicationEventTypes.terminalCursorChange, { userId: socket.id, ...cursor });
        });

        socket.on(CommunicationEventTypes.terminalSelectionChange, (cursor: any) => {
            socket.broadcast.emit(CommunicationEventTypes.terminalSelectionChange, { userId: socket.id, ...cursor });
        });

        socket.on(SokcketEvents.disconnect, () => {
            socket.broadcast.emit(CommunicationEventTypes.disconnect, socket.id);
            console.log('a user disconnected!');
        });
    });
    console.log(`⚡️[server]: Server is running at ${config.HOST}:${config.PORT}`);
});