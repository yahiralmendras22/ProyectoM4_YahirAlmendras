import { useState, useMemo } from 'react';
import type { Task } from '../types/task';
import { useAuth } from '../features/auth/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { createTask } from '../services/tasksService';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dateKey: string;
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const { user } = useAuth();
  const { tasks, loading } = useTasks(user?.uid);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  function handleDayClick(date: Date) {
    setSelectedDay(date);
    setNewTitle('');
    setNewDescription('');
  }

  function closeModal() {
    setSelectedDay(null);
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedDay || !newTitle.trim()) return;

    await createTask({
      userId: user.uid,
      title: newTitle,
      description: newDescription,
      completed: false,
      priority: 'medium',
      dueDate: selectedDay,
    });

    closeModal();
  }

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();

    tasks.forEach((task) => {
      if (!task.dueDate) return;

      const due = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      if (isNaN(due.getTime())) return;

      const dateKey = `${due.getFullYear()}-${due.getMonth()}-${due.getDate()}`;
      const existing = map.get(dateKey) || [];
      existing.push(task);
      map.set(dateKey, existing);
    });

    return map;
  }, [tasks]);

  const calendarDays = useMemo(() => {
    const days: CalendarDay[] = [];
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    for (let i = startDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
      const dateKey = `${prevDate.getFullYear()}-${prevDate.getMonth()}-${prevDate.getDate()}`;
      days.push({
        date: prevDate,
        dayNumber: prevDate.getDate(),
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        dateKey,
      });
    }

    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      days.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateKey === todayKey,
        dateKey,
      });
    }

    const remainingSlots = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateKey = `${nextDate.getFullYear()}-${nextDate.getMonth()}-${nextDate.getDate()}`;
      days.push({
        date: nextDate,
        dayNumber: nextDate.getDate(),
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        dateKey,
      });
    }

    return days;
  }, [year, month]);

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <div className="calendar-title-wrapper">
          <h1 className="calendar-title">
            📅 {MONTH_NAMES[month]} {year}
          </h1>
          <p className="calendar-subtitle">Vista mensual de tareas con fecha de vencimiento — hacé click en un día para agregar una tarea</p>
        </div>

        <div className="calendar-controls">
          <button
            type="button"
            className="calendar-btn-nav"
            onClick={handlePrevMonth}
            aria-label="Mes anterior"
            title="Mes anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="calendar-btn-today"
            onClick={handleToday}
            title="Ir al día actual"
          >
            Hoy
          </button>
          <button
            type="button"
            className="calendar-btn-nav"
            onClick={handleNextMonth}
            aria-label="Mes siguiente"
            title="Mes siguiente"
          >
            ›
          </button>
        </div>
      </header>

      {loading ? (
        <p className="loading-state">Cargando tareas del calendario...</p>
      ) : (
        <div className="calendar-wrapper">
          <div className="calendar-grid">
            <div className="calendar-weekdays">
              {WEEKDAYS.map((day) => (
                <div key={day} className="calendar-weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="calendar-days-container">
              {calendarDays.map((cell) => {
                const dayTasks = tasksByDate.get(cell.dateKey) || [];

                return (
                  <div
                    key={cell.dateKey}
                    className={`calendar-day clickable ${
                      !cell.isCurrentMonth ? 'calendar-day-other-month' : ''
                    } ${cell.isToday ? 'calendar-day-today' : ''}`}
                    onClick={() => handleDayClick(cell.date)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="calendar-day-header">
                      <span className="calendar-day-number">{cell.dayNumber}</span>
                      {dayTasks.length > 0 && (
                        <span
                          className="calendar-day-badge"
                          title={`${dayTasks.length} tarea${dayTasks.length > 1 ? 's' : ''}`}
                        >
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    <div className="calendar-day-tasks">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`calendar-task-item ${
                            task.completed ? 'completed' : ''
                          } priority-${task.priority || 'medium'}`}
                          title={`${task.title}${
                            task.description ? ` - ${task.description}` : ''
                          } (${task.completed ? 'Completada' : 'Pendiente'})`}
                        >
                          <span className="calendar-task-status-icon">
                            {task.completed ? '✓' : '•'}
                          </span>
                          <span className="calendar-task-title">{task.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedDay && (
        <div className="calendar-modal-overlay" onClick={closeModal}>
          <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              Nueva tarea — {selectedDay.toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
              })}
            </h3>
            <form onSubmit={handleCreateTask}>
              <div>
                <label htmlFor="modal-title">Título</label>
                <input
                  id="modal-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="modal-description">Descripción</label>
                <textarea
                  id="modal-description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div className="calendar-modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit">Agregar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}