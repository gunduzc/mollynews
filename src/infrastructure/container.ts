import { AuthService } from "../application/services/AuthService";
import { SubmitPostService } from "../application/services/SubmitPostService";
import { FeedService } from "../application/services/FeedService";
import { ModerationService } from "../application/services/ModerationService";
import { CommentThreadService } from "../application/services/CommentThreadService";
import { PostFactorySelector } from "../domain/factories/PostFactory";

import { SqlitePostRepository } from "./repositories/SqlitePostRepository";
import { SqliteUserRepository } from "./repositories/SqliteUserRepository";
import { SqliteSessionRepository } from "./repositories/SqliteSessionRepository";
import { SqliteCommentRepository } from "./repositories/SqliteCommentRepository";
import { SqliteVoteRepository } from "./repositories/SqliteVoteRepository";

const postRepository = new SqlitePostRepository();
const userRepository = new SqliteUserRepository();
const sessionRepository = new SqliteSessionRepository();
const commentRepository = new SqliteCommentRepository();
const voteRepository = new SqliteVoteRepository();

const postFactorySelector = new PostFactorySelector();
const commentThreadService = new CommentThreadService();

export const submitPostService = new SubmitPostService(
  postRepository,
  postFactorySelector
);

export const authService = new AuthService(
  userRepository,
  sessionRepository
);

export const feedService = new FeedService(postRepository);
export const moderationService = new ModerationService(
  postRepository,
  commentRepository,
  voteRepository
);

export const postReadRepository = postRepository;
export const postWriteRepository = postRepository;
export const userReadRepository = userRepository;
export const sessionReadRepository = sessionRepository;
export const commentReadRepository = commentRepository;
export const commentWriteRepository = commentRepository;
export const voteReadRepository = voteRepository;
export const voteWriteRepository = voteRepository;
export const commentTreeService = commentThreadService;
