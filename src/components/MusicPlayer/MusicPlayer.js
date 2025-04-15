import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { PreferencesModel } from "../../services/db";
import * as YouTubeService from "../../services/youtube";
import * as SpotifyService from "../../services/spotify";

// Styled components with new design
const MusicPlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #25aa60 0%, #1d8549 100%);
  color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 8px 20px rgba(29, 133, 73, 0.25);
  transition: all 0.5s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #67c694, #8fdcb4, #67c694);
    opacity: 0.8;
  }
`;

const WaveBackground = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='0.1' fill='%23FFFFFF'%3E%3C/path%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='0.15' fill='%23FFFFFF'%3E%3C/path%3E%3C/svg%3E");
  background-size: cover;
  background-repeat: no-repeat;
  z-index: 0;
  opacity: 0.5;
`;

const PlayerTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;

  i {
    font-size: 1.5rem;
  }
`;

const MusicControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0;
  z-index: 1;
`;

const PlayButton = styled.button`
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #25aa60;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.98);
  }

  i {
    font-size: 2.2rem;
  }

  &::after {
    content: "";
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    z-index: -1;
  }
`;

const ControlButton = styled.button`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 0.8rem;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }

  i {
    font-size: 1.2rem;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  margin: 0.5rem 0;
  cursor: pointer;
  position: relative;
  z-index: 1;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  width: ${(props) => props.$percentage}%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 1) 100%
  );
  border-radius: 3px;
  transition: width 0.2s ease;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
  }
`;

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  opacity: 0.8;
  z-index: 1;
`;

const SearchContainer = styled.div`
  margin-top: 1.5rem;
  position: relative;
  z-index: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.85rem;
  padding-right: 3rem;
  border-radius: 2rem;
  border: none;
  font-size: 0.95rem;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    background-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  i {
    font-size: 1.2rem;
  }
`;

const ServiceTabs = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  z-index: 1;
`;

const ServiceTab = styled.button`
  padding: 0.6rem 1.2rem;
  background-color: ${(props) =>
    props.$active ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.1)"};
  color: white;
  border: 1px solid
    ${(props) =>
      props.$active ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.2)"};
  border-radius: 2rem;
  font-weight: ${(props) => (props.$active ? "600" : "400")};
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  backdrop-filter: blur(4px);

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  ${(props) =>
    props.$active &&
    `
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  `}
`;

const ContentTypeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  z-index: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  padding: 0.3rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ContentTypeButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${(props) =>
    props.$active ? "rgba(255, 255, 255, 0.2)" : "transparent"};
  color: white;
  border: none;
  border-radius: 1.5rem;
  font-size: 0.85rem;
  font-weight: ${(props) => (props.$active ? "600" : "400")};
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;

  &:hover {
    background-color: ${(props) =>
      props.$active ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.1)"};
  }
`;

const ResultsList = styled.div`
  margin-top: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  z-index: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem;
  border-radius: 0.8rem;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const ResultThumbnail = styled.img`
  width: 55px;
  height: 55px;
  border-radius: 0.5rem;
  object-fit: cover;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const ResultInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const ResultTitle = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultArtist = styled.div`
  font-size: 0.8rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SearchTypeTag = styled.span`
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.3rem;
  margin-right: 0.4rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  gap: 0.8rem;
  z-index: 1;
  background: transparent;
  padding: 0.8rem 0;
  transition: all 0.3s ease;
`;

const VolumeIconButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  padding: 0;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const VolumeIcon = styled.i`
  font-size: 1.3rem;
  opacity: 0.9;
`;

const VolumeSlider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.3);
  outline: none;
  cursor: pointer;
  margin: 0 4px;

  /* This creates the filled part of the slider */
  &::-webkit-slider-runnable-track {
    height: 3px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.3);
  }

  /* Remove the default thumb */
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 0px;
    height: 0px;
    background: transparent;
    margin-top: 0px;
    box-shadow: none;
    border: none;
    opacity: 0;
  }

  &::-moz-range-track {
    height: 3px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.3);
  }

  &::-moz-range-thumb {
    width: 0px;
    height: 0px;
    background: transparent;
    border: none;
    box-shadow: none;
    opacity: 0;
  }

  &::-moz-range-progress {
    height: 3px;
    border-radius: 2px;
    background-color: white;
  }

  /* Use a pseudo-element to create the fill effect for webkit browsers */
  background: linear-gradient(
    to right,
    white 0%,
    white ${(props) => props.$percentage}%,
    rgba(255, 255, 255, 0.3) ${(props) => props.$percentage}%,
    rgba(255, 255, 255, 0.3) 100%
  );

  /* Add hover effect */
  &:hover {
    &::-webkit-slider-runnable-track {
      background: rgba(255, 255, 255, 0.4);
    }
    &::-moz-range-track {
      background: rgba(255, 255, 255, 0.4);
    }
    background: linear-gradient(
      to right,
      white 0%,
      white ${(props) => props.$percentage}%,
      rgba(255, 255, 255, 0.4) ${(props) => props.$percentage}%,
      rgba(255, 255, 255, 0.4) 100%
    );
  }
