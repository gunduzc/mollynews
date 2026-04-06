"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useModeratorMode } from "./useModeratorMode";

type MeResponse = {
  user: {
    id: string;
    username: string;
  } | null;
};

export default function Navbar() {
  const [user, setUser] = useState<MeResponse["user"]>(null);
  const pathname = usePathname();
  const { isModeratorMode } = useModeratorMode();

  async function loadMe() {
    const res = await fetch("/api/auth/me");
    const data: MeResponse = await res.json();
    setUser(data.user);
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/";
  }

  useEffect(() => {
    loadMe();
  }, []);

  return (
    <header className="topbar">
      <div className="brand">
        <a href="/" className="brand-mark">
          SN
        </a>
        <div className="brand-copy">
          <strong>SlashNews</strong>
          <span>Modern discussion board for posts, votes and threads</span>
        </div>
      </div>

      <nav className="nav-links">
        <a className={`nav-link${pathname === "/" ? " active" : ""}`} href="/">
          <svg className="nav-link-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle
              cx="11"
              cy="11"
              r="6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M16 16 L21 21"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Feed
        </a>
        <a
          className={`nav-link${pathname === "/submit" ? " active" : ""}`}
          href="/submit"
        >
          <svg
            className="nav-link-icon nav-link-icon-compose"
            viewBox="0 0 64 64"
            aria-hidden="true"
          >
            <rect
              x="14"
              y="12"
              width="30"
              height="34"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <path
              d="M18 45 L33 24 C39 17 47 14 55 16 C50 21 45 26 38 31 L24 42 Z"
              fill="currentColor"
            />
            <path
              d="M23 40 L43 22"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Submit
        </a>
      </nav>

      <div className="nav-user">
        {!user ? (
          <>
            <a className="nav-link" href="/login">
              Login
            </a>
            <a className="pill-button" href="/register">
              Join now
            </a>
          </>
        ) : (
          <>
            <div className="user-chip">
              <span className="avatar">
                {user.username.slice(0, 2).toUpperCase()}
              </span>
              <span>{user.username}</span>
              {isModeratorMode ? (
                <span className="role-badge">Moderator</span>
              ) : null}
            </div>
            <button className="ghost-button" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
