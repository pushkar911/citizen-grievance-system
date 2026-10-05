import { BrowserRouter, Routes, Route } from "react-router-dom";
import DepartmentDashboard from "./pages/DepartmentDashboard";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SubmitGrievance from "./pages/SubmitGrievance";
import TrackGrievance from "./pages/TrackGrievance";
import AdminDashboard from "./pages/AdminDashboard";
import MyGrievances from "./pages/MyGrievances";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/submit" element={<SubmitGrievance />} />

        <Route path="/track" element={<TrackGrievance />} />

        <Route
          path="/my-grievances"
          element={<MyGrievances />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
        <Route
  path="/department"
  element={<DepartmentDashboard />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;