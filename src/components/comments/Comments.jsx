import { useEffect, useState } from "react";
import "./Comments.css";
import toast from "react-hot-toast";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useUser } from "../../contexts/UserContext";

// Fetch video comments
const getVideoComments = async (videoId, apiKey) => {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${videoId}&key=${apiKey}&maxResults=50`
  );
  const data = await res.json();
  if (!data.items) return [];

  return data.items.map((item) => {
    const top = item.snippet.topLevelComment.snippet;
    return {
      id: item.snippet.topLevelComment.id,
      author: top.authorDisplayName,
      authorImage: top.authorProfileImageUrl,
      authorChannelId: top.authorChannelId?.value,
      text: top.textDisplay,
      canDelete: false, // will update based on user
      replies: item.replies
        ? item.replies.comments.map((r) => {
            const rs = r.snippet;
            return {
              id: r.id,
              author: rs.authorDisplayName,
              authorImage: rs.authorProfileImageUrl,
              authorChannelId: rs.authorChannelId?.value,
              text: rs.textDisplay,
              canDelete: false,
            };
          })
        : [],
    };
  });
};

// Single Comment Component
const Comment = ({ comment, onDelete, onReply, isLoggedIn }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  const handleReplySubmit = () => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    onReply(comment.id, replyText);
    setReplyText("");
    setShowReplyBox(false);
    setShowReplies(true);
  };

  return (
    <div className="comment">
      <section className="image-section">
        <img
          src={comment.authorImage || "https://i.pravatar.cc/150?img=3"}
          alt="avatar"
          className="comment-avatar"
        />
      </section>
      <section className="info-section">
        <div>
          <h4>{comment.author}</h4>
          <p dangerouslySetInnerHTML={{ __html: comment.text }} />
        </div>
        <div className="buttons">
          {isLoggedIn && (
            <button className="reply-button" onClick={() => setShowReplyBox(true)}>
              Reply
            </button>
          )}

          {comment.replies?.length > 0 && (
            <button
              className="replies-toggle"
              onClick={() => setShowReplies((prev) => !prev)}
            >
              {showReplies ? (
                <>
                  <IoIosArrowUp />
                  <span>{comment.replies.length} replies</span>
                </>
              ) : (
                <>
                  <IoIosArrowDown />
                  <span>{comment.replies.length} replies</span>
                </>
              )}
            </button>
          )}

          {isLoggedIn && comment.canDelete && (
            <button className="delete-button" onClick={() => onDelete(comment.id)}>
              Delete
            </button>
          )}
        </div>

        {showReplyBox && (
          <div className="reply-box">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              style={{ width: "100%", marginBottom: "6px" }}
            />
            <div>
              <button onClick={() => setShowReplyBox(false)}>Cancel</button>
              <button onClick={handleReplySubmit}>Post Reply</button>
            </div>
          </div>
        )}

        {showReplies &&
          comment.replies?.length > 0 &&
          comment.replies.map((reply) => (
            <div key={reply.id} className="comment reply-comment">
              <section className="image-section">
                <img
                  src={reply.authorImage || "https://i.pravatar.cc/150?img=3"}
                  alt="avatar"
                  className="comment-avatar"
                />
              </section>
              <section className="info-section">
                <div>
                  <h4>{reply.author}</h4>
                  <p dangerouslySetInnerHTML={{ __html: reply.text }} />
                </div>
                <div className="buttons">
                  {isLoggedIn && reply.canDelete && (
                    <button className="delete-button" onClick={() => onDelete(reply.id)}>
                      Delete
                    </button>
                  )}
                </div>
              </section>
            </div>
          ))}
      </section>
    </div>
  );
};

// Comments Content Component
const CommentsContent = ({ videoId }) => {
  const {
    state: { user },
  } = useUser();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  const apiKey = import.meta.env.VITE_APP_YOUTUBE_API_KEY;
  const loggedIn = !!user;

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const data = await getVideoComments(videoId, apiKey);
        setComments(
          data.map((c) => ({
            ...c,
            canDelete: c.authorChannelId === user?.channelId,
            replies: c.replies.map((r) => ({
              ...r,
              canDelete: r.authorChannelId === user?.channelId,
            })),
          }))
        );
      } catch {
        toast.error("Failed to fetch comments");
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [videoId, apiKey, user]);

  // Post a comment
  const handlePostComment = async () => {
    if (!loggedIn) return toast.error("You must be logged in to comment.");
    if (!newComment.trim()) return toast.error("Comment cannot be empty.");

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("yt_access_token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            snippet: {
              videoId,
              topLevelComment: { snippet: { textOriginal: newComment } },
            },
          }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const newCommentObject = {
        id: data.id,
        author: user.name || user.displayName,
        authorImage: data.avatar || "https://i.pravatar.cc/150?img=3",
        authorChannelId: user.channelId,
        text: newComment,
        canDelete: true,
        replies: [],
      };

      setComments((prev) => [newCommentObject, ...prev]);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (error) {
      toast.error(error.message || "Failed to post comment.");
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!loggedIn) return toast.error("You must be logged in.");
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/comments?id=${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("yt_access_token")}` },
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Delete failed");
      }

      setComments((prev) =>
        prev
          .map((c) =>
            c.id === commentId
              ? null
              : { ...c, replies: c.replies.filter((r) => r.id !== commentId) }
          )
          .filter(Boolean)
      );
      toast.success("Comment deleted");
    } catch (error) {
      toast.error(error.message || "Failed to delete comment.");
    }
  };

  // Reply to comment
  const handleReplyToComment = async (parentCommentId, replyText) => {
    if (!loggedIn) return toast.error("You must be logged in to reply");

    try {
      const res = await fetch(
        "https://www.googleapis.com/youtube/v3/comments?part=snippet",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("yt_access_token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            snippet: { parentId: parentCommentId, textOriginal: replyText },
          }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const newReply = {
        id: data.id,
        author: user.name || user.displayName,
        authorImage: data.avatar || "https://i.pravatar.cc/150?img=3",
        authorChannelId: user.channelId,
        text: replyText,
        canDelete: true,
      };

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentCommentId
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment
        )
      );
      toast.success("Reply posted!");
    } catch (error) {
      toast.error(error.message || "Failed to post reply.");
    }
  };

  return (
    <div id="comments-content">
      {loggedIn && (
        <div className="new-comment-box">
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div style={{ marginTop: "6px" }}>
            <button className="secondary-btn" onClick={() => setNewComment("")}>
              Clear
            </button>
            <button
              disabled={newComment.trim().length === 0}
              className="primary-btn"
              onClick={handlePostComment}
            >
              Post Comment
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet</p>
      ) : (
        comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            onDelete={handleDeleteComment}
            onReply={handleReplyToComment}
            isLoggedIn={loggedIn}
          />
        ))
      )}
    </div>
  );
};

// Wrapper
const Comments = () => {
  const videoId = "6K3_DXCEA5Q"; // example video ID
  return (
    <div id="comments">
      <h3>Comments</h3>
      <CommentsContent videoId={videoId} />
    </div>
  );
};

export default Comments;
