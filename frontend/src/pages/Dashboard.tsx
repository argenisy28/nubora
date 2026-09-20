import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
        setError("");

        const [
          healthData,
          ticketData,
          assetData,
        ] = await Promise.all([
          getHealth(),
          getTickets(),
          getAssets(),
        ]);

        setHealth(healthData.status);
        setTickets(ticketData.tickets ?? []);
        setAssets(assetData.assets ?? []);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load Nubora dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  // --------------------------------------------------
  // Ticket statistics
  // --------------------------------------------------

  const ticketStats = useMemo(() => {
    return {
      open: tickets.filter(
        (ticket) => ticket.status === "open",
      ).length,

      inProgress: tickets.filter(
        (ticket) =>
          ticket.status === "in-progress",
      ).length,

      resolved: tickets.filter(
        (ticket) =>
          ticket.status === "resolved",
      ).length,

      high: tickets.filter(
        (ticket) => ticket.priority === "high",
      ).length,

      medium: tickets.filter(
        (ticket) => ticket.priority === "medium",
      ).length,

      low: tickets.filter(
        (ticket) => ticket.priority === "low",
      ).length,
    };
  }, [tickets]);

  // --------------------------------------------------
  // Asset statistics
  // --------------------------------------------------

  const assetStats = useMemo(() => {
    return {
      available: assets.filter(
        (asset) => asset.status === "available",
      ).length,

      inUse: assets.filter(
        (asset) => asset.status === "in-use",
      ).length,

      maintenance: assets.filter(
        (asset) =>
          asset.status === "maintenance",
      ).length,

      retired: assets.filter(
        (asset) => asset.status === "retired",
      ).length,
    };
  }, [assets]);

  // --------------------------------------------------
  // Department statistics
  // --------------------------------------------------

  const departments = useMemo(() => {
    const counts: Record<string, number> = {};

    assets.forEach((asset) => {
      const department =
        asset.department?.trim() ||
        "Unassigned";

      counts[department] =
        (counts[department] ?? 0) + 1;
    });

    return Object.entries(counts).sort(
      (a, b) => b[1] - a[1],
    );
  }, [assets]);

  // --------------------------------------------------
  // Recent tickets
  // --------------------------------------------------

  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort((a, b) => {
        const aTime = new Date(
          a.updatedAt,
        ).getTime();

        const bTime = new Date(
          b.updatedAt,
        ).getTime();

        return bTime - aTime;
      })
      .slice(0, 5);
  }, [tickets]);

  const activeTickets =
    ticketStats.open +
    ticketStats.inProgress;

  return (
    <>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">
            CLOUD OPERATIONS
          </p>

          <h1>Overview</h1>

          <p>
            Monitor Nubora&apos;s operational
            environment.
          </p>
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

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {loading ? (
        <p className="dashboard-loading">
          Loading AWS resources...
        </p>
      ) : (
        <>
          {/* ------------------------------------------ */}
          {/* Top metrics                                */}
          {/* ------------------------------------------ */}

          <section className="metric-grid">
            <div className="metric-card">
              <span>Total tickets</span>

              <strong>
                {tickets.length}
              </strong>

              <small>
                All support requests
              </small>
            </div>

            <div className="metric-card">
              <span>Active tickets</span>

              <strong>
                {activeTickets}
              </strong>

              <small>
                Open or in progress
              </small>
            </div>

            <div className="metric-card">
              <span>Managed assets</span>

              <strong>
                {assets.length}
              </strong>

              <small>
                Tracked devices
              </small>
            </div>

            <div className="metric-card">
              <span>API status</span>

              <strong className="health-value">
                {health === "healthy"
                  ? "Healthy"
                  : health}
              </strong>

              <small>
                Amazon API Gateway
              </small>
            </div>
          </section>

          {/* ------------------------------------------ */}
          {/* Operational analytics                     */}
          {/* ------------------------------------------ */}

          <section className="analytics-grid">
            <div className="dashboard-card analytics-card">
              <div className="card-heading">
                <div>
                  <p className="eyebrow">
                    SUPPORT
                  </p>

                  <h2>
                    Ticket status
                  </h2>
                </div>

                <span>
                  {tickets.length} total
                </span>
              </div>

              <div className="stat-breakdown">
                <div className="breakdown-row">
                  <div>
                    <span className="breakdown-label">
                      Open
                    </span>

                    <strong>
                      {ticketStats.open}
                    </strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width:
                          tickets.length > 0
                            ? `${
                                (ticketStats.open /
                                  tickets.length) *
                                100
                              }%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                <div className="breakdown-row">
                  <div>
                    <span className="breakdown-label">
                      In progress
                    </span>

                    <strong>
                      {ticketStats.inProgress}
                    </strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width:
                          tickets.length > 0
                            ? `${
                                (ticketStats.inProgress /
                                  tickets.length) *
                                100
                              }%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                <div className="breakdown-row">
                  <div>
                    <span className="breakdown-label">
                      Resolved
                    </span>

                    <strong>
                      {ticketStats.resolved}
                    </strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width:
                          tickets.length > 0
                            ? `${
                                (ticketStats.resolved /
                                  tickets.length) *
                                100
                              }%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-card analytics-card">
              <div className="card-heading">
                <div>
                  <p className="eyebrow">
                    PRIORITY
                  </p>

                  <h2>
                    Ticket severity
                  </h2>
                </div>
              </div>

              <div className="priority-grid">
                <div className="priority-stat">
                  <span>High</span>
                  <strong>
                    {ticketStats.high}
                  </strong>
                </div>

                <div className="priority-stat">
                  <span>Medium</span>
                  <strong>
                    {ticketStats.medium}
                  </strong>
                </div>

                <div className="priority-stat">
                  <span>Low</span>
                  <strong>
                    {ticketStats.low}
                  </strong>
                </div>
              </div>
            </div>

            <div className="dashboard-card analytics-card">
              <div className="card-heading">
                <div>
                  <p className="eyebrow">
                    INVENTORY
                  </p>

                  <h2>
                    Asset health
                  </h2>
                </div>
              </div>

              <div className="asset-status-grid">
                <div>
                  <span>
                    Available
                  </span>

                  <strong>
                    {assetStats.available}
                  </strong>
                </div>

                <div>
                  <span>
                    In use
                  </span>

                  <strong>
                    {assetStats.inUse}
                  </strong>
                </div>

                <div>
                  <span>
                    Maintenance
                  </span>

                  <strong>
                    {assetStats.maintenance}
                  </strong>
                </div>

                <div>
                  <span>
                    Retired
                  </span>

                  <strong>
                    {assetStats.retired}
                  </strong>
                </div>
              </div>
            </div>

            <div className="dashboard-card analytics-card">
              <div className="card-heading">
                <div>
                  <p className="eyebrow">
                    ORGANIZATION
                  </p>

                  <h2>
                    Assets by department
                  </h2>
                </div>
              </div>

              <div className="department-list">
                {departments.length > 0 ? (
                  departments.map(
                    ([department, count]) => (
                      <div
                        className="department-row"
                        key={department}
                      >
                        <span>
                          {department}
                        </span>

                        <strong>
                          {count}
                        </strong>
                      </div>
                    ),
                  )
                ) : (
                  <p className="analytics-empty">
                    No department data yet.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ------------------------------------------ */}
          {/* Recent activity                            */}
          {/* ------------------------------------------ */}

          <section className="dashboard-card recent-activity-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">
                  RECENT ACTIVITY
                </p>

                <h2>
                  Recently updated tickets
                </h2>
              </div>

              <span>
                Latest {recentTickets.length}
              </span>
            </div>

            <div className="data-list">
              {recentTickets.map((ticket) => (
                <div
                  className="data-row"
                  key={ticket.ticketId}
                >
                  <div>
                    <strong>
                      {ticket.title}
                    </strong>

                    <span>
                      {ticket.ticketId}
                      {" · "}
                      {ticket.assignedTo ||
                        "unassigned"}
                    </span>
                  </div>

                  <div className="row-meta">
                    <span className="badge">
                      {ticket.priority}
                    </span>

                    <span>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))}

              {recentTickets.length === 0 && (
                <div className="empty-state">
                  <strong>
                    No ticket activity
                  </strong>

                  <p>
                    New and updated tickets
                    will appear here.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}