`;

const VolumeValue = styled.span`
  font-size: 0.85rem;
  min-width: 36px;
  text-align: right;
  opacity: 0.9;
`;

const VolumeBadge = styled.div`
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%) scale(${(props) => (props.$show ? 1 : 0)});
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 0.75rem;
  padding: 0.15rem 0.4rem;
  border-radius: 2px;
  opacity: ${(props) => (props.$show ? 1 : 0)};
  transition: all 0.2s ease;
  pointer-events: none;
`;

const VolumeWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

const TrackInfo = styled.div`
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  z-index: 1;
`;

const TrackThumbnail = styled.img`
  width: 65px;
  height: 65px;
  border-radius: 0.5rem;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
`;

const TrackDetails = styled.div`
  flex: 1;
`;

const TrackTitle = styled.h4`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
`;

const TrackArtist = styled.p`
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  opacity: 0.8;
`;

const NowPlayingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  margin-top: 0.5rem;
  width: fit-content;

  i {
    font-size: 0.8rem;
  }
`;

const PlayerViewContainer = styled.div`
  margin-top: 1.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
  padding-top: 56.25%; // 16:9 aspect ratio
  display: ${(props) => (props.$visible ? "block" : "none")};
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.15);
  z-index: 1;
`;

const IframeContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const EqualizerBars = styled.div`
  display: ${(props) => (props.$isPlaying ? "flex" : "none")};
  align-items: flex-end;
  height: 20px;
  gap: 2px;
  margin-left: 0.8rem;
`;

const Bar = styled.span`
  display: inline-block;
  width: 3px;
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

const SearchLoadingSpinner = styled.div`
  display: ${(props) => (props.$isLoading ? "block" : "none")};
  margin: 1rem auto;
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  margin: 1rem 0;
  padding: 0.8rem;
  background-color: rgba(255, 87, 87, 0.2);
  border: 1px solid rgba(255, 87, 87, 0.3);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.9rem;
  display: ${(props) => (props.$visible ? "block" : "none")};
`;

const RecentlyPlayedSection = styled.div`
  margin-top: 1.5rem;
  z-index: 1;
`;

const SectionTitle = styled.h4`
  margin: 0 0 0.8rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  i {
    font-size: 1.2rem;
    opacity: 0.8;
  }
`;

const TopPicksContainer = styled.div`
  margin-top: 1.5rem;
  z-index: 1;
  display: ${(props) => (props.$visible ? "block" : "none")};
`;

const TopPicksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
`;

const TopPickItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.8rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const TopPickImg = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
`;

const TopPickInfo = styled.div`
  padding: 0.8rem;
`;

const TopPickTitle = styled.h5`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoResults = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-top: 1rem;

  i {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    display: block;
    opacity: 0.5;
  }
