import { useEffect, useState } from "react";
import {
  createTicket,
  deleteTicket,
  getTickets,
  updateTicket,
  type Ticket,
} from "../services/api";

interface TicketsProps {
  role: string;
}

export default function Tickets({ role }: TicketsProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const canCreate =
    role === "Admins" || role === "Technicians";

  const canEdit =
    role === "Admins" || role === "Technicians";

  const canDelete = role === "Admins";

  async function loadTickets() {
    try {
      setError("");
      const response = await getTickets();
      setTickets(response.tickets ?? []);
    } catch (err) {
      console.error(err);
      setError("Unable to load tickets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTickets();
  }, []);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setShowCreate(false);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    try {
      await createTicket({
        title,
        description,
        priority,
        createdBy: "nubora-web",
      });

      resetForm();
      await loadTickets();
    } catch (err) {
      console.error(err);
      setError("Unable to create ticket.");
    }
  }

  async function handleStatusChange(
    ticket: Ticket,
    status: string,
  ) {
    try {
      await updateTicket(ticket.ticketId, {
        status,
      });

      await loadTickets();
    } catch (err) {
      console.error(err);
      setError("Unable to update ticket.");
    }
  }

  async function handleDelete(ticket: Ticket) {
    const confirmed = window.confirm(
      `Delete "${ticket.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTicket(ticket.ticketId);
      await loadTickets();
    } catch (err) {
      console.error(err);
      setError("Unable to delete ticket.");
    }
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">SUPPORT</p>
          <h1>Tickets</h1>
          <p>Manage IT support requests and incidents.</p>
        </div>

        {canCreate && (
          <button
            className="primary-button"
            onClick={() => setShowCreate(true)}
          >
            + New ticket
          </button>
        )}
      </header>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {showCreate && (
        <div className="dashboard-card ticket-form-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">NEW REQUEST</p>
              <h2>Create ticket</h2>
            </div>

            <button
              className="text-button"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>

          <form
            className="ticket-form"
            onSubmit={handleCreate}
          >
            <label>
              Title

              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                required
              />
            </label>

            <label>
              Description

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                required
              />
            </label>

            <label>
              Priority

              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value)
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <button
              className="primary-button"
              type="submit"
            >
              Create ticket
            </button>
          </form>
        </div>
      )}

      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">TICKET QUEUE</p>
            <h2>All tickets</h2>
          </div>

          <span>{tickets.length} total</span>
        </div>

        {loading ? (
          <p className="dashboard-loading">
            Loading tickets...
          </p>
        ) : (
          <div className="ticket-table">
            {tickets.map((ticket) => (
              <div
                className="ticket-item"
                key={ticket.ticketId}
              >
                <div className="ticket-main">
                  <strong>{ticket.title}</strong>

                  <span>{ticket.ticketId}</span>

                  <p>{ticket.description}</p>
                </div>

                <div className="ticket-controls">
                  <span className="badge">
                    {ticket.priority}
                  </span>

                  {canEdit ? (
                    <select
                      value={ticket.status}
                      onChange={(event) =>
                        void handleStatusChange(
                          ticket,
                          event.target.value,
                        )
                      }
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">
                        In progress
                      </option>
                      <option value="resolved">
                        Resolved
                      </option>
                    </select>
                  ) : (
                    <span>{ticket.status}</span>
                  )}

                  {canDelete && (
                    <button
                      className="danger-button"
                      onClick={() =>
                        void handleDelete(ticket)
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      
    </>
  );
}