"use client";

import { useState } from "react";

export default function SubmitPage() {
  const [type, setType] = useState<"link" | "text">("link");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        type,
        url: type === "link" ? url : undefined,
        text: type === "text" ? text : undefined
      })
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Submission failed");
      return;
    }

    setTitle("");
    setUrl("");
    setText("");
    setMessage("Post submitted successfully.");
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1>Submit Post</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Type
          <select value={type} onChange={(e) => setType(e.target.value as "link" | "text")}>
            <option value="link">Link</option>
            <option value="text">Text</option>
          </select>
        </label>

        {type === "link" ? (
          <label style={{ display: "grid", gap: 6 }}>
            URL
            <input value={url} onChange={(e) => setUrl(e.target.value)} required />
          </label>
        ) : (
          <label style={{ display: "grid", gap: 6 }}>
            Text
            <textarea value={text} onChange={(e) => setText(e.target.value)} required rows={5} />
          </label>
        )}

        <button type="submit">Submit</button>
      </form>
      {message ? <p style={{ marginTop: 12 }}>{message}</p> : null}
    </main>
  );
}
