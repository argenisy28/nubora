import { logout } from "../services/auth";

interface DashboardProps {
  email?: string;
  onLogout: () => Promise<void>;
}

export default function Dashboard({
  email,
  onLogout,
}: DashboardProps) {
  async function handleLogout() {
    await logout();
    await onLogout();
  }

  return (
    <div className="dashboard-placeholder">
      <nav className="dashboard-nav">
        <div className="dashboard-brand">
          <div className="brand-mark small">N</div>
          <span>Nubora</span>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </nav>

      <main className="dashboard-content">
        <p className="eyebrow">NUBORA CLOUD OPERATIONS</p>

        <h1>Welcome to Nubora.</h1>

        <p>
          You are authenticated
          {email ? ` as ${email}` : ""}.
        </p>

        <div className="auth-success-card">
          <span className="success-icon">✓</span>

          <div>
            <strong>Authentication successful</strong>
            <p>
              Your browser session is connected to the Nubora
              Amazon Cognito user pool.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}