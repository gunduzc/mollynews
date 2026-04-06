"use client";

import Navbar from "../../components/Navbar";
import PageHeader from "../../components/PageHeader";
import { useEffect, useState } from "react";

type User = {
  id: string;
  username: string;
};

export default function SubmitPage() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"text" | "link">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    }

    loadMe();
  }, []);

  async function handleSubmit() {
    setError("");
    setSubmitting(true);

    try {
      const payload =
        type === "text"
          ? { title, type, text }
          : { title, type, url };

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Post could not be created");
        return;
      }

      window.location.href = "/";
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <Navbar />
      <section className="submit-layout">
        <PageHeader
          eyebrow="New Submission"
          title="Share a link or publish a text post."
          description="Start a new discussion by writing a post title and choosing the format that fits your content."
          primaryHref="/"
          primaryLabel="Back to feed"
          secondaryHref="/login"
          secondaryLabel="Login"
        />

        <section className="form-card">
          <h2>Create Post</h2>
          <p className="section-copy">
            Titles should be descriptive, and your post type decides whether you
            share a link or write a body.
          </p>

          <div className="form-stack">
            {loadingUser ? <div className="info-banner">Checking your session...</div> : null}

            {!loadingUser && !user ? (
              <div className="error-banner">
                You need to log in before submitting a post.
              </div>
            ) : user ? (
              <div className="success-banner">Posting as @{user.username}</div>
            ) : null}

            <div className="form-field">
              <label>Title</label>
              <input
                className="text-input"
                placeholder="What should the community know?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loadingUser || !user || submitting}
              />
            </div>

            <div className="form-field">
              <label>Post type</label>
              <select
                className="select-input"
                value={type}
                onChange={(e) => setType(e.target.value as "text" | "link")}
                disabled={loadingUser || !user || submitting}
              >
                <option value="text">Text Post</option>
                <option value="link">Link Post</option>
              </select>
            </div>

            {type === "text" ? (
              <div className="form-field">
                <label>Body</label>
                <textarea
                  className="text-area"
                  placeholder="Share your thoughts, implementation details, or project notes."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={loadingUser || !user || submitting}
                />
              </div>
            ) : (
              <div className="form-field">
                <label>URL</label>
                <input
                  className="text-input"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loadingUser || !user || submitting}
                />
              </div>
            )}

            {error ? <div className="error-banner">{error}</div> : null}

            <div className="submit-row">
              <button
                className="pill-button"
                onClick={handleSubmit}
                disabled={loadingUser || !user || submitting}
              >
                {submitting ? "Submitting..." : "Publish post"}
              </button>
              <a className="ghost-button" href="/">
                Cancel
              </a>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
