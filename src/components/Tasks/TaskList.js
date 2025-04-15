import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { CategoriesModel, TasksModel } from "../../services/db";

// Styled components - fixed with $ prefix for custom props
const TaskListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TaskCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  ${(props) =>
    props.$completed &&
    `
    opacity: 0.7;
  `}
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const TaskTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  word-break: break-word;

  ${(props) =>
    props.$completed &&
    `
    text-decoration: line-through;
    color: #777;
  `}
`;

const TaskPriority = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  text-transform: uppercase;

  ${(props) => {
    if (props.$priority === "high") {
      return `
        background-color: #ffebee;
        color: #e53935;
      `;
    } else if (props.$priority === "medium") {
      return `
        background-color: #fff8e1;
        color: #ffa000;
      `;
    } else {
      return `
        background-color: #e8f5e9;
        color: #43a047;
      `;
    }
  }}
`;

const TaskDescription = styled.p`
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
  word-break: break-word;

  ${(props) =>
    props.$completed &&
    `
    color: #999;
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
  gap: 1rem;
`;

const TaskDate = styled.div`
  color: ${(props) => (props.$isOverdue ? "#e53935" : "#666")};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const TaskCategory = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  background-color: ${(props) => props.$color || "#e0e0e0"};
  color: white;
  border-radius: 4px;
  font-weight: 500;
`;

const TaskActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 10px;
  color: #666;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 0.9rem;
  min-width: 120px;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 0.9rem;
  flex-grow: 1;
  min-width: 200px;

  &::placeholder {
    color: #aaa;
  }
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
    <TaskCard $completed={task.status === "completed"}>
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
                event
              </i>
              {formatDate(task.dueDate)}
            </TaskDate>
          )}

          {category && (
            <TaskCategory $color={category.color}>
              <i className="material-icons" style={{ fontSize: "1rem" }}>
                {category.icon || "folder"}
              </i>
              {category.name}
            </TaskCategory>
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
          >
            <i className="material-icons">
              {task.status === "completed" ? "refresh" : "check_circle"}
            </i>
          </ActionButton>
          <ActionButton onClick={() => onEdit(task)} title="Edit tugas">
            <i className="material-icons">edit</i>
          </ActionButton>
          <ActionButton onClick={() => onDelete(task.id)} title="Hapus tugas">
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
    CategoriesModel.getAllCategories().then((data) => {
      setCategories(data);
    });
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
        await StatisticsModel.incrementCompletedTasks();
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

        <SearchInput
          type="text"
          name="search"
          value={filter.search}
          onChange={handleFilterChange}
          placeholder="Cari tugas..."
        />
      </FilterSection>

      <TaskListContainer>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              categories={categories}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <EmptyState>
            <i
              className="material-icons"
              style={{ fontSize: "3rem", opacity: 0.3, marginBottom: "1rem" }}
            >
              assignment
            </i>
            <h3>Tidak ada tugas</h3>
            <p>
              {filter.status !== "all" ||
              filter.priority !== "all" ||
              filter.category !== "all" ||
              filter.search
                ? "Coba ubah filter untuk melihat lebih banyak tugas"
                : "Klik tombol + untuk menambahkan tugas baru"}
            </p>
          </EmptyState>
        )}
      </TaskListContainer>
    </div>
  );
};

export default TaskList;
