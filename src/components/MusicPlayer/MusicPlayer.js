import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { PreferencesModel } from "../../services/db";
import * as YouTubeService from "../../services/youtube";
import * as SpotifyService from "../../services/spotify";

// Styled components - versi yang lebih ringkas
const MusicPlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #25aa60 0%, #1d8549 100%);
  color: white;
  border-radius: 0.75rem;
  padding: 0.75rem;
  box-shadow: 0 3px 8px rgba(29, 133, 73, 0.25);
  position: relative;
  overflow: hidden;
`;

const PlayerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  z-index: 1;
`;

const PlayerTitle = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  i {
    font-size: 1.1rem;
  }
`;

const ToggleButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  cursor: pointer;
  border-radius: 50%;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  i {
    font-size: 1.1rem;
  }
`;

const MiniPlayer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.4rem;
  padding: 0.4rem;
  margin-bottom: ${(props) => (props.$isExpanded ? "0.75rem" : "0")};
`;

const TrackThumbnail = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 0.2rem;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const TrackInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const TrackTitle = styled.div`
  font-weight: 600;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackArtist = styled.div`
  font-size: 0.65rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PlayButton = styled.button`
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #25aa60;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  padding: 0;

  i {
    font-size: 1rem;
  }
`;

const ExpandedContent = styled.div`
  display: ${(props) => (props.$isVisible ? "flex" : "none")};
  flex-direction: column;
  gap: 0.5rem;
`;

const SearchContainer = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  gap: 0.5rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.4rem 0.5rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.75rem;
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const ServiceTab = styled.button`
  padding: 0.4rem 0.6rem;
  background-color: ${(props) =>
    props.$active ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.1)"};
  color: white;
  border: none;
  border-radius: 0.4rem;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  i {
    font-size: 0.9rem;
  }
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 0.4rem;
  padding: 0.4rem;
  max-height: 180px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem;
  border-radius: 0.3rem;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ResultThumbnail = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 0.2rem;
  object-fit: cover;
`;

const ResultInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const ResultTitle = styled.div`
  font-weight: 500;
  font-size: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultArtist = styled.div`
  font-size: 0.65rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AudioPlayer = styled.audio`
  display: none;
`;

const YouTubeFrame = styled.iframe`
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 1px;
  height: 1px;
  top: 0;
  left: 0;
`;

const EqualizerContainer = styled.div`
  display: ${(props) => (props.$isVisible ? "flex" : "none")};
  align-items: flex-end;
  height: 10px;
  gap: 1px;
  margin-left: 0.3rem;
`;

const EqualizerBar = styled.span`
  display: inline-block;
  width: 2px;
  height: ${(props) => props.$height}px;
  background-color: white;
  border-radius: 1px;
  animation: ${(props) => `equalizer ${props.$duration}s ease-in-out infinite`};
  animation-delay: ${(props) => props.$delay}s;
  opacity: 0.9;

  @keyframes equalizer {
    0%,
    100% {
      height: ${(props) => props.$minHeight}px;
    }
    50% {
      height: ${(props) => props.$height}px;
    }
  }
