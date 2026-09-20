import { useEffect, useState } from "react";
import { getTickets, type Ticket } from "../services/api";

interface TicketsProps {
  role: string;
}

export default function Tickets({ role }: TicketsProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        const response = await getTickets();
        setTickets(response.tickets ?? []);
      } catch (err) {
        console.error(err);
        setError("Unable to load tickets.");
      } finally {
        setLoading(false);
      }
    }

    void loadTickets();
  }, []);

  return (
    <>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">SUPPORT</p>
          <h1>Tickets</h1>
          <p>Manage IT support requests and incidents.</p>
        </div>

        <span className="badge">{role}</span>
      </header>

      {error && <div className="dashboard-error">{error}</div>}

      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">TICKET QUEUE</p>
            <h2>All tickets</h2>
          </div>

          <span>{tickets.length} total</span>
        </div>

        {loading ? (
          <p className="dashboard-loading">Loading tickets...</p>
        ) : (
          <div className="data-list">
            {tickets.map((ticket) => (
              <div className="data-row" key={ticket.ticketId}>
                <div>
                  <strong>{ticket.title}</strong>
                  <span>
                    {ticket.ticketId} · {ticket.assignedTo}
                  </span>
                </div>

                <div className="row-meta">
                  <span className="badge">{ticket.priority}</span>
                  <span>{ticket.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}