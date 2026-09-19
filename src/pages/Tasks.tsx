import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../types/task';
import { useAuth } from '../features/auth/AuthContext';
import {
  subscribeToTasks,
  createTask,
  toggleTaskCompleted,
  deleteTask,
} from '../services/tasksService';

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToTasks(user.uid, (updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    await createTask({
      userId: user.uid,
      title,
      description,
      completed: false,
      priority: 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    setTitle('');
    setDescription('');
    setDueDate('');
  }

  async function handleToggle(task: Task) {
    await toggleTaskCompleted(task.id, !task.completed);
  }

  async function handleDelete(taskId: string) {
    await deleteTask(taskId);
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
        <div>
          <label htmlFor="dueDate">Fecha de vencimiento</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <button type="submit">Agregar tarea</button>
      </form>

      {loading ? (
        <p>Cargando tareas...</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task)}
              />
              <strong
                style={{
                  textDecoration: task.completed ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </strong>
              {task.description && ` - ${task.description}`}
              {task.dueDate && ` (vence: ${task.dueDate.toLocaleDateString()})`}
              <button onClick={() => handleDelete(task.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}