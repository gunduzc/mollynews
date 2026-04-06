"use client";

import Navbar from "../../../components/Navbar";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useModeratorMode } from "../../../components/useModeratorMode";

type Post = {
  id: string;
  title: string;
  authorUsername: string;
  text?: string | null;
  url?: string | null;
  type: "link" | "text";
  score: number;
  status: "normal" | "hidden" | "removed";
  createdAt: number;
  currentUserVote?: -1 | 0 | 1;
};

type CommentNode = {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  parentCommentId?: string | null;
  content: string;
  score: number;
  status: "normal" | "hidden" | "removed";
  createdAt: number;
  childCount: number;
  currentUserVote?: -1 | 0 | 1;
  children: CommentNode[];
};

type CommentsResponse = {
  thread: CommentNode[];
  totalComments: number;
};

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const postId = params.id;
  const [post, setPost] = useState<Post | null>(null);
  const [thread, setThread] = useState<CommentNode[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isCommentComposerOpen, setIsCommentComposerOpen] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [collapsedComments, setCollapsedComments] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { isModeratorMode, isReady } = useModeratorMode();

  function buildDefaultCollapsedState(nodes: CommentNode[], depth = 0) {
    const nextState: Record<string, boolean> = {};

    for (const node of nodes) {
      if (node.children.length > 0) {
        nextState[node.id] = depth >= 1;
        Object.assign(nextState, buildDefaultCollapsedState(node.children, depth + 1));
      }
    }

    return nextState;
  }

  async function load(showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }

    const postRes = await fetch(`/api/posts/${postId}`);
    const postData = await postRes.json();

    const commentRes = await fetch(`/api/posts/${postId}/comments`);
    const commentData: CommentsResponse = await commentRes.json();

    setPost(postData.post);
    setThread(commentData.thread ?? []);
    setTotalComments(commentData.totalComments ?? 0);
    setCollapsedComments((current) => {
      const defaults = buildDefaultCollapsedState(commentData.thread ?? []);
      return { ...defaults, ...current };
    });
    if (showLoading) {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!postId) {
      return;
    }

    load();
  }, [postId]);

  async function createComment(content: string, parentCommentId?: string) {
    setError("");
    setStatusMessage("");

    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        parentCommentId: parentCommentId ?? undefined,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Comment could not be added");
      return false;
    }

    setStatusMessage(parentCommentId ? "Reply added successfully." : "Comment added successfully.");
    await load(false);
    return true;
  }

  async function addComment() {
    const created = await createComment(commentText);
    if (created) {
      setCommentText("");
      setIsCommentComposerOpen(false);
    }
  }

  async function addReply(parentCommentId: string) {
    const replyText = (replyDrafts[parentCommentId] ?? "").trim();
    if (!replyText) {
      setError("Reply content is required");
      return;
    }

    const created = await createComment(replyText, parentCommentId);
    if (created) {
      setReplyDrafts((current) => ({ ...current, [parentCommentId]: "" }));
      setActiveReplyId(null);
      setExpandedReplies((current) => ({ ...current, [parentCommentId]: true }));
    }
  }

  async function moderate(action: string) {
    setError("");
    setStatusMessage("");

    const response = await fetch(`/api/moderation/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Moderation failed");
      return;
    }

    if (action === "remove" && data.deleted) {
      window.location.href = "/";
      return;
    }

    setStatusMessage(`Post action applied: ${action}`);
    load(false);
  }

  async function voteOnPost(method: "POST" | "DELETE") {
    setError("");
    setStatusMessage("");

    const response = await fetch(`/api/posts/${postId}/upvote`, {
      method,
    });

    const data = await response.json();
    if (!response.ok) {
      setError(
        data.error ??
          (method === "POST"
            ? "Post could not be upvoted"
            : "Post could not be downvoted")
      );
      return;
    }

    setStatusMessage(
      data.message ?? (method === "POST" ? "Post upvoted." : "Post downvoted.")
    );
    load(false);
  }

  async function voteOnComment(commentId: string, method: "POST" | "DELETE") {
    setError("");
    setStatusMessage("");

    const response = await fetch(`/api/comments/${commentId}/upvote`, {
      method,
    });

    const data = await response.json();
    if (!response.ok) {
      setError(
        data.error ??
          (method === "POST"
            ? "Comment could not be upvoted"
            : "Comment could not be downvoted")
      );
      return;
    }

    setStatusMessage(
      data.message ?? (method === "POST" ? "Comment upvoted." : "Comment downvoted.")
    );
    load(false);
  }

  async function moderateComment(commentId: string, action: "hide" | "remove" | "restore") {
    setError("");
    setStatusMessage("");

    const response = await fetch(`/api/moderation/comments/${commentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Comment moderation failed");
      return;
    }

    setStatusMessage(
      data.deleted
        ? "Comment removed successfully."
        : `Comment action applied: ${action}`
    );
    load(false);
  }

  function toggleExpandedReplies(commentId: string) {
    setExpandedReplies((current) => ({
      ...current,
      [commentId]: !current[commentId],
    }));
  }

  function toggleCollapse(commentId: string) {
    setCollapsedComments((current) => ({
      ...current,
      [commentId]: !current[commentId],
    }));
  }

  function toggleReply(commentId: string) {
    setActiveReplyId((current) => (current === commentId ? null : commentId));
  }

  function formatRelativeAge(createdAt: number) {
    const diffSeconds = Math.max(1, Math.floor((Date.now() - createdAt) / 1000));

    if (diffSeconds < 60) {
      return `-${diffSeconds}sn-`;
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `-${diffMinutes}dk-`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `-${diffHours}sa-`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `-${diffDays}g-`;
    }

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) {
      return `-${diffWeeks}hf-`;
    }

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `-${diffMonths}ay-`;
    }

    const diffYears = Math.floor(diffDays / 365);
    return `-${diffYears}y-`;
  }

  function renderCommentNode(node: CommentNode, depth = 0) {
    const isCollapsed = collapsedComments[node.id] ?? false;
    const hasChildren = node.children.length > 0;
    const isReplying = activeReplyId === node.id;
    const usesTopLevelMoreReplies = depth === 0;
    const isExpanded = expandedReplies[node.id] ?? false;
    const visibleChildren = hasChildren
      ? usesTopLevelMoreReplies
        ? isExpanded
          ? node.children
          : node.children.slice(0, 1)
        : isCollapsed
          ? []
          : node.children
      : [];
    const hiddenReplyCount =
      hasChildren && usesTopLevelMoreReplies
        ? node.children.length - visibleChildren.length
        : 0;

    return (
      <div key={node.id} className={`comment-card${depth > 0 ? " is-reply" : ""}`}>
        <div className="comment-meta">
          <span>{node.authorUsername}</span>
          <span className="meta-badge">Score {node.score}</span>
          <span className="meta-badge">{formatRelativeAge(node.createdAt)}</span>
        </div>

        <div className="comment-body">{node.content}</div>

        <div className="comment-actions">
          <button
            className={`vote-pill${node.currentUserVote === 1 ? " active-up" : ""}`}
            onClick={() => voteOnComment(node.id, "POST")}
            aria-label="Upvote comment"
          >
            ▲
          </button>
          <button
            className={`vote-pill${node.currentUserVote === -1 ? " active-down" : ""}`}
            onClick={() => voteOnComment(node.id, "DELETE")}
            aria-label="Downvote comment"
          >
            ▼
          </button>
          <button className="ghost-button" onClick={() => toggleReply(node.id)}>
            {isReplying ? "Cancel reply" : "Reply"}
          </button>
          {hasChildren && !usesTopLevelMoreReplies ? (
            <button
              className="thread-toggle"
              onClick={() => toggleCollapse(node.id)}
              aria-label={isCollapsed ? "Expand replies" : "Collapse replies"}
              title={isCollapsed ? "Expand replies" : "Collapse replies"}
            >
              <span className="thread-toggle-icon" aria-hidden="true">
                <span
                  className={`thread-toggle-caret${
                    isCollapsed ? " is-collapsed" : " is-expanded"
                  }`}
                />
              </span>
              {isCollapsed ? <span>{node.childCount}</span> : null}
            </button>
          ) : null}
          {isModeratorMode ? (
            <>
              <button
                className="ghost-button moderation-inline-button"
                onClick={() => moderateComment(node.id, "hide")}
              >
                Hide
              </button>
              <button
                className="danger-button moderation-inline-button"
                onClick={() => moderateComment(node.id, "remove")}
              >
                Remove
              </button>
              <button
                className="ghost-button moderation-inline-button"
                onClick={() => moderateComment(node.id, "restore")}
              >
                Restore
              </button>
            </>
          ) : null}
        </div>

        {isReplying ? (
          <div className="reply-box">
            <textarea
              className="text-area reply-area"
              value={replyDrafts[node.id] ?? ""}
              onChange={(event) =>
                setReplyDrafts((current) => ({
                  ...current,
                  [node.id]: event.target.value,
                }))
              }
              placeholder="Write a reply to this comment."
            />
            <div className="submit-row">
              <button className="pill-button" onClick={() => addReply(node.id)}>
                Post reply
              </button>
            </div>
          </div>
        ) : null}

        {hasChildren ? (
          <div className="comment-children">
            {visibleChildren.map((child) => renderCommentNode(child, depth + 1))}

            {usesTopLevelMoreReplies && hiddenReplyCount > 0 ? (
              <button
                className="more-replies-button"
                onClick={() => toggleExpandedReplies(node.id)}
              >
                More replies ({hiddenReplyCount})
              </button>
            ) : usesTopLevelMoreReplies && node.children.length > 1 ? (
              <button
                className="more-replies-button"
                onClick={() => toggleExpandedReplies(node.id)}
              >
                Hide replies
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  if (loading || !post) {
    return (
      <main className="page-shell">
        <Navbar />
        <div className="loading-shell">Loading discussion...</div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <Navbar />

      <section className="detail-layout">
        <div className="detail-main">
          <div className="post-card">
            <div className="post-meta">
              <span>{post.authorUsername}</span>
              <span className="meta-badge">{post.type === "link" ? "Link post" : "Text post"}</span>
              <span className="meta-badge">Score {post.score}</span>
              <span className="meta-badge">{post.status}</span>
              <span className="meta-badge">{formatRelativeAge(post.createdAt)}</span>
            </div>

            <h1 className="post-title">{post.title}</h1>

            {post.url ? (
              <p>
                <a className="post-link" href={post.url} target="_blank" rel="noreferrer">
                  {post.url}
                </a>
              </p>
            ) : null}

            <div className="post-body">
              {post.text?.trim() || "This thread is centered around the shared link."}
            </div>

            <div className="inline-actions" style={{ marginTop: 18 }}>
              <button
                className={`vote-pill${post.currentUserVote === 1 ? " active-up" : ""}`}
                onClick={() => voteOnPost("POST")}
                aria-label="Upvote post"
              >
                ▲
              </button>
              <button
                className={`vote-pill${post.currentUserVote === -1 ? " active-down" : ""}`}
                onClick={() => voteOnPost("DELETE")}
                aria-label="Downvote post"
              >
                ▼
              </button>
              <a className="ghost-button" href="/">
                Back to feed
              </a>
            </div>

            {isModeratorMode ? (
              <div className="moderation-panel" style={{ marginTop: 18 }}>
                <div className="comment-meta" style={{ marginBottom: 12 }}>
                  <span className="meta-badge">Moderator Mode</span>
                </div>
                <div className="moderation-row">
                  <button className="ghost-button" onClick={() => moderate("hide")}>
                    Hide
                  </button>
                  <button className="danger-button" onClick={() => moderate("remove")}>
                    Remove
                  </button>
                  <button className="ghost-button" onClick={() => moderate("restore")}>
                    Restore
                  </button>
                </div>
              </div>
            ) : null}

            {error ? <div className="error-banner" style={{ marginTop: 18 }}>{error}</div> : null}
            {statusMessage ? (
              <div className="success-banner" style={{ marginTop: 18 }}>
                {statusMessage}
              </div>
            ) : null}
          </div>

          <div className="surface-card" style={{ marginTop: 16 }}>
            <h2>Comments</h2>
            <p className="section-copy">
              Add a top-level comment or reply directly inside an existing branch.
            </p>

            {!isCommentComposerOpen ? (
              <div className="submit-row" style={{ marginBottom: 20 }}>
                <button
                  className="ghost-button write-comment-button"
                  onClick={() => setIsCommentComposerOpen(true)}
                >
                  <svg
                    className="write-comment-icon"
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
                  Write a comment
                </button>
              </div>
            ) : (
              <div className="form-stack" style={{ marginBottom: 20 }}>
                <div className="form-field">
                  <label>Add a comment</label>
                  <textarea
                    className="text-area"
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Write a thoughtful reply to this thread."
                  />
                </div>
                <div className="submit-row">
                  <button className="pill-button" onClick={addComment}>
                    Add Comment
                  </button>
                  <button
                    className="ghost-button"
                    onClick={() => {
                      setIsCommentComposerOpen(false);
                      setCommentText("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {thread.length === 0 ? (
              <div className="empty-card">No comments yet. Be the first to start the thread.</div>
            ) : (
              <div className="comment-stack">{thread.map((node) => renderCommentNode(node))}</div>
            )}
          </div>
        </div>

        <aside className="detail-sidebar">
          <div className="surface-card">
            <h3>Discussion Details</h3>
            <p className="muted">
              Follow the flow of the conversation, jump between branches, and keep
              longer threads easy to scan.
            </p>
            <ul className="side-list">
              <li>
                <strong>{totalComments}</strong>
                <div className="muted">Comments in this thread</div>
              </li>
              <li>
                <strong>{thread.length}</strong>
                <div className="muted">Top-level discussion starters</div>
              </li>
              <li>
                <strong>{isModeratorMode ? "Moderator view" : "Standard view"}</strong>
                <div className="muted">
                  {isReady && isModeratorMode
                    ? "Hide keeps content in the database, remove deletes it permanently."
                    : "Moderator tools stay out of the way until you need them."}
                </div>
              </li>
            </ul>
          </div>

          <div className="side-card">
            <h3>Thread Tips</h3>
            <ul className="side-list">
              <li>
                <strong>Reply in place</strong>
                <div className="muted">Each comment can open its own inline reply composer.</div>
              </li>
              <li>
                <strong>Collapse deep branches</strong>
                <div className="muted">Long subthreads can be folded without hiding the whole page.</div>
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
