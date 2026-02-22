import { UserRepository } from "../../src/application/repositories/user-repository";
import { User } from "../../src/core/entities/user";

export class InMemoryUserRepository implements UserRepository {
  public items: User[] = [];

  async create(user: User): Promise<void> {
    this.items.push(user);
  }
  async findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id.toString() === id);
    if (!user) {
      return null;
    }
    return user;
  }
  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email);
    if (!user) {
      return null;
    }
    return user;
  }
  async findByGoogleId(googleId: string): Promise<User | null> {
    const user = this.items.find((item) => item.googleId === googleId);
    if (!user) return null;
    return user;
  }
}
