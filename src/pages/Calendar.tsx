import { useEffect, useState, useMemo } from 'react';
import type { Task } from '../types/task';
import { useAuth } from '../features/auth/AuthContext';
import { subscribeToTasks } from '../services/tasksService';

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Suscripción en tiempo real a las tareas del usuario
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToTasks(user.uid, (updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navegación de meses
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Mapear y agrupar tareas por clave de fecha (YYYY-MM-DD)
  // Requisito 6: Las tareas sin dueDate no se incluyen
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

  // Generación pura de la grilla mensual (Lunes a Domingo)
  const calendarDays = useMemo(() => {
    const days: CalendarDay[] = [];
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    // Primer día del mes
    const firstDayOfMonth = new Date(year, month, 1);
    // Ajustar para que Lunes sea 0 y Domingo sea 6
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

    // Días totales del mes actual y del mes anterior
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // 1. Celdas de relleno del mes anterior
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

    // 2. Días del mes en curso
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

    // 3. Celdas de relleno del mes siguiente para completar la semana (múltiplo de 7)
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
          <p className="calendar-subtitle">Vista mensual de tareas con fecha de vencimiento</p>
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
            {/* Cabecera con nombres de días (Lun - Dom) */}
            <div className="calendar-weekdays">
              {WEEKDAYS.map((day) => (
                <div key={day} className="calendar-weekday">
                  {day}
                </div>
              ))}
            </div>

            {/* Celdas de días del calendario */}
            <div className="calendar-days-container">
              {calendarDays.map((cell) => {
                const dayTasks = tasksByDate.get(cell.dateKey) || [];

                return (
                  <div
                    key={cell.dateKey}
                    className={`calendar-day ${
                      !cell.isCurrentMonth ? 'calendar-day-other-month' : ''
                    } ${cell.isToday ? 'calendar-day-today' : ''}`}
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

                    {/* Lista apilada de tareas dentro del día */}
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
    </div>
  );
}
