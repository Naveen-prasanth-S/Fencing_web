import { Link } from "react-router-dom";
import CompanyBrand from "./CompanyBrand";
import "./SiteNavbar.css";

function SiteNavbar({ authUser, onLogout, collapseId = "siteNavbar" }) {
  const inventoryPath = authUser ? "/stock/dashboard" : "/login";
  const costingPath = authUser ? "/billing" : "/login";
  const gpsPath = authUser ? "/gps" : "/login";

  return (
    <header className="topbar navbar navbar-expand-lg">
      <div className="container-xl">
        <CompanyBrand />

        <button
          className="navbar-toggler bg-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#${collapseId}`}
          aria-controls={collapseId}
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <nav className="collapse navbar-collapse" id={collapseId}>
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <Link to={inventoryPath} className="nav-link">
              Inventory
            </Link>
            <Link to={costingPath} className="nav-link">
              Costing
            </Link>
            <Link to={gpsPath} className="nav-link">
              GPS
            </Link>

            {authUser ? (
              <div className="profile-nav ms-lg-2 mt-2 mt-lg-0">
                <div className="avatar">
                  {String(authUser?.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="profile-text">
                  <strong>{authUser?.name || "User"}</strong>
                  <span>{authUser?.role || "staff"}</span>
                </div>
                <button type="button" className="logout-btn" onClick={onLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-sm btn-primary ms-lg-1 mt-2 mt-lg-0"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default SiteNavbar;
