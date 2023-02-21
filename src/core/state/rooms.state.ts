import { IUser } from "../interfaces/user.interface";

class Room {
  id: string;

  private state: {
    userIds: Set<string>;
    terminal: { value: string; change: any };
  } = {
    userIds: new Set(),
    terminal: {
      value: "",
      change: null,
    },
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

  // redusers
  addUser(userId: string): void {
    this.state.userIds.add(userId);
  }

  deleteUserById(id: string): void {
    this.state.userIds.delete(id);
  }

  //selectors
  selectUserIds(): string[] {
    return [...this.state.userIds];
  }

  has(userId: string): boolean {
    return this.state.userIds.has(userId);
  }
}

class RoomsState {
  private rooms: Map<string, Room> = new Map();

  add(id: string) {
    this.rooms.set(id, new Room(id));
  }

  delete(id: string) {
    this.rooms.delete(id);
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

const roomState = new RoomsState();

export default roomState;
