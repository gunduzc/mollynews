import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1>SlashNews</h1>
      <p>UC-3 Submit Post demo with Builder + Factory Method + Repository.</p>
      <nav style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Link href="/register">Register</Link>
        <Link href="/login">Login</Link>
        <Link href="/submit">Submit Post</Link>
      </nav>
      <p style={{ marginTop: 24, color: "#555" }}>
        Authentication is minimal and intended for coursework only.
      </p>
    </main>
  );
}
