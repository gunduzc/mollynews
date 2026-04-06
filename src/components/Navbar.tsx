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
          Feed
        </a>
        <a
          className={`nav-link${pathname === "/submit" ? " active" : ""}`}
          href="/submit"
        >
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
