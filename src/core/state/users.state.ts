import { IUser } from "../interfaces/user.interface";

class User {
  id: string;
  color: string;
  username: string;
  roomId: string | null;

  constructor(id: string, color: string, username: string, roomId: string | null) {
    this.id = id;
    this.color = color;
    this.username = username;
    this.roomId = roomId;
  }

  getBody(): IUser {
    return {
        id: this.id,
        color: this.color,
        username: this.username,
        roomId: this.roomId!
    }
  }
}

class UsersState {
  private users: Map<string, User> = new Map();

  add(id: string, color: string, username: string, roomId: string | null): User {
    this.users.set(id, new User(id, color, username, roomId));
    return this.users.get(id)!;
  }

  delete(id: string): User | null {
    const user = this.users.get(id) || null;
    this.users.delete(id);
    return user;
  }

  get(id: string): User | null {
    return this.users.get(id) || null;
  }

  getAll(): Map<string, User> {
    return this.users;
  }
}

const usersState = new UsersState();

export default usersState;
