import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Library from './pages/Library';
import CategoryPage from './pages/CategoryPage';
import AuthPage from './pages/AuthPage';
import { useAuth } from './contexts/AuthContext';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }>
          <Route index element={<Library />} />
          <Route path="/movies" element={<CategoryPage type="movies" />} />
          <Route path="/tvshows" element={<CategoryPage type="tvshows" />} />
          <Route path="/albums" element={<CategoryPage type="albums" />} />
          <Route path="/books" element={<CategoryPage type="books" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
