import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import styled from "styled-components";
import { register } from "./serviceWorkerRegistration";
import { requestNotificationPermission } from "./services/notification";
import { initializeDatabase, TasksModel } from "./services/db";

// Import components
import PomodoroTimer from "./components/Pomodoro/PomodoroTimer";
import TaskList from "./components/Tasks/TaskList";
import TaskForm from "./components/Tasks/TaskForm";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";

// Styled components with green theme
const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
`;

const Header = styled.header`
  background-color: #25aa60; /* Changed from #4A00E0 to match the logo */
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(37, 170, 96, 0.25); /* Green shadow */
`;

const AppTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: 3fr 1fr;
  }
`;

const ContentSection = styled.section`
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 767px) {
    grid-row: 1;
  }
`;

const Navigation = styled.nav`
  background-color: white;
  border-top: 1px solid #eee;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 0.5rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);

  @media (min-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: ${(props) =>
    props.active ? "#25AA60" : "#777"}; /* Changed from #4A00E0 */
  font-size: 0.8rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(37, 170, 96, 0.05); /* Changed rgba value */
  }

  i {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
`;

const SectionTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #333;
  font-weight: 600;
`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 5rem;
  right: 1.5rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #25aa60; /* Changed from #4A00E0 */
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 170, 96, 0.25); /* Changed shadow color */
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  z-index: 10;

  i {
    font-size: 1.5rem;
  }

  &:hover {
    transform: translateY(-3px);
    background-color: #1d8549; /* Changed from #3700b3 - darker green */
  }

  &:active {
    transform: translateY(0);
  }

  @media (min-width: 768px) {
    bottom: 1.5rem;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 10px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const InstallPrompt = styled.div`
  background-color: #25aa60; /* Changed from #4A00E0 */
  color: white;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  button {
    background-color: white;
    color: #25aa60; /* Changed from #4A00E0 */
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f0f0f0;
    }
  }
`;

// TaskManager component to handle task state
function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTab, setActiveTab] = useState("tasks");
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  // Inisialisasi database dan service worker
  useEffect(() => {
    const initApp = async () => {
      // Inisialisasi database
      await initializeDatabase();

      // Minta izin notifikasi
      await requestNotificationPermission();

      // Load tasks
      const taskData = await TasksModel.getAllTasks();
      setTasks(taskData);

      // Tanda inisialisasi selesai
      setIsInitialized(true);
    };

    initApp();

    // Register service worker
    register({
      onUpdate: (registration) => {
        console.log("Update available");
        // Tampilkan pesan update jika diperlukan
      },
    });

    // Listen for beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
    });

    // Listen for appinstalled event
    window.addEventListener("appinstalled", () => {
      console.log("PWA was installed");
      setDeferredPrompt(null);
    });
  }, []);

  // Handler for task form submission
  const handleTaskSubmit = async (taskData) => {
    try {
      if (editingTask && editingTask.id) {
        // Update existing task
        await TasksModel.updateTask(editingTask.id, taskData);

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === editingTask.id ? { ...task, ...taskData } : task
          )
        );
      } else {
        // Add new task
        const id = await TasksModel.addTask(taskData);
        const newTask = { id, ...taskData };

        setTasks((prevTasks) => [...prevTasks, newTask]);
      }

      // Close modal
      setShowAddTaskModal(false);
      setEditingTask(null);

      // Navigate to tasks view
      navigate("/tasks");
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  };

  // Handler for task deletion
  const handleTaskDelete = async (taskId) => {
    try {
      await TasksModel.deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Handler for task editing
  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setShowAddTaskModal(true);
  };

  // Handler for Pomodoro session completion
  const handleSessionComplete = (sessionData) => {
    // Toggle break time
    setIsBreakTime(sessionData.type === "work");
  };

  // Install PWA handler
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);

      // We've used the prompt, and can't use it again, discard it
      setDeferredPrompt(null);
    }
  };

  // If not initialized yet, show loading
  if (!isInitialized) {
    return (
      <AppContainer
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>Loading StudyProjectBot...</div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header>
        <AppTitle>StudyProjectBot</AppTitle>
      </Header>

      {deferredPrompt && (
        <div style={{ padding: "0 1.5rem" }}>
          <InstallPrompt>
            <div>Install StudyProjectBot untuk pengalaman yang lebih baik!</div>
            <button onClick={handleInstallClick}>Install</button>
          </InstallPrompt>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/tasks" />} />

        <Route
          path="/tasks"
          element={
            <MainContent>
              <ContentSection>
                <SectionTitle>Daftar Tugas</SectionTitle>
                <TaskList
                  tasks={tasks}
                  onEdit={handleTaskEdit}
                  onDelete={handleTaskDelete}
                />
              </ContentSection>

              <Sidebar>
                <MusicPlayer isBreak={isBreakTime} />
                <PomodoroTimer
                  tasks={tasks}
                  onSessionComplete={handleSessionComplete}
                />
              </Sidebar>
            </MainContent>
          }
        />

        <Route
          path="/pomodoro"
          element={
            <MainContent>
              <ContentSection>
                <SectionTitle>Pomodoro Timer</SectionTitle>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                  <PomodoroTimer
                    tasks={tasks}
                    onSessionComplete={handleSessionComplete}
                  />
                </div>
              </ContentSection>

              <Sidebar>
                <MusicPlayer isBreak={isBreakTime} />
              </Sidebar>
            </MainContent>
          }
        />

        <Route
          path="/music"
          element={
            <MainContent>
              <ContentSection>
                <SectionTitle>Music Player</SectionTitle>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                  <MusicPlayer isBreak={isBreakTime} />
                </div>
              </ContentSection>
            </MainContent>
          }
        />

        <Route
          path="/stats"
          element={
            <MainContent>
              <ContentSection>
                <SectionTitle>Statistik & Progres</SectionTitle>
                <p>Fitur statistik akan segera hadir!</p>
              </ContentSection>
            </MainContent>
          }
        />
      </Routes>

      <Navigation>
        <NavLink
          to="/tasks"
          active={activeTab === "tasks" ? 1 : 0}
          onClick={() => setActiveTab("tasks")}
        >
          <i className="material-icons">assignment</i>
          Tugas
        </NavLink>
        <NavLink
          to="/pomodoro"
          active={activeTab === "pomodoro" ? 1 : 0}
          onClick={() => setActiveTab("pomodoro")}
        >
          <i className="material-icons">timer</i>
          Pomodoro
        </NavLink>
        <NavLink
          to="/music"
          active={activeTab === "music" ? 1 : 0}
          onClick={() => setActiveTab("music")}
        >
          <i className="material-icons">music_note</i>
          Musik
        </NavLink>
        <NavLink
          to="/stats"
          active={activeTab === "stats" ? 1 : 0}
          onClick={() => setActiveTab("stats")}
        >
          <i className="material-icons">bar_chart</i>
          Statistik
        </NavLink>
      </Navigation>

      <FloatingButton
        onClick={() => {
          setEditingTask(null);
          setShowAddTaskModal(true);
        }}
      >
        <i className="material-icons">add</i>
      </FloatingButton>

      {showAddTaskModal && (
        <Modal onClick={() => setShowAddTaskModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <TaskForm
              initialTask={editingTask}
              onSubmit={handleTaskSubmit}
              onCancel={() => {
                setShowAddTaskModal(false);
                setEditingTask(null);
              }}
            />
          </ModalContent>
        </Modal>
      )}
    </AppContainer>
  );
}

// App Component
export default function App() {
  return (
    <Router>
      <TaskManager />
    </Router>
  );
}
