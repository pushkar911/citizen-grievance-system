import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  let user = null;

  const savedUser = localStorage.getItem("user");

  if (savedUser) {
    try {
      user = JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("user");
      user = null;
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        Civic<span>Resolve</span>
      </Link>

      <div className="nav-links">

        <Link to="/">Home</Link>

        <Link to="/submit">Submit Grievance</Link>

        <Link to="/track">Track Grievance</Link>

        {/* Department Dashboard */}
        {user?.role === "department" && (
          <Link to="/department">
            Department Dashboard
          </Link>
        )}

        {/* Admin Dashboard */}
        {user?.role === "admin" && (
          <Link to="/admin">
            Admin Dashboard
          </Link>
        )}

        {!user ? (
          <Link to="/login">Login</Link>
        ) : (
          <>
            <span className="nav-user">
              Welcome, {user.name}
            </span>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}

      </div>
    </nav>
  );
}

export default Navbar;