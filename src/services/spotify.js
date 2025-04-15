// Spotify API service
// This file handles authentication and API calls to Spotify

// Spotify API credentials
const SPOTIFY_CLIENT_ID = "f8b64136c2b84dfe8a87792f371a0fef";
const SPOTIFY_CLIENT_SECRET = "a22e0a461f9b4cc580352f7843310d88";

// Storage keys
const TOKEN_STORAGE_KEY = "spotify_access_token";
const TOKEN_EXPIRY_KEY = "spotify_token_expiry";

/**
 * Get a valid Spotify access token
 * @returns {Promise<string>} The access token
 */
export const getAccessToken = async () => {
  // Check if we have a token in storage that's still valid
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
    return storedToken;
  }

  // If no valid token, request a new one
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error("Failed to get Spotify access token");
    }

    const data = await response.json();

    // Store the token and its expiry time
    const expiresIn = data.expires_in * 1000; // Convert to milliseconds
    const expiryTime = Date.now() + expiresIn;

    localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

    return data.access_token;
  } catch (error) {
    console.error("Error getting Spotify access token:", error);
    throw error;
  }
};

/**
 * Search Spotify for tracks based on a query
 * @param {string} query - The search query
 * @param {number} limit - The maximum number of results to return
 * @returns {Promise<Array>} The search results
 */
export const searchTracks = async (query, limit = 10) => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=track&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search Spotify tracks");
    }

    const data = await response.json();

    // Format the data for our app
    return data.tracks.items.map((item) => ({
      id: item.id,
      title: item.name,
      artist: item.artists.map((artist) => artist.name).join(", "),
      albumName: item.album.name,
      albumImage: item.album.images[0]?.url,
      duration: Math.floor(item.duration_ms / 1000),
      previewUrl: item.preview_url,
      externalUrl: item.external_urls.spotify,
      uri: item.uri,
      service: "spotify",
    }));
  } catch (error) {
    console.error("Error searching Spotify tracks:", error);
    throw error;
  }
};

/**
 * Search Spotify for playlists based on a query
 * @param {string} query - The search query
 * @param {number} limit - The maximum number of results to return
 * @returns {Promise<Array>} The search results
 */
export const searchPlaylists = async (query, limit = 10) => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=playlist&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search Spotify playlists");
    }

    const data = await response.json();

    // Format the data for our app
    return data.playlists.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.images[0]?.url,
      owner: item.owner.display_name,
      trackCount: item.tracks.total,
      externalUrl: item.external_urls.spotify,
      uri: item.uri,
    }));
  } catch (error) {
    console.error("Error searching Spotify playlists:", error);
    throw error;
  }
};

/**
 * Get a playlist's tracks
 * @param {string} playlistId - The Spotify playlist ID
 * @param {number} limit - The maximum number of tracks to return
 * @returns {Promise<Array>} The playlist tracks
 */
export const getPlaylistTracks = async (playlistId, limit = 50) => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get playlist tracks");
    }

    const data = await response.json();

    // Format the data for our app
    return data.items.map((item) => ({
      id: item.track.id,
      title: item.track.name,
      artist: item.track.artists.map((artist) => artist.name).join(", "),
      albumName: item.track.album.name,
      albumImage: item.track.album.images[0]?.url,
      duration: Math.floor(item.track.duration_ms / 1000),
      previewUrl: item.track.preview_url,
      externalUrl: item.track.external_urls.spotify,
      uri: item.track.uri,
      service: "spotify",
    }));
  } catch (error) {
    console.error("Error getting playlist tracks:", error);
    throw error;
  }
};

/**
 * Get recommended study or relaxation playlists
 * @param {boolean} isRelaxation - Whether to get relaxation playlists (true) or study playlists (false)
 * @returns {Promise<Array>} The recommended playlists
 */
export const getRecommendedPlaylists = async (isRelaxation = false) => {
  // Define search terms based on the type of playlists we want
  const searchTerm = isRelaxation
    ? "relaxation meditation ambient calm"
    : "focus study concentration productivity";

  return await searchPlaylists(searchTerm, 5);
};

/**
 * Get featured playlists from Spotify
 * @returns {Promise<Array>} The featured playlists
 */
export const getFeaturedPlaylists = async () => {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      "https://api.spotify.com/v1/browse/featured-playlists?limit=6",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get featured playlists");
    }

    const data = await response.json();

    // Format the data for our app
    return data.playlists.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.images[0]?.url,
      owner: item.owner.display_name,
      trackCount: item.tracks.total,
      externalUrl: item.external_urls.spotify,
      uri: item.uri,
    }));
  } catch (error) {
    console.error("Error getting featured playlists:", error);
    throw error;
  }
};

// Default export
export default {
  getAccessToken,
  searchTracks,
  searchPlaylists,
  getPlaylistTracks,
  getRecommendedPlaylists,
  getFeaturedPlaylists,
};
