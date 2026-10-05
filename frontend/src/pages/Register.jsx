import API_URL from "../api";
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setMessage("All fields are required.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${API_URL}/register.php`,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Registration response:", response.data);

      if (response.data?.success === true) {
        // Registration successful
        window.location.href = "/login";
        return;
      }

      setMessage(
        response.data?.message || "Registration failed."
      );

    } catch (error) {
  console.error("Registration error:", error);

  const data = error.response?.data;

  setMessage(
    data?.error ||
    data?.message ||
    error.message ||
    "Unable to create account. Please try again."
  );
}finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <div className="auth-icon">
            👤
          </div>

          <p className="auth-tag">
            CIVICAI • CITIZEN ACCOUNT
          </p>

          <h1>
            Create Account
          </h1>

          <p>
            Create your account to submit, manage and
            track your civic grievances.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="auth-field">
            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />

            <small className="password-hint">
              Use a password that is difficult for others
              to guess.
            </small>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-spinner"></span>
                Creating Account...
              </>
            ) : (
              "Create Account →"
            )}
          </button>

        </form>

        {message && (
          <div className="auth-error">
            <strong>
              Registration Failed
            </strong>

            <p>
              {message}
            </p>
          </div>
        )}

        <div className="auth-footer">
          <span>
            Already have an account?
          </span>{" "}

          <Link to="/login">
            Login
          </Link>
        </div>

        <div className="auth-security">
          🔒 Your account information is securely handled.
        </div>

      </div>
    </div>
  );
}

export default Register;