import { AuthService } from "../application/services/AuthService";
import { SubmitPostService } from "../application/services/SubmitPostService";
import { PostFactorySelector } from "../domain/factories/PostFactory";
import { SqlitePostRepository } from "./repositories/SqlitePostRepository";
import { SqliteUserRepository } from "./repositories/SqliteUserRepository";
import { SqliteSessionRepository } from "./repositories/SqliteSessionRepository";

const postRepository = new SqlitePostRepository();
const userRepository = new SqliteUserRepository();
const sessionRepository = new SqliteSessionRepository();

const postFactorySelector = new PostFactorySelector();

export const submitPostService = new SubmitPostService(postRepository, postFactorySelector);
export const authService = new AuthService(userRepository, sessionRepository);
export const postReadRepository = postRepository;
