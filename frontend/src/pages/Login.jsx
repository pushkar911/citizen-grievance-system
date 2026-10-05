import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/login.php",
        formData
      );

      if (response.data.success) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );

        navigate("/");
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* HEADER */}
        <div className="auth-header">


          <p className="auth-tag">
            CIVICAI • ACCOUNT
          </p>

          <h1>
            Welcome Back
          </h1>

          <p>
            Login to access your CivicAI account
            and manage your grievances.
          </p>

        </div>


        {/* FORM */}
        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
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


          {/* PASSWORD */}
          <div className="auth-field">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />

          </div>


          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-spinner"></span>
                Logging in...
              </>
            ) : (
              "Login →"
            )}
          </button>

        </form>


        {/* ERROR */}
        {message && (
          <div className="auth-error">
            <strong>
              Login Failed
            </strong>

            <p>
              {message}
            </p>
          </div>
        )}


        {/* REGISTER */}
        <div className="auth-footer">

          <span>
            Don't have an account?
          </span>{" "}

          <Link to="/register">
            Create Account
          </Link>

        </div>


        {/* SECURITY INFO */}
        <div className="auth-security">
          🔒 Your account information is securely handled.
        </div>

      </div>

    </div>
  );
}

export default Login;