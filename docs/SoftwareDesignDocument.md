# Software Design Document

**Use Case:** UC-3 Submit Post
**Project:** SlashNews
**Authors:** Cemil Gunduz, Ahmed Kasik, Yusuf Can Bahadirlioglu

---

## Document Task Matrix

| Section | Owner |
|---------|-------|
| System Overview, Context, Architecture | Yusuf Can Bahadirlioglu |
| Component Design, Design Patterns | Cemil Gunduz |
| Data Design, Implementation | Ahmed Kasik |

---

## 1. System Overview

UC-3 Submit Post lets authenticated users create new posts. A user fills out a form with a title and either a URL (link post) or body text (text post). The system validates, creates the post via factory, and stores it.

## 2. System Context

```
[User] --> [POST /api/posts] --> [SubmitPostService]
                                        |
                    [PostFactory] <-----+
                                        |
                    [PostRepository] <--+
                                        |
                    [SQLite] <----------+
```

## 3. Architectural Design

Layered architecture with four layers:

| Layer | Components | Role |
|-------|------------|------|
| Presentation | `POST /api/posts` | Handle HTTP, return response |
| Application | `SubmitPostService` | Validate, coordinate flow |
| Domain | `PostFactory`, `PostBuilder` | Create Post objects |
| Infrastructure | `SqlitePostRepository` | Persist to database |

Each layer only talks to the layer below. Service doesn't know SQL; Factory doesn't know HTTP.

## 4. Component Design

```
POST /api/posts
      │
      ▼
SubmitPostService
      │
      ├──▶ PostFactorySelector ──▶ LinkPostFactory / TextPostFactory ──▶ PostBuilder
      │
      └──▶ SqlitePostRepository ──▶ SQLite
```

**Interfaces:**
```typescript
submit(input: PostInput): Promise<Post>      // SubmitPostService
create(input: PostInput): Post               // PostFactory
create(post: Post): Promise<void>            // PostRepository
```

## 5. Data Design

**Posts table:**

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT | PK, UUID |
| title | TEXT | min 3 chars |
| type | TEXT | "link" or "text" |
| url | TEXT | required if link |
| text | TEXT | required if text |
| author_id | TEXT | FK to users |
| created_at | INTEGER | Unix ms |

## 6. Design Patterns

### Factory Method
**File:** `src/domain/factories/PostFactory.ts`

Creates link or text posts without type-checking in the service. `PostFactorySelector` picks the right factory; each factory handles its type's validation.

**Metric:** Zero conditionals in SubmitPostService.

### Builder
**File:** `src/domain/builders/PostBuilder.ts`

Builds Post objects step-by-step with fluent methods (`withTitle()`, `withLink()`, etc.). Validates all fields in `build()` before returning.

**Metric:** Constructor params reduced from 6 to 0 at call sites.

### Repository
**Files:** `src/domain/interfaces/PostRepository.ts`, `src/infrastructure/repositories/SqlitePostRepository.ts`

Abstracts database access. Domain defines interface; infrastructure implements it with SQLite.

**Metric:** Service has zero SQL.

## 7. Error Handling

| Error | Status | Message |
|-------|--------|---------|
| Title too short | 400 | "Title must be at least 3 characters" |
| Missing URL (link) | 400 | "URL is required for link posts" |
| Missing text (text) | 400 | "Text is required for text posts" |
| Not logged in | 401 | "Authentication required" |

Validation errors throw in SubmitPostService, caught by API route, returned as 400.

## 8. Testability

| Component | Test Approach |
|-----------|---------------|
| PostBuilder, PostFactory | Unit test directly |
| SubmitPostService | Mock PostRepository |
| API route | End-to-end with test DB |

Constructor injection enables easy mocking.

## 9. Deployment

```bash
npm install
npm run dev
```

Database creates automatically at `data/app.db`. Set `SQLITE_PATH` to change location.
