import { useEffect, useState } from "react";
import "./Comments.css";
import toast from "react-hot-toast";

// Service to fetch comments with replies
const getVideoComments = async (videoId, apiKey) => {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${videoId}&key=${apiKey}&maxResults=50`
  );
  const data = await res.json();

  return data.items.map((item) => ({
    id: item.id,
    author: item.snippet.topLevelComment.snippet.authorDisplayName,
    text: item.snippet.topLevelComment.snippet.textDisplay,
    canDelete: false,
    replies: item.replies
      ? item.replies.comments.map((reply) => ({
          id: reply.id,
          author: reply.snippet.authorDisplayName,
          text: reply.snippet.textDisplay,
          canDelete: false,
        }))
      : [],
  }));
};

// Single Comment Component
const Comment = ({ comment, onDelete, onReply }) => {
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
    <div id="comment">
      <h4>{comment.author}</h4>
      <p>{comment.text}</p>

      <div>
        <button
          className="reply-button"
          onClick={() => setShowReplyBox(!showReplyBox)}
        >
          {showReplyBox ? "Cancel" : "Reply"}
        </button>

        {comment.canDelete && (
          <button className="delete-button" onClick={() => onDelete(comment.id)}>
            Delete
          </button>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <button
            className="replies-toggle"
            onClick={() => setShowReplies((prev) => !prev)}
          >
            {showReplies
              ? "Hide Replies"
              : `View Replies (${comment.replies.length})`}
          </button>
        )}
      </div>

      {showReplyBox && (
        <div style={{ marginTop: "8px" }}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            rows={2}
            style={{ width: "100%", marginBottom: "6px" }}
          />
          <button onClick={handleReplySubmit}>Post Reply</button>
        </div>
      )}

      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="reply">
              <h4>{reply.author}</h4>
              <p>{reply.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Comments Content Component
const CommentsContent = ({ videoId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  const apiKey = import.meta.env.VITE_APP_YOUTUBE_API_KEY;

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await getVideoComments(videoId, apiKey);
      setComments(data);
    } catch (error) {
      toast.error(error.message || "Unable to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    const accessToken = localStorage.getItem("yt_access_token");
    if (!accessToken) return toast.error("You must be logged in to comment.");
    if (!newComment.trim()) return toast.error("Comment cannot be empty.");

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
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

      toast.success("Comment posted!");
      setNewComment("");

      const newCommentObject = {
        id: data.snippet.topLevelComment.id,
        author: data.snippet.topLevelComment.snippet.authorDisplayName,
        text: data.snippet.topLevelComment.snippet.textDisplay,
        canDelete: true,
        replies: [],
      };

      setComments((prev) => [newCommentObject, ...prev]);
    } catch (error) {
      toast.error(error.message || "Failed to post comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    const accessToken = localStorage.getItem("yt_access_token");
    if (!accessToken) return toast.error("You must be logged in.");
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/comments?id=${commentId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Delete failed");
      }

      toast.success("Comment deleted");
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      toast.error(error.message || "Failed to delete comment.");
    }
  };

  const handleReplyToComment = async (parentCommentId, replyText) => {
    const accessToken = localStorage.getItem("yt_access_token");
    if (!accessToken) return toast.error("You must be logged in to reply");

    try {
      const res = await fetch(
        "https://www.googleapis.com/youtube/v3/comments?part=snippet",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
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

      toast.success("Reply posted!");

      const newReply = {
        id: data.id,
        author: data.snippet.authorDisplayName,
        text: data.snippet.textDisplay,
        canDelete: true,
      };

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === parentCommentId
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment
        )
      );
    } catch (error) {
      toast.error(error.message || "Failed to post reply.");
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div id="comments-content">
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
          <button className="primary-btn" onClick={handlePostComment}>
            Post Comment
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading comments...</p>
      ) : (
        comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            onDelete={handleDeleteComment}
            onReply={handleReplyToComment}
          />
        ))
      )}
    </div>
  );
};

// Main Comments Wrapper
const Comments = () => {
  const videoId = "6K3_DXCEA5Q"; // replace with dynamic videoId if needed
  return (
    <div id="comments">
      <h3>Comments</h3>
      <CommentsContent videoId={videoId} />
    </div>
  );
};

export default Comments;
