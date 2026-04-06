import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import CompanyBrand from "./CompanyBrand";
import CompanyFooter from "./CompanyFooter";
import "./GPSTracker.css";

const TRACKERS = [
  {
    id: "bolero-pickup",
    label: "Vehicle 1",
    vehicleName: "BOLERO PICKUP",
    provider: "Navilap GPS",
    url: "https://navilap.com/gps/login",
    summary:
      "Click this vehicle card to move directly to the Navilap GPS tracking portal.",
  },
  {
    id: "dost-ev",
    label: "Vehicle 2",
    vehicleName: "DOST EV",
    provider: "Switch iON",
    url: "https://ion.switchmobilityev.com/",
    summary:
      "Click this vehicle card to move directly to the Switch iON tracking portal.",
  },
];

function GPSTracker() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const rawUser = sessionStorage.getItem("authUser");
    if (!rawUser) return;

    try {
      setAuthUser(JSON.parse(rawUser));
    } catch (_error) {
      sessionStorage.removeItem("authUser");
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("authUser");
    setAuthUser(null);
    navigate("/login");
  };

  return (
    <div className="stock-shell">
      <header className="topbar navbar navbar-expand-lg">
        <div className="container-xl">
          <CompanyBrand />
          <button
            className="navbar-toggler bg-light"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#gpsNavbar"
            aria-controls="gpsNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <nav className="collapse navbar-collapse" id="gpsNavbar">
            <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              <Link to="/" className="nav-link">
                Home
              </Link>
              <NavLink to="/stock/dashboard" className="nav-link">
                Inventory
              </NavLink>
              <NavLink to="/billing" className="nav-link">
                Costing
              </NavLink>
              <NavLink to="/gps" className="nav-link">
                GPS
              </NavLink>
              {authUser && (
                <div className="profile-nav ms-lg-2 mt-2 mt-lg-0">
                  <div className="avatar">
                    {String(authUser?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-text">
                    <strong>{authUser?.name || "User"}</strong>
                    <span>{authUser?.role || "staff"}</span>
                  </div>
                  <button
                    type="button"
                    className="logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <section className="gps-page">
        <div className="container-xl gps-shell">
          <div className="gps-hero">
            <div className="gps-hero-copy">
              <span className="gps-eyebrow">Fleet Tracking</span>
              <h1>Vehicle GPS Links</h1>
              <p>
                Click any vehicle below and the user will move directly to that
                GPS website. No tracking website is embedded inside your page.
              </p>
            </div>

            <Link to="/" className="gps-back-link">
              Back to home
            </Link>
          </div>

          <div className="gps-stat-grid">
            <article className="gps-stat-card">
              <span>Total Vehicles</span>
              <strong>{TRACKERS.length}</strong>
            </article>
            <article className="gps-stat-card">
              <span>Action Type</span>
              <strong>Direct website open</strong>
            </article>
            <article className="gps-stat-card accent">
              <span>Page Purpose</span>
              <strong>Vehicle portal launcher</strong>
            </article>
          </div>

          <div className="gps-link-grid">
            {TRACKERS.map((tracker) => (
              <a key={tracker.id} href={tracker.url} className="gps-link-card">
                <div className="gps-link-top">
                  <div>
                    <span className="gps-link-label">{tracker.label}</span>
                    <h2>{tracker.vehicleName}</h2>
                  </div>
                  <span className="gps-provider-badge">{tracker.provider}</span>
                </div>

                <p className="gps-link-summary">{tracker.summary}</p>

                <div className="gps-link-meta">
                  <div className="gps-meta-row">
                    <span>Provider</span>
                    <strong>{tracker.provider}</strong>
                  </div>
                  <div className="gps-meta-row">
                    <span>Vehicle</span>
                    <strong>{tracker.vehicleName}</strong>
                  </div>
                </div>

                <div className="gps-link-action">
                  Open tracking website
                </div>
              </a>
            ))}
          </div>

          <div className="gps-info-grid">
            <article className="gps-info-card">
              <h3>Available Vehicles</h3>
              <div className="gps-info-list">
                {TRACKERS.map((tracker) => (
                  <div key={tracker.id} className="gps-info-row">
                    <span>{tracker.label}</span>
                    <strong>{tracker.vehicleName}</strong>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <CompanyFooter />
    </div>
  );
}

export default GPSTracker;
