import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Task, NewTask } from '../types/task';

const tasksCollection = collection(db, 'tasks');

export function subscribeToTasks(
  userId: string,
  callback: (tasks: Task[]) => void
) {
  const q = query(tasksCollection, where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        completed: data.completed,
        priority: data.priority,
        dueDate: data.dueDate ? data.dueDate.toDate() : null,
        createdAt: data.createdAt.toDate(),
      };
    });
    callback(tasks);
  });
}

export function createTask(newTask: NewTask) {
  return addDoc(tasksCollection, {
    ...newTask,
    dueDate: newTask.dueDate ? Timestamp.fromDate(newTask.dueDate) : null,
    createdAt: Timestamp.now(),
  });
}

export function toggleTaskCompleted(taskId: string, completed: boolean) {
  const taskRef = doc(db, 'tasks', taskId);
  return updateDoc(taskRef, { completed });
}

export function deleteTask(taskId: string) {
  const taskRef = doc(db, 'tasks', taskId);
  return deleteDoc(taskRef);
}