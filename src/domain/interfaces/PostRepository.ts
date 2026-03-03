import { Post } from "../entities/Post";

// Design Pattern: Repository
// Intent: Provide a collection-like interface for posts while hiding persistence details.
// Motivation: UC-3 should not depend on SQLite specifics or SQL queries.
// Improvement: Reduces data-access call sites from N to 1 repository per use case.
export interface PostRepository {
  create(post: Post): Promise<void>;
  listLatest(limit: number): Promise<Post[]>;
}
