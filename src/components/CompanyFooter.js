import { COMPANY_PROFILE } from "../data/companyProfile";
import "./CompanyIdentity.css";

function CompanyFooter() {
  return (
    <footer id="contact" className="footer">
      <div className="container-xl">
        <div className="row g-3 align-items-start">
          <div className="col-lg-3">
            <h3 className="footer-title">{COMPANY_PROFILE.name}</h3>
            <p className="footer-text mb-0">{COMPANY_PROFILE.summary}</p>
          </div>

          <div className="col-lg-4">
            <h4 className="footer-subtitle">Office Address</h4>
            <div className="company-footer-address">
              <p className="footer-text mb-0">
                <span className="company-footer-label">HEAD OFFICE:</span>{" "}
                {COMPANY_PROFILE.headOffice}
              </p>
              <p className="footer-text mb-0">
                <span className="company-footer-label">BRANCH:</span>{" "}
                {COMPANY_PROFILE.branch}
              </p>
            </div>
          </div>

          <div className="col-lg-2">
            <h4 className="footer-subtitle">Company Details</h4>
            <div className="company-footer-meta">
              <p className="footer-text mb-0">
                <span className="company-footer-label">Mobile:</span>{" "}
                {COMPANY_PROFILE.mobile}
              </p>
              <p className="footer-text mb-0">
                <span className="company-footer-label">GSTIN:</span>{" "}
                {COMPANY_PROFILE.gstin}
              </p>
            </div>
          </div>

          <div className="col-lg-3">
            <h4 className="footer-subtitle">Connect</h4>
            <div className="social-links">
              {COMPANY_PROFILE.socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <h4 className="footer-subtitle mt-3">Unit Locations</h4>
            <div className="social-links">
              {COMPANY_PROFILE.unitLocations.map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <hr className="footer-line" />
        <p className="footer-copy mb-0">
          &copy; {new Date().getFullYear()} {COMPANY_PROFILE.name}. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}

export default CompanyFooter;
