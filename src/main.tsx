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
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';
import Login from './pages/auth/Login.tsx';
import Dashboard from './pages/dashboard/Dashboard.tsx';
import Students from './pages/students/Students.tsx';
import Professors from './pages/professors/Professors.tsx';
import Classes from './pages/classes/Classes.tsx';
import Disciplines from './pages/disciplines/Disciplines.tsx';
import Grades from './pages/grades/Grades.tsx';
import Attendance from './pages/attendance/Attendance.tsx';
import Enrollments from './pages/enrollments/Enrollments.tsx';
import RiskAlerts from './pages/risk/RiskAlerts.tsx';
import Profile from './pages/profile/Profile.tsx';
import AccessDenied from './pages/access-denied/AccessDenied.tsx';
import MyClasses from './pages/student/MyClasses.tsx';
import MyGrades from './pages/student/MyGrades.tsx';
import MyAttendance from './pages/student/MyAttendance.tsx';
import MyRisk from './pages/student/MyRisk.tsx';
import RiskInterventions from './pages/alerts/RiskInterventions.tsx';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <App />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'perfil',
            element: <Profile />,
          },
          {
            path: 'acesso-negado',
            element: <AccessDenied />,
          },
          {
            element: <ProtectedRoute allowedRoles={['ADMIN']} />,
            children: [
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
                path: 'matriculas',
                element: <Enrollments />,
              },
              {
                path: 'alertas',
                element: <RiskInterventions />,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={['ADMIN', 'PROFESSOR']} />,
            children: [
              {
                path: 'notas',
                element: <Grades />,
              },
              {
                path: 'frequencia',
                element: <Attendance />,
              },
              {
                path: 'risco',
                element: <RiskAlerts />,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={['ADMIN', 'ALUNO']} />,
            children: [
              {
                path: 'minhas-turmas',
                element: <MyClasses />,
              },
              {
                path: 'minhas-notas',
                element: <MyGrades />,
              },
              {
                path: 'minha-frequencia',
                element: <MyAttendance />,
              },
              {
                path: 'meu-risco',
                element: <MyRisk />,
              },
            ],
          },
        ],
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
