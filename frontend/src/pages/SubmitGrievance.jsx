import API_URL from "../api";
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

// =====================================================
// DEFAULT LOCATION — MUMBAI
// =====================================================

const DEFAULT_POSITION = [19.076, 72.8777];


// =====================================================
// MAP CLICK COMPONENT
// =====================================================

function LocationMarker({
  position,
  setPosition,
  setFormData,
  setLocationVerified,
}) {
  useMapEvents({
    async click(e) {
      const latitude = e.latlng.lat;
      const longitude = e.latlng.lng;

      const newPosition = [
        latitude,
        longitude,
      ];

      setPosition(newPosition);

      try {
        // Reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );

        const data = await response.json();

        if (!data.display_name) {
          setLocationVerified(false);

          alert(
            "Unable to identify this location. Please select a valid location."
          );

          return;
        }

        setFormData((prev) => ({
          ...prev,

          location: data.display_name,

          latitude: latitude.toFixed(6),

          longitude: longitude.toFixed(6),
        }));

        setLocationVerified(true);

      } catch (error) {
        console.error(
          "Unable to verify map location:",
          error
        );

        setLocationVerified(false);

        alert(
          "Unable to verify this location. Please try again."
        );
      }
    },
  });

  return position ? (
    <Marker position={position} />
  ) : null;
}


// =====================================================
// MAIN COMPONENT
// =====================================================

