"use client";

import Navbar from "../../components/Navbar";
import PageHeader from "../../components/PageHeader";
import { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleRegister() {
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Register failed");
      return;
    }

    window.location.href = "/login";
  }

  return (
    <main className="page-shell">
      <Navbar />

      <section className="auth-layout">
        <PageHeader
          eyebrow="Join The Board"
          title="Create a community-ready account in seconds."
          description="Register to post links, write text submissions, vote on ideas and participate in threaded discussions."
          primaryHref="/login"
          primaryLabel="Already registered?"
          secondaryHref="/"
          secondaryLabel="See the feed"
        />

        <section className="form-card">
          <h2>Register</h2>
          <p className="section-copy">
            Pick a simple username and a secure password to get started.
          </p>

          <div className="form-stack">
            <div className="form-field">
              <label>Username</label>
              <input
                className="text-input"
                placeholder="news_builder"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                className="text-input"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error ? <div className="error-banner">{error}</div> : null}

            <div className="submit-row">
              <button className="pill-button" onClick={handleRegister}>
                Create account
              </button>
              <a className="ghost-button" href="/login">
                Go to login
              </a>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
