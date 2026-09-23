import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

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
  // --------------------------------------------------
  // Ticket data
  // --------------------------------------------------

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Search and filters
  // --------------------------------------------------

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // --------------------------------------------------
  // Create ticket
  // --------------------------------------------------

  const [showCreate, setShowCreate] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  // --------------------------------------------------
  // Edit ticket
  // --------------------------------------------------

  const [editingTicket, setEditingTicket] =
    useState<Ticket | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editStatus, setEditStatus] = useState("open");
  const [editAssignedTo, setEditAssignedTo] = useState("");

  // --------------------------------------------------
  // RBAC
  // --------------------------------------------------

  const canCreate =
    role === "Admins" || role === "Technicians";

  const canEdit =
    role === "Admins" || role === "Technicians";

  const canDelete = role === "Admins";

  // --------------------------------------------------
  // Load tickets
  // --------------------------------------------------

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
  // eslint-disable-next-line react-hooks/set-state-in-effect
  void loadTickets();
}, []);

  // --------------------------------------------------
  // Filtering
  // --------------------------------------------------

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.ticketId.toLowerCase().includes(query) ||
        (ticket.assignedTo ?? "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        ticket.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tickets,
    search,
    statusFilter,
    priorityFilter,
  ]);

  // --------------------------------------------------
  // Create ticket
  // --------------------------------------------------

  function resetCreateForm() {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setShowCreate(false);
  }

  async function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setError("");

      await createTicket({
        title,
        description,
        priority,
        createdBy: "nubora-web",
      });

      resetCreateForm();

      await loadTickets();
    } catch (err) {
      console.error(err);
      setError("Unable to create ticket.");
    }
  }

  // --------------------------------------------------
  // Edit ticket
  // --------------------------------------------------

  function startEdit(ticket: Ticket) {
    setEditingTicket(ticket);

    setEditTitle(ticket.title);
    setEditDescription(ticket.description);
    setEditPriority(ticket.priority);
    setEditStatus(ticket.status);
    setEditAssignedTo(ticket.assignedTo ?? "");

    setShowCreate(false);
  }

  function cancelEdit() {
    setEditingTicket(null);
  }

  async function handleEdit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!editingTicket) {
      return;
    }

    try {
      setError("");

      await updateTicket(editingTicket.ticketId, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        status: editStatus,
        assignedTo:
          editAssignedTo.trim() || "unassigned",
      });

      setEditingTicket(null);

      await loadTickets();
    } catch (err) {
      console.error(err);
      setError("Unable to update ticket.");
    }
  }

  // --------------------------------------------------
  // Quick status update
  // --------------------------------------------------

  async function handleStatusChange(
    ticket: Ticket,
    status: string,
  ) {
    try {
      setError("");

      await updateTicket(ticket.ticketId, {
        status,
      });

      await loadTickets();
    } catch (err) {
      console.error(err);
      setError("Unable to update ticket status.");
    }
  }

  // --------------------------------------------------
  // Delete ticket
  // --------------------------------------------------

  async function handleDelete(ticket: Ticket) {
    const confirmed = window.confirm(
      `Delete "${ticket.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteTicket(ticket.ticketId);

      if (
        editingTicket?.ticketId === ticket.ticketId
      ) {
        setEditingTicket(null);
      }

      await loadTickets();
    } catch (err) {
      console.error(err);
      setError("Unable to delete ticket.");
    }
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">SUPPORT</p>

          <h1>Tickets</h1>

          <p>
            Manage IT support requests and incidents.
          </p>
        </div>

        {canCreate && (
          <button
            className="primary-button"
            onClick={() => {
              setEditingTicket(null);
              setShowCreate(true);
            }}
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

      {/* ------------------------------------------------ */}
      {/* Create ticket                                    */}
      {/* ------------------------------------------------ */}

      {showCreate && (
        <div className="dashboard-card ticket-form-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                NEW REQUEST
              </p>

              <h2>Create ticket</h2>
            </div>

            <button
              className="text-button"
              onClick={resetCreateForm}
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
                placeholder="Describe the issue"
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
                placeholder="Provide details about the issue..."
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
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
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

      {/* ------------------------------------------------ */}
      {/* Edit ticket                                      */}
      {/* ------------------------------------------------ */}

      {editingTicket && (
        <div className="dashboard-card ticket-form-card edit-ticket-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                EDIT REQUEST
              </p>

              <h2>
                {editingTicket.ticketId}
              </h2>
            </div>

            <button
              className="text-button"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </div>

          <form
            className="ticket-form"
            onSubmit={handleEdit}
          >
            <label>
              Title

              <input
                value={editTitle}
                onChange={(event) =>
                  setEditTitle(event.target.value)
                }
                required
              />
            </label>

            <label>
              Description

              <textarea
                value={editDescription}
                onChange={(event) =>
                  setEditDescription(
                    event.target.value,
                  )
                }
                required
              />
            </label>

            <div className="form-grid">
              <label>
                Priority

                <select
                  value={editPriority}
                  onChange={(event) =>
                    setEditPriority(
                      event.target.value,
                    )
                  }
                >
                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>
                </select>
              </label>

              <label>
                Status

                <select
                  value={editStatus}
                  onChange={(event) =>
                    setEditStatus(
                      event.target.value,
                    )
                  }
                >
                  <option value="open">
                    Open
                  </option>

                  <option value="in-progress">
                    In progress
                  </option>

                  <option value="resolved">
                    Resolved
                  </option>
                </select>
              </label>
            </div>

            <label>
              Assigned to

              <input
                value={editAssignedTo}
                placeholder="technician-01"
                onChange={(event) =>
                  setEditAssignedTo(
                    event.target.value,
                  )
                }
              />
            </label>

            <button
              className="primary-button"
              type="submit"
            >
              Save changes
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* Search and filters                               */}
      {/* ------------------------------------------------ */}

      <div className="filter-bar">
        <input
          type="search"
          placeholder="Search tickets..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="all">
            All statuses
          </option>

          <option value="open">
            Open
          </option>

          <option value="in-progress">
            In progress
          </option>

          <option value="resolved">
            Resolved
          </option>
        </select>

        <select
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(event.target.value)
          }
        >
          <option value="all">
            All priorities
          </option>

          <option value="low">
            Low
          </option>

          <option value="medium">
            Medium
          </option>

          <option value="high">
            High
          </option>
        </select>
      </div>

      {/* ------------------------------------------------ */}
      {/* Ticket queue                                     */}
      {/* ------------------------------------------------ */}

      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">
              TICKET QUEUE
            </p>

            <h2>All tickets</h2>
          </div>

          <span>
            {filteredTickets.length} of{" "}
            {tickets.length}
          </span>
        </div>

        {loading ? (
          <p className="dashboard-loading">
            Loading tickets...
          </p>
        ) : (
          <div className="ticket-table">
            {filteredTickets.map((ticket) => (
              <div
                className="ticket-item"
                key={ticket.ticketId}
              >
                <div className="ticket-main">
                  <strong>
                    {ticket.title}
                  </strong>

                  <span>
                    {ticket.ticketId}
                    {" · "}
                    {ticket.assignedTo ||
                      "unassigned"}
                  </span>

                  <p>
                    {ticket.description}
                  </p>
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
                      <option value="open">
                        Open
                      </option>

                      <option value="in-progress">
                        In progress
                      </option>

                      <option value="resolved">
                        Resolved
                      </option>
                    </select>
                  ) : (
                    <span>
                      {ticket.status}
                    </span>
                  )}

                  {canEdit && (
                    <button
                      className="secondary-button"
                      onClick={() =>
                        startEdit(ticket)
                      }
                    >
                      Edit
                    </button>
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

            {!loading &&
              filteredTickets.length === 0 && (
                <div className="empty-state">
                  <strong>
                    No tickets found
                  </strong>

                  <p>
                    Try changing your search or
                    filters.
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </>
  );
}