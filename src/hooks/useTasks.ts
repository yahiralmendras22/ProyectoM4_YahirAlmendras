import { useEffect, useState } from 'react';
import type { Task } from '../types/task';
import { subscribeToTasks } from '../services/tasksService';

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToTasks(userId, (updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { tasks, loading };
}