import API_URL from "../api";
import { useEffect, useState } from "react";
import axios from "axios";

function DepartmentDashboard() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const savedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    user = null;
  }

  const loadGrievances = async () => {
    if (!user?.department) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
`${API_URL}/department_grievances.php`,     {
          params: {
            department: user.department,
          },
        }
      );

      if (response.data.success) {
        setGrievances(
          response.data.grievances || []
        );

        setMessage("");
      } else {
        setMessage(
          response.data.message ||
            "Unable to load grievances."
        );
      }
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to load grievances."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrievances();
  }, []);

  const updateStatus = async (
    grievanceId,
    status
  ) => {
    try {
      setUpdatingId(grievanceId);
      setMessage("");

      const response = await axios.put(
        `${API_URL}/department_grievances.php`,
        {
          grievanceId,
          status,
          department: user.department,
        }
      );

      if (response.data.success) {
        setMessage(
          "Status updated successfully."
        );

        await loadGrievances();
      } else {
        setMessage(
          response.data.message ||
            "Unable to update status."
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Server error while updating status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (
    !user ||
    user.role !== "department"
  ) {
    return (
      <div className="department-page">
        <div className="department-access-denied">
          <h2>Access Denied</h2>

          <p>
            Only department officers can access
            this page.
          </p>
        </div>
      </div>
    );
  }

  const totalCases = grievances.length;

  const submittedCount =
    grievances.filter(
      (g) => g.status === "Submitted"
    ).length;

  const progressCount =
    grievances.filter(
      (g) => g.status === "In Progress"
    ).length;

  const resolvedCount =
    grievances.filter(
      (g) => g.status === "Resolved"
    ).length;

  const getStatusClass = (status) => {
    if (status === "Resolved") {
      return "department-status resolved";
    }

    if (status === "In Progress") {
      return "department-status progress";
    }

    return "department-status submitted";
  };

  const getPriorityClass = (priority) => {
    if (priority === "High") {
      return "department-priority high";
    }

    return "department-priority medium";
  };

  return (
    <div className="department-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="department-header">

        <div>
          <p className="department-tag">
            CIVICAI • DEPARTMENT PORTAL
          </p>

          <h1>{user.department}</h1>

          <p className="department-subtitle">
            Manage grievances assigned to your
            department.
          </p>
        </div>

      </div>


      {/* =========================================
          MESSAGE
      ========================================= */}

      {message && (
        <div className="department-message">
          {message}
        </div>
      )}


      {/* =========================================
          STATISTICS
      ========================================= */}

      <div className="department-stats">

        <div className="department-stat-card">
          <span>TOTAL CASES</span>
          <strong>{totalCases}</strong>
        </div>

        <div className="department-stat-card">
          <span>SUBMITTED</span>
          <strong>{submittedCount}</strong>
        </div>

        <div className="department-stat-card">
          <span>IN PROGRESS</span>
          <strong>{progressCount}</strong>
        </div>

        <div className="department-stat-card">
          <span>RESOLVED</span>
          <strong>{resolvedCount}</strong>
        </div>

      </div>


      {/* =========================================
          SECTION HEADER
      ========================================= */}

      <div className="department-section-header">

        <div>
          <p className="department-section-tag">
            CASE MANAGEMENT
          </p>

          <h2>
            Department Grievances
          </h2>
        </div>

        <button
          className="department-refresh-btn"
          onClick={loadGrievances}
          disabled={loading}
        >
          ↻ {loading ? "Refreshing..." : "Refresh"}
        </button>

      </div>


      {/* =========================================
          LOADING
      ========================================= */}

      {loading ? (

        <div className="department-empty">
          <h3>Loading grievances...</h3>

          <p>
            Please wait while the latest cases
            are loaded.
          </p>
        </div>

      ) : grievances.length === 0 ? (

        <div className="department-empty">

          <div className="department-empty-icon">
            ✓
          </div>

          <h3>
            No grievances assigned
          </h3>

          <p>
            New grievances assigned to your
            department will appear here.
          </p>

        </div>

      ) : (

        <div className="department-grievances">

          {grievances.map((grievance) => (

            <div
              className="department-card"
              key={grievance.grievanceId}
            >

              {/* CARD HEADER */}

              <div className="department-card-header">

                <div>

                  <span className="department-case-id">
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

              <div className="department-description">

                <span>
                  DESCRIPTION
                </span>

                <p>
                  {grievance.description}
                </p>

              </div>


              {/* INFORMATION GRID */}

              <div className="department-info-grid">

                <div className="department-info-box">

                  <span>
                    Location
                  </span>

                  <strong>
                    📍 {grievance.location}
                  </strong>

                </div>


                <div className="department-info-box">

                  <span>
                    Category
                  </span>

                  <strong>
                    {grievance.category}
                  </strong>

                </div>


                <div className="department-info-box">

                  <span>
                    Priority
                  </span>

                  <strong
                    className={getPriorityClass(
                      grievance.priority
                    )}
                  >
                    {grievance.priority}
                  </strong>

                </div>


                <div className="department-info-box">

                  <span>
                    Department
                  </span>

                  <strong>
                    {grievance.department}
                  </strong>

                </div>

              </div>


              {/* STATUS CONTROL */}

              <div className="department-action">

                <div>

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
                      updateStatus(
                        grievance.grievanceId,
                        e.target.value
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


                {updatingId ===
                  grievance.grievanceId && (

                  <span className="department-updating">
                    Updating...
                  </span>

                )}

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default DepartmentDashboard;