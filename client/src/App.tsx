import type { ReactNode } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { Login } from "./pages/Login";
import { CharacterList } from "./pages/CharacterList";
import { InPlay } from "./pages/InPlay";
import { BuilderRoot } from "./pages/builder/BuilderRoot";
import { LivePlay } from "./pages/play/LivePlay";
import { GmDashboard } from "./pages/play/GmDashboard";
import { TopNav } from "./components/TopNav";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AuthedLayout() {
  return (
    <RequireAuth>
      <TopNav />
      <Outlet />
    </RequireAuth>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AuthedLayout />}>
        <Route path="/characters" element={<CharacterList />} />
        <Route path="/characters/:id" element={<BuilderRoot />} />
        <Route path="/characters/:id/live" element={<LivePlay />} />
        <Route path="/in-play" element={<InPlay />} />
        <Route path="/play" element={<GmDashboard />} />
      </Route>
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
