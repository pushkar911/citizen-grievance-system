import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function MyGrievances() {
  const navigate = useNavigate();

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGrievances = async () => {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        navigate("/login");
        return;
      }

      let user;

      try {
        user = JSON.parse(savedUser);
      } catch {
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!user?.id) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8000/api/my_grievances.php",
          {
            params: {
              userId: user.id,
            },
          }
        );

        if (response.data.success) {
          setGrievances(response.data.grievances || []);
        } else {
          setError(
            response.data.message || "Unable to load grievances."
          );
        }
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    loadGrievances();
  }, [navigate]);

  const getStatusClass = (status) => {
    const value = status?.toLowerCase();

    if (value === "resolved") return "status-resolved";
    if (value === "in progress") return "status-progress";
    if (value === "rejected") return "status-rejected";

    return "status-submitted";
  };

  const getPriorityClass = (priority) => {
    const value = priority?.toLowerCase();

    if (value === "high") return "priority-high";
    if (value === "low") return "priority-low";

    return "priority-medium";
  };

  if (loading) {
    return (
      <div className="my-grievances-page">
        <div className="my-grievances-container">
          <div className="my-grievances-loading">
            Loading your grievances...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-grievances-page">
      <div className="my-grievances-container">

        <div className="my-grievances-header">
          <div>
            <span className="page-label">CITIZEN PORTAL</span>

            <h1>My Grievances</h1>

            <p>
              View and track all the grievances you have submitted.
            </p>
          </div>

          <Link
            to="/submit"
            className="new-grievance-btn"
          >
            + Submit New Grievance
          </Link>
        </div>

        {error && (
          <div className="my-grievances-error">
            {error}
          </div>
        )}

        {!error && grievances.length === 0 && (
          <div className="no-grievances">
            <div className="no-grievances-icon">
              📋
            </div>

            <h2>No grievances yet</h2>

            <p>
              You have not submitted any grievances.
            </p>

            <Link
              to="/submit"
              className="new-grievance-btn"
            >
              Submit Your First Grievance
            </Link>
          </div>
        )}

        {grievances.length > 0 && (
          <>
            <div className="grievance-summary">
              <div className="summary-box">
                <span>Total Grievances</span>
                <strong>{grievances.length}</strong>
              </div>

              <div className="summary-box">
                <span>Submitted</span>
                <strong>
                  {
                    grievances.filter(
                      (g) =>
                        g.status?.toLowerCase() ===
                        "submitted"
                    ).length
                  }
                </strong>
              </div>

              <div className="summary-box">
                <span>In Progress</span>
                <strong>
                  {
                    grievances.filter(
                      (g) =>
                        g.status?.toLowerCase() ===
                        "in progress"
                    ).length
                  }
                </strong>
              </div>

              <div className="summary-box">
                <span>Resolved</span>
                <strong>
                  {
                    grievances.filter(
                      (g) =>
                        g.status?.toLowerCase() ===
                        "resolved"
                    ).length
                  }
                </strong>
              </div>
            </div>

            <div className="grievance-list">
              {grievances.map((grievance) => (
                <div
                  className="grievance-card"
                  key={grievance.grievanceId}
                >
                  <div className="grievance-card-top">

                    <div>
                      <span className="grievance-id">
                        {grievance.grievanceId}
                      </span>

                      <h2>
                        {grievance.title}
                      </h2>
                    </div>

                    <div className="grievance-badges">
                      <span
                        className={`priority-badge ${getPriorityClass(
                          grievance.priority
                        )}`}
                      >
                        {grievance.priority}
                      </span>

                      <span
                        className={`status-badge ${getStatusClass(
                          grievance.status
                        )}`}
                      >
                        {grievance.status}
                      </span>
                    </div>
                  </div>

                  <div className="grievance-card-details">

                    <div>
                      <span>Category</span>
                      <strong>
                        {grievance.category}
                      </strong>
                    </div>

                    <div>
                      <span>Department</span>
                      <strong>
                        {grievance.department}
                      </strong>
                    </div>

                    <div>
                      <span>Location</span>
                      <strong>
                        {grievance.location || "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Submitted On</span>
                      <strong>
                        {grievance.createdAt
                          ? new Date(
                              grievance.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "N/A"}
                      </strong>
                    </div>

                  </div>

                  {grievance.resolution && (
                    <div className="grievance-resolution">
                      <span>Resolution</span>
                      <p>
                        {grievance.resolution}
                      </p>
                    </div>
                  )}

                  <div className="grievance-card-footer">

                    <span>
                      ID: {grievance.grievanceId}
                    </span>

                    <Link
                      to={`/track?grievanceId=${encodeURIComponent(
                        grievance.grievanceId
                      )}`}
                      className="track-grievance-btn"
                    >
                      Track Grievance →
                    </Link>

                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default MyGrievances;