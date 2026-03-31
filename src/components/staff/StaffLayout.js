import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../inventory/InventoryPages.css";

function StaffLayout() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const rawUser = sessionStorage.getItem("authUser");
    if (!rawUser) {
      setReady(true);
      return;
    }

    try {
      const parsed = JSON.parse(rawUser);
      setAuthUser(parsed);
    } catch (_error) {
      sessionStorage.removeItem("authUser");
    } finally {
      setReady(true);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("authUser");
    navigate("/login");
  };

  if (!ready) return null;
  if (!authUser) return <Navigate to="/login" replace />;
  if (authUser.role !== "staff") return <Navigate to="/" replace />;

  return (
    <div className="stock-shell">
      <header className="topbar navbar navbar-expand-lg">
        <div className="container-xl">
          <span className="brand navbar-brand mb-0">FencingMS Staff</span>
          <button
            className="navbar-toggler bg-light"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#staffNavbar"
            aria-controls="staffNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <nav className="collapse navbar-collapse" id="staffNavbar">
            <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              <NavLink to="/staff/home" className="nav-link">Staff Home</NavLink>
              <NavLink to="/staff/stock-list" className="nav-link">Stock List</NavLink>
              <NavLink to="/staff/orders" className="nav-link">Orders</NavLink>
              <div className="profile-nav ms-lg-2 mt-2 mt-lg-0">
                <div className="avatar">
                  {String(authUser?.name || "S").charAt(0).toUpperCase()}
                </div>
                <div className="profile-text">
                  <strong>{authUser?.name || "Staff"}</strong>
                  <span>{authUser?.role || "staff"}</span>
                </div>
                <button type="button" className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="container-xl py-3">
        <Outlet context={{ authUser }} />
      </main>

      <footer id="contact" className="footer">
        <div className="container-xl">
          <div className="row g-3 align-items-start">
            <div className="col-lg-5">
              <h3 className="footer-title">FencingMS</h3>
              <p className="footer-text mb-2">
                Professional fencing solutions for homes, commercial spaces, and industrial sites.
              </p>
              <p className="footer-text mb-0">
                Address: 24/7 Industrial Road, Coimbatore, Tamil Nadu 641021
              </p>
            </div>
            <div className="col-lg-4">
              <h4 className="footer-subtitle">Contact</h4>
              <p className="footer-text mb-1">Phone: +91 98765 43210</p>
              <p className="footer-text mb-1">Email: support@fencingms.local</p>
              <p className="footer-text mb-0">Working Hours: Mon - Sat, 9:00 AM - 6:00 PM</p>
            </div>
            <div className="col-lg-3">
              <h4 className="footer-subtitle">Follow Us</h4>
              <div className="social-links">
                <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
                <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer">WhatsApp</a>
              </div>
            </div>
          </div>
          <hr className="footer-line" />
          <p className="footer-copy mb-0">© {new Date().getFullYear()} FencingMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default StaffLayout;
