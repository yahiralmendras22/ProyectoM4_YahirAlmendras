import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task, NewTask } from '../types/task';
import { useAuth } from '../features/auth/AuthContext';

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newTask: NewTask = {
      userId: user?.uid ?? 'temp-user',
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
      <p>Bienvenido, {user?.email}</p>
      <button onClick={handleLogout}>Cerrar sesión</button>

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