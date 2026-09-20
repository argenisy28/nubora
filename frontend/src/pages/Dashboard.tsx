import { useEffect, useState } from "react";
import {
  getAssets,
  getHealth,
  getTickets,
  type Asset,
  type Ticket,
} from "../services/api";

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [health, setHealth] = useState("checking");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [healthData, ticketData, assetData] =
          await Promise.all([
            getHealth(),
            getTickets(),
            getAssets(),
          ]);

        setHealth(healthData.status);
        setTickets(ticketData.tickets ?? []);
        setAssets(assetData.assets ?? []);
      } catch (err) {
        console.error(err);
        setError("Unable to load Nubora dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "open",
  ).length;

  return (
    <>
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
    </>
  );
}