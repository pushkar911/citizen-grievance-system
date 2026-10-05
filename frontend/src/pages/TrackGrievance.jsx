import API_URL from "../api";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

function TrackGrievance() {
  const [grievanceId, setGrievanceId] = useState("");
  const [grievances, setGrievances] = useState([]);
  const [loadingGrievances, setLoadingGrievances] = useState(true);

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef(null);
  const resultRef = useRef(null);

  // ==========================================
  // LOAD USER'S GRIEVANCES
  // ==========================================

  useEffect(() => {
    const loadMyGrievances = async () => {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        setLoadingGrievances(false);
        return;
      }

      let user = null;

      try {
        user = JSON.parse(savedUser);
      } catch (err) {
        console.error("Invalid user:", err);
        setLoadingGrievances(false);
        return;
      }

      if (!user?.id) {
        setLoadingGrievances(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/my_grievances.php`,
          {
            params: {
              userId: user.id,
            },
          }
        );

        if (response.data.success) {
          setGrievances(response.data.grievances || []);
        }
      } catch (err) {
        console.error("Error loading grievances:", err);
      } finally {
        setLoadingGrievances(false);
      }
    };

    loadMyGrievances();
  }, []);

  // ==========================================
  // TRACK GRIEVANCE
  // ==========================================

  const trackGrievance = async (id = null) => {
    let selectedId = "";

    // 1. ID passed directly
    if (id !== null && id !== undefined) {
      selectedId = String(id).trim();
    }

    // 2. Read directly from input
    if (!selectedId && inputRef.current) {
      selectedId = String(inputRef.current.value || "").trim();
    }

    // 3. React state fallback
    if (!selectedId) {
      selectedId = String(grievanceId || "").trim();
    }

    console.log("================================");
    console.log("TRACK BUTTON CLICKED");
    console.log("ID:", selectedId);
    console.log("================================");

    // Only show required error if REALLY empty
    if (!selectedId) {
      setError("Please enter a grievance ID.");
      setGrievance(null);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return;
    }

    setLoading(true);
    setError("");
    setGrievance(null);

    try {
      const response = await axios.get(
        `${API_URL}/track_grievance.php`,
        {
          params: {
            grievanceId: selectedId,
          },
        }
      );

      console.log("TRACK RESPONSE:", response.data);

      if (response.data.success) {
        setGrievance(response.data.grievance);
        setGrievanceId(selectedId);
        setError("");

        setTimeout(() => {
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 200);
      } else {
        setError(
          response.data.message || "Grievance not found."
        );
      }
    } catch (err) {
      console.error("TRACK ERROR:", err);
      console.error("SERVER RESPONSE:", err.response?.data);

      setError(
        err.response?.data?.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "resolved") {
      return "status-resolved";
    }

    if (value === "in progress") {
      return "status-progress";
    }

    if (value === "rejected") {
      return "status-rejected";
    }

    return "status-submitted";
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="track-page">

      {/* HEADER */}

      <div className="track-header">
        <span className="track-label">
          CIVICAI • GRIEVANCE TRACKING
        </span>

        <h1>Track Your Grievance</h1>

        <p>
          Enter your unique grievance ID to check the
          current status, department and resolution.
        </p>
      </div>

      {/* USER GRIEVANCES */}

      {!loadingGrievances && grievances.length > 0 && (
        <div className="my-grievance-selector">

          <div className="my-grievance-selector-header">
            <div>
              <h2>Your Submitted Grievances</h2>

              <p>
                Select a grievance below to track its
                current status.
              </p>
            </div>

            <span className="grievance-count">
              {grievances.length}{" "}
              {grievances.length === 1
                ? "Grievance"
                : "Grievances"}
            </span>
          </div>

          <div className="grievance-id-list">

            {grievances.map((item) => {
              const itemId = String(
                item.grievanceId || ""
              ).trim();

              return (
                <button
                  type="button"
                  key={itemId}
                  className={`grievance-id-card ${
                    grievanceId === itemId
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {
                    setGrievanceId(itemId);
                    setError("");
                    trackGrievance(itemId);
                  }}
                >
                  <div className="grievance-id-info">
                    <strong>{itemId}</strong>

                    <span>
                      {item.title}
                    </span>
                  </div>

                  <div className="grievance-id-status">
                    <span
                      className={`mini-status ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>

                    <span className="arrow">
                      →
                    </span>
                  </div>
                </button>
              );
            })}

          </div>
        </div>
      )}

      {/* SEARCH */}

      <div className="track-search">

        <div className="track-input-wrapper">

          <span className="search-icon">
            🔎
          </span>

          <input
            ref={inputRef}
            type="text"
            value={grievanceId}
            onChange={(e) => {
              setGrievanceId(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();

                trackGrievance(
                  e.currentTarget.value
                );
              }
            }}
            placeholder="Enter your Grievance ID"
          />

        </div>

        <button
          type="button"
          className="track-button"
          disabled={loading}
          onClick={() => {
            trackGrievance();
          }}
        >
          {loading
            ? "Tracking..."
            : "Track Grievance →"}
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="track-error">
          {error}
        </div>
      )}

      {/* RESULT */}

      {grievance && (
        <div
          ref={resultRef}
          className="track-result"
        >

          <div className="track-result-header">

            <div>
              <span className="track-result-label">
                GRIEVANCE ID
              </span>

              <h2>
                {grievance.grievanceId}
              </h2>
            </div>

            <span
              className={`track-status ${getStatusClass(
                grievance.status
              )}`}
            >
              {grievance.status}
            </span>

          </div>

          <div className="track-timeline">

            <div
              className={`timeline-item ${
                grievance.status
                  ? "active"
                  : ""
              }`}
            >
              <div className="timeline-dot" />

              <div>
                <strong>
                  Submitted
                </strong>

                <span>
                  Grievance received
                </span>
              </div>
            </div>

            <div
              className={`timeline-item ${
                grievance.status ===
                  "In Progress" ||
                grievance.status ===
                  "Resolved"
                  ? "active"
                  : ""
              }`}
            >
              <div className="timeline-dot" />

              <div>
                <strong>
                  In Progress
                </strong>

                <span>
                  Department is handling
                  the grievance
                </span>
              </div>
            </div>

            <div
              className={`timeline-item ${
                grievance.status ===
                "Resolved"
                  ? "active"
                  : ""
              }`}
            >
              <div className="timeline-dot" />

              <div>
                <strong>
                  Resolved
                </strong>

                <span>
                  Grievance resolved
                </span>
              </div>
            </div>

          </div>

          {/* DETAILS */}

          <div className="track-details">

            <div>
              <span>Title</span>
              <strong>
                {grievance.title}
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
              <strong>
                {grievance.priority}
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
                {grievance.location}
              </strong>
            </div>

          </div>

          {/* DESCRIPTION */}

          <div className="track-description">
            <span>Description</span>

            <p>
              {grievance.description}
            </p>
          </div>

          {/* RESOLUTION */}

          {grievance.resolution && (
            <div className="track-resolution">

              <span>
                Resolution
              </span>

              <p>
                {grievance.resolution}
              </p>

            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default TrackGrievance;