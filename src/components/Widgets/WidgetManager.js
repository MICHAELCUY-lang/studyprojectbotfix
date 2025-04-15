import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { TasksModel } from "../../services/db";

// Styled components
const WidgetContainer = styled.div`
  display: ${(props) => (props.$isVisible ? "block" : "none")};
`;

const TodayTasksWidget = styled.div`
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

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: ${(props) => (props.$completed ? "#f9f9f9" : "#f0f8f4")};
  border-radius: 8px;
  border-left: 3px solid ${(props) => (props.$completed ? "#aaa" : "#25AA60")};
`;

const TaskCheckbox = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${(props) => (props.$completed ? "#aaa" : "#25AA60")};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: ${(props) => (props.$completed ? "#aaa" : "transparent")};

  i {
    color: white;
    font-size: 14px;
  }
`;

const TaskContent = styled.div`
  flex: 1;
`;

const TaskTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
  text-decoration: ${(props) => (props.$completed ? "line-through" : "none")};
  color: ${(props) => (props.$completed ? "#888" : "#333")};
`;

const TaskTime = styled.div`
  font-size: 0.75rem;
  color: #888;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: #888;
  text-align: center;

  i {
    font-size: 24px;
    margin-bottom: 8px;
    color: #ccc;
  }

  p {
    margin: 0;
    font-size: 0.85rem;
  }
`;

/**
 * Widget Manager Component
 *
 * Mengelola widget dengan dukungan Web App Manifest
 */
const WidgetManager = () => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [isWidgetSupported, setIsWidgetSupported] = useState(false);

  // Check if widget is supported
  useEffect(() => {
    // Check if browser supports widgets
    const checkWidgetSupport = () => {
      // For now we'll just check if it's Android or iOS
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isAndroid = /android/i.test(userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

      // This is a simplified check - in real implementation we'd
      // check for actual widget support in the browser
      setIsWidgetSupported(isAndroid || isIOS);
    };

    checkWidgetSupport();
  }, []);

  // Load today's tasks
  useEffect(() => {
    const loadTodayTasks = async () => {
      try {
        // Get today's date with time set to start of day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get tomorrow's date with time set to start of day
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get tasks due today
        const tasks = await TasksModel.getUpcomingTasks(1);

        // Filter tasks to only include those due today
        const todayTasksList = tasks.filter((task) => {
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        });

        setTodayTasks(todayTasksList);

        // Update widget data if supported
        if (isWidgetSupported && "widgets" in window) {
          updateWidgetData(todayTasksList);
        }
      } catch (error) {
        console.error("Error loading today's tasks:", error);
      }
    };

    loadTodayTasks();

    // Set up an interval to refresh tasks every 15 minutes
    const intervalId = setInterval(loadTodayTasks, 15 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isWidgetSupported]);

  // Handle task status toggle
  const handleTaskStatusToggle = async (taskId) => {
    try {
      // Find the task
      const task = todayTasks.find((t) => t.id === taskId);
      if (!task) return;

      // Toggle status
      const newStatus = task.status === "completed" ? "pending" : "completed";

      // Update in database
      await TasksModel.updateTaskStatus(taskId, newStatus);

      // Update in state
      setTodayTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        )
      );

      // Update widget data if supported
      if (isWidgetSupported && "widgets" in window) {
        updateWidgetData(
          todayTasks.map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t
          )
        );
      }
    } catch (error) {
      console.error("Error toggling task status:", error);
    }
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Update widget data
  const updateWidgetData = (tasks) => {
    // This is a placeholder function - in a real app,
    // we would use the Widget API to update widget data

    // Example for how this might work with an actual Widget API:
    if ("widgets" in window && window.widgets.updateData) {
      try {
        // Format tasks for the widget
        const widgetItems = tasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          dueTime: formatTime(task.dueDate),
        }));

        // Update widget data
        window.widgets.updateData("today-tasks", {
          template: tasks.length > 0 ? "with-tasks" : "default",
          items: widgetItems,
        });
      } catch (error) {
        console.error("Error updating widget data:", error);
      }
    }
  };

  return (
    <WidgetContainer $isVisible={isWidgetSupported}>
      <TodayTasksWidget>
        <WidgetHeader>
          <WidgetTitle>
            <i className="material-icons">today</i>
            Tugas Hari Ini
          </WidgetTitle>
        </WidgetHeader>

        {todayTasks.length > 0 ? (
          <TaskList>
            {todayTasks.map((task) => (
              <TaskItem key={task.id} $completed={task.status === "completed"}>
                <TaskCheckbox
                  $completed={task.status === "completed"}
                  onClick={() => handleTaskStatusToggle(task.id)}
                >
                  {task.status === "completed" && (
                    <i className="material-icons">check</i>
                  )}
                </TaskCheckbox>

                <TaskContent>
                  <TaskTitle $completed={task.status === "completed"}>
                    {task.title}
                  </TaskTitle>
                  <TaskTime>{formatTime(task.dueDate)}</TaskTime>
                </TaskContent>
              </TaskItem>
            ))}
          </TaskList>
        ) : (
          <EmptyState>
            <i className="material-icons">check_circle</i>
            <p>Tidak ada tugas untuk hari ini</p>
          </EmptyState>
        )}
      </TodayTasksWidget>
    </WidgetContainer>
  );
};

export default WidgetManager;
