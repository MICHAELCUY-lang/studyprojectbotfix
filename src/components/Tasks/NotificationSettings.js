import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import styled, { keyframes, css } from "styled-components";
import { CategoriesModel } from "../../services/db";
import NotificationSettings from "./NotificationSettings";
import {
  scheduleTaskNotification,
  scheduleDailyReminder,
  scheduleIntervalReminder,
  cancelTaskNotification,
  getNotificationSettings,
  requestNotificationPermission,
} from "../../services/notification";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Background gradient animation
const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled components - Enhanced premium design
const FormContainer = styled.div`
  background-color: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 650px;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease-out;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #25aa60, #34d378, #25aa60);
    background-size: 200% 200%;
    animation: ${gradientMove} 3s ease infinite;
  }
`;

const FormTitle = styled.h2`
  color: #222;
  margin-top: 0;
  margin-bottom: 1.75rem;
  font-weight: 800;
  font-size: 1.8rem;
  position: relative;
  display: inline-block;

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 4px;
    background-color: #25aa60;
    border-radius: 2px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);

    & > :first-child {
      grid-column: 1 / -1;
    }

    & > :nth-child(2) {
      grid-column: 1 / -1;
    }
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.6rem;
  font-weight: 600;
  color: #444;
  font-size: 0.95rem;
  display: flex;
  align-items: center;

  i {
    margin-right: 6px;
    color: #25aa60;
    font-size: 1.1rem;
  }
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  padding-left: ${(props) => (props.$hasIcon ? "2.8rem" : "1rem")};
  border: 2px solid ${(props) => (props.$error ? "#e74c3c" : "#eaeaea")};
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  background-color: ${(props) =>
    props.$error ? "rgba(231, 76, 60, 0.05)" : "#f9fafb"};

  &:focus {
    border-color: #25aa60;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(37, 170, 96, 0.15);
  }

  &::placeholder {
    color: #aab;
    font-size: 0.95rem;
  }
`;

const InputIcon = styled.i`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 1.2rem;
  pointer-events: none;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  padding-left: ${(props) => (props.$hasIcon ? "2.8rem" : "1rem")};
  border: 2px solid ${(props) => (props.$error ? "#e74c3c" : "#eaeaea")};
  border-radius: 12px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;
  background-color: ${(props) =>
    props.$error ? "rgba(231, 76, 60, 0.05)" : "#f9fafb"};
  font-family: inherit;

  &:focus {
    border-color: #25aa60;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(37, 170, 96, 0.15);
  }

  &::placeholder {
    color: #aab;
    font-size: 0.95rem;
  }
`;

const TextAreaIcon = styled.i`
  position: absolute;
  left: 1rem;
  top: 1rem;
  color: #999;
  font-size: 1.2rem;
  pointer-events: none;
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem;
  padding-left: ${(props) => (props.$hasIcon ? "2.8rem" : "1rem")};
  border: 2px solid ${(props) => (props.$error ? "#e74c3c" : "#eaeaea")};
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-color: ${(props) =>
    props.$error ? "rgba(231, 76, 60, 0.05)" : "#f9fafb"};
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  transition: all 0.3s ease;

  &:focus {
    border-color: #25aa60;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(37, 170, 96, 0.15);
  }
`;

const SelectIcon = styled.i`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 1.2rem;
  pointer-events: none;
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
  display: flex;
  align-items: center;

  i {
    margin-right: 6px;
    font-size: 0.9rem;
  }
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #eee;
  margin: 1.5rem 0;
  position: relative;

  &::after {
    content: "Pengaturan Tambahan";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 0 1rem;
    color: #999;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 0.9rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  i {
    font-size: 1.1rem;
  }

  @media (max-width: 500px) {
    width: 100%;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #25aa60 0%, #1d8549 100%);
  color: white;
  min-width: 140px;
  box-shadow: 0 4px 15px rgba(37, 170, 96, 0.3);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2cbe6c 0%, #219150 100%);
    box-shadow: 0 6px 20px rgba(37, 170, 96, 0.4);
  }

  &:disabled {
    background: linear-gradient(135deg, #88c8a4 0%, #88c8a4 100%);
  }
`;

const SecondaryButton = styled(Button)`
  background-color: #f5f5f5;
  color: #555;

  &:hover {
    background-color: #eee;
  }
`;

