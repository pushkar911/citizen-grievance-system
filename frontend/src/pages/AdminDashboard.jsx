import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
  const savedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    user = null;
  }

  const [grievances, setGrievances] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadGrievances = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:8000/api/admin_grievances.php"
      );

      if (response.data.success) {
        setGrievances(response.data.grievances || []);
        setMessage("");
      } else {
        setMessage(
          response.data.message || "Failed to load grievances."
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to load grievances.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrievances();
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "department") {
    return <Navigate to="/department" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const updateGrievance = async (
    grievanceId,
    status,
    resolution
  ) => {
    try {
      setUpdatingId(grievanceId);
      setMessage("");

      const response = await axios.put(
        "http://localhost:8000/api/admin_grievances.php",
        {
          grievanceId,
          status,
          resolution,
        }
      );

      if (response.data.success) {
        setMessage("Grievance updated successfully.");
        await loadGrievances();
      } else {
        setMessage(
          response.data.message || "Update failed."
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to update grievance.");
    } finally {
      setUpdatingId(null);
    }
  };

  const totalGrievances = grievances.length;

  const submittedCount = grievances.filter(
    (g) => g.status === "Submitted"
  ).length;

  const progressCount = grievances.filter(
    (g) => g.status === "In Progress"
  ).length;

  const resolvedCount = grievances.filter(
    (g) => g.status === "Resolved"
  ).length;

  const highPriorityCount = grievances.filter(
    (g) => g.priority === "High"
  ).length;

  const activeCases =
    submittedCount + progressCount;

  const resolutionRate =
    totalGrievances > 0
      ? Math.round(
          (resolvedCount / totalGrievances) * 100
        )
      : 0;

  const getStatusClass = (status) => {
    if (status === "Resolved") {
      return "admin-status resolved";
    }

    if (status === "In Progress") {
      return "admin-status progress";
    }

    return "admin-status submitted";
  };

  const getPriorityClass = (priority) => {
    if (priority === "High") {
      return "admin-priority high";
    }

    return "admin-priority medium";
  };

  return (
    <div className="admin-page">

      {/* HEADER */}

      <div className="admin-header">
        <div>
          <p className="admin-tag">
            CIVICAI • ADMINISTRATION
          </p>

          <h1>Admin Dashboard</h1>

          <p className="admin-subtitle">
            Manage all citizen grievances, monitor departments,
            update their status, and provide resolution details.
          </p>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={loadGrievances}
          disabled={loading}
        >
          ↻ {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>


      {/* MESSAGE */}

      {message && (
        <div className="admin-message">
          {message}
        </div>
      )}


      {/* STATISTICS */}

      <div className="admin-stats">

        <div className="admin-stat-card">
          <span className="admin-stat-label">
            TOTAL GRIEVANCES
          </span>

          <strong>{totalGrievances}</strong>

          <p>All submitted complaints</p>
        </div>


        <div className="admin-stat-card">
          <span className="admin-stat-label">
            SUBMITTED
          </span>

          <strong>{submittedCount}</strong>

          <p>Awaiting action</p>
        </div>


        <div className="admin-stat-card">
          <span className="admin-stat-label">
            IN PROGRESS
          </span>

          <strong>{progressCount}</strong>

          <p>Currently being handled</p>
        </div>


        <div className="admin-stat-card">
          <span className="admin-stat-label">
            RESOLVED
          </span>

          <strong>{resolvedCount}</strong>

          <p>Successfully completed</p>
        </div>

      </div>


      {/* SUMMARY */}

      <div className="admin-overview">

        <div>
          <span>HIGH PRIORITY</span>
          <strong>{highPriorityCount}</strong>
        </div>

        <div>
          <span>RESOLUTION RATE</span>
          <strong>{resolutionRate}%</strong>
        </div>

        <div>
          <span>ACTIVE CASES</span>
          <strong>{activeCases}</strong>
        </div>

      </div>


      {/* GRIEVANCES */}

      <div className="admin-section-header">

        <div>
          <p className="admin-tag">
            CASE MANAGEMENT
          </p>

          <h2>All Citizen Grievances</h2>
        </div>

        <span>
          {totalGrievances}{" "}
          {totalGrievances === 1 ? "case" : "cases"}
        </span>

      </div>


      {/* LOADING */}

      {loading && grievances.length === 0 ? (

        <div className="admin-empty">
          <div className="admin-loader"></div>

          <h3>Loading grievances...</h3>

          <p>
            Please wait while the latest cases are loaded.
          </p>
        </div>

      ) : grievances.length === 0 ? (

        <div className="admin-empty">

          <div className="admin-empty-icon">
            ✓
          </div>

          <h3>No grievances found</h3>

          <p>
            New citizen grievances will appear here.
          </p>

        </div>

      ) : (

        <div className="admin-grievances">

          {grievances.map((grievance) => (

            <div
              key={grievance.grievanceId}
              className="admin-grievance-card"
            >

              {/* CARD HEADER */}

              <div className="admin-card-header">

                <div>
                  <span className="admin-case-id">
                    {grievance.grievanceId}
                  </span>

                  <h3>
                    {grievance.title}
                  </h3>
                </div>

                <span
                  className={getStatusClass(
                    grievance.status
                  )}
                >
                  {grievance.status}
                </span>

              </div>


              {/* DESCRIPTION */}

              <div className="admin-description">

                <span>Description</span>

                <p>
                  {grievance.description}
                </p>

              </div>


              {/* INFORMATION */}

              <div className="admin-info-grid">

                <div>
                  <span>Location</span>

                  <strong>
                    📍 {grievance.location}
                  </strong>
                </div>

                <div>
                  <span>Category</span>

                  <strong>
                    {grievance.category}
                  </strong>
                </div>

                <div>
                  <span>Priority</span>

                  <strong
                    className={getPriorityClass(
                      grievance.priority
                    )}
                  >
                    {grievance.priority}
                  </strong>
                </div>

                <div>
                  <span>Department</span>

                  <strong>
                    {grievance.department}
                  </strong>
                </div>

              </div>


              {/* ADMIN CONTROLS */}

              <div className="admin-controls">

                <div className="admin-control">

                  <label>
                    Update Status
                  </label>

                  <select
                    value={grievance.status}
                    disabled={
                      updatingId ===
                      grievance.grievanceId
                    }
                    onChange={(e) =>
                      updateGrievance(
                        grievance.grievanceId,
                        e.target.value,
                        grievance.resolution || ""
                      )
                    }
                  >

                    <option value="Submitted">
                      Submitted
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Resolved">
                      Resolved
                    </option>

                  </select>

                </div>


                <div className="admin-control">

                  <label>
                    Resolution
                  </label>

                  <textarea
                    placeholder="Enter resolution details..."
                    defaultValue={
                      grievance.resolution || ""
                    }
                    disabled={
                      updatingId ===
                      grievance.grievanceId
                    }
                    onBlur={(e) =>
                      updateGrievance(
                        grievance.grievanceId,
                        grievance.status,
                        e.target.value
                      )
                    }
                  />

                  <small>
                    Resolution is saved when you leave
                    the text field.
                  </small>

                </div>

              </div>


              {updatingId ===
                grievance.grievanceId && (
                <div className="admin-updating">
                  Updating grievance...
                </div>
              )}

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default AdminDashboard;