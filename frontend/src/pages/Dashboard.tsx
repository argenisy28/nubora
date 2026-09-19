import { useEffect, useState } from "react";
import { getUserGroups, logout } from "../services/auth";
import {
  getAssets,
  getHealth,
  getTickets,
  type Asset,
  type Ticket,
} from "../services/api";

interface DashboardProps {
  email?: string;
  onLogout: () => Promise<void>;
}

export default function Dashboard({
  email,
  onLogout,
}: DashboardProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [health, setHealth] = useState("checking");
  const [role, setRole] = useState("User");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [healthData, ticketData, assetData, groups] =
          await Promise.all([
            getHealth(),
            getTickets(),
            getAssets(),
            getUserGroups(),
          ]);

        setHealth(healthData.status);
        setTickets(ticketData.tickets ?? []);
        setAssets(assetData.assets ?? []);
        setRole(groups[0] ?? "User");
      } catch (err) {
        console.error(err);
        setError("Unable to load Nubora dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  async function handleLogout() {
    await logout();
    await onLogout();
  }

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "open",
  ).length;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="dashboard-brand">
          <div className="brand-mark small">N</div>
          <span>Nubora</span>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">Overview</button>
          <button className="nav-item">Tickets</button>
          <button className="nav-item">Assets</button>
        </nav>

        <div className="sidebar-user">
          <strong>{role}</strong>
          <span>{email}</span>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-dashboard">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">CLOUD OPERATIONS</p>
            <h1>Overview</h1>
            <p>Monitor Nubora's operational environment.</p>
          </div>

          <div className="system-status">
            <span
              className={
                health === "healthy"
                  ? "status-dot"
                  : "status-dot offline"
              }
            />
            {health === "healthy"
              ? "All systems operational"
              : health}
          </div>
        </header>

        {error && <div className="dashboard-error">{error}</div>}

        {loading ? (
          <p className="dashboard-loading">
            Loading AWS resources...
          </p>
        ) : (
          <>
            <section className="metric-grid">
              <div className="metric-card">
                <span>Total tickets</span>
                <strong>{tickets.length}</strong>
                <small>Support requests</small>
              </div>

              <div className="metric-card">
                <span>Open tickets</span>
                <strong>{openTickets}</strong>
                <small>Require attention</small>
              </div>

              <div className="metric-card">
                <span>Managed assets</span>
                <strong>{assets.length}</strong>
                <small>Tracked devices</small>
              </div>

              <div className="metric-card">
                <span>API status</span>
                <strong className="health-value">
                  {health === "healthy" ? "Healthy" : health}
                </strong>
                <small>Amazon API Gateway</small>
              </div>
            </section>

            <section className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-heading">
                  <div>
                    <p className="eyebrow">SUPPORT</p>
                    <h2>Recent tickets</h2>
                  </div>

                  <span>{tickets.length} total</span>
                </div>

                <div className="data-list">
                  {tickets.slice(0, 5).map((ticket) => (
                    <div
                      className="data-row"
                      key={ticket.ticketId}
                    >
                      <div>
                        <strong>{ticket.title}</strong>
                        <span>{ticket.ticketId}</span>
                      </div>

                      <div className="row-meta">
                        <span className="badge">
                          {ticket.priority}
                        </span>
                        <span>{ticket.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-heading">
                  <div>
                    <p className="eyebrow">INVENTORY</p>
                    <h2>Assets</h2>
                  </div>

                  <span>{assets.length} total</span>
                </div>

                <div className="data-list">
                  {assets.slice(0, 5).map((asset) => (
                    <div
                      className="data-row"
                      key={asset.assetId}
                    >
                      <div>
                        <strong>{asset.name}</strong>
                        <span>
                          {asset.manufacturer} {asset.model}
                        </span>
                      </div>

                      <div className="row-meta">
                        <span className="badge">
                          {asset.type}
                        </span>
                        <span>{asset.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}