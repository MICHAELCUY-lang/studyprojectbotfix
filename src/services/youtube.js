// YouTube API service
// This file handles API calls to the YouTube Data API v3

// YouTube API key
const YOUTUBE_API_KEY = "AIzaSyB59tvqGw1VbuhDEoGltDFRMfoJWoL20CQ"; // Ganti dengan API key Anda

// Storage keys
const RECENTLY_PLAYED_KEY = "youtube_recently_played";

/**
 * Search for YouTube videos
 * @param {string} query - The search query
 * @param {number} maxResults - The maximum number of results to return
 * @returns {Promise<Array>} The search results
 */
export const searchVideos = async (query, maxResults = 10) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(
        query
      )}&type=video&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to search YouTube videos");
    }

    const data = await response.json();

    // Format the data for our app
    return data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      artist: item.snippet.channelTitle,
      publishedAt: new Date(item.snippet.publishedAt),
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      service: "youtube",
    }));
  } catch (error) {
    console.error("Error searching YouTube videos:", error);

    // Throw the error so we can handle it in the component
    throw error;
  }
};

/**
 * Get video details by ID
 * @param {string} videoId - The YouTube video ID
 * @returns {Promise<Object>} The video details
 */
export const getVideoDetails = async (videoId) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to get video details");
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("Video not found");
    }

    const video = data.items[0];

    // Format the data for our app
    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high.url,
      channelTitle: video.snippet.channelTitle,
      publishedAt: new Date(video.snippet.publishedAt),
      duration: video.contentDetails.duration, // ISO 8601 duration format
      viewCount: parseInt(video.statistics.viewCount),
      likeCount: parseInt(video.statistics.likeCount),
      embedUrl: `https://www.youtube.com/embed/${video.id}`,
      watchUrl: `https://www.youtube.com/watch?v=${video.id}`,
      service: "youtube",
    };
  } catch (error) {
    console.error("Error getting video details:", error);
    throw error;
  }
};

/**
 * Get popular study music videos or playlists
 * @param {boolean} isRelaxation - Whether to get relaxation videos (true) or study videos (false)
 * @returns {Promise<Array>} The recommended videos
 */
export const getRecommendedVideos = async (isRelaxation = false) => {
  // Define search terms based on the type of videos we want
  const searchTerm = isRelaxation
    ? "relaxation music meditation ambient calm sounds"
    : "focus study music concentration productivity lo-fi";

  return await searchVideos(searchTerm, 5);
};

/**
 * Save a video to recently played
 * @param {Object} video - The video to save
 */
export const saveToRecentlyPlayed = (video) => {
  try {
    // Get existing recently played videos
    const recentlyPlayed = JSON.parse(
      localStorage.getItem(RECENTLY_PLAYED_KEY) || "[]"
    );

    // Check if video already exists in list
    const existingIndex = recentlyPlayed.findIndex(
      (item) => item.id === video.id
    );
    if (existingIndex !== -1) {
      // Remove existing entry
      recentlyPlayed.splice(existingIndex, 1);
    }

    // Add video to beginning of list
    recentlyPlayed.unshift({
      ...video,
      lastPlayed: new Date().toISOString(),
    });

    // Limit list to 10 items
    const limitedList = recentlyPlayed.slice(0, 10);

    // Save back to localStorage
    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(limitedList));
  } catch (error) {
    console.error("Error saving to recently played:", error);
  }
};

/**
 * Get recently played videos
 * @returns {Array} The recently played videos
 */
export const getRecentlyPlayed = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_PLAYED_KEY) || "[]");
  } catch (error) {
    console.error("Error getting recently played videos:", error);
    return [];
  }
};

// Default export
export default {
  searchVideos,
  getVideoDetails,
  getRecommendedVideos,
  saveToRecentlyPlayed,
  getRecentlyPlayed,
};
