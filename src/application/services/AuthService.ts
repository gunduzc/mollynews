import { randomBytes, pbkdf2Sync, randomUUID } from "crypto";
import { User } from "../../domain/entities/User";
import { Session } from "../../domain/entities/Session";
import { UserRepository } from "../../domain/interfaces/UserRepository";
import { SessionRepository } from "../../domain/interfaces/SessionRepository";

export class AuthService {
  private readonly iterations = 100_000;
  private readonly keyLength = 64;
  private readonly digest = "sha512";
  private readonly sessionTtlMs = 1000 * 60 * 60 * 24 * 7;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository
  ) {}

  async register(username: string, password: string): Promise<User> {
    const normalized = username.trim().toLowerCase();
    if (normalized.length < 3) {
      throw new Error("Username must be at least 3 characters.");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    if (await this.userRepository.findByUsername(normalized)) {
      throw new Error("Username already exists.");
    }

    const salt = randomBytes(16).toString("hex");
    const hash = pbkdf2Sync(password, salt, this.iterations, this.keyLength, this.digest).toString("hex");

    const user: User = {
      id: randomUUID(),
      username: normalized,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: Date.now()
    };

    await this.userRepository.create(user);
    return user;
  }

  async login(username: string, password: string): Promise<Session> {
    const normalized = username.trim().toLowerCase();
    const user = await this.userRepository.findByUsername(normalized);
    if (!user) {
      throw new Error("Invalid credentials.");
    }

    const hash = pbkdf2Sync(password, user.passwordSalt, this.iterations, this.keyLength, this.digest).toString("hex");
    if (hash !== user.passwordHash) {
      throw new Error("Invalid credentials.");
    }

    const session: Session = {
      token: randomBytes(32).toString("hex"),
      userId: user.id,
      expiresAt: Date.now() + this.sessionTtlMs
    };

    await this.sessionRepository.create(session);
    return session;
  }

  async getUserBySessionToken(token: string): Promise<User | null> {
    const session = await this.sessionRepository.findByToken(token);
    if (!session) {
      return null;
    }

    if (session.expiresAt < Date.now()) {
      await this.sessionRepository.delete(token);
      return null;
    }

    return this.userRepository.findById(session.userId);
  }

  async logout(token: string): Promise<void> {
    await this.sessionRepository.delete(token);
  }
}
