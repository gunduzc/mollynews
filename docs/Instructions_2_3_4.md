**2.** **Four Core Use Cases in a Software Requirements Specification
Document**

> **Use Case 1:**
>
> **Title:** Browse Ranked Feed
>
> **Main Actor:** User
>
> **Goal:** View a ranked list of posts (e.g., Top, New).
>
> **Preconditions:**

- The system is running.

- Posts exist in the database.

> **Main Flow:**

1.  The user accesses the main page.

2.  The user selects a feed type (if applicable).

3.  The system retrieves posts using the selected ranking strategy.

4.  The system displays the ranked feed.

> **Postconditions:**

- The user can view and select posts from the feed.

> **Use Case 2:**
>
> **Title:** Submit Post
>
> **Main Actor:** User
>
> **Goal:** Submit a new post (link or text).
>
> **Preconditions:**

- The user is authenticated (if authentication is implemented).

> **Main Flow:**

1.  The user opens the submission form.

2.  The user enters post details (title and content/link).

3.  The system validates the input.

4.  The system saves the post to the database.

5.  The system confirms successful submission.

> **Postconditions:**

- The new post appears in the appropriate feed.

> **Use Case 3:**
>
> **Title:** Add Comment
>
> **Main Actor:** User
>
> **Goal:** Add a comment to a post.
>
> **Preconditions:**

- The selected post exists.

> **Main Flow:**

1.  The user enters comment text.

2.  The system validates the input.

3.  The system stores the comment in the database.

4.  The system updates the comment thread.

> **Postconditions:**

- The comment becomes visible under the post.

> **Use Case 4:**
>
> **Title:** Vote Content
>
> **Main Actor:** User
>
> **Goal:** Increase or decrease the score of a post or comment.
>
> **Preconditions:**

- The content exists.

- The user has not already voted (if voting restrictions apply).

> **Main Flow:**

1.  The user selects the upvote option.

2.  The system validates the voting action.

3.  The system records the vote.

4.  The system updates the score and ranking if necessary.

> **Postconditions:**

- The content score increases and ranking may change accordingly.

**3. Design Software Architecture**

**a) High-Level Architecture Design**

SlashNews is designed using a layered (n-tier) architecture to keep
responsibilities separated, improve maintainability, and support
configurability. The system is composed of four main layers:
**Presentation**, **Application**, **Domain**, and **Infrastructure**.

**1) Presentation Layer (UI + Controllers)**

- Provides web pages and handles user requests (e.g., browsing feeds,
  opening posts, submitting posts/comments, voting, moderation actions).

- Routes requests to application services and renders responses.

- Contains controller endpoints for: **Feed**, **Post**, **Comment**,
  **Vote**, **Moderation**, and **Accessibility (Read Aloud)**.

**2) Application Layer (Use Case / Service Layer)**

- Implements the business workflows for each use case.

- Coordinates domain logic, repositories, and cross-cutting concerns.

- Main services (examples):

  - **FeedService**: Browse Ranked Feed

  - **PostService**: View Post & Comments, Submit Post

  - **CommentService**: Add Comment

  - **VoteService**: Upvote Content

  - **ModerationService**: Moderate Content

  - **AccessibilityService / ReadAloudService**: Voice Reading Support

**3) Domain Layer (Core Business Logic)**

- Contains core entities and rules independent of frameworks:

  - Entities: **User**, **Role (User/Moderator)**, **Post**,
    **Comment**, **Vote**

- Pattern-focused components:

  - **Strategy** for ranking algorithms (e.g., Top/New ranking
    strategies).

  - **Command** for user actions (e.g., UpvoteCommand,
    AddCommentCommand, ModerateRemoveCommand).

  - **State** for content visibility/status (e.g.,
    Normal/Hidden/Removed).

- Defines interfaces (ports) for data access and external dependencies:

  - PostRepository, CommentRepository, VoteRepository, UserRepository

**4) Infrastructure Layer (Data + External Libraries)**

- Implements repository interfaces using the chosen database technology.

- Handles persistence, migrations, and data mapping (DTO ↔ domain).

- Provides optional utility integrations used internally:

  - A **Text-to-Speech (TTS) provider module** for “Read Aloud” (can be
    a library or local service).

**Mapping Architecture to Use Cases**

- **Browse Ranked Feed** → Presentation (FeedController) → Application
  (FeedService) → Domain (RankStrategy) → Infrastructure
  (PostRepository)

- **View Post & Comments** → PostController → PostService → Repositories
  (Post/Comment)

- **Submit Post** → PostController → PostService → PostRepository

- **Add Comment** → CommentController → CommentService →
  CommentRepository

- **Upvote Content** → VoteController → VoteService → VoteRepository
  (and score update)

- **Moderate Content** → ModerationController → ModerationService →
  Authorization/Role Check → Repositories

- **Voice Reading Support** → AccessibilityController → ReadAloudService
  → TTS Provider

**Key Architectural Notes**

- **Configurability:** Ranking rules and moderation policies are
  configurable and replaceable without changing core flow
  (Strategy/Policy-based design).

- **Separation of concerns:** UI, workflows, business rules, and
  persistence are isolated to avoid tight coupling.

- **Extensibility:** New feed types, content types, or moderation rules
  can be added by extending strategies/commands and updating
  configuration.

**b) Structured Description**

SlashNews uses a **client–server, layered architecture**.

