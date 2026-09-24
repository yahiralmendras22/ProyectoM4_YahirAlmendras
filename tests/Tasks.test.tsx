import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Tasks } from '../src/pages/Tasks';

const mockCreateTask = vi.fn();
const mockSubscribeToTasks = vi.fn();
const mockUser = { uid: 'user-123', email: 'test@test.com' };

vi.mock('../src/features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: vi.fn(),
  }),
}));

vi.mock('../src/services/tasksService', () => ({
  subscribeToTasks: (userId: string, callback: (tasks: unknown[]) => void) =>
    mockSubscribeToTasks(userId, callback),
  createTask: (task: unknown) => mockCreateTask(task),
  toggleTaskCompleted: vi.fn(),
  deleteTask: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

function renderTasks() {
  return render(
    <MemoryRouter>
      <Tasks />
    </MemoryRouter>
  );
}

describe('Tasks', () => {
  beforeEach(() => {
    mockCreateTask.mockReset();
    mockSubscribeToTasks.mockReset();
    mockSubscribeToTasks.mockImplementation((_userId, callback) => {
      callback([]);
      return vi.fn();
    });
  });

  it('muestra el estado vacío cuando no hay tareas', async () => {
    renderTasks();
    await waitFor(() => {
      expect(screen.getByText(/todavía no tenés tareas creadas/i)).toBeInTheDocument();
    });
  });

  it('no permite crear una tarea con título vacío', async () => {
    renderTasks();
    await waitFor(() => screen.getByLabelText(/título/i));

    fireEvent.click(screen.getByRole('button', { name: 'Agregar tarea' }));

    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  it('crea una tarea cuando se completa el formulario', async () => {
    renderTasks();
    await waitFor(() => screen.getByLabelText(/título/i));

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Comprar pan' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar tarea' }));

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Comprar pan',
          userId: 'user-123',
          completed: false,
        })
      );
    });
  });
});