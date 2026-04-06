"use client";

import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import { useEffect, useState } from "react";

type Post = {
  id: string;
  title: string;
  score: number;
  type?: "link" | "text";
  text?: string | null;
  url?: string | null;
  currentUserVote?: -1 | 0 | 1;
};

type MeResponse = {
  user: {
    id: string;
    username: string;
  } | null;
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [mode, setMode] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<MeResponse["user"]>(null);

  async function loadFeed(selectedMode: string, showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }
    const res = await fetch(`/api/feed?mode=${selectedMode}`);
    const data = await res.json();
    setPosts(data.posts);
    if (showLoading) {
      setLoading(false);
    }
  }

  async function loadMe() {
    const res = await fetch("/api/auth/me");
    const data: MeResponse = await res.json();
    setUser(data.user);
  }

  async function vote(postId: string, method: "POST" | "DELETE") {
    const res = await fetch(`/api/posts/${postId}/upvote`, { method });

    if (!res.ok) {
      return;
    }

    loadFeed(mode, false);
  }

  useEffect(() => {
    loadFeed(mode);
    loadMe();
  }, [mode]);

  return (
    <main className="page-shell">
      <Navbar />

      <section className="hero-grid">
        <PageHeader
          eyebrow="Community Pulse"
          title="Discover what the SlashNews community is talking about."
          description="Browse ranked stories, open active discussions, and keep up with the newest links and text posts in one place."
          primaryHref="/submit"
          primaryLabel="Create a post"
          secondaryHref={!user ? "/register" : undefined}
          secondaryLabel={!user ? "Open an account" : undefined}
        />

        <aside className="side-card">
          <h3>Community Highlights</h3>
          <p className="muted">
            Follow the most active conversations, jump into fresh submissions,
            and explore what is rising across the board.
          </p>

          <ul className="side-list">
            <li>
              <strong>Multiple feed views</strong>
              <div className="muted">Switch between Latest, Top and Trending posts.</div>
            </li>
            <li>
              <strong>Fast discussion flow</strong>
              <div className="muted">Open a post, vote, and join the thread in seconds.</div>
            </li>
            <li>
              <strong>Fresh submissions</strong>
              <div className="muted">Share a link or publish a text post directly from the feed.</div>
            </li>
          </ul>
        </aside>
      </section>

      <section className="content-grid" style={{ marginTop: 24 }}>
        <div>
          <div className="filter-row">
            {[
              { value: "latest", label: "Latest" },
              { value: "top", label: "Top" },
              { value: "trending", label: "Trending" },
            ].map((option) => (
              <button
                key={option.value}
                className={`filter-chip${mode === option.value ? " active" : ""}`}
                onClick={() => setMode(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="empty-card">Loading feed...</div>
          ) : posts.length === 0 ? (
            <div className="empty-card">
              No posts yet. Start the board with the first submission.
            </div>
          ) : (
            <div className="feed-stack">
              {posts.map((post, index) => (
                <article className="feed-card" key={post.id}>
                  <div className="vote-rail">
                    <button
                      className={`vote-pill${post.currentUserVote === 1 ? " active-up" : ""}`}
                      onClick={() => vote(post.id, "POST")}
                      aria-label="Upvote post"
                    >
                      ▲
                    </button>
                    <div className="vote-count">{post.score}</div>
                    <button
                      className={`vote-pill${post.currentUserVote === -1 ? " active-down" : ""}`}
                      onClick={() => vote(post.id, "DELETE")}
                      aria-label="Downvote post"
                    >
                      ▼
                    </button>
                  </div>

                  <div>
                    <div className="feed-meta">
                      <span className="meta-badge">
                        {mode === "latest" ? "New" : mode === "top" ? "Top" : "Trending"}
                      </span>
                      <span>{post.type === "link" ? "Link post" : "Text post"}</span>
                    </div>

                    <a
                      href={post.type === "link" && post.url ? post.url : `/posts/${post.id}`}
                      target={post.type === "link" && post.url ? "_blank" : undefined}
                      rel={post.type === "link" && post.url ? "noreferrer" : undefined}
                    >
                      <h2 className="feed-title">{post.title}</h2>
                    </a>

                    <p className="feed-summary">
                      {post.text?.trim()
                        ? `${post.text.slice(0, 180)}${post.text.length > 180 ? "..." : ""}`
                        : post.url
                          ? `External link: ${post.url}`
                          : "Open the thread to read the full discussion and interact with the post."}
                    </p>

                    <div className="inline-actions">
                      {post.type === "link" && post.url ? (
                        <a
                          className="ghost-button"
                          href={post.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open link
                        </a>
                      ) : (
                        <a className="ghost-button" href={`/posts/${post.id}`}>
                          Open discussion
                        </a>
                      )}
                      <a className="nav-link" href="/submit">
                        Share something similar
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="surface-card">
          <h3>Board Snapshot</h3>
          <p className="muted">
            Track how active the board is and which ranking mode you are
            currently browsing.
          </p>

          <div className="hero-stats">
            <div className="stat-card">
              <strong>{posts.length}</strong>
              <span>Visible stories</span>
            </div>
            <div className="stat-card">
              <strong>{mode}</strong>
              <span>Current ranking</span>
            </div>
            <div className="stat-card">
              <strong>24/7</strong>
              <span>Always on demo</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
