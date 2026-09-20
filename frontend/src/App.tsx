import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { getUser, getUserGroups } from "./services/auth";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import Assets from "./pages/Assets";
import AppLayout from "./components/AppLayout";

type NuboraUser = {
  username: string;
  userId: string;
  signInDetails?: {
    loginId?: string;
  };
};

function App() {
  const [user, setUser] = useState<NuboraUser | null>(null);
  const [role, setRole] = useState("User");
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentUser = await getUser();

    if (currentUser) {
      const groups = await getUserGroups();

      setUser(currentUser as NuboraUser);
      setRole(groups[0] ?? "User");
    } else {
      setUser(null);
      setRole("User");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">N</div>
        <p>Loading Nubora...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={refreshUser} />;
  }

  return (
    <AppLayout
      email={user.signInDetails?.loginId}
      role={role}
      onLogout={refreshUser}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets role={role} />} />
        <Route path="/assets" element={<Assets role={role} />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;