- **Client (Web Browser):** Users and moderators interact with the
  system through a web UI.

- **Presentation Layer (Controllers + Views):** Handles HTTP requests,
  input validation (basic), and page rendering.

- **Application Layer (Use Case Services):** Orchestrates workflows for
  each use case (feed browsing, post viewing, commenting, voting,
  moderation, voice reading).

- **Domain Layer (Business Logic):** Core entities and rules (Post,
  Comment, Vote, User/Role) and pattern-based components
  (Strategy/Command/State).

- **Infrastructure Layer:** Database access (repositories/ORM),
  persistence, and optional TTS provider module for voice reading
  support.

- **Database (Relational DB):** Stores posts, comments, votes, and user
  roles.

<img src="media/image1.png" style="width:6.3in;height:3.72569in"
alt="metin, ekran görüntüsü, diyagram, 3B modelleme içeren bir resim Yapay zeka tarafından oluşturulmuş içerik yanlış olabilir." />

**c) Explanation of Architectural Support for Use Cases**

The layered client–server architecture of SlashNews directly supports
the realization of the identified use cases by clearly separating
responsibilities across system components. The **Presentation Layer**
handles user interactions such as browsing feeds, viewing posts,
submitting content, voting, moderating, and using voice reading support.
These requests are forwarded to the **Application Layer**, where
dedicated services coordinate the workflow for each use case.

The **Domain Layer** encapsulates the core business logic and rules,
ensuring that operations such as ranking, voting, moderation, and
content state management are handled consistently and independently of
the user interface. The use of design patterns (e.g., Strategy for
ranking, Command for user actions, State for content status) enables
flexibility and configurability while maintaining clean separation of
concerns. Finally, the **Infrastructure Layer** manages data persistence
and optional voice support services, ensuring reliable storage and
retrieval of system data.

This separation allows each use case to be implemented in a modular and
maintainable manner, facilitating extensibility and future enhancements
without impacting unrelated components.

**4. Apply Design Patterns**

**<u>Use Case 1: Browse Ranked Feed</u>**

**Pattern:** Strategy

**Why it is appropriate:**

The ranking logic (e.g., Top, New, or future ranking types) may change
or expand over time. The Strategy pattern allows ranking algorithms to
be interchangeable without modifying the core feed logic.

**How it will be applied:**

An interface such as IRankingStrategy will be defined in the domain
layer. Concrete implementations (e.g., TopRankingStrategy,
NewRankingStrategy) will implement this interface. The FeedService will
use dependency injection or configuration to select the appropriate
strategy at runtime, enabling extensibility without modifying existing
logic.

**<u>Use Case 2: View Post and Comments</u>**

**Pattern:** Repository

**Why it is appropriate:**

Accessing posts and comments requires interaction with a data source.
The Repository pattern abstracts data access, preventing business logic
from depending directly on database implementation details.

**How it will be applied:**

Interfaces such as PostRepository and CommentRepository will be defined
in the domain/application boundary. The infrastructure layer will
implement these interfaces. The PostService will interact only with
repository interfaces, allowing future changes in database technology
without affecting the core logic.

**<u>Use Case 3: Submit Post</u>**

**Pattern:** Factory Method

**Why it is appropriate:**

Posts may have different types (e.g., link posts or text posts), each
requiring specific initialization or validation rules. The Factory
Method centralizes object creation logic and supports future extension.

**How it will be applied:**

A PostFactory will create the appropriate post object (e.g., LinkPost,
TextPost) based on input parameters. The PostService will use the
factory instead of directly instantiating objects, improving modularity
and scalability.

**<u>Use Case 4: Add Comment</u>**

**Pattern:** Command

**Why it is appropriate:**

Adding a comment represents a user action that may require validation,
authorization checks, logging, or future extensions. The Command pattern
encapsulates this action into a single object.

**How it will be applied:**

An AddCommentCommand class will encapsulate the logic for adding a
comment. The execute() method will handle validation and persistence.
The CommentService will trigger the command, making user actions modular
and easier to extend.

**<u>Use Case 5: Upvote Content</u>**

**Pattern:** Command

**Why it is appropriate:**

Upvoting is a user-triggered action with rules (e.g., preventing
duplicate votes). Encapsulating this logic in a command object ensures
separation of concerns and future flexibility.

**How it will be applied:**

An UpvoteCommand will be created containing vote validation and update
logic. The VoteService will execute this command. This structure allows
easy extension (e.g., undo vote, rate limiting, logging).

**<u>Use Case 6: Moderate Content</u>**

**Pattern:** State

**Why it is appropriate:**

Content may transition between states such as Normal, Hidden, or
Removed. The State pattern helps manage behavior based on the content’s
current status.

**How it will be applied:**

A ContentState model will define possible states. The ModerationService
will change the state when moderation actions occur. The presentation
layer will display or restrict content based on its state, ensuring
consistent behavior across the system.

**<u>Use Case 7: Use Voice Reading Support</u>**

**Pattern:** Adapter

**Why it is appropriate:**

Voice reading relies on external text-to-speech (TTS) libraries or
services. The Adapter pattern allows the system to integrate external
services while maintaining independence from specific implementations.

**How it will be applied:**

An interface such as ITextToSpeech will be defined. A
TextToSpeechAdapter will wrap the chosen TTS library. The
ReadAloudService will depend only on the interface, allowing replacement
of the TTS provider without modifying business logic.
