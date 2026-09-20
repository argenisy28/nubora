import { useEffect, useState } from "react";
import { getAssets, type Asset } from "../services/api";

interface AssetsProps {
  role: string;
}

export default function Assets({ role }: AssetsProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAssets() {
      try {
        const response = await getAssets();
        setAssets(response.assets ?? []);
      } catch (err) {
        console.error(err);
        setError("Unable to load assets.");
      } finally {
        setLoading(false);
      }
    }

    void loadAssets();
  }, []);

  return (
    <>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">INVENTORY</p>
          <h1>Assets</h1>
          <p>Track Nubora's managed hardware inventory.</p>
        </div>

        <span className="badge">{role}</span>
      </header>

      {error && <div className="dashboard-error">{error}</div>}

      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">ASSET INVENTORY</p>
            <h2>Managed devices</h2>
          </div>

          <span>{assets.length} total</span>
        </div>

        {loading ? (
          <p className="dashboard-loading">Loading assets...</p>
        ) : (
          <div className="data-list">
            {assets.map((asset) => (
              <div className="data-row" key={asset.assetId}>
                <div>
                  <strong>{asset.name}</strong>
                  <span>
                    {asset.manufacturer} {asset.model} ·{" "}
                    {asset.assetId}
                  </span>
                </div>

                <div className="row-meta">
                  <span className="badge">{asset.type}</span>
                  <span>{asset.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}