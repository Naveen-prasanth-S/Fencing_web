import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import bgImage from "../assets/bg.webp";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { API_BASE_URL } from "../services/apiBaseUrl";
const NAME_REGEX = /^[A-Za-z ]{3,50}$/;
const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export default function Signup() {
  const navigate = useNavigate();

  const [isStaff, setIsStaff] = useState(false);

  // Separate forms
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Separate errors
  const [adminErrors, setAdminErrors] = useState({});
  const [staffErrors, setStaffErrors] = useState({});

  // Eye toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = isStaff ? staffForm : adminForm;
  const errors = isStaff ? staffErrors : adminErrors;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (isStaff) {
      setStaffForm({ ...staffForm, [name]: value });
      setStaffErrors({ ...staffErrors, [name]: "" });
    } else {
      setAdminForm({ ...adminForm, [name]: value });
      setAdminErrors({ ...adminErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const e = {};

    if (!form.name.trim()) e.name = "Name is required";
    else if (!NAME_REGEX.test(form.name.trim()))
      e.name = "Name must be 3-50 letters only";

    if (!form.email) e.email = "Email is required";
    else if (!GMAIL_REGEX.test(form.email.trim()))
      e.email = "Email must be a valid @gmail.com address";

    if (!form.password) e.password = "Password is required";
    else if (!PASSWORD_REGEX.test(form.password))
      e.password =
        "Password must contain 1 capital, 1 small, 1 number & 1 special character";

    if (!form.confirmPassword)
      e.confirmPassword = "Confirm your password";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    isStaff ? setStaffErrors(e) : setAdminErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: isStaff ? "staff" : "admin",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || "Signup failed");
        return;
      }

      alert(`${isStaff ? "Staff" : "Admin"} account created successfully`);
      navigate("/login");
    } catch (_error) {
      alert("Unable to create the account right now. Please try again.");
    }
  };

  return (
    <div
      className="page"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bgImage})`,
      }}
    >
      <div className="signup-card">
        <h2 className="signup-title">{isStaff ? "Staff" : "Admin"} Signup</h2>

        <div className="role-switch">
          <button
            type="button"
            className={`role-btn ${!isStaff ? "active" : ""}`}
            onClick={() => setIsStaff(false)}
          >
            Admin
          </button>
          <button
            type="button"
            className={`role-btn ${isStaff ? "active" : ""}`}
            onClick={() => setIsStaff(true)}
          >
            Staff
          </button>
        </div>

        <div className="field">
          <input
            name="name"
            placeholder={isStaff ? "Staff Name" : "Admin Name"}
            value={form.name}
            onChange={handleChange}
          />
          <span className="error-text">{errors.name}</span>
        </div>

        <div className="field">
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <span className="error-text">{errors.email}</span>
        </div>

        <div className="field">
          <div className="password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            <span
              className="toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <span className="error-text">{errors.password}</span>
        </div>

        <div className="field">
          <div className="password-wrap">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            <span
              className="toggle-eye"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <span className="error-text">{errors.confirmPassword}</span>
        </div>

        <button className="submit" onClick={handleSignup}>
          Signup
        </button>

        <p className="login-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

