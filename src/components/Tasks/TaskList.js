import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import {
  CategoriesModel,
  TasksModel,
  StatisticsModel,
} from "../../services/db";
import {
  scheduleTaskNotification,
  cancelTaskNotification,
} from "../../services/notification";

// Styled components - desain yang lebih modern dan elegan
const TaskListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(37, 170, 96, 0.05);
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background-color: #f9fafb;
  font-size: 0.9rem;
  min-width: 160px;
  color: #333;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    border-color: #25aa60;
  }

  &:focus {
    border-color: #25aa60;
    box-shadow: 0 0 0 3px rgba(37, 170, 96, 0.1);
    outline: none;
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
  flex-grow: 1;
  min-width: 200px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background-color: #f9fafb;
  font-size: 0.9rem;
  color: #333;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &::placeholder {
    color: #9ca3af;
  }

  &:hover {
    border-color: #25aa60;
  }

  &:focus {
    border-color: #25aa60;
    box-shadow: 0 0 0 3px rgba(37, 170, 96, 0.1);
    outline: none;
  }
`;

const SearchIcon = styled.i`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.25rem;
`;

const TaskCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  padding: 1.25rem;
  transition: all 0.3s ease;
  border-left: 4px solid
    ${(props) => {
      if (props.$completed) return "#d1d5db";
      if (props.$priority === "high") return "#ef4444";
      if (props.$priority === "medium") return "#f59e0b";
      return "#10b981";
    }};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.07);
  }

  ${(props) =>
    props.$completed &&
    `
    opacity: 0.75;
    background-color: #f9fafb;
  `}
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const TaskTitle = styled.h3`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: #333;
  word-break: break-word;

  ${(props) =>
    props.$completed &&
    `
    text-decoration: line-through;
    color: #6b7280;
  `}
`;

const TaskPriority = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  ${(props) => {
    if (props.$priority === "high") {
      return `
        background-color: #fee2e2;
        color: #ef4444;
      `;
    } else if (props.$priority === "medium") {
      return `
        background-color: #fef3c7;
        color: #f59e0b;
      `;
    } else {
      return `
        background-color: #d1fae5;
        color: #10b981;
      `;
    }
  }}
`;

const TaskDescription = styled.p`
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #4b5563;
  word-break: break-word;

  ${(props) =>
    props.$completed &&
    `
    color: #9ca3af;
  `}
`;

const TaskFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.8rem;
`;

const TaskMetadata = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const TaskDate = styled.div`
  color: ${(props) => (props.$isOverdue ? "#ef4444" : "#6b7280")};
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: ${(props) => (props.$isOverdue ? "600" : "normal")};
`;

const TaskCategory = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  background-color: ${(props) => props.$color || "#e5e7eb"}20;
  color: ${(props) => props.$color || "#6b7280"};
  border-radius: 4px;
  font-weight: 500;
  border: 1px solid ${(props) => props.$color || "#e5e7eb"}40;
`;

const ReminderBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  background-color: rgba(37, 170, 96, 0.1);
  color: #25aa60;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.7rem;
`;

const TaskActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  padding: 0.35rem;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
    color: ${(props) => props.$color || "#25aa60"};
  }
`;

const EmptyState = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  background-color: #f9fafb;
  border-radius: 12px;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e5e7eb;
`;

const EmptyStateIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;

  i {
    font-size: 30px;
    color: #9ca3af;
  }
`;

const EmptyStateTitle = styled.h3`
  color: #4b5563;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
`;

const EmptyStateText = styled.p`
  margin: 0;
  color: #6b7280;
  max-width: 300px;
  line-height: 1.5;
`;

// Task Item Component
const TaskItem = ({ task, categories, onEdit, onDelete, onStatusChange }) => {
  const [category, setCategory] = useState(null);

  useEffect(() => {
    // Find the category for this task
    const taskCategory = categories.find((cat) => cat.id === task.categoryId);
    setCategory(taskCategory || null);
  }, [task.categoryId, categories]);

  // Handle status toggle
  const handleStatusToggle = () => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    onStatusChange(task.id, newStatus);
  };

  // Format date helper
  const formatDate = (date) => {
    if (!date) return null;
    return format(new Date(date), "dd MMM yyyy");
  };

  // Check if task is overdue
  const isOverdue = () => {
    if (!task.dueDate || task.status === "completed") return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <TaskCard
      $completed={task.status === "completed"}
      $priority={task.priority}
    >
      <TaskHeader>
        <TaskTitle $completed={task.status === "completed"}>
          {task.title}
        </TaskTitle>
        <TaskPriority $priority={task.priority}>{task.priority}</TaskPriority>
      </TaskHeader>

      {task.description && (
        <TaskDescription $completed={task.status === "completed"}>
          {task.description}
        </TaskDescription>
      )}

      <TaskFooter>
        <TaskMetadata>
          {task.dueDate && (
            <TaskDate $isOverdue={isOverdue()}>
              <i className="material-icons" style={{ fontSize: "1rem" }}>
                {isOverdue() ? "event_busy" : "event"}
              </i>
              {formatDate(task.dueDate)}
            </TaskDate>
          )}

          {category && (
            <TaskCategory $color={category.color}>
              <i className="material-icons" style={{ fontSize: "0.9rem" }}>
                {category.icon || "folder"}
              </i>
              {category.name}
            </TaskCategory>
          )}

          {task.reminder && (
            <ReminderBadge>
              <i className="material-icons" style={{ fontSize: "0.9rem" }}>
                notifications_active
              </i>
              Pengingat
            </ReminderBadge>
          )}
        </TaskMetadata>

        <TaskActions>
          <ActionButton
            onClick={handleStatusToggle}
            title={
              task.status === "completed"
                ? "Tandai belum selesai"
                : "Tandai selesai"
            }
            $color={task.status === "completed" ? "#6b7280" : "#10b981"}
          >
            <i className="material-icons">
              {task.status === "completed" ? "refresh" : "check_circle"}
            </i>
          </ActionButton>
          <ActionButton
            onClick={() => onEdit(task)}
            title="Edit tugas"
            $color="#3b82f6"
          >
            <i className="material-icons">edit</i>
          </ActionButton>
          <ActionButton
            onClick={() => onDelete(task.id)}
            title="Hapus tugas"
            $color="#ef4444"
          >
            <i className="material-icons">delete</i>
          </ActionButton>
        </TaskActions>
      </TaskFooter>
    </TaskCard>
  );
};

