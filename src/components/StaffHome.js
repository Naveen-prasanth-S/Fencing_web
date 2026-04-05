import { Link, useOutletContext } from "react-router-dom";
import "./Home.css";
import heroImage from "../assets/home.webp";
import bgImage from "../assets/bg.webp";
import siteImage from "../assets/lbg.jpg";

function StaffHome() {
  const { authUser, loading, staffMetrics } = useOutletContext();

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
              <h1>Staff Registration, Work Orders, Task Updates, Performance</h1>
              <p className="lead-text">
                This staff panel is focused only on the core team workflow you
                need.
              </p>

              <div className="hero-profile">
                <h3>Welcome, {authUser?.name || "Staff"}</h3>
                <p>
                  Logged in as <b>{authUser?.role || "staff"}</b> |{" "}
                  <b>{authUser?.email || "-"}</b>
                </p>
                <div className="d-flex flex-wrap gap-2 mt-3">
                  <Link to="/staff/work-orders" className="btn btn-success btn-lg">
                    Work Orders
                  </Link>
                  <Link
                    to="/staff/task-updates"
                    className="btn btn-outline-light btn-lg"
                  >
                    Task Updates
                  </Link>
                  <Link
                    to="/staff/performance"
                    className="btn btn-outline-light btn-lg"
                  >
                    Performance
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="hero-side-card">
                <h3>Quick Summary</h3>
                <ul>
                  <li>
                    Assigned Orders:{" "}
                    <strong>{loading ? "Loading..." : staffMetrics.assignedOrders}</strong>
                  </li>
                  <li>
                    Pending Orders:{" "}
                    <strong>{loading ? "Loading..." : staffMetrics.pendingOrders}</strong>
                  </li>
                  <li>
                    In Progress Tasks:{" "}
                    <strong>{loading ? "Loading..." : staffMetrics.inProgressTasks}</strong>
                  </li>
                  <li>
                    Task Completion Rate:{" "}
                    <strong>
                      {loading ? "Loading..." : `${staffMetrics.taskCompletionRate}%`}
                    </strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="section container-xl">
        <div className="section-head">
          <h2>Core Staff Features</h2>
          <p>Only the modules needed for staff workflow.</p>
        </div>
        <div className="row g-3">
          <div className="col-md-6 col-xl-3">
            <article className="product-card h-100">
              <img src={bgImage} alt="Staff access" className="card-image" />
              <h3>Staff Registration and Login</h3>
              <p>Staff access continues through the existing signup and login system.</p>
            </article>
          </div>
          <div className="col-md-6 col-xl-3">
            <article className="product-card h-100">
              <img src={siteImage} alt="Work orders" className="card-image" />
              <h3>Work Order Assignment</h3>
              <p>Staff can see only the work orders assigned to them.</p>
            </article>
          </div>
          <div className="col-md-6 col-xl-3">
            <article className="product-card h-100">
              <img src={heroImage} alt="Task updates" className="card-image" />
              <h3>Task Status Updates</h3>
              <p>Staff can add task logs and update status as work progresses.</p>
            </article>
          </div>
          <div className="col-md-6 col-xl-3">
            <article className="product-card h-100">
              <img src={bgImage} alt="Performance tracking" className="card-image" />
              <h3>Performance Tracking</h3>
              <p>Performance is shown through work order completion and task progress.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

export default StaffHome;
