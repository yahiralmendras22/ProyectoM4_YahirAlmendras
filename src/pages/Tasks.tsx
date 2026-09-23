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
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
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

  async function handleSendSummary() {
    if (!user?.email) return;

    setSendingEmail(true);
    setEmailStatus('idle');

    const pending = tasks.filter((t) => !t.completed);
    const completed = tasks.filter((t) => t.completed);

    const summaryLines = [
      `Resumen de tus tareas (${tasks.length} en total):`,
      '',
      `Pendientes (${pending.length}):`,
      ...pending.map((t) => `- ${t.title}`),
      '',
      `Completadas (${completed.length}):`,
      ...completed.map((t) => `- ${t.title}`),
    ];

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          summary: summaryLines.join('\n'),
        }),
      });

      if (!response.ok) throw new Error('Error en el envío');
      setEmailStatus('success');
    } catch {
      setEmailStatus('error');
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div className="tasks-container">
      <h1>Mis tareas</h1>
      <p>Bienvenido, {user?.email}</p>
      <button className="btn-logout" onClick={handleLogout}>
        Cerrar sesión
      </button>

      <button className="btn-email" onClick={handleSendSummary} disabled={sendingEmail}>
        {sendingEmail ? 'Enviando...' : 'Enviar resumen por email'}
      </button>
      {emailStatus === 'success' && (
        <p className="success-message">¡Resumen enviado! Revisá tu email.</p>
      )}
      {emailStatus === 'error' && <p className="error-message">No se pudo enviar el resumen</p>}

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
        <p className="loading-state">Cargando tareas...</p>
      ) : tasks.length === 0 ? (
        <p className="empty-state">Todavía no tenés tareas creadas.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task)}
              />
              <div className="task-content">
                <span className="task-title">{task.title}</span>
                {task.description && (
                  <span className="task-description">{task.description}</span>
                )}
                {task.dueDate && (
                  <span className="task-description">
                    Vence: {task.dueDate.toLocaleDateString()}
                  </span>
                )}
              </div>
              <button onClick={() => handleDelete(task.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}