`;

// Main component
const MusicPlayer = ({ isBreak }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [service, setService] = useState("youtube"); // youtube or spotify
  const [contentType, setContentType] = useState("tracks"); // tracks or playlists
  const [showPlayer, setShowPlayer] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showVolumeBadge, setShowVolumeBadge] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [topPicks, setTopPicks] = useState([]);
  const [isLoadingTopPicks, setIsLoadingTopPicks] = useState(false);
  const volumeBadgeTimeoutRef = useRef(null);

  // References
  const audioRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const spotifyTokenRef = useRef(null);

  // Load preferences and init on mount
  useEffect(() => {
    const initPlayer = async () => {
      try {
        // Load volume preferences
        const prefs = await PreferencesModel.getMusicPreferences();
        setVolume(prefs.volume);

        // Load recently played
        const recent = YouTubeService.getRecentlyPlayed();
        setRecentlyPlayed(recent.slice(0, 5));

        // Load recommended content based on mode
        loadTopPicks();
      } catch (error) {
        console.error("Error initializing music player:", error);
      }
    };

    initPlayer();
  }, []);

  // Handle mode change (focus/break)
  useEffect(() => {
    loadTopPicks();
  }, [isBreak]);

  // Load top picks based on current mode
  const loadTopPicks = async () => {
    setIsLoadingTopPicks(true);
    try {
      if (service === "youtube") {
        const recommendations = await YouTubeService.getRecommendedVideos(
          isBreak
        );
        setTopPicks(recommendations);
      } else {
        const recommendations = await SpotifyService.getRecommendedPlaylists(
          isBreak
        );
        setTopPicks(recommendations);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
      // Fall back to mock data if API fails
      setTopPicks(getMockRecommendations());
    } finally {
      setIsLoadingTopPicks(false);
    }
  };

  // Handle service change
  useEffect(() => {
    // Reset when changing service
    setSearchResults([]);
    setContentType("tracks");
    setSearchQuery("");
    setErrorMessage("");
    setCurrentTrack(null);
    setIsPlaying(false);
    setShowPlayer(false);
    loadTopPicks();
  }, [service]);

  // Effect to simulate progress updates
  useEffect(() => {
    if (isPlaying && currentTrack) {
      // Clear any existing timer
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }

      // Create new timer to update progress
      progressTimerRef.current = setInterval(() => {
        setCurrentTime((prevTime) => {
          const newTime = prevTime + 1;
          // Calculate duration based on track or default to 4:32 (272 seconds)
          const totalDuration = currentTrack.duration || 272;
          const percentage = (newTime / totalDuration) * 100;

          // If reached the end, reset
          if (percentage >= 100) {
            setIsPlaying(false);
            setProgress(100);
            clearInterval(progressTimerRef.current);
            return totalDuration;
          }

          setProgress(percentage);
          return newTime;
        });
      }, 1000);
    } else if (progressTimerRef.current) {
      // If not playing, clear the timer
      clearInterval(progressTimerRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [isPlaying, currentTrack]);
  // Function to search YouTube
  const searchYouTube = async (query) => {
    if (!query) return;

    setIsSearching(true);
    setErrorMessage("");

    try {
      let results;
      if (contentType === "tracks") {
        results = await YouTubeService.searchVideos(query);
      } else {
        // For playlists, use a modified query to find playlists
        results = await YouTubeService.searchVideos(`${query} playlist`);
        // Filter results to try to get actual playlists
        results = results.filter(
          (item) =>
            item.title.toLowerCase().includes("playlist") ||
            item.title.toLowerCase().includes("mix") ||
            item.description.toLowerCase().includes("playlist") ||
            item.description.toLowerCase().includes("songs")
        );
      }

      if (results.length === 0) {
        setErrorMessage(`No ${contentType} found for "${query}"`);
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching YouTube:", error);
      setErrorMessage("Failed to search YouTube. Please try again.");

      // Fallback to mock data in case of API error
      setSearchResults(
        getMockYoutubeResults(query, contentType === "playlists")
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Function to search Spotify
  const searchSpotify = async (query) => {
    if (!query) return;

    setIsSearching(true);
    setErrorMessage("");

    try {
      let results;
      if (contentType === "tracks") {
        results = await SpotifyService.searchTracks(query);
      } else {
        results = await SpotifyService.searchPlaylists(query);
      }

      if (results.length === 0) {
        setErrorMessage(`No ${contentType} found for "${query}"`);
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching Spotify:", error);
      setErrorMessage("Failed to search Spotify. Please try again.");

      // Fallback to mock data in case of API error
      setSearchResults(
        getMockSpotifyResults(query, contentType === "playlists")
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Mock data for YouTube results
  const getMockYoutubeResults = (query, isPlaylist = false) => {
    const isRelaxQuery =
      isBreak ||
      query.toLowerCase().includes("relax") ||
      query.toLowerCase().includes("ambient") ||
      query.toLowerCase().includes("calm");

    if (isPlaylist) {
      // Playlist results
      if (isRelaxQuery) {
        return [
          {
            id: "PLQkQfzsIUwRbPZ0EltFFM2HW_67TFxLGW",
            title: "Relaxing Music Playlist - Ambient Calm Music",
            thumbnail: "https://i.ytimg.com/vi/77ZozI0rw7w/hqdefault.jpg",
            artist: "Meditation Channel",
            description:
              "The best collection of relaxing ambient music for meditation, sleep, and stress relief.",
            service: "youtube",
          },
          {
            id: "PLQkQfzsIUwRahdMm_C4Go0z5cHZtO5M2h",
            title: "Peaceful Music Mix - Nature Sounds Playlist",
            thumbnail: "https://i.ytimg.com/vi/hlWiI4xVXKY/hqdefault.jpg",
            artist: "Nature Sounds",
            description:
              "A perfect mix of peaceful music with nature sounds for relaxation and meditation.",
            service: "youtube",
          },
          {
            id: "PLQkQfzsIUwRb2FG3gXGP7PQ8xqsS71h58",
            title: "Meditation Music Playlist - Sleep & Relaxation Collection",
            thumbnail: "https://i.ytimg.com/vi/DWcJFNfaw9c/hqdefault.jpg",
            artist: "Deep Sleep Music",
            description:
              "Complete collection of meditation music to help you relax, sleep better and reduce anxiety.",
            service: "youtube",
          },
        ];
      } else {
        return [
          {
            id: "PLOHoVaTp8R7dfrJW5TOb_P7X8xiGlfvDt",
            title: "Lofi Hip Hop Mix - Best Study Music Playlist",
            thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
            artist: "Lofi Girl",
            description:
              "The most popular lofi hip hop radio playlist - perfect beats to relax/study to.",
            service: "youtube",
          },
          {
            id: "PLOHoVaTp8R7cc1lqIi1FGy0t9qgsoHj9i",
            title: "Focus Music Mix - Concentration & Productivity Playlist",
            thumbnail: "https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg",
            artist: "Study Music",
            description:
              "The ultimate playlist for concentration, focus, and productivity for work and study.",
            service: "youtube",
          },
          {
            id: "PLOHoVaTp8R7dXJqeF0dFRUXDzBnHCzD0u",
            title: "Study Music Playlist - Alpha Waves Collection",
            thumbnail: "https://i.ytimg.com/vi/n61ULEU7CO0/hqdefault.jpg",
            artist: "YellowBrickCinema",
            description:
              "A complete collection of alpha wave music for studying, memory enhancement, and focus.",
            service: "youtube",
          },
        ];
      }
    } else {
      // Single video results
      if (isRelaxQuery) {
        return [
          {
            id: "DWcJFNfaw9c",
            title: "Relaxing Piano Music for Stress Relief",
            thumbnail: "https://i.ytimg.com/vi/DWcJFNfaw9c/hqdefault.jpg",
            artist: "Meditation Music",
            description:
              "Beautiful piano music for stress relief, meditation, and relaxation.",
            duration: 3600,
            service: "youtube",
          },
          {
            id: "77ZozI0rw7w",
            title: "Relaxing Sleep Music with Rain Sounds",
            thumbnail: "https://i.ytimg.com/vi/77ZozI0rw7w/hqdefault.jpg",
            artist: "Sleep Music",
            description:
              "Deep sleeping music combined with gentle rain sounds for complete relaxation.",
            duration: 28800,
            service: "youtube",
          },
          {
            id: "hlWiI4xVXKY",
            title: "Relaxing Jazz Music and Rain Sounds",
            thumbnail: "https://i.ytimg.com/vi/hlWiI4xVXKY/hqdefault.jpg",
            artist: "Calm Music",
            description:
              "Soft jazz with the sound of gentle rain for the ultimate relaxation experience.",
            duration: 10800,
            service: "youtube",
          },
        ];
      } else {
        return [
          {
            id: "jfKfPfyJRdk",
            title: "lofi hip hop radio - beats to study/relax to",
            thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
            artist: "Lofi Girl",
            description:
              "The original lofi hip hop radio - the perfect study beats 24/7.",
            duration: 3600,
            service: "youtube",
          },
          {
            id: "5qap5aO4i9A",
            title: "lofi hip hop radio - beats to relax/study to",
            thumbnail: "https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg",
            artist: "Lofi Girl",
            description:
              "Chill study beats 24/7, the perfect stream for studying and working.",
            duration: 3600,
            service: "youtube",
          },
          {
            id: "n61ULEU7CO0",
            title: "Study Music Alpha Waves: Relaxing Studying Music",
            thumbnail: "https://i.ytimg.com/vi/n61ULEU7CO0/hqdefault.jpg",
            artist: "YellowBrickCinema",
            description:
              "Enhance your concentration and memory with alpha wave studying music.",
            duration: 10800,
            service: "youtube",
          },
        ];
      }
    }
  };

  // Mock data for Spotify results
  const getMockSpotifyResults = (query, isPlaylist = false) => {
    const isRelaxQuery =
      isBreak ||
      query.toLowerCase().includes("relax") ||
      query.toLowerCase().includes("ambient") ||
      query.toLowerCase().includes("calm");

    if (isPlaylist) {
      // Playlist results
      if (isRelaxQuery) {
        return [
          {
            id: "37i9dQZF1DWZqd5JICZI0u",
            name: "Peaceful Piano",
            image:
              "https://i.scdn.co/image/ab67706f00000002ca5a7517156021292e5663a4",
            owner: "Spotify",
            trackCount: 178,
            description: "Relax and indulge with beautiful piano pieces",
            service: "spotify",
          },
          {
            id: "37i9dQZF1DWYcDQ1hSjOpY",
            name: "Deep Sleep",
            image:
              "https://i.scdn.co/image/ab67706f000000025249a34bd5c54d12ae7a8613",
            owner: "Spotify",
            trackCount: 150,
            description: "Soothing sounds to help you fall asleep",
            service: "spotify",
          },
          {
            id: "37i9dQZF1DX4J9bG4Jp0RH",
            name: "Relaxing Jazz",
            image:
              "https://i.scdn.co/image/ab67706f0000000278b4745cb9ce8ffe32daaf7e",
            owner: "Spotify",
            trackCount: 125,
            description: "Smooth jazz to relax to",
            service: "spotify",
          },
        ];
      } else {
        return [
          {
            id: "37i9dQZF1DWZeKCadgRdKQ",
            name: "Focus Flow",
            image:
              "https://i.scdn.co/image/ab67706f000000022d4195adee3c41dabd718435",
            owner: "Spotify",
            trackCount: 166,
            description: "Uptempo instrumental hip hop beats",
            service: "spotify",
          },
          {
            id: "37i9dQZF1DWXLeA8Omikj7",
            name: "Brain Food",
            image:
              "https://i.scdn.co/image/ab67706f000000026e849349fc0a57e606644442",
            owner: "Spotify",
            trackCount: 125,
            description: "Hypnotic electronic for studies and work",
            service: "spotify",
          },
          {
            id: "37i9dQZF1DX8NTLI2TtZa6",
            name: "Instrumental Study",
            image:
              "https://i.scdn.co/image/ab67706f00000002fe24d7084be472288cd6ee6c",
            owner: "Spotify",
            trackCount: 193,
            description: "Focus with soft study music in the background",
            service: "spotify",
          },
        ];
      }
    } else {
      // Track results
      if (isRelaxQuery) {
        return [
          {
            id: "3lPr8ghNDBLc2uZovNyLs9",
            title: "Weightless",
            artist: "Marconi Union",
            albumName: "Weightless",
            albumImage:
              "https://i.scdn.co/image/ab67616d0000b273e9c65c678d997e060907d28c",
            duration: 480,
            service: "spotify",
          },
          {
            id: "2uFaJJtFnADyYhRHG4bjGX",
            title: "Gymnopedie No. 1",
            artist: "Erik Satie",
            albumName: "Classical Piano Pieces",
            albumImage:
              "https://i.scdn.co/image/ab67616d0000b273bd02d0fd27a8c3db71c3d933",
            duration: 180,
            service: "spotify",
          },
          {
            id: "3V8GA9X4Bn9m4QU9lKSMtp",
            title: "Autumn Leaves",
            artist: "Bill Evans",
            albumName: "Portrait in Jazz",
            albumImage:
              "https://i.scdn.co/image/ab67616d0000b273cca5d4486b0da58a30d0f4c4",
            duration: 360,
            service: "spotify",
          },
        ];
      } else {
        return [
          {
            id: "5sdQOyqq2IDhvmx2lHOpwd",
            title: "The Girl I Haven't Met",
            artist: "kudasai",
            albumName: "Lofi Hip Hop Beats",
            albumImage:
              "https://i.scdn.co/image/ab67616d0000b273de3c04b5fc69c9721e7f1152",
            duration: 132,
            service: "spotify",
          },
          {
            id: "0bMoNdAnxNR6p4RhO2EV7V",
            title: "Midnight City Vibes",
            artist: "Chillhop Music",
            albumName: "Study Session",
            albumImage:
              "https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a",
            duration: 185,
            service: "spotify",
          },
          {
            id: "7fPuv9yRDayQvUmAz0CwCU",
            title: "Coffee Shop Calm",
            artist: "Lo-Fi Beats",
            albumName: "Focus & Concentration",
            albumImage:
              "https://i.scdn.co/image/ab67616d0000b273b2871316e5040f8c406a46f2",
            duration: 226,
            service: "spotify",
          },
        ];
      }
    }
  };

  // Generate mock recommendations for top picks
  const getMockRecommendations = () => {
    if (service === "youtube") {
      return getMockYoutubeResults(
        isBreak ? "relaxation" : "focus",
        Math.random() > 0.5
      );
    } else {
      return getMockSpotifyResults(
        isBreak ? "relaxation" : "focus",
        Math.random() > 0.5
      );
    }
  };

  // Play track
  const playTrack = (track) => {
    setCurrentTrack(track);
    setShowPlayer(true);
    setIsPlaying(true);

    // Reset progress
    setProgress(0);
    setCurrentTime(0);

    // If it's a YouTube video, save it to recently played
    if (service === "youtube") {
      YouTubeService.saveToRecentlyPlayed(track);

      // Update recently played list
      setRecentlyPlayed(YouTubeService.getRecentlyPlayed().slice(0, 5));
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Handle volume change with smoother animation
  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);

    // Animate the volume change for smoother visual effect
    const startVolume = volume;
    const endVolume = newVolume;
    const duration = 200; // milliseconds
    const startTime = performance.now();

    const animateVolume = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // Smooth easing function
      const easing = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
      const easedProgress = easing(progress);

      // Calculate current volume in animation
      const currentVolume = Math.round(
        startVolume + (endVolume - startVolume) * easedProgress
      );
      setVolume(currentVolume);

      if (progress < 1) {
        requestAnimationFrame(animateVolume);
      } else {
        // When animation completes, ensure we have the exact target volume
        setVolume(endVolume);

        // Save volume preference when animation completes
        PreferencesModel.getMusicPreferences().then((prefs) => {
          PreferencesModel.updateMusicPreferences({
            ...prefs,
            volume: endVolume,
          });
        });
      }
    };

    // Start the animation
    requestAnimationFrame(animateVolume);

    // Show volume badge
    setShowVolumeBadge(true);

    // Clear existing timeout
    if (volumeBadgeTimeoutRef.current) {
      clearTimeout(volumeBadgeTimeoutRef.current);
    }

    // Hide badge after 1.5 seconds
    volumeBadgeTimeoutRef.current = setTimeout(() => {
      setShowVolumeBadge(false);
    }, 1500);
  };

  // Toggle mute function
  const toggleMute = () => {
    if (volume === 0) {
      // If currently muted, restore to last non-zero volume or default 70%
      const lastVolume = localStorage.getItem("lastVolume") || 70;
      setVolume(parseInt(lastVolume));
    } else {
      // Store current volume before muting
      localStorage.setItem("lastVolume", volume.toString());
      setVolume(0);
    }

    // Show badge
    setShowVolumeBadge(true);

    // Clear existing timeout
    if (volumeBadgeTimeoutRef.current) {
      clearTimeout(volumeBadgeTimeoutRef.current);
    }

    // Hide badge after 1.5 seconds
    volumeBadgeTimeoutRef.current = setTimeout(() => {
      setShowVolumeBadge(false);
    }, 1500);
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setErrorMessage("Please enter a search term");
      return;
    }

    if (service === "youtube") {
      searchYouTube(searchQuery);
    } else {
      searchSpotify(searchQuery);
    }
  };

  // Handle search input
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search input key press
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle content type change
  const handleContentTypeChange = (type) => {
    setContentType(type);
    setSearchResults([]);
    setErrorMessage("");
  };

  // Handle seeking in progress bar
  const handleSeek = (e) => {
    if (!currentTrack) return;

    const progressBar = e.currentTarget;
    const bounds = progressBar.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const width = bounds.width;
    const percentage = (x / width) * 100;

    // Calculate new time based on percentage
    const totalDuration = currentTrack.duration || 272;
    const newTime = Math.floor((percentage / 100) * totalDuration);

    setCurrentTime(newTime);
    setProgress(percentage);

    // In a real implementation, we would seek the actual media player
  };

  // Render equalizer bars
  const renderEqualizerBars = () => {
    return (
      <EqualizerBars $isPlaying={isPlaying}>
        {[...Array(5)].map((_, i) => (
          <Bar
            key={i}
            $height={12 + Math.random() * 8}
            $minHeight={4 + Math.random() * 4}
            $duration={0.8 + Math.random() * 0.4}
            $delay={Math.random() * 0.5}
          />
        ))}
      </EqualizerBars>
    );
  };

  // Generate placeholder title for suggested search
  const getSuggestedSearch = () => {
    if (isBreak) {
      return service === "youtube"
        ? "relaxing music meditation"
        : "meditation playlist";
    } else {
      return service === "youtube" ? "lofi study beats" : "focus playlist";
    }
  };

  return (
    <MusicPlayerContainer>
      <WaveBackground />
      <PlayerTitle>
        <i className="material-icons">{isBreak ? "spa" : "headphones"}</i>
        {isBreak ? "Musik Relaksasi" : "Musik Fokus"}
        {renderEqualizerBars()}
      </PlayerTitle>

      <ServiceTabs>
        <ServiceTab
          $active={service === "youtube"}
          onClick={() => setService("youtube")}
        >
          <i className="material-icons" style={{ fontSize: "1.2rem" }}>
            videocam
          </i>
          YouTube
        </ServiceTab>
        <ServiceTab
          $active={service === "spotify"}
          onClick={() => setService("spotify")}
        >
          <i className="material-icons" style={{ fontSize: "1.2rem" }}>
            audiotrack
          </i>
          Spotify
        </ServiceTab>
      </ServiceTabs>

      <ContentTypeToggle>
        <ContentTypeButton
          $active={contentType === "tracks"}
          onClick={() => handleContentTypeChange("tracks")}
        >
          {service === "youtube" ? "Videos" : "Tracks"}
        </ContentTypeButton>
        <ContentTypeButton
          $active={contentType === "playlists"}
          onClick={() => handleContentTypeChange("playlists")}
        >
          Playlists
        </ContentTypeButton>
      </ContentTypeToggle>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder={`Cari ${
            contentType === "tracks"
              ? service === "youtube"
                ? "video"
                : "lagu"
              : "playlist"
          }... coba "${getSuggestedSearch()}"`}
          value={searchQuery}
          onChange={handleSearchInputChange}
          onKeyPress={handleSearchKeyPress}
        />
        <SearchButton onClick={handleSearch}>
          <i className="material-icons">search</i>
        </SearchButton>
      </SearchContainer>

      <ErrorMessage $visible={errorMessage !== ""}>{errorMessage}</ErrorMessage>

      <SearchLoadingSpinner $isLoading={isSearching} />

      {searchResults.length > 0 && (
        <ResultsList>
          {searchResults.map((result) => (
            <ResultItem key={result.id} onClick={() => playTrack(result)}>
              <ResultThumbnail
                src={
                  service === "youtube"
                    ? result.thumbnail
                    : (contentType === "tracks"
                        ? result.albumImage
                        : result.image) || "/logo192.png"
                }
                alt={result.title || result.name}
              />
              <ResultInfo>
                <ResultTitle>
                  {contentType === "playlists" && service === "spotify" && (
                    <SearchTypeTag>Playlist</SearchTypeTag>
                  )}
                  {result.title || result.name}
                </ResultTitle>
                <ResultArtist>
                  {service === "youtube"
                    ? result.artist
                    : contentType === "tracks"
                    ? result.artist
                    : `${result.trackCount} tracks • ${result.owner}`}
                </ResultArtist>
              </ResultInfo>
            </ResultItem>
          ))}
        </ResultsList>
      )}

      {searchResults.length === 0 && !isSearching && !errorMessage && (
        <>
          {recentlyPlayed.length > 0 && service === "youtube" && (
            <RecentlyPlayedSection>
              <SectionTitle>
                <i className="material-icons">history</i>
                Recently Played
              </SectionTitle>
              <ResultsList>
                {recentlyPlayed.map((item) => (
                  <ResultItem key={item.id} onClick={() => playTrack(item)}>
                    <ResultThumbnail src={item.thumbnail} alt={item.title} />
                    <ResultInfo>
                      <ResultTitle>{item.title}</ResultTitle>
                      <ResultArtist>{item.artist}</ResultArtist>
                    </ResultInfo>
                  </ResultItem>
                ))}
              </ResultsList>
            </RecentlyPlayedSection>
          )}

          <TopPicksContainer $visible={topPicks.length > 0}>
            <SectionTitle>
              <i className="material-icons">stars</i>
              {isBreak ? "Recommended for Relaxation" : "Recommended for Focus"}
            </SectionTitle>
            <ResultsList>
              {topPicks.map((item) => (
                <ResultItem key={item.id} onClick={() => playTrack(item)}>
                  <ResultThumbnail
                    src={
                      service === "youtube"
                        ? item.thumbnail
                        : item.image || item.albumImage || "/logo192.png"
                    }
                    alt={item.title || item.name}
                  />
                  <ResultInfo>
                    <ResultTitle>{item.title || item.name}</ResultTitle>
                    <ResultArtist>
                      {service === "youtube"
                        ? item.artist
                        : item.artist ||
                          `${item.trackCount || 0} tracks • ${
                            item.owner || "Spotify"
                          }`}
                    </ResultArtist>
                  </ResultInfo>
                </ResultItem>
              ))}
            </ResultsList>
          </TopPicksContainer>
        </>
      )}

      {currentTrack && (
        <>
          <TrackInfo>
            <TrackThumbnail
              src={
                service === "youtube"
                  ? currentTrack.thumbnail
                  : (contentType === "tracks"
                      ? currentTrack.albumImage
                      : currentTrack.image) || "/logo192.png"
              }
              alt={currentTrack.title || currentTrack.name}
            />
            <TrackDetails>
              <TrackTitle>{currentTrack.title || currentTrack.name}</TrackTitle>
              <TrackArtist>
                {service === "youtube"
                  ? currentTrack.artist
                  : contentType === "tracks"
                  ? currentTrack.artist
                  : `${currentTrack.trackCount} tracks • ${currentTrack.owner}`}
              </TrackArtist>
              <NowPlayingBadge>
                <i className="material-icons" style={{ fontSize: "0.8rem" }}>
                  {service === "youtube" ? "videocam" : "audiotrack"}
                </i>
                {service === "youtube" ? "YouTube" : "Spotify"}
                {contentType === "playlists" && " Playlist"}
              </NowPlayingBadge>
            </TrackDetails>
          </TrackInfo>

          <MusicControls>
            <ControlButton title="Previous">
              <i className="material-icons">skip_previous</i>
            </ControlButton>
            <PlayButton onClick={() => setIsPlaying(!isPlaying)}>
              <i className="material-icons">
                {isPlaying ? "pause" : "play_arrow"}
              </i>
            </PlayButton>
            <ControlButton title="Next">
              <i className="material-icons">skip_next</i>
            </ControlButton>
          </MusicControls>

          <ProgressBar onClick={handleSeek}>
            <Progress $percentage={progress} />
          </ProgressBar>
          <TimeDisplay>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentTrack.duration || 272)}</span>
          </TimeDisplay>

          <PlayerViewContainer $visible={showPlayer}>
            <IframeContainer>
              {service === "youtube" && (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&rel=0`}
                  title="YouTube player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
              {service === "spotify" && (
                <iframe
                  src={`https://open.spotify.com/embed/${
                    contentType === "tracks" ? "track" : "playlist"
                  }/${currentTrack.id}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowTransparency="true"
                  allow="encrypted-media"
                  title="Spotify player"
                ></iframe>
              )}
            </IframeContainer>
          </PlayerViewContainer>
        </>
      )}

      <VolumeControl>
        <VolumeIconButton
          onClick={toggleMute}
          title={volume === 0 ? "Unmute" : "Mute"}
        >
          <VolumeIcon className="material-icons">
            {volume === 0
              ? "volume_off"
              : volume < 30
              ? "volume_down"
              : "volume_up"}
          </VolumeIcon>
        </VolumeIconButton>
        <VolumeWrapper>
          <VolumeBadge $show={showVolumeBadge}>{volume}%</VolumeBadge>
          <VolumeSlider
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            $percentage={volume}
          />
          <VolumeValue>{volume}%</VolumeValue>
        </VolumeWrapper>
      </VolumeControl>
    </MusicPlayerContainer>
  );
};


export default MusicPlayer;