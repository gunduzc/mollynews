import { Session } from "../entities/Session";

export interface SessionRepository {
  create(session: Session): Promise<void>;
  findByToken(token: string): Promise<Session | null>;
  delete(token: string): Promise<void>;
}
