"use client";

import Navbar from "../../components/Navbar";
import PageHeader from "../../components/PageHeader";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Login failed");
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="page-shell">
      <Navbar />

      <section className="auth-layout">
        <PageHeader
          eyebrow="Welcome Back"
          title="Jump back into the discussion."
          description="Sign in to submit posts, vote on threads and manage content flows across the platform."
          primaryHref="/register"
          primaryLabel="Create account"
          secondaryHref="/"
          secondaryLabel="Browse feed"
        />

        <section className="form-card">
          <h2>Login</h2>
          <p className="section-copy">
            Use your SlashNews account to continue where you left off.
          </p>

          <div className="form-stack">
            <div className="form-field">
              <label>Username</label>
              <input
                className="text-input"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                className="text-input"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error ? <div className="error-banner">{error}</div> : null}

            <div className="submit-row">
              <button className="pill-button" onClick={handleLogin}>
                Login
              </button>
              <a className="ghost-button" href="/register">
                Need an account?
              </a>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
