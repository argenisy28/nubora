import { useEffect, useState, type FormEvent } from "react";
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
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [editingAsset, setEditingAsset] =
    useState<Asset | null>(null);

  // Create form
  const [name, setName] = useState("");
  const [type, setType] = useState("laptop");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState("available");
  const [assignedTo, setAssignedTo] = useState("");
  const [department, setDepartment] = useState("");

  // Edit form
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editManufacturer, setEditManufacturer] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editSerialNumber, setEditSerialNumber] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [editDepartment, setEditDepartment] = useState("");

  const canCreate =
    role === "Admins" || role === "Technicians";

  const canEdit =
    role === "Admins" || role === "Technicians";

  const canDelete = role === "Admins";

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

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
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
        assignedTo: assignedTo || "unassigned",
        department,
      });

      resetCreateForm();
      await loadAssets();
    } catch (err) {
      console.error(err);
      setError("Unable to create asset.");
    }
  }

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
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
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
        assignedTo: editAssignedTo || "unassigned",
        department: editDepartment,
      });

      setEditingAsset(null);
      await loadAssets();
    } catch (err) {
      console.error(err);
      setError("Unable to update asset.");
    }
  }

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
      await loadAssets();
    } catch (err) {
      console.error(err);
      setError("Unable to delete asset.");
    }
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">INVENTORY</p>
          <h1>Assets</h1>
          <p>Track and manage organizational hardware.</p>
        </div>

        {canCreate && (
          <button
            className="primary-button"
            onClick={() => setShowCreate(true)}
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

      {showCreate && (
        <div className="dashboard-card ticket-form-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">NEW ASSET</p>
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
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label>
                Type
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="laptop">Laptop</option>
                  <option value="desktop">Desktop</option>
                  <option value="server">Server</option>
                  <option value="printer">Printer</option>
                  <option value="network">Network device</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label>
                Manufacturer
                <input
                  value={manufacturer}
                  onChange={(e) =>
                    setManufacturer(e.target.value)
                  }
                  required
                />
              </label>

              <label>
                Model
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                />
              </label>

              <label>
                Serial number
                <input
                  value={serialNumber}
                  onChange={(e) =>
                    setSerialNumber(e.target.value)
                  }
                  required
                />
              </label>

              <label>
                Department
                <input
                  value={department}
                  onChange={(e) =>
                    setDepartment(e.target.value)
                  }
                  required
                />
              </label>

              <label>
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="available">Available</option>
                  <option value="in-use">In use</option>
                  <option value="maintenance">
                    Maintenance
                  </option>
                  <option value="retired">Retired</option>
                </select>
              </label>

              <label>
                Assigned to
                <input
                  value={assignedTo}
                  placeholder="unassigned"
                  onChange={(e) =>
                    setAssignedTo(e.target.value)
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

      {editingAsset && (
        <div className="dashboard-card ticket-form-card edit-ticket-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">EDIT ASSET</p>
              <h2>{editingAsset.assetId}</h2>
            </div>

            <button
              className="text-button"
              onClick={() => setEditingAsset(null)}
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
                  onChange={(e) =>
                    setEditName(e.target.value)
                  }
                  required
                />
              </label>

              <label>
                Type
                <select
                  value={editType}
                  onChange={(e) =>
                    setEditType(e.target.value)
                  }
                >
                  <option value="laptop">Laptop</option>
                  <option value="desktop">Desktop</option>
                  <option value="server">Server</option>
                  <option value="printer">Printer</option>
                  <option value="network">Network device</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label>
                Manufacturer
                <input
                  value={editManufacturer}
                  onChange={(e) =>
                    setEditManufacturer(e.target.value)
                  }
                />
              </label>

              <label>
                Model
                <input
                  value={editModel}
                  onChange={(e) =>
                    setEditModel(e.target.value)
                  }
                />
              </label>

              <label>
                Serial number
                <input
                  value={editSerialNumber}
                  onChange={(e) =>
                    setEditSerialNumber(e.target.value)
                  }
                />
              </label>

              <label>
                Department
                <input
                  value={editDepartment}
                  onChange={(e) =>
                    setEditDepartment(e.target.value)
                  }
                />
              </label>

              <label>
                Status
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value)
                  }
                >
                  <option value="available">Available</option>
                  <option value="in-use">In use</option>
                  <option value="maintenance">
                    Maintenance
                  </option>
                  <option value="retired">Retired</option>
                </select>
              </label>

              <label>
                Assigned to
                <input
                  value={editAssignedTo}
                  onChange={(e) =>
                    setEditAssignedTo(e.target.value)
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

      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">ASSET INVENTORY</p>
            <h2>Managed devices</h2>
          </div>

          <span>{assets.length} total</span>
        </div>

        {loading ? (
          <p className="dashboard-loading">
            Loading assets...
          </p>
        ) : (
          <div className="ticket-table">
            {assets.map((asset) => (
              <div
                className="ticket-item"
                key={asset.assetId}
              >
                <div className="ticket-main">
                  <strong>{asset.name}</strong>

                  <span>
                    {asset.assetId}
                    {" · "}
                    {asset.department || "No department"}
                  </span>

                  <p>
                    {asset.manufacturer} {asset.model}
                    {asset.serialNumber
                      ? ` · SN: ${asset.serialNumber}`
                      : ""}
                  </p>

                  <p>
                    Assigned to:{" "}
                    {asset.assignedTo || "unassigned"}
                  </p>
                </div>

                <div className="ticket-controls">
                  <span className="badge">
                    {asset.type}
                  </span>

                  <span>{asset.status}</span>

                  {canEdit && (
                    <button
                      className="secondary-button"
                      onClick={() => startEdit(asset)}
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
          </div>
        )}
      </div>
    </>
  );
}