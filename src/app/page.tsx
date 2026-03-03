import Link from "next/link";
import { cookies } from "next/headers";
import { authService, postReadRepository } from "../infrastructure/container";

export default async function HomePage() {
  const sessionToken = cookies().get("session")?.value;
  const user = sessionToken ? await authService.getUserBySessionToken(sessionToken) : null;
  const posts = await postReadRepository.listLatest(20);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1>SlashNews</h1>
      <p>UC-3 Submit Post demo with Builder + Factory Method + Repository.</p>

      <section style={{ marginTop: 16 }}>
        <strong>Session</strong>
        <div style={{ marginTop: 8 }}>
          {user ? (
            <div>
              <div>Logged in as: {user.username}</div>
              <form action="/api/auth/logout" method="post" style={{ marginTop: 8 }}>
                <button type="submit">Logout</button>
              </form>
            </div>
          ) : (
            <div>Not logged in.</div>
          )}
        </div>
      </section>

      <nav style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
        <Link href="/register">Register</Link>
        <Link href="/login">Login</Link>
        <Link href="/submit">Submit Post</Link>
      </nav>

      <section style={{ marginTop: 24 }}>
        <strong>Latest Posts</strong>
        {posts.length === 0 ? (
          <p style={{ color: "#555" }}>No posts yet. Submit the first one.</p>
        ) : (
          <ul style={{ marginTop: 8 }}>
            {posts.map((post) => (
              <li key={post.id} style={{ marginBottom: 12 }}>
                <div>
                  <strong>{post.title}</strong> <span style={{ color: "#666" }}>({post.type})</span>
                </div>
                {post.url ? (
                  <div style={{ fontSize: 14, color: "#2b6cb0" }}>{post.url}</div>
                ) : null}
                {post.text ? (
                  <div style={{ fontSize: 14, color: "#444" }}>{post.text}</div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p style={{ marginTop: 24, color: "#555" }}>
        Authentication is minimal and intended for coursework only.
      </p>
    </main>
  );
}