// Main TaskList Component
const TaskList = ({ tasks = [], onEdit, onDelete }) => {
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState({
    status: "all",
    priority: "all",
    category: "all",
    search: "",
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await CategoriesModel.getAllCategories();
        setCategories(data || []);
      } catch (error) {
        console.error("Error loading categories:", error);
        // Fallback default categories
        setCategories([
          { id: 1, name: "Kuliah", color: "#4A00E0", icon: "school" },
          { id: 2, name: "Pekerjaan", color: "#0077B6", icon: "work" },
          { id: 3, name: "Pribadi", color: "#00B4D8", icon: "person" },
          { id: 4, name: "Proyek", color: "#F72585", icon: "code" },
        ]);
      }
    };

    loadCategories();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...tasks];

    // Filter by status
    if (filter.status !== "all") {
      result = result.filter((task) => task.status === filter.status);
    }

    // Filter by priority
    if (filter.priority !== "all") {
      result = result.filter((task) => task.priority === filter.priority);
    }

    // Filter by category
    if (filter.category !== "all") {
      result = result.filter(
        (task) => task.categoryId === parseInt(filter.category)
      );
    }

    // Filter by search query
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          (task.description &&
            task.description.toLowerCase().includes(searchLower))
      );
    }

    // Sort tasks: pending first, then by priority, then by due date
    result.sort((a, b) => {
      // First by status (pending first)
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (a.status !== "completed" && b.status === "completed") return -1;

      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      // Then by due date (if both have due dates)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }

      // Tasks with due dates come before tasks without due dates
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      // Finally by title
      return a.title.localeCompare(b.title);
    });

    setFilteredTasks(result);
  }, [tasks, filter]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  // Handle task status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await TasksModel.updateTaskStatus(taskId, newStatus);

      // Update statistics if task is completed
      if (newStatus === "completed") {
        try {
          await StatisticsModel.incrementCompletedTasks();

          // Cancel notification for completed task
          cancelTaskNotification(taskId);
        } catch (error) {
          console.error("Error updating statistics:", error);
        }
      } else if (newStatus === "pending") {
        // If task is marked as pending again, reschedule notification
        const task = tasks.find((t) => t.id === taskId);
        if (task && task.dueDate && task.reminder) {
          scheduleTaskNotification(task, 60); // Notifikasi 60 menit sebelum deadline
        }
      }

      // Find and update the task in the tasks list
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      );

      // Update UI with new task data
      setFilteredTasks(
        filteredTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      // Cancel any scheduled notification for this task
      cancelTaskNotification(taskId);

      // Delete the task
      onDelete(taskId);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div>
      <FilterSection>
        <FilterSelect
          name="status"
          value={filter.status}
          onChange={handleFilterChange}
        >
          <option value="all">Semua Status</option>
          <option value="pending">Belum Selesai</option>
          <option value="completed">Selesai</option>
        </FilterSelect>

        <FilterSelect
          name="priority"
          value={filter.priority}
          onChange={handleFilterChange}
        >
          <option value="all">Semua Prioritas</option>
          <option value="high">Tinggi</option>
          <option value="medium">Sedang</option>
          <option value="low">Rendah</option>
        </FilterSelect>

        <FilterSelect
          name="category"
          value={filter.category}
          onChange={handleFilterChange}
        >
          <option value="all">Semua Kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </FilterSelect>

        <SearchInputContainer>
          <SearchIcon className="material-icons">search</SearchIcon>
          <SearchInput
            type="text"
            name="search"
            value={filter.search}
            onChange={handleFilterChange}
            placeholder="Cari tugas..."
          />
        </SearchInputContainer>
      </FilterSection>

      <TaskListContainer>
        <TransitionGroup component={null}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <CSSTransition
                key={task.id}
                timeout={300}
                classNames="task-card-anim"
              >
                <TaskItem
                  key={task.id}
                  task={task}
                  categories={categories}
                  onEdit={onEdit}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              </CSSTransition>
            ))
          ) : (
            <CSSTransition timeout={300} classNames="task-card-anim">
              <EmptyState>
                <EmptyStateIcon>
                  <i className="material-icons">assignment</i>
                </EmptyStateIcon>
                <EmptyStateTitle>Tidak ada tugas</EmptyStateTitle>
                <EmptyStateText>
                  {filter.status !== "all" ||
                  filter.priority !== "all" ||
                  filter.category !== "all" ||
                  filter.search
                    ? "Coba ubah filter untuk melihat lebih banyak tugas"
                    : "Klik tombol + untuk menambahkan tugas baru"}
                </EmptyStateText>
              </EmptyState>
            </CSSTransition>
          )}
        </TransitionGroup>
      </TaskListContainer>
    </div>
  );
};

export default TaskList;
