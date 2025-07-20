export const getVideoDetails = async (videoId, apiKey) => {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("Video not found");
    }

    const video = data.items[0];

    return {
      title: video.snippet.title,
      description: video.snippet.description,
      views: video.statistics.viewCount,
      likes: video.statistics.likeCount,
      publishedAt: video.snippet.publishedAt,
      channelTitle: video.snippet.channelTitle,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch (error) {
    throw new Error("Failed to fetch video details");
  }
};


