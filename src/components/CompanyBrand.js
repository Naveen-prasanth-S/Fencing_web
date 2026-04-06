import { Link } from "react-router-dom";
import companyLogo from "../assets/athanuramman-logo.png";
import { COMPANY_PROFILE } from "../data/companyProfile";
import "./CompanyIdentity.css";

function CompanyBrand() {
  return (
    <Link to="/" className="brand-link navbar-brand mb-0 text-decoration-none">
      <img
        src={companyLogo}
        alt={`${COMPANY_PROFILE.name} logo`}
        className="brand-logo"
      />
      <span className="brand-copy">{COMPANY_PROFILE.name}</span>
    </Link>
  );
}

export default CompanyBrand;
