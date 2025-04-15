import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  width: 100%;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${(props) => (props.isBreak ? "#4CAF50" : "#4CAF50")};
  color: white;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const SettingsButton = styled.button`
  background: none;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const SettingsPanel = styled.div`
  width: 100%;
  padding: 24px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SettingsTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #333;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const SettingsField = styled.div`
  margin-bottom: 8px;
`;

const SettingsLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 4px;
  color: #555;
`;

const SettingsInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: ${(props) => (props.isBreak ? "#4CAF50" : "#4CAF50")};
    box-shadow: 0 0 0 2px
      ${(props) =>
        props.isBreak ? "rgba(76, 175, 80, 0.2)" : "rgba(74, 0, 224, 0.2)"};
  }
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f44336;
  }
`;

const TaskSelection = styled.div`
  width: 100%;
  padding: 24px;
  background-color: white;
`;

const SelectLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: #555;
`;

const TaskSelect = styled.select`
  width: 100%;
  padding: 12px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  outline: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: #4CAF50;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const TimerDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background-color: white;
`;

const CircleContainer = styled.div`
  position: relative;
  width: 250px;
  height: 250px;
`;

const CircleBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #f5f5f5;
`;

const TimerSVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
`;

const TimerCircle = styled.circle`
  fill: none;
  stroke: ${(props) => {
    if (props.isBreak) return "#4CAF50";
    if (props.isLastMinute) return "#F44336";
    return "#4CAF50";
  }};
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s linear, stroke 0.3s ease;
`;

const TimeText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  font-weight: 700;
  font-family: "Roboto Mono", monospace;
  color: ${(props) => {
    if (props.isBreak) return "#4CAF50";
    if (props.isLastMinute) return "#F44336";
    return "#4CAF50";
  }};
  transition: color 0.3s ease;
`;

const SessionInfo = styled.p`
  margin: 16px 0 0 0;
  font-size: 0.875rem;
  color: #666;
`;

const SessionDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
`;

const SessionDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => {
    if (!props.active) return "#e0e0e0";
    if (props.isBreak) return "#4CAF50";
    return "#4CAF50";
  }};
`;

const ControlsContainer = styled.div`
  width: 100%;
  padding: 24px;
  background-color: #f9f9f9;
  display: flex;
  justify-content: center;
`;

const PrimaryButton = styled.button`
  padding: 12px 32px;
  border-radius: 50px;
  border: none;
  background-color: ${(props) => {
    if (props.disabled) return "#bdbdbd";
    if (props.isBreak) return "#4CAF50";
    if (props.isLastMinute) return "#F44336";
    return "#4CAF50";
  }};
  color: white;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  box-shadow: 0 4px 12px
    ${(props) => {
      if (props.disabled) return "rgba(0, 0, 0, 0.1)";
      if (props.isBreak) return "rgba(76, 175, 80, 0.3)";
      if (props.isLastMinute) return "rgba(244, 67, 54, 0.3)";
      return "rgba(244, 67, 54, 0.3)";
    }};
  transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s;

  &:hover:not(:disabled) {
    background-color: ${(props) => {
      if (props.isBreak) return "#43A047";
      if (props.isLastMinute) return "#E53935";
      return "#E53935";
    }};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px
      ${(props) => {
        if (props.isBreak) return "rgba(76, 175, 80, 0.4)";
        if (props.isLastMinute) return "rgba(244, 67, 54, 0.4)";
        return "rgba(74, 0, 224, 0.4)";
      }};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px
      ${(props) => {
        if (props.isBreak) return "rgba(76, 175, 80, 0.3)";
        if (props.isLastMinute) return "rgba(244, 67, 54, 0.3)";
        return "rgba(74, 0, 224, 0.3)";
      }};
  }
`;

const SecondaryControls = styled.div`
  width: 100%;
  padding: 16px 24px;
  background-color: white;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #f0f0f0;
`;

const SecondaryButton = styled.button`
  background: none;
  border: none;
  color: #757575;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #f5f5f5;
    color: #4caf50;
  }
