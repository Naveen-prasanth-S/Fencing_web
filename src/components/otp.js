import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/apiBaseUrl";
import "./Otp.css";

export default function Otp() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    const email = localStorage.getItem("signupEmail");

    if (enteredOtp.length !== 6) {
      alert("Please enter valid OTP");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });

      const data = await res.json();

      if (data.success) {
        alert("OTP verified successfully");
        localStorage.removeItem("signupEmail");
        navigate("/login");
      } else {
        alert("Invalid OTP");
      }
    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-box">
        <h2>OTP Verification</h2>
        <p>Enter the 6-digit code sent to your email</p>

        <div className="otp-inputs">
          {otp.map((data, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={data}
              onChange={(e) => handleChange(e.target.value, index)}
            />
          ))}
        </div>

        <button className="verify-btn" onClick={handleVerify}>
          Verify OTP
        </button>

        <p className="resend">
          {timeLeft > 0 ? (
            <>Resend OTP in <b>{timeLeft}s</b></>
          ) : (
            <span onClick={() => setTimeLeft(60)} style={{ cursor: "pointer" }}>
              Resend OTP
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
