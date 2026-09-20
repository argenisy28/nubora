import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { logout } from "../services/auth";

interface AppLayoutProps {
  children: ReactNode;
  email?: string;
  role: string;
  onLogout: () => Promise<void>;
}

export default function AppLayout({
  children,
  email,
  role,
  onLogout,
}: AppLayoutProps) {
  async function handleLogout() {
    await logout();
    await onLogout();
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="dashboard-brand">
          <div className="brand-mark small">N</div>
          <span>Nubora</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Overview
          </NavLink>

          <NavLink
            to="/tickets"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Tickets
          </NavLink>

          <NavLink
            to="/assets"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Assets
          </NavLink>
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
        {children}
      </main>
    </div>
  );
}