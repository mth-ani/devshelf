
import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResourcesPage from './pages/ResourcesPage';
import SnippetsPage from './pages/SnippetsPage';
import TasksPage from './pages/TasksPage';

function NotFound() {
  return (
    <main className="empty-state not-found">
      <p className="eyebrow">404 ERROR</p>
      <h1>Page not found</h1>
      <p className="muted">The page you're looking for doesn't exist.</p>
      <a className="button button-primary" href="/resources">
        Back to DevShelf
      </a>
    </main>
  );
}

function AppLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/resources" replace />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/snippets" element={<SnippetsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/resources" replace />
            : <LoginPage />
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated
            ? <Navigate to="/resources" replace />
            : <RegisterPage />
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<AppLayout />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
