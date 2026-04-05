import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Home.css";
import heroImage from "../assets/home.webp";
import bgImage from "../assets/bg.webp";
import siteImage from "../assets/lbg.jpg";
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
              <div className="hero-side-card">
                <h3>Quick Highlights</h3>
                <ul>
                  <li>Residential and commercial fencing</li>
                  <li>Custom gates and designs</li>
                  <li>On-time installation</li>
                  <li>Post-service support</li>
                </ul>
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
          <h2>Fence Types We Provide</h2>
          <p>Simple options for different property needs.</p>
        </div>
        <div className="row g-3">
          <div className="col-md-6 col-xl-3">
            <article className="product-card h-100">
              <img src={bgImage} alt="Chain link fencing" className="card-image" />
              <h3>Chain Link Fencing</h3>
              <p>Affordable and durable for wide boundary coverage.</p>
            </article>
          </div>
          <div className="col-md-6 col-xl-3">
            <article className="product-card h-100">
              <img src={siteImage} alt="Wooden fencing" className="card-image" />
              <h3>Wooden Fencing</h3>
              <p>Classic style for homes and garden privacy.</p>
            </article>
          </div>
          <div className="col-md-6 col-xl-3">
            <article className="product-card h-100">
              <img src={heroImage} alt="Metal fencing" className="card-image" />
              <h3>Metal Fencing</h3>
              <p>High-security option with long service life.</p>
            </article>
          </div>
          <div className="col-md-6 col-xl-3">
            <article className="product-card h-100">
              <img src={bgImage} alt="Custom gate work" className="card-image" />
              <h3>Customized Gate Works</h3>
              <p>Custom gates that match your fence design.</p>
            </article>
          </div>
        </div>
      </section>

      <footer id="contact" className="footer">
        <div className="container-xl">
          <div className="row g-3 align-items-start">
            <div className="col-lg-5">
              <h3 className="footer-title">ATHANURAMMAN FENCINGS</h3>
              <p className="footer-text mb-2">
                Professional fencing solutions for homes, commercial spaces, and
                industrial sites.
              </p>
              <p className="footer-text mb-0">
                Address: 24/7 Industrial Road, Coimbatore, Tamil Nadu 641021
              </p>
            </div>

            <div className="col-lg-4">
              <h4 className="footer-subtitle">Contact</h4>
              <p className="footer-text mb-1">Phone: +91 98765 43210</p>
              <p className="footer-text mb-1">Alt Phone: +91 91234 56789</p>
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
          <p className="footer-copy mb-0">
            &copy; {new Date().getFullYear()} ATHANURAMMAN FENCINGS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