`;

// Helper components for SVG icons
const PlayIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
  </svg>
);

const PauseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.25 22L8.85 18.8C8.63333 18.7167 8.429 18.6167 8.237 18.5C8.04567 18.3833 7.86667 18.2583 7.7 18.125L4.7 19.375L1.95 14.625L4.525 12.675C4.50833 12.5583 4.5 12.446 4.5 12.338V11.663C4.5 11.554 4.50833 11.4417 4.525 11.325L1.95 9.375L4.7 4.625L7.7 5.875C7.86667 5.74167 8.05 5.61667 8.25 5.5C8.45 5.38333 8.65 5.28333 8.85 5.2L9.25 2H14.75L15.15 5.2C15.3667 5.28333 15.571 5.38333 15.763 5.5C15.9543 5.61667 16.1333 5.74167 16.3 5.875L19.3 4.625L22.05 9.375L19.475 11.325C19.4917 11.4417 19.5 11.554 19.5 11.663V12.337C19.5 12.4457 19.4833 12.5583 19.45 12.675L22.025 14.625L19.275 19.375L16.3 18.125C16.1333 18.2583 15.95 18.3833 15.75 18.5C15.55 18.6167 15.35 18.7167 15.15 18.8L14.75 22H9.25ZM12 16C13.1 16 14.0417 15.6083 14.825 14.825C15.6083 14.0417 16 13.1 16 12C16 10.9 15.6083 9.95833 14.825 9.175C14.0417 8.39167 13.1 8 12 8C10.9 8 9.95833 8.39167 9.175 9.175C8.39167 9.95833 8 10.9 8 12C8 13.1 8.39167 14.0417 9.175 14.825C9.95833 15.6083 10.9 16 12 16Z"
      fill="currentColor"
    />
  </svg>
);

const ResetIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 20C9.8 20 7.925 19.225 6.375 17.675C4.825 16.125 4.05 14.25 4.05 12.05C4.05 9.85 4.825 7.975 6.375 6.425C7.925 4.875 9.8 4.1 12 4.1C13.325 4.1 14.55 4.4 15.675 5C16.8 5.6 17.7 6.35 18.375 7.25V4H20.375V11H13.375V9H17.65C17.1167 7.95 16.375 7.125 15.425 6.525C14.475 5.92567 13.3917 5.625 12.175 5.625C10.3417 5.625 8.79167 6.2625 7.525 7.5375C6.25833 8.8125 5.625 10.3667 5.625 12.2C5.625 14.0333 6.25833 15.5833 7.525 16.85C8.79167 18.1167 10.3417 18.75 12.175 18.75C13.5417 18.75 14.7583 18.375 15.825 17.625C16.8917 16.875 17.6333 15.8667 18.05 14.6L19.65 15.15C19.1167 16.7833 18.1667 18.0917 16.8 19.075C15.4333 20.0583 13.8667 20.55 12.1 20.55C9.86667 20.55 7.95833 19.7667 6.375 18.2C4.79167 16.6333 4 14.7167 4 12.45C4 10.1833 4.78333 8.26667 6.35 6.7C7.91667 5.13333 9.83333 4.35 12.1 4.35C13.3 4.35 14.4417 4.58733 15.525 5.062C16.6083 5.53667 17.5333 6.18333 18.3 7H20.15V20H18.15V16.95C17.45 17.8167 16.55 18.5167 15.45 19.05C14.35 19.5833 13.1833 19.85 11.95 19.85L12 20Z"
      fill="currentColor"
    />
  </svg>
);

const SkipIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M13 6V18L21.5 12L13 6ZM4 18H8V6H4V18Z" fill="currentColor" />
  </svg>
);

// Component utama
const PomodoroTimer = ({ tasks = [], onSessionComplete }) => {
  // State untuk timer
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentSession, setCurrentSession] = useState(1);
  const [maxSessions, setMaxSessions] = useState(4);
  const [progress, setProgress] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakAfter: 4,
  });

  // State untuk mengecek apakah waktu tersisa kurang dari 1 menit
  const [isLastMinute, setIsLastMinute] = useState(false);

  // Refs
  const timerRef = useRef(null);
  const sessionRef = useRef(null);
  const totalSeconds = useRef(0);
  const elapsedSeconds = useRef(0);
  const audioRef = useRef(null);

  // Konstanta untuk lingkaran SVG
  const CIRCLE_RADIUS = 110;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  // Effect untuk menghitung total dan elapsed seconds
  useEffect(() => {
    if (isBreak) {
      const breakDuration =
        currentSession % settings.longBreakAfter === 0
          ? settings.longBreakDuration
          : settings.shortBreakDuration;
      totalSeconds.current = breakDuration * 60;
    } else {
      totalSeconds.current = settings.workDuration * 60;
    }
    elapsedSeconds.current = 0;
  }, [isBreak, currentSession, settings]);

  // Effect untuk update progress bar dan cek last minute
  useEffect(() => {
    if (totalSeconds.current > 0) {
      const secondsLeft = minutes * 60 + seconds;
      elapsedSeconds.current = totalSeconds.current - secondsLeft;
      setProgress((elapsedSeconds.current / totalSeconds.current) * 100);

      // Cek apakah waktu tersisa kurang dari 1 menit
      setIsLastMinute(!isBreak && secondsLeft <= 60);
    }
  }, [minutes, seconds, isBreak]);

  // Timer logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer selesai
            clearInterval(timerRef.current);
            handleTimerComplete();
          } else {
            // Kurangi menit, set detik ke 59
            setMinutes((prev) => prev - 1);
            setSeconds(59);
          }
        } else {
          // Kurangi detik
          setSeconds((prev) => prev - 1);
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, minutes, seconds]);

  // Format time helper function
  const formatTime = (mins, secs) => {
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Fungsi untuk memulai timer
  const startTimer = () => {
    if (!isActive) {
      setIsActive(true);
    }
  };

  // Fungsi untuk menjeda timer
  const pauseTimer = () => {
    setIsActive(false);
  };

  // Fungsi untuk reset timer
  const resetTimer = () => {
    setIsActive(false);

    if (isBreak) {
      setMinutes(
        currentSession % settings.longBreakAfter === 0
          ? settings.longBreakDuration
          : settings.shortBreakDuration
      );
    } else {
      setMinutes(settings.workDuration);
    }

    setSeconds(0);
    setProgress(0);
    elapsedSeconds.current = 0;
    setIsLastMinute(false);
  };

  // Fungsi untuk melewati timer saat ini
  const skipTimer = () => {
    handleTimerComplete();
  };

  // Fungsi yang dijalankan ketika timer selesai
  const handleTimerComplete = () => {
    setIsActive(false);

    if (!isBreak) {
      // Tentukan jenis istirahat
      const isLongBreak = currentSession % settings.longBreakAfter === 0;
      const breakDuration = isLongBreak
        ? settings.longBreakDuration
        : settings.shortBreakDuration;

      // Set ke mode istirahat
      setIsBreak(true);
      setMinutes(breakDuration);
      setSeconds(0);
      setIsLastMinute(false);

      // Callback untuk komponen induk
      if (onSessionComplete) {
        onSessionComplete({
          type: "work",
          duration: settings.workDuration,
          taskId: selectedTaskId !== "none" ? parseInt(selectedTaskId) : null,
        });
      }
    } else {
      // Istirahat selesai
      setIsBreak(false);
      setMinutes(settings.workDuration);
      setSeconds(0);
      setIsLastMinute(false);

      // Tambah sesi jika bukan long break
      if (currentSession % settings.longBreakAfter !== 0) {
        setCurrentSession((prev) => prev + 1);
      } else {
        // Reset sesi counter setelah long break
        setCurrentSession(1);
      }

      // Callback untuk komponen induk
      if (onSessionComplete) {
        onSessionComplete({
          type: "break",
          duration:
            currentSession % settings.longBreakAfter === 0
              ? settings.longBreakDuration
              : settings.shortBreakDuration,
        });
      }
    }
  };

  // Handler untuk perubahan task yang dipilih
  const handleTaskChange = (e) => {
    setSelectedTaskId(e.target.value);
  };

  // Handler untuk perubahan setting
  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: parseInt(value),
    }));
  };

  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Hitung stroke-dashoffset untuk lingkaran progress
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress / 100);

  return (
    <Container>
      <Header isBreak={isBreak}>
        <Title>
          {isBreak
            ? currentSession % settings.longBreakAfter === 0
              ? "Istirahat Panjang"
              : "Istirahat Pendek"
            : "Fokus"}
        </Title>
        <SettingsButton onClick={toggleSettings}>
          <SettingsIcon />
        </SettingsButton>
      </Header>

      {showSettings && (
        <SettingsPanel>
          <SettingsTitle>Pengaturan Timer</SettingsTitle>
          <SettingsGrid>
            <SettingsField>
              <SettingsLabel>Durasi Fokus (menit)</SettingsLabel>
              <SettingsInput
                type="number"
                name="workDuration"
                value={settings.workDuration}
                onChange={handleSettingChange}
                min="1"
                max="60"
                isBreak={isBreak}
              />
            </SettingsField>
            <SettingsField>
              <SettingsLabel>Istirahat Pendek (menit)</SettingsLabel>
              <SettingsInput
                type="number"
                name="shortBreakDuration"
                value={settings.shortBreakDuration}
                onChange={handleSettingChange}
                min="1"
                max="30"
                isBreak={isBreak}
              />
            </SettingsField>
            <SettingsField>
              <SettingsLabel>Istirahat Panjang (menit)</SettingsLabel>
              <SettingsInput
                type="number"
                name="longBreakDuration"
                value={settings.longBreakDuration}
                onChange={handleSettingChange}
                min="1"
                max="60"
                isBreak={isBreak}
              />
            </SettingsField>
            <SettingsField>
              <SettingsLabel>Sesi sebelum istirahat panjang</SettingsLabel>
              <SettingsInput
                type="number"
                name="longBreakAfter"
                value={settings.longBreakAfter}
                onChange={handleSettingChange}
                min="1"
                max="10"
                isBreak={isBreak}
              />
            </SettingsField>
          </SettingsGrid>
          <CloseButton onClick={toggleSettings}>Tutup</CloseButton>
        </SettingsPanel>
      )}

      {!isBreak && !isActive && (
        <TaskSelection>
          <SelectLabel>Pilih Tugas</SelectLabel>
          <TaskSelect value={selectedTaskId} onChange={handleTaskChange}>
            <option value="none">-- Pilih Tugas --</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </TaskSelect>
        </TaskSelection>
      )}

      <TimerDisplay>
        <CircleContainer>
          <CircleBackground />
          <TimerSVG viewBox="0 0 240 240">
            <TimerCircle
              cx="120"
              cy="120"
              r={CIRCLE_RADIUS}
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              isBreak={isBreak}
              isLastMinute={isLastMinute}
            />
          </TimerSVG>
          <TimeText isBreak={isBreak} isLastMinute={isLastMinute}>
            {formatTime(minutes, seconds)}
          </TimeText>
        </CircleContainer>

        <SessionInfo>
          Sesi {currentSession} dari {settings.longBreakAfter}
        </SessionInfo>
        <SessionDots>
          {[...Array(settings.longBreakAfter)].map((_, i) => (
            <SessionDot key={i} active={i < currentSession} isBreak={isBreak} />
          ))}
        </SessionDots>
      </TimerDisplay>

      <ControlsContainer>
        {!isActive ? (
          <PrimaryButton
            onClick={startTimer}
            disabled={!isBreak && selectedTaskId === ""}
            isBreak={isBreak}
            isLastMinute={isLastMinute}
          >
            <PlayIcon />
            Mulai
          </PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={pauseTimer}
            isBreak={isBreak}
            isLastMinute={isLastMinute}
          >
            <PauseIcon />
            Jeda
          </PrimaryButton>
        )}
      </ControlsContainer>

      <SecondaryControls>
        <SecondaryButton onClick={resetTimer}>
          <ResetIcon />
          Reset
        </SecondaryButton>
        <SecondaryButton onClick={skipTimer}>
          <SkipIcon />
          Lewati
        </SecondaryButton>
      </SecondaryControls>
    </Container>
  );
};

export default PomodoroTimer;
