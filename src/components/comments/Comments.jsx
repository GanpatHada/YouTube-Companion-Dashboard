import { useEffect, useState } from "react";
import "./Comments.css";
import toast from "react-hot-toast";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

// ✅ Fetch comments for a video
const getVideoComments = async (videoId, apiKey, myChannelId) => {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${videoId}&key=${apiKey}&maxResults=50`
  );
  const data = await res.json();

  if (!data.items) return [];

  return data.items.map((item) => {
    const topComment = item.snippet.topLevelComment.snippet;

    return {
      id: item.snippet.topLevelComment.id,
      author: topComment.authorDisplayName,
      authorImage: topComment.authorProfileImageUrl,
      text: topComment.textDisplay,
      canDelete: myChannelId
        ? topComment.authorChannelId?.value === myChannelId
        : false,
      replies: item.replies
        ? item.replies.comments.map((reply) => {
            const replySnippet = reply.snippet;
            return {
              id: reply.id,
              author: replySnippet.authorDisplayName,
              authorImage: replySnippet.authorProfileImageUrl,
              text: replySnippet.textDisplay,
              canDelete: myChannelId
                ? replySnippet.authorChannelId?.value === myChannelId
                : false,
            };
          })
        : [],
    };
  });
};

// ✅ Single Comment Component
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
    <div className="comment">
      <section className="image-section">
        <img src={comment.authorImage} alt={"."} className="comment-avatar" />
      </section>
      <section className="info-section">
        <div>
          <h4>{comment.author}</h4>
          <p>{comment.text}</p>
        </div>
        <div className="buttons">
          <button
            className="reply-button"
            onClick={() => setShowReplyBox(true)}
          >
          Reply
          </button>

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

          {comment.canDelete && (
            <button
              className="delete-button"
              onClick={() => onDelete(comment.id)}
            >
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
              rows={2}
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
            <div key={reply.id} className="comment">
              <section className="image-section">
                <img
                  src={comment.authorImage}
                  alt={comment.author}
                  className="comment-avatar"
                />
              </section>
              <section className="info-section">
                <div>
                  <h4>{reply.author}</h4>
                  <p>{reply.text}</p>
                </div>
                <div className="buttons">
                  {reply.canDelete && (
                    <button
                      className="delete-button"
                      onClick={() => onDelete(reply.id)}
                    >
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

// ✅ Comments Content Component
const CommentsContent = ({ videoId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [myChannelId, setMyChannelId] = useState(null);

  const apiKey = import.meta.env.VITE_APP_YOUTUBE_API_KEY;

  // ✅ Get my channelId (from OAuth token)
  const fetchMyChannelId = async () => {
    const accessToken = localStorage.getItem("yt_access_token");
    if (!accessToken) return null;

    try {
      const res = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=id&mine=true",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      if (data.items?.length > 0) {
        setMyChannelId(data.items[0].id);
      }
    } catch {
      setMyChannelId(null);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await getVideoComments(videoId, apiKey, myChannelId);
      setComments(data);
    } catch (error) {
      toast.error(error.message || "Unable to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Post Comment
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
        id: data.id,
        author: data.snippet.topLevelComment.snippet.authorDisplayName,
        text: data.snippet.topLevelComment.snippet.textDisplay,
        canDelete: true, // ✅ always true for your own comment
        replies: [],
      };

      setComments((prev) => [newCommentObject, ...prev]);
    } catch (error) {
      toast.error(error.message || "Failed to post comment.");
    }
  };

  // ✅ Delete Comment or Reply
  const handleDeleteComment = async (commentId) => {
    const accessToken = localStorage.getItem("yt_access_token");
    if (!accessToken) return toast.error("You must be logged in.");
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/comments?id=${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Delete failed");
      }

      toast.success("Comment deleted");

      setComments((prev) =>
        prev
          .map((c) =>
            c.id === commentId
              ? null
              : { ...c, replies: c.replies.filter((r) => r.id !== commentId) }
          )
          .filter(Boolean)
      );
    } catch (error) {
      toast.error(error.message || "Failed to delete comment.");
    }
  };

  // ✅ Post Reply
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
        canDelete: true, // ✅ always true for your own reply
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
    fetchMyChannelId();
  }, []);

  useEffect(() => {
    if (myChannelId !== null) {
      fetchComments();
    }
  }, [myChannelId]);

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
          <button
            disabled={newComment.trim().length === 0}
            className="primary-btn"
            onClick={handlePostComment}
          >
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

// ✅ Wrapper
const Comments = () => {
  const videoId = "6K3_DXCEA5Q";
  return (
    <div id="comments">
      <h3>Comments</h3>
      <CommentsContent videoId={videoId} />
    </div>
  );
};

export default Comments;