`;

// Main component - lebih ringkas
const MusicPlayer = ({ isBreak }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [service, setService] = useState("youtube");
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  // Refs
  const audioRef = useRef(null);
  const youtubePlayerRef = useRef(null);

  // Initialize player
  useEffect(() => {
    const initPlayer = async () => {
      try {
        // Load recently played videos/tracks
        const recent = YouTubeService.getRecentlyPlayed();
        if (recent.length > 0) {
          setRecentlyPlayed(recent.slice(0, 4));
          setCurrentTrack(recent[0]);
        } else {
          // Load recommended content
          loadRecommendations();
        }
      } catch (error) {
        console.error("Error initializing music player:", error);
      }
    };

    initPlayer();
  }, []);

  // Update when service changes
  useEffect(() => {
    if (searchResults.length === 0) {
      loadRecommendations();
    }
  }, [service, isBreak]);

  // Handle YouTube iframe API
  useEffect(() => {
    if (
      isPlaying &&
      currentTrack &&
      service === "youtube" &&
      youtubePlayerRef.current
    ) {
      // YouTube iframe API would be initialized here in a real implementation
    }
  }, [isPlaying, currentTrack, service]);

  // Handle audio playback for Spotify
  useEffect(() => {
    if (audioRef.current && service === "spotify") {
      if (isPlaying && currentTrack?.previewUrl) {
        audioRef.current.src = currentTrack.previewUrl;
        audioRef.current.volume = 1.0;
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Playback error:", error);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack, service]);

  // Load recommended content
  const loadRecommendations = async () => {
    try {
      let results;
      if (service === "youtube") {
        results = await YouTubeService.getRecommendedVideos(isBreak);
      } else {
        results = await SpotifyService.getRecommendedPlaylists(isBreak);
      }

      if (results && results.length > 0) {
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
      // Fallback to mock data
      setSearchResults(getMockResults());
    }
  };

  // Generate mock results
  const getMockResults = () => {
    if (service === "youtube") {
      if (isBreak) {
        return [
          {
            id: "DWcJFNfaw9c",
            title: "Relaxing Piano Music",
            thumbnail: "https://i.ytimg.com/vi/DWcJFNfaw9c/hqdefault.jpg",
            artist: "Meditation Music",
            service: "youtube",
          },
          {
            id: "77ZozI0rw7w",
            title: "Sleep Music with Rain",
            thumbnail: "https://i.ytimg.com/vi/77ZozI0rw7w/hqdefault.jpg",
            artist: "Sleep Music",
            service: "youtube",
          },
        ];
      } else {
        return [
          {
            id: "jfKfPfyJRdk",
            title: "lofi hip hop radio",
            thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
            artist: "Lofi Girl",
            service: "youtube",
          },
          {
            id: "5qap5aO4i9A",
            title: "beats to relax/study to",
            thumbnail: "https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg",
            artist: "Lofi Girl",
            service: "youtube",
          },
        ];
      }
    } else {
      // Spotify mock data
      return [
        {
          id: isBreak ? "peaceful_piano" : "focus_flow",
          title: isBreak ? "Peaceful Piano" : "Focus Flow",
          artist: "Spotify",
          albumImage:
            "https://i.scdn.co/image/ab67706f00000002ca5a7517156021292e5663a4",
          previewUrl:
            "https://p.scdn.co/mp3-preview/2ceefe2a3103e9de426f944ed52510f5b7d2bb3d",
          service: "spotify",
        },
        {
          id: isBreak ? "deep_sleep" : "brain_food",
          title: isBreak ? "Deep Sleep" : "Brain Food",
          artist: "Spotify",
          albumImage:
            "https://i.scdn.co/image/ab67706f000000026e849349fc0a57e606644442",
          previewUrl:
            "https://p.scdn.co/mp3-preview/d8b1b9ba9c986a1ef9a5e5a6be752ea1e533d334",
          service: "spotify",
        },
      ];
    }
  };

  // Play selected track
  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);

    // If YouTube video, save to recently played
    if (service === "youtube") {
      YouTubeService.saveToRecentlyPlayed(track);
      setRecentlyPlayed(YouTubeService.getRecentlyPlayed().slice(0, 4));
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Toggle expanded view
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadRecommendations();
      return;
    }

    try {
      let results;
      if (service === "youtube") {
        results = await YouTubeService.searchVideos(searchQuery);
      } else {
        results = await SpotifyService.searchTracks(searchQuery);
      }

      if (results && results.length > 0) {
        setSearchResults(results);
      } else {
        setSearchResults([
          {
            id: "no-results",
            title: "Tidak ada hasil",
            artist: "Coba kata kunci lain",
            thumbnail: "/logo192.png",
            service: service,
          },
        ]);
      }
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults(getMockResults());
    }
  };

  // Handle search input and key press
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Render equalizer animation
  const renderEqualizer = () => {
    return (
      <EqualizerContainer $isVisible={isPlaying}>
        {[...Array(3)].map((_, i) => (
          <EqualizerBar
            key={i}
            $height={6 + Math.random() * 4}
            $minHeight={2 + Math.random() * 2}
            $duration={0.7 + Math.random() * 0.3}
            $delay={Math.random() * 0.3}
          />
        ))}
      </EqualizerContainer>
    );
  };

  return (
    <MusicPlayerContainer>
      <PlayerHeader>
        <PlayerTitle>
          <i className="material-icons">{isBreak ? "spa" : "headphones"}</i>
          {isBreak ? "Musik Relax" : "Musik Fokus"}
          {renderEqualizer()}
        </PlayerTitle>
        <ToggleButton
          onClick={toggleExpand}
          title={isExpanded ? "Sembunyikan" : "Tampilkan"}
        >
          <i className="material-icons">
            {isExpanded ? "expand_less" : "expand_more"}
          </i>
        </ToggleButton>
      </PlayerHeader>

      {currentTrack && (
        <MiniPlayer $isExpanded={isExpanded}>
          <TrackThumbnail
            src={
              service === "youtube"
                ? currentTrack.thumbnail
                : currentTrack.albumImage || "/logo192.png"
            }
            alt={currentTrack.title || currentTrack.name}
          />
          <TrackInfo>
            <TrackTitle>{currentTrack.title || currentTrack.name}</TrackTitle>
            <TrackArtist>{currentTrack.artist || "Unknown"}</TrackArtist>
          </TrackInfo>
          <PlayButton
            onClick={togglePlayPause}
            title={isPlaying ? "Pause" : "Play"}
          >
            <i className="material-icons">
              {isPlaying ? "pause" : "play_arrow"}
            </i>
          </PlayButton>
        </MiniPlayer>
      )}

      <ExpandedContent $isVisible={isExpanded}>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder={`Cari ${service === "youtube" ? "video" : "musik"}...`}
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleSearchKeyPress}
          />
          <ServiceTab
            $active={service === "youtube"}
            onClick={() => setService("youtube")}
          >
            <i className="material-icons">videocam</i>
            YT
          </ServiceTab>
          <ServiceTab
            $active={service === "spotify"}
            onClick={() => setService("spotify")}
          >
            <i className="material-icons">audiotrack</i>
            Spotify
          </ServiceTab>
        </SearchContainer>

        <ResultsList>
          {searchResults.length > 0 ? (
            searchResults.map((result) => (
              <ResultItem key={result.id} onClick={() => playTrack(result)}>
                <ResultThumbnail
                  src={
                    service === "youtube"
                      ? result.thumbnail
                      : result.albumImage || "/logo192.png"
                  }
                  alt={result.title || result.name}
                />
                <ResultInfo>
                  <ResultTitle>{result.title || result.name}</ResultTitle>
                  <ResultArtist>{result.artist || "Unknown"}</ResultArtist>
                </ResultInfo>
              </ResultItem>
            ))
          ) : recentlyPlayed.length > 0 && service === "youtube" ? (
            recentlyPlayed.map((item) => (
              <ResultItem key={item.id} onClick={() => playTrack(item)}>
                <ResultThumbnail src={item.thumbnail} alt={item.title} />
                <ResultInfo>
                  <ResultTitle>{item.title}</ResultTitle>
                  <ResultArtist>{item.artist}</ResultArtist>
                </ResultInfo>
              </ResultItem>
            ))
          ) : (
            <ResultItem>
              <ResultInfo>
                <ResultTitle>Tidak ada hasil</ResultTitle>
                <ResultArtist>Coba kata kunci lain</ResultArtist>
              </ResultInfo>
            </ResultItem>
          )}
        </ResultsList>
      </ExpandedContent>

      {/* Audio element for Spotify preview playback */}
      <AudioPlayer ref={audioRef} controls={false} preload="auto" />

      {/* Hidden YouTube iframe for audio playback */}
      {service === "youtube" && currentTrack && isPlaying && (
        <YouTubeFrame
          src={`https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&mute=0&enablejsapi=1&disablekb=1&controls=0&fs=0&modestbranding=1&origin=${window.location.origin}`}
          title="Hidden YouTube player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={false}
          ref={youtubePlayerRef}
        />
      )}
    </MusicPlayerContainer>
  );
};

export default MusicPlayer;
