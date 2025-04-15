import React from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";

// Contoh penggunaan dengan TaskList
const AnimatedTaskList = ({ tasks, onEdit, onDelete, onStatusChange }) => {
  return (
    <TransitionGroup className="task-list-container">
      {tasks.map((task) => (
        <CSSTransition key={task.id} timeout={300} classNames="task-card-anim">
          <TaskItem
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
};
