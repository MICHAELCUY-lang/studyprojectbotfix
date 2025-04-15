import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { PreferencesModel } from "../../services/db";

// Styled components
const WidgetContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const WidgetTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    font-size: 18px;
    color: #25aa60;
  }
`;

const TimerDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 12px 0;
`;

const TimerText = styled.div`
  font-size: 2rem;
  font-weight: 700;
  font-family: "Roboto Mono", monospace;
  color: ${(props) => (props.$isBreak ? "#4CAF50" : "#25AA60")};
`;

const TimerControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
`;

const TimerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: ${(props) => (props.$primary ? "#25AA60" : "#f5f5f5")};
  color: ${(props) => (props.$primary ? "white" : "#666")};
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  i {
    font-size: 18px;
  }
`;

const TimerInfo = styled.div`
  text-align: center;
  font-size: 0.85rem;
  color: #666;
  margin-top: 8px;
`;

const SessionProgress = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
`;

const SessionDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => (props.$active ? "#25AA60" : "#e0e0e0")};
`;

/**
 * Pomodoro Widget Component
 *
 * Widget untuk Pomodoro Timer yang dapat digunakan di home screen
 */
const PomodoroWidget = () => {
  // State untuk timer
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentSession, setCurrentSession] = useState(1);
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakAfter: 4,
  });

  // Refs
  const timerRef = useRef(null);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const pomodoroSettings = await PreferencesModel.getPomodoroSettings();
        setSettings(pomodoroSettings);

        // Initialize timer with work duration
        setMinutes(pomodoroSettings.workDuration);
        setSeconds(0);
      } catch (error) {
        console.error("Error loading Pomodoro settings:", error);
      }
    };

    loadSettings();
  }, []);

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
            setMinutes((prevMinutes) => prevMinutes - 1);
            setSeconds(59);
          }
        } else {
          // Kurangi detik
          setSeconds((prevSeconds) => prevSeconds - 1);
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Update widget data if supported
    if ("widgets" in window && window.widgets && window.widgets.updateData) {
      updateWidgetData();
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
    setIsActive(true);
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
    } else {
      // Istirahat selesai
      setIsBreak(false);
      setMinutes(settings.workDuration);
      setSeconds(0);

      // Tambah sesi jika bukan long break
      if (currentSession % settings.longBreakAfter !== 0) {
        setCurrentSession((prev) => prev + 1);
      } else {
        // Reset sesi counter setelah long break
        setCurrentSession(1);
      }
    }

    // Update widget data
    updateWidgetData();

    // Notifikasi
    if ("Notification" in window && Notification.permission === "granted") {
      const title = isBreak ? "Istirahat selesai!" : "Sesi fokus selesai!";

      const options = {
        body: isBreak
          ? "Waktunya kembali fokus. Anda bisa melakukannya!"
          : "Saatnya istirahat sejenak.",
        icon: "/logo192.png",
      };

      new Notification(title, options);
    }
  };

  // Update widget data
  const updateWidgetData = () => {
    // This is a placeholder for actual Widget API implementation
    if ("widgets" in window && window.widgets && window.widgets.updateData) {
      try {
        window.widgets.updateData("pomodoro-timer", {
          template: "running",
          time: formatTime(minutes, seconds),
        });
      } catch (error) {
        console.error("Error updating widget data:", error);
      }
    }
  };

  return (
    <WidgetContainer>
      <WidgetHeader>
        <WidgetTitle>
          <i className="material-icons">timer</i>
          {isBreak
            ? currentSession % settings.longBreakAfter === 0
              ? "Istirahat Panjang"
              : "Istirahat Pendek"
            : "Pomodoro Timer"}
        </WidgetTitle>
      </WidgetHeader>

      <TimerDisplay>
        <TimerText $isBreak={isBreak}>{formatTime(minutes, seconds)}</TimerText>
      </TimerDisplay>

      <TimerControls>
        {!isActive ? (
          <TimerButton onClick={startTimer} $primary>
            <i className="material-icons">play_arrow</i>
          </TimerButton>
        ) : (
          <TimerButton onClick={pauseTimer} $primary>
            <i className="material-icons">pause</i>
          </TimerButton>
        )}

        <TimerButton onClick={resetTimer}>
          <i className="material-icons">refresh</i>
        </TimerButton>
      </TimerControls>

      <TimerInfo>
        {isBreak
          ? `Istirahat ${
              currentSession % settings.longBreakAfter === 0
                ? "panjang"
                : "pendek"
            }`
          : `Sesi fokus ${currentSession}`}
      </TimerInfo>

      <SessionProgress>
        {[...Array(settings.longBreakAfter)].map((_, i) => (
          <SessionDot key={i} $active={i < currentSession} />
        ))}
      </SessionProgress>
    </WidgetContainer>
  );
};

export default PomodoroWidget;
