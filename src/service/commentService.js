export const getVideoComments = async (videoId, apiKey) => {
  const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${apiKey}&maxResults=20`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to fetch comments");
    }

    const data = await response.json();

    const currentUserChannelId = localStorage.getItem("yt_channel_id");

    return data.items.map((item) => {
      const topLevelComment = item.snippet.topLevelComment;
      const snippet = topLevelComment.snippet;
      const authorChannelId = snippet.authorChannelId?.value;

      return {
        id: topLevelComment.id,
        author: snippet.authorDisplayName,
        text: snippet.textDisplay,
        publishedAt: snippet.publishedAt,
        profileImage: snippet.authorProfileImageUrl,
        canDelete: authorChannelId === currentUserChannelId,
      };
    });
  } catch (error) {
    throw new Error(error.message || "Failed to fetch comments");
  }
};