const PriorityOptions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  justify-content: space-between;

  @media (max-width: 400px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const PriorityButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  border: 2px solid
    ${(props) =>
      props.$selected
        ? props.$value === "high"
          ? "#e74c3c"
          : props.$value === "medium"
          ? "#f39c12"
          : "#27ae60"
        : "#eaeaea"};
  border-radius: 12px;
  background-color: ${(props) =>
    props.$selected
      ? props.$value === "high"
        ? "rgba(231, 76, 60, 0.1)"
        : props.$value === "medium"
        ? "rgba(243, 156, 18, 0.1)"
        : "rgba(39, 174, 96, 0.1)"
      : "#f9fafb"};
  color: ${(props) =>
    props.$value === "high"
      ? "#e74c3c"
      : props.$value === "medium"
      ? "#f39c12"
      : "#27ae60"};
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  text-align: center;

  i {
    font-size: 1.1rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: translateY(0);
  }

  ${(props) =>
    props.$selected &&
    css`
      animation: ${pulse} 0.3s ease-in-out;
      box-shadow: 0 4px 10px
        ${props.$value === "high"
          ? "rgba(231, 76, 60, 0.2)"
          : props.$value === "medium"
          ? "rgba(243, 156, 18, 0.2)"
          : "rgba(39, 174, 96, 0.2)"};
    `}
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Tag = styled.div`
  padding: 0.5rem 0.8rem;
  background-color: ${(props) => props.$color || "rgba(37, 170, 96, 0.1)"};
  color: ${(props) => props.$textColor || "#25aa60"};
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  i {
    font-size: 1rem;
  }
`;

const ReminderOption = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
  background-color: #f9fafb;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 2px solid #eaeaea;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #25aa60;
    background-color: rgba(37, 170, 96, 0.05);
  }

  ${(props) =>
    props.$active &&
    `
    border-color: #25aa60;
    background-color: rgba(37, 170, 96, 0.05);
  `}
`;

const ReminderCheck = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid ${(props) => (props.$active ? "#25aa60" : "#ccc")};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => (props.$active ? "#25aa60" : "transparent")};
  color: white;
  transition: all 0.2s ease;

  i {
    font-size: 0.8rem;
    opacity: ${(props) => (props.$active ? 1 : 0)};
  }
`;

const ReminderText = styled.div`
  flex: 1;

  p {
    margin: 0;
    font-weight: 500;
    color: #444;
  }

  span {
    font-size: 0.8rem;
    color: #888;
  }
`;

const ReminderIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: rgba(37, 170, 96, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #25aa60;

  i {
    font-size: 1.2rem;
  }
`;

const NotificationBanner = styled.div`
  background-color: ${(props) =>
    props.$permission === "granted"
      ? "rgba(39, 174, 96, 0.1)"
      : "rgba(243, 156, 18, 0.1)"};
  border-left: 4px solid
    ${(props) => (props.$permission === "granted" ? "#27ae60" : "#f39c12")};
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;

  i {
    font-size: 1.5rem;
    color: ${(props) =>
      props.$permission === "granted" ? "#27ae60" : "#f39c12"};
  }

  div {
    flex: 1;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }

  button {
    background-color: ${(props) =>
      props.$permission === "granted" ? "#27ae60" : "#f39c12"};
    color: white;
    border: none;
    padding: 0.5rem 0.8rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
  }
`;

// Main Component
const TaskForm = ({ initialTask, onSubmit, onCancel }) => {
  // Ensure initialTask is an object, even if null or undefined
  const task = initialTask || {};

  const [categories, setCategories] = useState([]);
  const [priority, setPriority] = useState(task.priority || "medium");
  const [reminder, setReminder] = useState(task.reminder || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    Notification.permission
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 10)
        : "",
      priority: task.priority || "medium",
      categoryId: task.categoryId || "1",
    },
  });

  // Watch for field values
  const watchTitle = watch("title");
  const watchDate = watch("dueDate");
  const watchCategory = watch("categoryId");

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await CategoriesModel.getAllCategories();
        setCategories(
          data || [
            { id: 1, name: "Kuliah", color: "#4A00E0", icon: "school" },
            { id: 2, name: "Pekerjaan", color: "#0077B6", icon: "work" },
            { id: 3, name: "Pribadi", color: "#00B4D8", icon: "person" },
            { id: 4, name: "Proyek", color: "#F72585", icon: "code" },
          ]
        );
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

    // Check notification permission
    setNotificationPermission(Notification.permission);
  }, []);

  // Handle priority change
  const handlePriorityChange = (value) => {
    setPriority(value);
    setValue("priority", value);
  };

  // Handle reminder toggle
  const toggleReminder = () => {
    if (notificationPermission !== "granted" && !reminder) {
      requestNotificationPermission().then((result) => {
        setNotificationPermission(result.permission);
      });
    }
    setReminder(!reminder);
  };

  // Fungsi untuk menangani perubahan pengaturan notifikasi
  const handleApplyNotificationSettings = async (settings, taskId) => {
    if (!reminder || !watchDate) return;

    // Buat task object untuk notifikasi
    const taskObject = {
      id: taskId || task.id,
      title: watchTitle,
      dueDate: watchDate ? new Date(watchDate) : null,
      reminder: reminder,
    };

    // Membatalkan semua notifikasi yang ada
    if (taskId || task.id) {
      cancelTaskNotification(taskId || task.id);
    }

    // Jadwalkan notifikasi berdasarkan pengaturan
    if (settings.deadlineEnabled && taskObject.dueDate) {
      await scheduleTaskNotification(taskObject, 60); // 60 menit sebelum deadline
    }

    if (settings.dailyEnabled) {
      await scheduleDailyReminder(
        taskObject,
        settings.dailyHour,
        settings.dailyMinute
      );
    }

    if (settings.intervalEnabled) {
      await scheduleIntervalReminder(taskObject, settings.intervalHours);
    }
  };

  // Get current category color & icon
  const getCurrentCategory = () => {
    const categoryId = parseInt(watchCategory);
    return (
      categories.find((cat) => cat.id === categoryId) || {
        color: "#ccc",
        icon: "folder",
      }
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Belum diatur";

    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("id-ID", options);
  };

  // Handle submit
  const submitHandler = async (data) => {
    try {
      setIsSubmitting(true);

      // Convert categoryId to number
      data.categoryId = data.categoryId ? parseInt(data.categoryId) : null;

      // Convert dueDate to Date object
      if (data.dueDate) {
        data.dueDate = new Date(data.dueDate);
      }

      // Add reminder setting
      data.reminder = reminder;

      // If task has an ID and reminder has changed, handle notification changes
      if (task.id) {
        if (task.reminder && !reminder) {
          // Cancel notification if reminder was turned off
          cancelTaskNotification(task.id);
        }
      }

      const result = await onSubmit(data);

      // Jadwalkan notifikasi jika reminder diaktifkan dan form disubmit
      if (reminder) {
        const settings = getNotificationSettings();
        const taskId = task.id || result;
        if (taskId) {
          await handleApplyNotificationSettings(settings, taskId);
        }
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting task:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <FormTitle>{task.id ? "Edit Tugas" : "Tambah Tugas Baru"}</FormTitle>

      {reminder && notificationPermission !== "granted" && (
        <NotificationBanner $permission={notificationPermission}>
          <i className="material-icons">notification_important</i>
          <div>
            <p>
              {notificationPermission === "denied"
                ? "Notifikasi diblokir oleh browser. Harap aktifkan notifikasi di pengaturan browser untuk menerima pengingat tugas."
                : "Izin notifikasi diperlukan untuk mengaktifkan pengingat tugas."}
            </p>
          </div>
          {notificationPermission !== "denied" && (
            <button
              onClick={() =>
                requestNotificationPermission().then((result) => {
                  setNotificationPermission(result.permission);
                })
              }
            >
              Izinkan
            </button>
          )}
        </NotificationBanner>
      )}

      <form onSubmit={handleSubmit(submitHandler)}>
        <FormGrid>
          <FormGroup>
            <Label htmlFor="title">
              <i className="material-icons">assignment</i>
              Judul
            </Label>
            <InputWrapper>
              <InputIcon className="material-icons">edit</InputIcon>
              <Input
                id="title"
                type="text"
                placeholder="Masukkan judul tugas"
                $hasIcon
                $error={errors.title}
                {...register("title", {
                  required: "Judul tugas wajib diisi",
                  maxLength: {
                    value: 100,
                    message: "Judul tidak boleh lebih dari 100 karakter",
                  },
                })}
              />
            </InputWrapper>
            {errors.title && (
              <ErrorMessage>
                <i className="material-icons">error_outline</i>
                {errors.title.message}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">
              <i className="material-icons">notes</i>
              Deskripsi
            </Label>
            <InputWrapper>
              <TextAreaIcon className="material-icons">subject</TextAreaIcon>
              <TextArea
                id="description"
                placeholder="Deskripsi tugas (opsional)"
                $hasIcon
                {...register("description")}
              />
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="dueDate">
              <i className="material-icons">event</i>
              Tanggal Deadline
            </Label>
            <InputWrapper>
              <InputIcon className="material-icons">calendar_today</InputIcon>
              <Input
                id="dueDate"
                type="date"
                $hasIcon
                {...register("dueDate")}
              />
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="categoryId">
              <i className="material-icons">folder</i>
              Kategori
            </Label>
            <InputWrapper>
              <SelectIcon className="material-icons">
                {getCurrentCategory().icon || "folder"}
              </SelectIcon>
              <Select id="categoryId" $hasIcon {...register("categoryId")}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </InputWrapper>
          </FormGroup>
        </FormGrid>

        <Divider />

        <FormGroup>
          <Label htmlFor="priority">
            <i className="material-icons">flag</i>
            Prioritas
          </Label>
          <PriorityOptions>
            <PriorityButton
              type="button"
              $value="low"
              $selected={priority === "low"}
              onClick={() => handlePriorityChange("low")}
            >
              <i className="material-icons">arrow_downward</i>
              Rendah
            </PriorityButton>
            <PriorityButton
              type="button"
              $value="medium"
              $selected={priority === "medium"}
              onClick={() => handlePriorityChange("medium")}
            >
              <i className="material-icons">drag_handle</i>
              Sedang
            </PriorityButton>
            <PriorityButton
              type="button"
              $value="high"
              $selected={priority === "high"}
              onClick={() => handlePriorityChange("high")}
            >
              <i className="material-icons">arrow_upward</i>
              Tinggi
            </PriorityButton>
          </PriorityOptions>
        </FormGroup>

        <FormGroup style={{ marginTop: "1rem" }}>
          <Label>
            <i className="material-icons">notifications</i>
            Pengingat
          </Label>
          <ReminderOption $active={reminder} onClick={toggleReminder}>
            <ReminderCheck $active={reminder}>
              <i className="material-icons">check</i>
            </ReminderCheck>
            <ReminderText>
              <p>Ingatkan saya sebelum deadline</p>
              <span>Anda akan menerima notifikasi untuk tugas ini</span>
            </ReminderText>
            <ReminderIcon>
              <i className="material-icons">alarm</i>
            </ReminderIcon>
          </ReminderOption>
        </FormGroup>

        {/* Add notification settings component if reminder is enabled */}
        {reminder && (
          <FormGroup style={{ marginTop: "1rem" }}>
            <NotificationSettings
              taskId={task.id}
              onApplySettings={handleApplyNotificationSettings}
            />
          </FormGroup>
        )}

        {watchTitle && watchDate && (
          <FormGroup style={{ marginTop: "1rem" }}>
            <Label>
              <i className="material-icons">preview</i>
              Preview
            </Label>
            <TagsContainer>
              <Tag $color="rgba(37, 170, 96, 0.1)" $textColor="#25aa60">
                <i className="material-icons">assignment</i>
                {watchTitle.length > 20
                  ? watchTitle.substring(0, 20) + "..."
                  : watchTitle}
              </Tag>

              <Tag $color="rgba(83, 82, 237, 0.1)" $textColor="#5352ed">
                <i className="material-icons">calendar_today</i>
                {formatDate(watchDate)}
              </Tag>

              {getCurrentCategory() && (
                <Tag
                  $color={`${getCurrentCategory().color}20`}
                  $textColor={getCurrentCategory().color}
                >
                  <i className="material-icons">{getCurrentCategory().icon}</i>
                  {getCurrentCategory().name}
                </Tag>
              )}

              <Tag
                $color={
                  priority === "high"
                    ? "rgba(231, 76, 60, 0.1)"
                    : priority === "medium"
                    ? "rgba(243, 156, 18, 0.1)"
                    : "rgba(39, 174, 96, 0.1)"
                }
                $textColor={
                  priority === "high"
                    ? "#e74c3c"
                    : priority === "medium"
                    ? "#f39c12"
                    : "#27ae60"
                }
              >
                <i className="material-icons">
                  {priority === "high"
                    ? "priority_high"
                    : priority === "medium"
                    ? "remove"
                    : "arrow_downward"}
                </i>
                {priority === "high"
                  ? "Prioritas Tinggi"
                  : priority === "medium"
                  ? "Prioritas Sedang"
                  : "Prioritas Rendah"}
              </Tag>

              {reminder && (
                <Tag $color="rgba(83, 82, 237, 0.1)" $textColor="#5352ed">
                  <i className="material-icons">notifications_active</i>
                  Pengingat Aktif
                </Tag>
              )}
            </TagsContainer>
          </FormGroup>
        )}

        <ButtonGroup>
          <SecondaryButton type="button" onClick={onCancel}>
            <i className="material-icons">close</i>
            Batal
          </SecondaryButton>

          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <i
                  className="material-icons"
                  style={{ animation: "spin 1s linear infinite" }}
                >
                  sync
                </i>
                Menyimpan...
              </>
            ) : task.id ? (
              <>
                <i className="material-icons">save</i>
                Perbarui
              </>
            ) : (
              <>
                <i className="material-icons">add_task</i>
                Simpan
              </>
            )}
          </PrimaryButton>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

export default TaskForm;
