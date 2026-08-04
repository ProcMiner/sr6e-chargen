import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { Login } from "./pages/Login";
import { CharacterList } from "./pages/CharacterList";
import { BuilderRoot } from "./pages/builder/BuilderRoot";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/characters"
        element={
          <RequireAuth>
            <CharacterList />
          </RequireAuth>
        }
      />
      <Route
        path="/characters/:id"
        element={
          <RequireAuth>
            <BuilderRoot />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/characters" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
