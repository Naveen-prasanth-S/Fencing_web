import { Link, useOutletContext } from "react-router-dom";
import "./Home.css";
import heroImage from "../assets/home.webp";
import bgImage from "../assets/bg.webp";
import siteImage from "../assets/lbg.jpg";

function StaffHome() {
  const { authUser } = useOutletContext();

  return (
    <>
      <section
        id="overview"
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.76), rgba(15, 23, 42, 0.76)), url(${heroImage})`,
        }}
      >
        <div className="container-xl hero-content">
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              <p className="eyebrow">Staff Workspace</p>
              <h1>Track Daily Work, Orders, and Stock Status</h1>
              <p className="lead-text">
                Use this panel to follow assigned tasks and update stock movement quickly.
              </p>

              <div className="hero-profile">
                <h3>Welcome, {authUser?.name || "Staff"}</h3>
                <p>
                  Logged in as <b>{authUser?.role || "staff"}</b> |{" "}
                  <b>{authUser?.email || "-"}</b>
                </p>
                <div className="d-flex flex-wrap gap-2 mt-3">
                  <Link to="/staff/stock-list" className="btn btn-success btn-lg">Open Stock List</Link>
                  <Link to="/staff/orders" className="btn btn-outline-light btn-lg">Open Orders</Link>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="hero-side-card">
                <h3>Staff Quick Actions</h3>
                <ul>
                  <li>Check available stock before delivery</li>
                  <li>Update order delivery status</li>
                  <li>Confirm delivered quantity and pending items</li>
                  <li>Coordinate with admin for low stock items</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="section container-xl">
        <div className="section-head">
          <h2>Today&apos;s Work Flow</h2>
          <p>Simple workflow for staff operations.</p>
        </div>
        <div className="row g-3">
          <div className="col-md-6 col-xl-4">
            <article className="product-card h-100">
              <img src={bgImage} alt="Stock review" className="card-image" />
              <h3>1. Verify Stock</h3>
              <p>Check available and low stock items before assigning delivery.</p>
            </article>
          </div>
          <div className="col-md-6 col-xl-4">
            <article className="product-card h-100">
              <img src={siteImage} alt="Order update" className="card-image" />
              <h3>2. Update Orders</h3>
              <p>Track ordered items and mark them delivered after dispatch.</p>
            </article>
          </div>
          <div className="col-md-6 col-xl-4">
            <article className="product-card h-100">
              <img src={heroImage} alt="Task tracking" className="card-image" />
              <h3>3. Submit Task Status</h3>
              <p>Log staff task progress to keep operations clear and accurate.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

export default StaffHome;
