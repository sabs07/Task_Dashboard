import React from 'react';
import { Task } from '../types/models';
import styles from './TaskItem.module.css';
import Button from './Button';

interface TaskItemProps {
  task: Task;
  onComplete?: (id: string) => void;
  onOverdue?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

const priorityColors = {
  high: styles.high,
  medium: styles.medium,
  low: styles.low,
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onOverdue, onEdit, onDelete }) => {
  const isCompleted = task.status === 'completed';
  const isOverdue = task.status === 'pending' && task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10);

  return (
    <div className={styles.taskItem}>
      <span className={styles.title}>{task.title}</span>
      <span className={`${styles.priority} ${priorityColors[task.priority]}`}>{task.priority}</span>
      <span className={styles.status}>
        {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : ''}
      </span>
      {!isCompleted && (
        <>
          {onComplete && (
            <Button variant="primary" size="small" onClick={() => onComplete(task.id)} style={{marginRight: 4}}>
              Complete
            </Button>
          )}
          {onEdit && (
            <Button variant="secondary" size="small" onClick={() => onEdit(task)} style={{marginRight: 4}}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="danger" size="small" onClick={() => onDelete(task.id)}>
              Delete
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default TaskItem; 