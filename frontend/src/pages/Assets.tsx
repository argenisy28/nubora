import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  createAsset,
  deleteAsset,
  getAssets,
  updateAsset,
  type Asset,
} from "../services/api";

interface AssetsProps {
  role: string;
}

export default function Assets({ role }: AssetsProps) {
  // --------------------------------------------------
  // Asset data
  // --------------------------------------------------

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Search and filters
  // --------------------------------------------------

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] =
    useState("all");

  // --------------------------------------------------
  // Create asset
  // --------------------------------------------------

  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("laptop");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState("available");
  const [assignedTo, setAssignedTo] = useState("");
  const [department, setDepartment] = useState("");

  // --------------------------------------------------
  // Edit asset
  // --------------------------------------------------

  const [editingAsset, setEditingAsset] =
    useState<Asset | null>(null);

  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editManufacturer, setEditManufacturer] =
    useState("");
  const [editModel, setEditModel] = useState("");
  const [editSerialNumber, setEditSerialNumber] =
    useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editAssignedTo, setEditAssignedTo] =
    useState("");
  const [editDepartment, setEditDepartment] =
    useState("");

  // --------------------------------------------------
  // RBAC
  // --------------------------------------------------

  const canCreate =
    role === "Admins" || role === "Technicians";

  const canEdit =
    role === "Admins" || role === "Technicians";

  const canDelete = role === "Admins";

  // --------------------------------------------------
  // Load assets
  // --------------------------------------------------

  async function loadAssets() {
    try {
      setError("");

      const response = await getAssets();

      setAssets(response.assets ?? []);
    } catch (err) {
      console.error(err);
      setError("Unable to load assets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAssets();
  }, []);

  // --------------------------------------------------
  // Available department filters
  // --------------------------------------------------

  const departments = useMemo(() => {
    return Array.from(
      new Set(
        assets
          .map((asset) => asset.department)
          .filter(
            (department): department is string =>
              Boolean(department),
          ),
      ),
    ).sort();
  }, [assets]);

  // --------------------------------------------------
  // Filter assets
  // --------------------------------------------------

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesSearch =
        !query ||
        asset.name.toLowerCase().includes(query) ||
        asset.assetId.toLowerCase().includes(query) ||
        (asset.serialNumber ?? "")
          .toLowerCase()
          .includes(query) ||
        (asset.manufacturer ?? "")
          .toLowerCase()
          .includes(query) ||
        (asset.model ?? "")
          .toLowerCase()
          .includes(query) ||
        (asset.assignedTo ?? "")
          .toLowerCase()
          .includes(query) ||
        (asset.department ?? "")
          .toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "all" ||
        asset.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        asset.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "all" ||
        asset.department === departmentFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesDepartment
      );
    });
  }, [
    assets,
    search,
    typeFilter,
    statusFilter,
    departmentFilter,
  ]);

  // --------------------------------------------------
  // Create asset
  // --------------------------------------------------

  function resetCreateForm() {
    setName("");
    setType("laptop");
    setManufacturer("");
    setModel("");
    setSerialNumber("");
    setStatus("available");
    setAssignedTo("");
    setDepartment("");
    setShowCreate(false);
  }

  async function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setError("");

      await createAsset({
        name,
        type,
        manufacturer,
        model,
        serialNumber,
        status,
        assignedTo:
          assignedTo.trim() || "unassigned",
        department,
      });

      resetCreateForm();

      await loadAssets();
    } catch (err) {
      console.error(err);
      setError("Unable to create asset.");
    }
  }

  // --------------------------------------------------
  // Edit asset
  // --------------------------------------------------

  function startEdit(asset: Asset) {
    setEditingAsset(asset);

    setEditName(asset.name);
    setEditType(asset.type);
    setEditManufacturer(asset.manufacturer ?? "");
    setEditModel(asset.model ?? "");
    setEditSerialNumber(asset.serialNumber ?? "");
    setEditStatus(asset.status);
    setEditAssignedTo(asset.assignedTo ?? "");
    setEditDepartment(asset.department ?? "");

    setShowCreate(false);
  }

  function cancelEdit() {
    setEditingAsset(null);
  }

  async function handleEdit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!editingAsset) {
      return;
    }

    try {
      setError("");

      await updateAsset(editingAsset.assetId, {
        name: editName,
        type: editType,
        manufacturer: editManufacturer,
        model: editModel,
        serialNumber: editSerialNumber,
        status: editStatus,
        assignedTo:
          editAssignedTo.trim() || "unassigned",
        department: editDepartment,
      });

      setEditingAsset(null);

      await loadAssets();
    } catch (err) {
      console.error(err);
      setError("Unable to update asset.");
    }
  }

  // --------------------------------------------------
  // Delete asset
  // --------------------------------------------------

  async function handleDelete(asset: Asset) {
    const confirmed = window.confirm(
      `Delete "${asset.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteAsset(asset.assetId);

      if (
        editingAsset?.assetId === asset.assetId
      ) {
        setEditingAsset(null);
      }

      await loadAssets();
    } catch (err) {
      console.error(err);
      setError("Unable to delete asset.");
    }
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">INVENTORY</p>

          <h1>Assets</h1>

          <p>
            Track and manage organizational hardware.
          </p>
        </div>

        {canCreate && (
          <button
            className="primary-button"
            onClick={() => {
              setEditingAsset(null);
              setShowCreate(true);
            }}
          >
            + New asset
          </button>
        )}
      </header>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* Create asset                                     */}
      {/* ------------------------------------------------ */}

      {showCreate && (
        <div className="dashboard-card ticket-form-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                NEW ASSET
              </p>

              <h2>Add managed device</h2>
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
            <div className="form-grid">
              <label>
                Asset name

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Type

                <select
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value)
                  }
                >
                  <option value="laptop">
                    Laptop
                  </option>

                  <option value="desktop">
                    Desktop
                  </option>

                  <option value="server">
                    Server
                  </option>

                  <option value="printer">
                    Printer
                  </option>

                  <option value="network">
                    Network device
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </label>

              <label>
                Manufacturer

                <input
                  value={manufacturer}
                  onChange={(event) =>
                    setManufacturer(
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                Model

                <input
                  value={model}
                  onChange={(event) =>
                    setModel(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Serial number

                <input
                  value={serialNumber}
                  onChange={(event) =>
                    setSerialNumber(
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                Department

                <input
                  value={department}
                  onChange={(event) =>
                    setDepartment(
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                Status

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                >
                  <option value="available">
                    Available
                  </option>

                  <option value="in-use">
                    In use
                  </option>

                  <option value="maintenance">
                    Maintenance
                  </option>

                  <option value="retired">
                    Retired
                  </option>
                </select>
              </label>

              <label>
                Assigned to

                <input
                  value={assignedTo}
                  placeholder="unassigned"
                  onChange={(event) =>
                    setAssignedTo(
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>

            <button
              className="primary-button"
              type="submit"
            >
              Add asset
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* Edit asset                                       */}
      {/* ------------------------------------------------ */}

      {editingAsset && (
        <div className="dashboard-card ticket-form-card edit-ticket-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                EDIT ASSET
              </p>

              <h2>
                {editingAsset.assetId}
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
            <div className="form-grid">
              <label>
                Asset name

                <input
                  value={editName}
                  onChange={(event) =>
                    setEditName(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Type

                <select
                  value={editType}
                  onChange={(event) =>
                    setEditType(event.target.value)
                  }
                >
                  <option value="laptop">
                    Laptop
                  </option>

                  <option value="desktop">
                    Desktop
                  </option>

                  <option value="server">
                    Server
                  </option>

                  <option value="printer">
                    Printer
                  </option>

                  <option value="network">
                    Network device
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </label>

              <label>
                Manufacturer

                <input
                  value={editManufacturer}
                  onChange={(event) =>
                    setEditManufacturer(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Model

                <input
                  value={editModel}
                  onChange={(event) =>
                    setEditModel(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Serial number

                <input
                  value={editSerialNumber}
                  onChange={(event) =>
                    setEditSerialNumber(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Department

                <input
                  value={editDepartment}
                  onChange={(event) =>
                    setEditDepartment(
                      event.target.value,
                    )
                  }
                />
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
                  <option value="available">
                    Available
                  </option>

                  <option value="in-use">
                    In use
                  </option>

                  <option value="maintenance">
                    Maintenance
                  </option>

                  <option value="retired">
                    Retired
                  </option>
                </select>
              </label>

              <label>
                Assigned to

                <input
                  value={editAssignedTo}
                  onChange={(event) =>
                    setEditAssignedTo(
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>

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
      {/* Filters                                          */}
      {/* ------------------------------------------------ */}

      <div className="filter-bar asset-filter-bar">
        <input
          type="search"
          placeholder="Search assets..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value)
          }
        >
          <option value="all">
            All types
          </option>

          <option value="laptop">
            Laptop
          </option>

          <option value="desktop">
            Desktop
          </option>

          <option value="server">
            Server
          </option>

          <option value="printer">
            Printer
          </option>

          <option value="network">
            Network device
          </option>

          <option value="other">
            Other
          </option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="all">
            All statuses
          </option>

          <option value="available">
            Available
          </option>

          <option value="in-use">
            In use
          </option>

          <option value="maintenance">
            Maintenance
          </option>

          <option value="retired">
            Retired
          </option>
        </select>

        <select
          value={departmentFilter}
          onChange={(event) =>
            setDepartmentFilter(
              event.target.value,
            )
          }
        >
          <option value="all">
            All departments
          </option>

          {departments.map((department) => (
            <option
              value={department}
              key={department}
            >
              {department}
            </option>
          ))}
        </select>
      </div>

      {/* ------------------------------------------------ */}
      {/* Asset inventory                                  */}
      {/* ------------------------------------------------ */}

      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">
              ASSET INVENTORY
            </p>

            <h2>Managed devices</h2>
          </div>

          <span>
            {filteredAssets.length} of{" "}
            {assets.length}
          </span>
        </div>

        {loading ? (
          <p className="dashboard-loading">
            Loading assets...
          </p>
        ) : (
          <div className="ticket-table">
            {filteredAssets.map((asset) => (
              <div
                className="ticket-item"
                key={asset.assetId}
              >
                <div className="ticket-main">
                  <strong>
                    {asset.name}
                  </strong>

                  <span>
                    {asset.assetId}
                    {" · "}
                    {asset.department ||
                      "No department"}
                  </span>

                  <p>
                    {asset.manufacturer}{" "}
                    {asset.model}

                    {asset.serialNumber
                      ? ` · SN: ${asset.serialNumber}`
                      : ""}
                  </p>

                  <p>
                    Assigned to:{" "}
                    {asset.assignedTo ||
                      "unassigned"}
                  </p>
                </div>

                <div className="ticket-controls">
                  <span className="badge">
                    {asset.type}
                  </span>

                  <span>
                    {asset.status}
                  </span>

                  {canEdit && (
                    <button
                      className="secondary-button"
                      onClick={() =>
                        startEdit(asset)
                      }
                    >
                      Edit
                    </button>
                  )}

                  {canDelete && (
                    <button
                      className="danger-button"
                      onClick={() =>
                        void handleDelete(asset)
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}

            {!loading &&
              filteredAssets.length === 0 && (
                <div className="empty-state">
                  <strong>
                    No assets found
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