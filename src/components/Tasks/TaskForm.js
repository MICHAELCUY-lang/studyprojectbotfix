import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { CategoriesModel } from "../../services/db";

// Styled components
const FormContainer = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  color: #333;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #4a00e0;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #4a00e0;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1em;

  &:focus {
    border-color: #4a00e0;
  }
`;

const ErrorMessage = styled.p`
  color: #e53935;
  font-size: 0.875rem;
  margin-top: 0.375rem;
  margin-bottom: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #4a00e0;
  color: white;

  &:hover {
    background-color: #3700b3;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: #4a00e0;
  border: 1px solid #4a00e0;

  &:hover {
    background-color: rgba(74, 0, 224, 0.05);
  }
`;

// Main Component
const TaskForm = ({ initialTask, onSubmit, onCancel }) => {
  // Ensure initialTask is an object, even if null or undefined
  const task = initialTask || {};

  const [categories, setCategories] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 10)
        : "",
      priority: task.priority || "medium",
      categoryId: task.categoryId || "",
    },
  });

  // Ambil kategori dari database
  useEffect(() => {
    CategoriesModel.getAllCategories().then((data) => {
      setCategories(data);

      // Jika tidak ada kategori yang dipilih, pilih yang pertama
      if (!task.categoryId && data.length > 0) {
        reset((values) => ({ ...values, categoryId: String(data[0].id) }));
      }
    });
  }, [task.categoryId, reset]);

  // Handle submit
  const submitHandler = async (data) => {
    try {
      // Convert categoryId to number
      data.categoryId = data.categoryId ? parseInt(data.categoryId) : null;

      // Convert dueDate to Date object
      if (data.dueDate) {
        data.dueDate = new Date(data.dueDate);
      }

      await onSubmit(data);
      reset();
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  };

  return (
    <FormContainer>
      <FormTitle>{task.id ? "Edit Tugas" : "Tambah Tugas Baru"}</FormTitle>

      <form onSubmit={handleSubmit(submitHandler)}>
        <FormGroup>
          <Label htmlFor="title">Judul</Label>
          <Input
            id="title"
            type="text"
            placeholder="Masukkan judul tugas"
            {...register("title", {
              required: "Judul tugas wajib diisi",
              maxLength: {
                value: 100,
                message: "Judul tidak boleh lebih dari 100 karakter",
              },
            })}
          />
          {errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">Deskripsi</Label>
          <TextArea
            id="description"
            placeholder="Deskripsi tugas (opsional)"
            {...register("description")}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="dueDate">Tanggal Deadline</Label>
          <Input id="dueDate" type="date" {...register("dueDate")} />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="priority">Prioritas</Label>
          <Select id="priority" {...register("priority", { required: true })}>
            <option value="low">Rendah</option>
            <option value="medium">Sedang</option>
            <option value="high">Tinggi</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="categoryId">Kategori</Label>
          <Select id="categoryId" {...register("categoryId")}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <ButtonGroup>
          <SecondaryButton type="button" onClick={onCancel}>
            Batal
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : task.id ? "Perbarui" : "Simpan"}
          </PrimaryButton>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

export default TaskForm;
