import { useCallback, useEffect, useState } from "react";
import { getUser } from "./services/auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

type NuboraUser = {
  username: string;
  userId: string;
  signInDetails?: {
    loginId?: string;
  };
};

function App() {
  const [user, setUser] = useState<NuboraUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentUser = await getUser();

    setUser(currentUser as NuboraUser | null);
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
    <Dashboard
      email={user.signInDetails?.loginId}
      onLogout={refreshUser}
    />
  );
}

export default App;