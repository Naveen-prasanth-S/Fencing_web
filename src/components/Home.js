import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Home.css";
import heroImage from "../assets/home.webp";
import bgImage from "../assets/bg.webp";
import siteImage from "../assets/lbg.jpg";
import CompanyFooter from "./CompanyFooter";
import SiteNavbar from "./SiteNavbar";

function Home() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const rawUser = sessionStorage.getItem("authUser");
    if (!rawUser) return;
    try {
      const parsed = JSON.parse(rawUser);
      if (parsed?.role === "staff") {
        navigate("/staff/home", { replace: true });
        return;
      }
      setAuthUser(parsed);
    } catch (_error) {
      sessionStorage.removeItem("authUser");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("authUser");
    setAuthUser(null);
  };

  return (
    <div className="site">
      <SiteNavbar
        authUser={authUser}
        onLogout={handleLogout}
        collapseId="homeNavbar"
      />

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
              <p className="eyebrow">Trusted Fencing Company</p>
              <h1>Strong, Secure, and Stylish Fencing for Homes and Businesses</h1>
              <p className="lead-text">
                Professional fencing solutions with quality materials and clean installation.
              </p>

              {authUser ? (
                <div className="hero-profile">
                  <h3>Welcome back, {authUser?.name || "User"}</h3>
                  <p>
                    Signed in as <b>{authUser?.role || "staff"}</b> |{" "}
                    <b>{authUser?.email || "-"}</b>
                  </p>
                  <div className="hero-profile-actions">
                    <button type="button" className="btn btn-success btn-sm">Account Active</button>
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2 mt-3">
                  <Link to="/login" className="btn btn-success btn-lg">Get Started</Link>
                  <Link to="/signup" className="btn btn-outline-light btn-lg">Create Account</Link>
                </div>
              )}
            </div>

            <div className="col-lg-5">
              <div className="hero-proof-list">
                <div className="hero-proof-item">
                  <strong>Site Visit</strong>
                  <span>Clear measurements before work starts</span>
                </div>
                <div className="hero-proof-item">
                  <strong>Material Ready</strong>
                  <span>Stock, orders, and billing managed in one flow</span>
                </div>
                <div className="hero-proof-item">
                  <strong>Team Follow-up</strong>
                  <span>Staff updates and vehicle links stay connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="section container-xl">
        <div className="section-head">
          <h2>About Our Company</h2>
          <p>Building safe boundaries with reliable workmanship.</p>
        </div>
        <div className="row g-3 align-items-stretch">
          <div className="col-lg-7">
            <article className="about-card h-100">
              <h3>Who We Are</h3>
              <p>
                We provide fencing for homes, offices, and industrial spaces.
              </p>
              <p>
                Our team supports you from site visit to final installation.
              </p>
            </article>
          </div>
          <div className="col-lg-5">
            <div className="gallery-grid h-100">
              <img src={heroImage} alt="Fencing project overview" />
              <img src={bgImage} alt="Fencing materials and stock area" />
              <img src={siteImage} alt="Fencing site operations" />
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="section container-xl">
        <div className="section-head">
          <h2>Fencing Work We Handle</h2>
          <p>Practical fencing support from material planning to installation.</p>
        </div>
        <div className="row g-3">
          <div className="col-md-4">
            <article className="product-card h-100">
              <img src={heroImage} alt="Completed fencing boundary" className="card-image" />
              <h3>Boundary Fencing</h3>
              <p>Strong boundary work for homes, farms, offices, and industrial sites.</p>
            </article>
          </div>
          <div className="col-md-4">
            <article className="product-card h-100">
              <img src={bgImage} alt="Fencing stock materials" className="card-image" />
              <h3>Material Planning</h3>
              <p>Stock quantities, reorder needs, and work orders stay easy to track.</p>
            </article>
          </div>
          <div className="col-md-4">
            <article className="product-card h-100">
              <img src={siteImage} alt="Fencing site work" className="card-image" />
              <h3>Site Installation</h3>
              <p>Staff assignments and task updates support clean on-site execution.</p>
            </article>
          </div>
        </div>
      </section>

      <CompanyFooter />
    </div>
  );
}

export default Home;
