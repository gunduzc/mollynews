# SlashNews

A Hacker News-style content aggregation platform built with Next.js and TypeScript. This project demonstrates software design patterns in a clean, layered architecture.

## Features

- User registration and authentication
- Submit link or text posts
- Browse posts feed

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Database:** SQLite (libsql)
- **Architecture:** Layered (Presentation, Application, Domain, Infrastructure)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app runs at `http://localhost:3000`. A SQLite database is created automatically in the `data/` folder.

## Project Structure

```
src/
├── app/                  # Next.js pages and API routes
├── application/          # Use case services
│   └── services/
├── domain/               # Core business logic
│   ├── entities/
│   ├── builders/
│   ├── factories/
│   └── interfaces/
└── infrastructure/       # Database and external dependencies
    ├── db/
    └── repositories/
```

## Design Patterns Used

| Pattern | Location | Purpose |
|---------|----------|---------|
| Factory Method | `domain/factories/PostFactory.ts` | Create link vs text posts without conditionals at call sites |
| Builder | `domain/builders/PostBuilder.ts` | Construct Post objects step-by-step with validation |
| Repository | `domain/interfaces/`, `infrastructure/repositories/` | Abstract data access from business logic |

## Documentation

See the `docs/` folder for project documentation and the `taskdef/` folder for assignment specifications.

## Team

- Cemil Gunduz
- Ahmed Kasik
- Yusuf Can Bahadirlioglu
