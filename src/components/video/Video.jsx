import { useEffect, useState } from "react";
import { useVideo } from "../../contexts/VideoContext";
import "./Video.css";
import VideoLoading from "../video_loading/VideoLoading";
import toast from "react-hot-toast";
import { getVideoDetails } from "../../service/videoService";

const Video = () => {
  const videoId = "6K3_DXCEA5Q";
  const apiKey = import.meta.env.VITE_APP_YOUTUBE_API_KEY;
  const { state, dispatch } = useVideo();
  const { videoInfo, comments, loading } = state;

  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchVideoData = async (videoId, apiKey, dispatch) => {
    try {
      dispatch({ type: "VIDEO_FETCH_START" });
      const videoInfo = await getVideoDetails(videoId, apiKey);
      dispatch({
        type: "VIDEO_FETCH_SUCCESS",
        payload: { videoInfo, comments: [] },
      });

      setTitle(videoInfo.title);
      setDescription(videoInfo.description);
    } catch (error) {
      toast.error(error.message);
    } finally {
      toast.success("Video fetched successfully");
    }
  };

  const handleSave = async () => {
    const accessToken = localStorage.getItem("yt_access_token");
    if (!accessToken) {
      toast.error("You must be logged in to edit.");
      return;
    }

    try {
      const res = await fetch(
        "https://www.googleapis.com/youtube/v3/videos?part=snippet",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: videoId,
            snippet: {
              title,
              description,
              categoryId: "22", // default category (People & Blogs)
            },
          }),
        }
      );

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      toast.success("Video updated!");
      setEditMode(false);

      // update local state
      dispatch({
        type: "VIDEO_FETCH_SUCCESS",
        payload: {
          videoInfo: {
            ...videoInfo,
            title,
            description,
          },
          comments,
        },
      });
    } catch (error) {
      toast.error(error.message || "Failed to update video");
    }
  };

  useEffect(() => {
    fetchVideoData(videoId, apiKey, dispatch);
  }, [videoId]);

  return (
    <div id="video">
      <section id="video-content">
        {loading && <VideoLoading />}
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </section>

      <section id="description">
        {editMode ? (
          <div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <div>
              <button className="primary-btn" onClick={handleSave}>
                Save
              </button>
              <button
                className="secondary-btn"
                onClick={() => setEditMode(false)}
                style={{ marginLeft: "8px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h4>{videoInfo?.title}</h4>
            <div>
              <p>{videoInfo?.description}</p>
              <p>{videoInfo?.publishedAt?.split("T")[0]}</p>
            </div>
            
          </div>
        )}

        <section className="buttons">
          <button className="primary-btn" onClick={() => setEditMode(true)}>
              Edit
            </button>
          <span>
          Views {videoInfo?.views}
        </span>
        <span>
          Likes {videoInfo?.likes}
        </span>
        </section>
      </section>
    </div>
  );
};

export default Video;
