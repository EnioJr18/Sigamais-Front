import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import './index.css';
import App from './App';
import Login from './pages/auth/Login.tsx';
import Dashboard from './pages/dashboard/Dashboard.tsx';
import Students from './pages/students/Students.tsx';
import Professors from './pages/professors/Professors.tsx';
import Classes from './pages/classes/Classes.tsx';
import Disciplines from './pages/disciplines/Disciplines.tsx';
import Grades from './pages/grades/Grades.tsx';
import Attendance from './pages/attendance/Attendance.tsx';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'alunos',
        element: <Students />,
      },
      {
        path: 'professores',
        element: <Professors />,
      },
      {
        path: 'turmas',
        element: <Classes />,
      },
      {
        path: 'disciplinas',
        element: <Disciplines />,
      },
      {
        path: 'notas',
        element: <Grades />,
      },
      {
        path: 'frequencia',
        element: <Attendance />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
