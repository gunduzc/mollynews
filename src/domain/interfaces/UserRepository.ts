import { User } from "../entities/User";

export interface UserRepository {
  create(user: User): Promise<void>;
  findByUsername(username: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
