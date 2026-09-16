import { useState } from 'react';
import type { Task, NewTask } from '../types/task';

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newTask: NewTask = {
      userId: 'temp-user',
      title,
      description,
      completed: false,
      priority: 'medium',
      dueDate: null,
    };

    const taskWithId: Task = {
      ...newTask,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    setTasks([...tasks, taskWithId]);
    setTitle('');
    setDescription('');
  }

  return (
    <div>
      <h1>Mis tareas</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Título</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit">Agregar tarea</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <strong>{task.title}</strong>
            {task.description && ` - ${task.description}`}
          </li>
        ))}
      </ul>
    </div>
  );
}