export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
}

export type NewTask = Omit<Task, 'id' | 'createdAt'>;