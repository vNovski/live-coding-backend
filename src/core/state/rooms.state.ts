
class Room {
    id: string;

    private state: any = {
        terminal: {
            code: ''
        }
    };


    constructor(id: string) {
        this.id = id;
    }

    dispach(cb: Function): void {
        this.state = cb(this.state);
    }

    snapshot(cb: Function): any {
        return cb(this.state);
    }
}

class RoomsState {
    private rooms: Map<string, Room> = new Map();

    add(id: string) {
        this.rooms.set(id, new Room(id));
    }

    get(id: string): Room {
        if (!this.rooms.has(id)) {
            this.add(id);

        }
        return this.rooms.get(id)!;
    }
    getAll(): Map<string, Room> {
        return this.rooms;
    }


}


export default new RoomsState();