function SubmitGrievance() {

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
  });

  const [mapPosition, setMapPosition] =
    useState(DEFAULT_POSITION);

  const [searchLocation, setSearchLocation] =
    useState("");

  const [searching, setSearching] =
    useState(false);

  const [locationVerified, setLocationVerified] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);


  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If location is manually changed,
    // it is no longer verified.
    if (name === "location") {
      setLocationVerified(false);
    }
  };


  // =====================================================
  // SEARCH LOCATION
  // =====================================================

  const searchPlace = async () => {

    if (!searchLocation.trim()) {
      alert("Please enter a location to search.");
      return;
    }

    setSearching(true);

    // Previous location is no longer considered verified
    // until the new search succeeds.
    setLocationVerified(false);

    try {

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          searchLocation
        )}`
      );

      const data = await response.json();

      if (!data.length) {

        alert(
          "Location not found. Please enter a valid area, landmark, or address."
        );

        setLocationVerified(false);

        return;
      }

      const latitude =
        parseFloat(data[0].lat);

      const longitude =
        parseFloat(data[0].lon);


      setMapPosition([
        latitude,
        longitude,
      ]);


      setFormData((prev) => ({
        ...prev,

        location:
          data[0].display_name,

        latitude:
          latitude.toFixed(6),

        longitude:
          longitude.toFixed(6),
      }));


      // Location successfully found
      setLocationVerified(true);

    } catch (error) {

      console.error(error);

      setLocationVerified(false);

      alert(
        "Unable to search for this location."
      );

    } finally {

      setSearching(false);
    }
  };


  // =====================================================
  // CURRENT LOCATION
  // =====================================================

  const useCurrentLocation = () => {

    if (!navigator.geolocation) {

      alert(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    setLocationVerified(false);

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        setMapPosition([
          latitude,
          longitude,
        ]);


        setFormData((prev) => ({
          ...prev,

          latitude:
            latitude.toFixed(6),

          longitude:
            longitude.toFixed(6),
        }));


        // Reverse geocoding

        try {

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          const data =
            await response.json();


          if (data.display_name) {

            setFormData((prev) => ({
              ...prev,

              location:
                data.display_name,
            }));

            // Current location successfully verified
            setLocationVerified(true);

          } else {

            setLocationVerified(false);

            alert(
              "Unable to identify your current location."
            );
          }

        } catch (error) {

          console.error(
            "Unable to get address:",
            error
          );

          setLocationVerified(false);

          alert(
            "Unable to verify your current location."
          );
        }
      },


      () => {

        setLocationVerified(false);

        alert(
          "Unable to get your location. Please allow location access."
        );
      },


      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };


  // =====================================================
  // SUBMIT GRIEVANCE
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setResult(null);


    try {

      // =================================================
      // GET LOGGED-IN USER
      // =================================================

      const savedUser =
        localStorage.getItem("user");

      const user = savedUser
        ? JSON.parse(savedUser)
        : null;


      // =================================================
      // CHECK LOGIN
      // =================================================

      if (!user?.id) {

        setResult({
          success: false,
          message:
            "Please login before submitting a grievance.",
        });

        setLoading(false);

        return;
      }


      // =================================================
      // VALIDATE DESCRIPTION
      // =================================================

      if (
        formData.description.trim().length <= 10
      ) {

        setResult({
          success: false,
          message:
            "Description must be more than 10 characters.",
        });

        setLoading(false);

        return;
      }


      // =================================================
      // VALIDATE LOCATION
      // =================================================

      if (!locationVerified) {

        setResult({
          success: false,
          message:
            "Please search and select a valid location before submitting.",
        });

        setLoading(false);

        return;
      }


      // =================================================
      // VALIDATE LOCATION DATA
      // =================================================

      if (
        !formData.location.trim() ||
        !formData.latitude ||
        !formData.longitude
      ) {

        setResult({
          success: false,
          message:
            "Please provide a valid location before submitting.",
        });

        setLoading(false);

        return;
      }


      // =================================================
      // SEND GRIEVANCE + USER ID
      // =================================================

      const response = await axios.post(
        `${API_URL}/submit_grievance.php`,
        {
          ...formData,
          userId: user.id,
        }
      );


      // =================================================
      // SUCCESS
      // =================================================

      if (response.data.success) {

        setResult({
          success: true,
          data: response.data,
        });


        setFormData({
          title: "",
          description: "",
          location: "",
          latitude: "",
          longitude: "",
        });


        setSearchLocation("");

        setMapPosition(
          DEFAULT_POSITION
        );

        setLocationVerified(false);

      } else {

        setResult({
          success: false,
          message:
            response.data.message,
        });
      }


    } catch (error) {

      console.error(error);

      setResult({
        success: false,

        message:
          error.response?.data?.message ||
          "Unable to submit grievance",
      });

    } finally {

      setLoading(false);
    }
  };


  return (
    <div className="submit-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="submit-header">

        <p className="submit-tag">
          CIVICAI • CITIZEN SERVICES
        </p>

        <h1>
          Submit Your Grievance
        </h1>

        <p>
          Tell us about the civic issue you're facing.
          CivicAI will analyze your complaint and help
          route it to the appropriate department.
        </p>

      </div>


      {/* =================================================
          FORM CARD
      ================================================= */}

      <div className="submit-card">

        <div className="form-intro">

          <div className="form-intro-icon">
            📝
          </div>

          <div>

            <h2>
              Grievance Details
            </h2>

            <p>
              Please provide accurate information about
              the issue.
            </p>

          </div>

        </div>


        <form onSubmit={handleSubmit}>


          {/* TITLE */}

          <div className="form-group">

            <label htmlFor="title">
              Grievance Title
            </label>

            <input
              id="title"
              type="text"
              name="title"
              placeholder="Example: Garbage not collected"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <small>
              Give your complaint a short and clear title.
            </small>

          </div>


          {/* DESCRIPTION */}

          <div className="form-group">

            <label htmlFor="description">
              Describe the Problem
            </label>

            <textarea
              id="description"
              name="description"
              placeholder="Describe the problem in detail..."
              value={formData.description}
              onChange={handleChange}
              rows="6"
              minLength={11}
              required
            />

            <small>
              Description must be more than 10 characters.
              A detailed description helps CivicAI classify
              your grievance more accurately.
            </small>

          </div>


          {/* LOCATION SEARCH */}

          <div className="form-group">

            <label>
              Search Location
            </label>

            <div className="location-search">

              <input
                type="text"
                placeholder="Example: Andheri, Mumbai"
                value={searchLocation}
                onChange={(e) =>
                  setSearchLocation(e.target.value)
                }
                onKeyDown={(e) => {

                  if (e.key === "Enter") {

                    e.preventDefault();

                    searchPlace();
                  }
                }}
              />

              <button
                type="button"
                className="location-search-btn"
                onClick={searchPlace}
                disabled={searching}
              >
                {searching
                  ? "Searching..."
                  : "Search"}
              </button>

            </div>


            <button
              type="button"
              className="current-location-btn"
              onClick={useCurrentLocation}
            >
              📍 Use My Current Location
            </button>

          </div>


          {/* MAP */}

          <div className="map-section">

            <div className="map-heading">

              <h3>
                Pin Your Location
              </h3>

              <p>
                Click anywhere on the map to select
                the exact location of the grievance.
              </p>

            </div>


            <div className="grievance-map">

              <MapContainer
                center={DEFAULT_POSITION}
                zoom={12}
                scrollWheelZoom={true}
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LocationMarker
                  position={mapPosition}
                  setPosition={setMapPosition}
                  setFormData={setFormData}
                  setLocationVerified={
                    setLocationVerified
                  }
                />

              </MapContainer>

            </div>


            {/* COORDINATES */}

            <div className="selected-location-info">

              <div>

                <span>
                  Latitude
                </span>

                <strong>
                  {formData.latitude ||
                    mapPosition[0].toFixed(6)}
                </strong>

              </div>


              <div>

                <span>
                  Longitude
                </span>

                <strong>
                  {formData.longitude ||
                    mapPosition[1].toFixed(6)}
                </strong>

              </div>

            </div>

          </div>


          {/* LOCATION DETAILS */}

          <div className="form-group">

            <label htmlFor="location">
              Location Details
            </label>

            <input
              id="location"
              type="text"
              name="location"
              placeholder="Search and select a valid location"
              value={formData.location}
              onChange={handleChange}
              required
            />

            {result?.success ? null : locationVerified ? (

               <small
              style={{
              color: "#059669",
              fontWeight: "600",
              }}
              >
              ✓ Location verified
               </small>

                ) : (

                <small
                style={{
                color: "#dc2626",
                 fontWeight: "600",
                   }}
                   >
                    ⚠ Please search or select a valid location from the map.
                    </small>

                    )}

          </div>


          {/* SUBMIT */}

          <button
            type="submit"
            className="submit-grievance-btn"
            disabled={loading}
          >

            {loading ? (

              <>
                <span className="button-spinner"></span>

                Processing Grievance...
              </>

            ) : (

              <>
                Submit Grievance →
              </>

            )}

          </button>

        </form>


        {/* =================================================
            SUCCESS
        ================================================= */}

        {result?.success && (

          <div className="submission-success">

            <div className="success-icon">
              ✓
            </div>

            <h2>
              Grievance Submitted Successfully
            </h2>

            <p>
              Your grievance has been received and
              classified successfully.
            </p>


            <div className="grievance-id-box">

              <span>
                YOUR GRIEVANCE ID
              </span>

              <strong>
                {result.data.grievanceId}
              </strong>

            </div>


            <div className="classification-result">

              <h3>
                AI Classification Result
              </h3>

              <div className="classification-grid">

                <div className="classification-item">

                  <span>
                    Category
                  </span>

                  <strong>
                    {result.data.category}
                  </strong>

                </div>


                <div className="classification-item">

                  <span>
                    Priority
                  </span>

                  <strong className="priority-value">
                    {result.data.priority}
                  </strong>

                </div>


                <div className="classification-item">

                  <span>
                    Department
                  </span>

                  <strong>
                    {result.data.department}
                  </strong>

                </div>

              </div>

            </div>


            <p className="track-message">
              Keep your Grievance ID safe to track
              the status of your complaint.
            </p>


            <div className="success-actions">

              <Link
                to="/track"
                className="track-result-btn"
              >
                Track Grievance →
              </Link>

              <button
                type="button"
                className="new-grievance-btn"
                onClick={() =>
                  setResult(null)
                }
              >
                Submit Another
              </button>

            </div>

          </div>

        )}


        {/* ERROR */}

        {result?.success === false && (

          <div className="submission-error">

            <strong>
              Submission Failed
            </strong>

            <p>
              {result.message}
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default SubmitGrievance;